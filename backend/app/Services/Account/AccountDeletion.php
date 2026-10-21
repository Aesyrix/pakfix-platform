<?php

declare(strict_types=1);

namespace App\Services\Account;

use App\Enums\BookingStatus;
use App\Enums\QuoteStatus;
use App\Enums\VerificationStatus;
use App\Models\Booking;
use App\Models\DeviceToken;
use App\Models\Property;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\TechnicianDocument;
use App\Models\TechnicianVerification;
use App\Models\User;
use App\Models\UserProfile;
use App\Services\Audit\AuditLogger;
use App\Services\Marketplace\Bidding;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Someone deleting their own account (App Store 5.1.1(v), Google Play).
 *
 * Personal details are erased straight away: name, email, phone, photo, CNIC
 * and selfie files, saved addresses and every signed-in device. Records of
 * jobs that happened (bookings, reviews, chat, payments) are kept without the
 * name, because the other person and PakFix's accounts still rely on them.
 *
 * Not allowed while a job is in progress, so nobody is left mid-repair.
 */
class AccountDeletion
{
    public const DELETED_NAME = 'Deleted user';

    public function __construct(private readonly Bidding $bidding, private readonly AuditLogger $audit) {}

    /** Bookings that must finish (or be cancelled) before the account can go. */
    public function activeBookingsCount(User $user): int
    {
        $profileId = $user->technicianProfile?->id;
        $done = [BookingStatus::CustomerConfirmed->value, BookingStatus::Cancelled->value, BookingStatus::Refunded->value];

        return Booking::query()
            ->whereNotIn('status', $done)
            ->where(function ($q) use ($user, $profileId): void {
                $q->where('customer_id', $user->id);
                if ($profileId !== null) {
                    $q->orWhere('technician_profile_id', $profileId);
                }
            })
            ->count();
    }

    public function delete(User $user, string $password, ?string $reason = null): void
    {
        if (! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages(['password' => 'That password is not right.']);
        }
        if ($this->activeBookingsCount($user) > 0) {
            throw ValidationException::withMessages([
                'account' => 'You have a job in progress. Finish or cancel it first, then delete your account.',
            ]);
        }

        $files = [];

        DB::transaction(function () use ($user, $reason, &$files): void {
            // Nothing left waiting on this person.
            QuoteRequest::query()
                ->where('customer_id', $user->id)
                ->where('status', QuoteRequest::STATUS_OPEN)
                ->whereNull('booking_id')
                ->get()
                ->each(fn (QuoteRequest $r) => $this->bidding->cancelRequest($r));

            $profile = $user->technicianProfile;
            if ($profile !== null) {
                Quote::query()
                    ->where('technician_profile_id', $profile->id)
                    ->where('status', QuoteStatus::Sent->value)
                    ->get()
                    ->each(fn (Quote $q) => $this->bidding->withdrawQuote($q));

                foreach (TechnicianDocument::query()->whereHas('verification', fn ($q) => $q->where('technician_profile_id', $profile->id))->get() as $document) {
                    $files[] = [$document->disk, $document->path];
                    $document->delete();
                }

                TechnicianVerification::query()->where('technician_profile_id', $profile->id)->update(['cnic' => null]);

                // Off the public listings and out of matching.
                $profile->forceFill([
                    'verification_status' => VerificationStatus::Suspended,
                    'is_available' => false,
                    'is_accepting_jobs' => false,
                    'bio' => null,
                ])->save();
            }

            UserProfile::query()->where('user_id', $user->id)->delete();
            Property::query()
                ->where('user_id', $user->id)
                ->whereNotIn('id', Booking::query()->whereNotNull('property_id')->select('property_id'))
                ->delete();

            if ($user->avatar_path !== null) {
                $files[] = ['public', $user->avatar_path];
            }

            $this->audit->record('account.deleted', $user, [], ['reason' => $reason], 'A user deleted their account.', $user);

            $user->tokens()->delete();
            DeviceToken::query()->where('user_id', $user->id)->delete();
            $user->forceFill([
                'name' => self::DELETED_NAME,
                'email' => 'deleted-'.($user->uuid ?? Str::uuid()).'@deleted.pakfix.invalid',
                'phone' => null,
                'email_verified_at' => null,
                'phone_verified_at' => null,
                'avatar_path' => null,
                'password' => Hash::make(Str::random(64)),
                'remember_token' => null,
                'two_factor_secret' => null,
                'two_factor_recovery_codes' => null,
                'two_factor_confirmed_at' => null,
                'referral_code' => null,
                'last_login_ip' => null,
                'status' => User::STATUS_DELETED,
                'status_reason' => 'This account was deleted.',
            ])->save();
            $user->delete();
        });

        // Files go once the database change has committed.
        foreach ($files as [$disk, $path]) {
            Storage::disk($disk)->delete($path);
        }
    }
}
