<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

use App\Enums\VerificationStatus;
use App\Models\TechnicianProfile;
use App\Models\User;
use App\Services\Notifications\Notifier;
use App\Services\Audit\AuditLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * A person at PakFix reviewing a professional's documents. Approving makes
 * the professional verified (listed, can bid) and their account active;
 * rejecting sends them back to fix and resubmit, with the reason shown.
 * Every decision is audited.
 */
class VerificationReview
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    public function approve(TechnicianProfile $profile, User $reviewer, ?string $notes = null): TechnicianProfile
    {
        $this->assertPending($profile);

        return DB::transaction(function () use ($profile, $reviewer, $notes): TechnicianProfile {
            $profile->verification->fill([
                'status' => VerificationStatus::Verified,
                'reviewed_at' => now(),
                'reviewed_by_user_id' => $reviewer->id,
                'reviewer_notes' => $notes,
                'rejection_reason' => null,
            ])->save();

            $profile->forceFill([
                'verification_status' => VerificationStatus::Verified,
                'verified_at' => now(),
            ])->save();

            // A technician registers as "pending"; verification activates them.
            $user = $profile->user;
            if ($user !== null && $user->status === User::STATUS_PENDING) {
                $user->forceFill(['status' => User::STATUS_ACTIVE])->save();
            }

            $this->audit->record('technician.verified', $profile, ['status' => 'pending'], ['status' => 'verified'], "Verified {$profile->displayName()}.", $reviewer);
            app(Notifier::class)->verificationDecided($profile, true);

            return $profile->refresh();
        });
    }

    public function reject(TechnicianProfile $profile, User $reviewer, string $reason): TechnicianProfile
    {
        $this->assertPending($profile);

        return DB::transaction(function () use ($profile, $reviewer, $reason): TechnicianProfile {
            $profile->verification->fill([
                'status' => VerificationStatus::Rejected,
                'reviewed_at' => now(),
                'reviewed_by_user_id' => $reviewer->id,
                'rejection_reason' => $reason,
            ])->save();

            $profile->forceFill(['verification_status' => VerificationStatus::Rejected])->save();

            $this->audit->record('technician.verification.rejected', $profile, ['status' => 'pending'], ['status' => 'rejected'], "Rejected {$profile->displayName()}: {$reason}", $reviewer);
            app(Notifier::class)->verificationDecided($profile, false, $reason);

            return $profile->refresh();
        });
    }

    private function assertPending(TechnicianProfile $profile): void
    {
        if ($profile->verification_status !== VerificationStatus::Pending || $profile->verification === null) {
            throw ValidationException::withMessages([
                'verification' => 'Only a submission waiting for review can be approved or rejected.',
            ]);
        }
    }
}
