<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

use App\Enums\VerificationStatus;
use App\Models\City;
use App\Models\ServiceCategory;
use App\Models\TechnicianDocument;
use App\Models\TechnicianProfile;
use App\Models\TechnicianService;
use App\Models\TechnicianServiceArea;
use App\Models\TechnicianVerification;
use App\Models\User;
use App\Services\Audit\AuditLogger;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * A professional getting verified: set up the profile, upload CNIC (both
 * sides) and a selfie, then submit for a person at PakFix to review.
 *
 * Documents live on the private disk and are never served by a public URL;
 * reviewers fetch them through a permission-checked admin endpoint.
 */
class ProOnboarding
{
    /** Documents every professional must provide (management rule 3.1). */
    public const REQUIRED_DOCUMENTS = [
        TechnicianDocument::TYPE_CNIC_FRONT,
        TechnicianDocument::TYPE_CNIC_BACK,
        TechnicianDocument::TYPE_PHOTO,
    ];

    /** Documents a professional may upload. */
    public const ALLOWED_DOCUMENTS = [
        TechnicianDocument::TYPE_CNIC_FRONT,
        TechnicianDocument::TYPE_CNIC_BACK,
        TechnicianDocument::TYPE_PHOTO,
        TechnicianDocument::TYPE_CERTIFICATE,
    ];

    private const DISK = 'local';

    /** Statuses in which the professional can still change what they submit. */
    private const EDITABLE = [
        VerificationStatus::NotSubmitted,
        VerificationStatus::Rejected,
        VerificationStatus::MoreInfoRequested,
    ];

    public function __construct(private readonly AuditLogger $audit)
    {
    }

    /** @param array<string, mixed> $data Validated input. */
    public function updateProfile(TechnicianProfile $profile, array $data): TechnicianProfile
    {
        return DB::transaction(function () use ($profile, $data): TechnicianProfile {
            $city = City::findOrFail($data['city_id']);

            $profile->fill([
                'business_name' => $data['business_name'] ?? null,
                'bio' => $data['bio'] ?? null,
                'years_experience' => (int) ($data['years_experience'] ?? 0),
                'city_id' => $city->id,
                'base_address' => $data['base_address'] ?? $city->name,
                'latitude' => $data['latitude'] ?? $city->latitude,
                'longitude' => $data['longitude'] ?? $city->longitude,
                'service_radius_km' => (int) ($data['service_radius_km'] ?? config('pakfix.marketplace.default_radius_km', 20)),
                'offers_emergency_service' => (bool) ($data['offers_emergency_service'] ?? false),
            ])->save();

            // Trades: replace the set, keeping rows that stay so their history is kept.
            $categoryIds = ServiceCategory::whereIn('uuid', $data['category_ids'])->pluck('id')->all();
            $profile->services()->whereNotIn('service_category_id', $categoryIds)->whereNull('service_id')->delete();
            foreach ($categoryIds as $id) {
                TechnicianService::updateOrCreate(
                    ['technician_profile_id' => $profile->id, 'service_category_id' => $id, 'service_id' => null],
                    ['is_active' => true, 'experience_years' => $profile->years_experience],
                );
            }

            // Their base city is always a service area.
            TechnicianServiceArea::updateOrCreate(
                ['technician_profile_id' => $profile->id, 'city_id' => $city->id, 'area_id' => null],
                ['is_active' => true],
            );

            $this->refreshOnboardingPercent($profile);

            return $profile->refresh();
        });
    }

    public function uploadDocument(TechnicianProfile $profile, string $type, UploadedFile $file): TechnicianDocument
    {
        $verification = $this->verificationFor($profile);
        $this->assertEditable($profile);

        return DB::transaction(function () use ($profile, $verification, $type, $file): TechnicianDocument {
            // One document of each type: a new upload replaces the old one.
            $verification->documents()->where('type', $type)->get()->each(function (TechnicianDocument $old): void {
                Storage::disk($old->disk)->delete($old->path);
                $old->delete();
            });

            $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');
            $path = $file->storeAs(
                "verification/{$profile->uuid}",
                $type . '-' . Str::random(24) . '.' . $extension,
                self::DISK
            );

            $document = $verification->documents()->create([
                'type' => $type,
                'disk' => self::DISK,
                'path' => $path,
                'original_name' => Str::limit($file->getClientOriginalName(), 200, ''),
                'mime_type' => $file->getMimeType(),
                'size_bytes' => $file->getSize(),
            ]);

            $this->refreshOnboardingPercent($profile);

            return $document;
        });
    }

    public function submit(TechnicianProfile $profile, User $actor, string $cnic): TechnicianVerification
    {
        $this->assertEditable($profile);
        $checklist = $this->checklist($profile);

        if (! $checklist['profile_complete']) {
            throw ValidationException::withMessages([
                'profile' => 'Complete your profile first: your trades and your city.',
            ]);
        }
        if ($checklist['missing_documents'] !== []) {
            throw ValidationException::withMessages([
                'documents' => 'Upload your CNIC (both sides) and a selfie before submitting.',
            ]);
        }

        return DB::transaction(function () use ($profile, $actor, $cnic): TechnicianVerification {
            $verification = $this->verificationFor($profile);
            $verification->fill([
                'status' => VerificationStatus::Pending,
                'cnic' => preg_replace('/\D/', '', $cnic),
                'submitted_at' => now(),
                'rejection_reason' => null,
            ])->save();

            $profile->forceFill(['verification_status' => VerificationStatus::Pending])->save();
            $this->audit->record('technician.verification.submitted', $profile, [], ['status' => 'pending'], 'Professional submitted documents for verification.', $actor);

            return $verification;
        });
    }

    /**
     * What is done and what is left, for the app's checklist.
     *
     * @return array{profile_complete: bool, documents: list<string>, missing_documents: list<string>, can_submit: bool}
     */
    public function checklist(TechnicianProfile $profile): array
    {
        $uploaded = $profile->verification?->documents()->pluck('type')->unique()->values()->all() ?? [];
        $missing = array_values(array_diff(self::REQUIRED_DOCUMENTS, $uploaded));
        $profileComplete = $profile->city_id !== null
            && $profile->latitude !== null
            && $profile->services()->where('is_active', true)->exists();

        return [
            'profile_complete' => $profileComplete,
            'documents' => $uploaded,
            'missing_documents' => $missing,
            'can_submit' => $profileComplete && $missing === [] && in_array($profile->verification_status, self::EDITABLE, true),
        ];
    }

    public function verificationFor(TechnicianProfile $profile): TechnicianVerification
    {
        return $profile->verification()->firstOrCreate([], ['status' => VerificationStatus::NotSubmitted]);
    }

    private function assertEditable(TechnicianProfile $profile): void
    {
        if (! in_array($profile->verification_status, self::EDITABLE, true)) {
            throw ValidationException::withMessages([
                'verification' => $profile->verification_status === VerificationStatus::Verified
                    ? 'You are already verified.'
                    : 'Your documents are being reviewed. You can change them if PakFix asks for more information.',
            ]);
        }
    }

    private function refreshOnboardingPercent(TechnicianProfile $profile): void
    {
        $checklist = $this->checklist($profile->refresh());
        $done = ($checklist['profile_complete'] ? 1 : 0) + (3 - count($checklist['missing_documents']));
        $profile->forceFill(['onboarding_percent' => (int) round($done / 4 * 100)])->save();
    }
}
