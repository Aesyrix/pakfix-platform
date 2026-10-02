<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\UserProfile;
use App\Services\Audit\AuditLogger;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

/**
 * php artisan pakfix:admin
 *
 * Creates a staff account. The only way to create the first admin on a
 * production install, where demo accounts are never seeded.
 */
class CreateAdminCommand extends Command
{
    protected $signature = 'pakfix:admin
                            {--name= : Full name}
                            {--email= : Email address used to sign in}
                            {--phone= : Mobile number, e.g. 03001234567}
                            {--password= : Password (prompted for, hidden, when omitted)}
                            {--role=super_admin : super_admin, admin or support_agent}';

    protected $description = 'Create an admin or support account';

    public function handle(AuditLogger $audit): int
    {
        $role = UserRole::tryFrom((string) $this->option('role'));

        if (! $role || ! $role->isStaff()) {
            $this->components->error('--role must be super_admin, admin or support_agent.');

            return self::FAILURE;
        }

        $input = [
            'name' => $this->option('name') ?: $this->ask('Full name'),
            'email' => mb_strtolower((string) ($this->option('email') ?: $this->ask('Email address'))),
            'phone' => $this->normalisePhone((string) ($this->option('phone') ?: $this->ask('Mobile number (e.g. 03001234567)'))),
            'password' => $this->option('password') ?: $this->secret('Password (at least 10 characters)'),
        ];

        $validator = Validator::make($input, [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['required', 'regex:/^\+923\d{9}$/', 'unique:users,phone'],
            // Staff accounts reach every customer's data: a stronger rule than customers get.
            'password' => ['required', Password::min(10)->letters()->mixedCase()->numbers()],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->components->error($error);
            }

            return self::FAILURE;
        }

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'],
            'password' => $input['password'],
            'status' => User::STATUS_ACTIVE,
        ]);

        $user->forceFill(['email_verified_at' => now()])->save();
        $user->assignRole($role->value);

        UserProfile::create([
            'user_id' => $user->id,
            'first_name' => Str::before($input['name'], ' '),
            'last_name' => Str::contains($input['name'], ' ') ? Str::after($input['name'], ' ') : null,
        ]);

        $audit->record('user.staff_created', $user, [], ['email' => $user->email, 'role' => $role->value], 'Created from the command line');

        $this->components->info("{$role->label()} account created for {$user->email}. Sign in at " . rtrim((string) config('app.url'), '/') . '/login');

        return self::SUCCESS;
    }

    private function normalisePhone(string $phone): string
    {
        $phone = preg_replace('/[\s()-]/', '', $phone) ?? '';

        return match (true) {
            str_starts_with($phone, '03') => '+92' . substr($phone, 1),
            str_starts_with($phone, '92') => '+' . $phone,
            default => $phone,
        };
    }
}
