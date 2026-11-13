<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * The app lets a professional switch to Customer mode and book help for
 * themselves, but the professional role lacked the customer permissions, so
 * posting a job, accepting an offer and every customer booking action
 * answered 403. This grants them on the live database (the seeder grants
 * them on a fresh one).
 */
return new class extends Migration
{
    private const CUSTOMER_MODE = [
        'bookings.view.own', 'bookings.create', 'bookings.update', 'bookings.cancel',
        'quotes.respond', 'ai.use', 'reviews.create',
    ];

    public function up(): void
    {
        $role = Role::query()->where('name', 'technician')->where('guard_name', 'web')->first();
        if ($role === null) {
            return; // A fresh database: the seeder creates the role with these permissions.
        }

        foreach (self::CUSTOMER_MODE as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }
        $role->givePermissionTo(self::CUSTOMER_MODE);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        $role = Role::query()->where('name', 'technician')->where('guard_name', 'web')->first();
        $role?->revokePermissionTo(self::CUSTOMER_MODE);
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
