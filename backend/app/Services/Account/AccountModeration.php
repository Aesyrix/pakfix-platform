<?php

declare(strict_types=1);

namespace App\Services\Account;

use App\Enums\QuoteStatus;
use App\Enums\UserRole;
use App\Models\DeviceToken;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\TechnicianProfile;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Suspending and restoring accounts, and clearing a professional's strikes.
 *
 * Suspending takes effect everywhere at once:
 *  - every sign-in token and website session is revoked, and sign-in is
 *    refused (EnsureUserIsActive and AuthController already check status);
 *  - push notifications stop (device tokens are removed);
 *  - a customer's open requests are closed, so professionals stop seeing them;
 *  - a professional's open offers are withdrawn, so no customer can book them,
 *    and they disappear from public listings.
 * Booked jobs are left as they are: PakFix decides each one (the admin can
 * cancel it from the bookings page), so nobody loses a job automatically.
 */
class AccountModeration
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function suspend(User $user, User $admin, string $reason): User
    {
        $this->guard($user, $admin);
        if (! $user->canAuthenticate()) {
            throw ValidationException::withMessages(['user' => 'This account is already suspended.']);
        }

        return DB::transaction(function () use ($user, $admin, $reason): User {
            $before = ['status' => $user->status];
            $user->forceFill(['status' => User::STATUS_SUSPENDED, 'status_reason' => $reason])->save();

            $user->tokens()->delete();
            DB::table('sessions')->where('user_id', $user->id)->delete();
            DeviceToken::query()->where('user_id', $user->id)->delete();

            $closedRequests = QuoteRequest::query()
                ->where('customer_id', $user->id)
                ->where('status', QuoteRequest::STATUS_OPEN)
                ->update(['status' => QuoteRequest::STATUS_CLOSED, 'cancelled_at' => now()]);

            $withdrawnOffers = 0;
            if ($profile = $user->technicianProfile) {
                $withdrawnOffers = Quote::query()
                    ->where('technician_profile_id', $profile->id)
                    ->whereNotNull('quote_request_id')
                    ->where('status', QuoteStatus::Sent->value)
                    ->update(['status' => QuoteStatus::Withdrawn->value, 'responded_at' => now()]);
            }

            $this->audit->record('user.suspended', $user, $before, ['status' => User::STATUS_SUSPENDED], "Suspended: {$reason} (closed {$closedRequests} request(s), withdrew {$withdrawnOffers} offer(s)).", $admin);

            return $user;
        });
    }

    public function restore(User $user, User $admin): User
    {
        $this->guard($user, $admin);
        if ($user->status !== User::STATUS_SUSPENDED) {
            throw ValidationException::withMessages(['user' => 'Only a suspended account can be restored.']);
        }

        $user->forceFill(['status' => User::STATUS_ACTIVE, 'status_reason' => null])->save();
        $this->audit->record('user.restored', $user, ['status' => User::STATUS_SUSPENDED], ['status' => User::STATUS_ACTIVE], 'Account restored.', $admin);

        return $user;
    }

    public function clearStrikes(TechnicianProfile $profile, User $admin, string $note): TechnicianProfile
    {
        $before = (int) $profile->strikes_count;
        $profile->forceFill(['strikes_count' => 0])->save();
        $this->audit->record('technician.strikes.cleared', $profile, ['strikes_count' => $before], ['strikes_count' => 0], "Strikes cleared: {$note}", $admin);

        return $profile;
    }

    /** Nobody suspends themselves, and only a super admin acts on staff accounts. */
    private function guard(User $user, User $admin): void
    {
        if ($user->is($admin)) {
            throw ValidationException::withMessages(['user' => 'You cannot change your own account here.']);
        }

        $staff = [UserRole::Admin->value, UserRole::SuperAdmin->value, UserRole::SupportAgent->value];
        if ($user->hasAnyRole($staff) && ! $admin->hasRole(UserRole::SuperAdmin->value)) {
            throw ValidationException::withMessages(['user' => 'Only a super admin can change a staff account.']);
        }
    }
}
