<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Marketplace;

use App\Http\Controllers\Controller;
use App\Models\TechnicianProfile;
use App\Services\Marketplace\ProOnboarding;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * The professional's own profile and verification: what they offer and where,
 * their documents, and submitting for review. Open to pending professionals,
 * since this is how they become verified.
 */
class ProProfileController extends Controller
{
    public function __construct(private readonly ProOnboarding $onboarding)
    {
    }

    /** `GET /pro/profile` */
    public function show(Request $request): JsonResponse
    {
        return ApiResponse::success($this->payload($this->profile($request)));
    }

    /** `PUT /pro/profile` */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'business_name' => ['nullable', 'string', 'max:120'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'years_experience' => ['nullable', 'integer', 'min:0', 'max:60'],
            'city_id' => ['required', 'integer', Rule::exists('cities', 'id')->where('is_served', true)],
            'base_address' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:23.5,37.5', 'required_with:longitude'],
            'longitude' => ['nullable', 'numeric', 'between:60.5,77.9', 'required_with:latitude'],
            'service_radius_km' => ['nullable', 'integer', 'min:5', 'max:50'],
            'offers_emergency_service' => ['nullable', 'boolean'],
            'category_ids' => ['required', 'array', 'min:1', 'max:10'],
            'category_ids.*' => ['string', Rule::exists('service_categories', 'uuid')->where('is_active', true)],
        ], [
            'category_ids.required' => 'Choose at least one trade.',
            'category_ids.min' => 'Choose at least one trade.',
            'city_id.exists' => 'PakFix is not live in that city yet.',
        ]);

        $profile = $this->onboarding->updateProfile($this->profile($request), $data);

        return ApiResponse::success($this->payload($profile), 'Profile saved.');
    }

    /** `POST /pro/verification/documents` — multipart: `type`, `file`. */
    public function upload(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(ProOnboarding::ALLOWED_DOCUMENTS)],
            'file' => [
                'required', 'file',
                'max:' . (int) config('pakfix.uploads.max_image_kb', 8192),
                // Photos for CNIC and selfie; a certificate may also be a PDF.
                $request->input('type') === 'certificate' ? 'mimes:jpg,jpeg,png,webp,pdf' : 'mimes:jpg,jpeg,png,webp',
            ],
        ], [
            'file.max' => 'That file is too large. Photos must be under 8 MB.',
            'file.mimes' => 'Upload a photo (JPG, PNG or WebP).',
        ]);

        $profile = $this->profile($request);
        $this->onboarding->uploadDocument($profile, $data['type'], $request->file('file'));

        return ApiResponse::success($this->payload($profile->refresh()), 'Document uploaded.');
    }

    /** `POST /pro/verification/submit` — `{ "cnic": "35202-1234567-1" }` */
    public function submit(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cnic' => ['required', 'string', 'regex:/^\d{5}-?\d{7}-?\d$/'],
        ], [
            'cnic.regex' => 'Enter your 13-digit CNIC number, e.g. 35202-1234567-1.',
        ]);

        $profile = $this->profile($request);
        $this->onboarding->submit($profile, $request->user(), $data['cnic']);

        return ApiResponse::success(
            $this->payload($profile->refresh()),
            'Submitted. PakFix will review your documents, usually within 24 hours.'
        );
    }

    private function profile(Request $request): TechnicianProfile
    {
        // Always read fresh: verification status can change between requests.
        return TechnicianProfile::where('user_id', $request->user()->id)->first()
            ?? abort(403, 'This account is not a professional account.');
    }

    /** @return array<string, mixed> */
    private function payload(TechnicianProfile $profile): array
    {
        $profile->loadMissing(['city', 'services.category', 'verification']);
        $verification = $profile->verification;

        return [
            'id' => $profile->uuid,
            'business_name' => $profile->business_name,
            'bio' => $profile->bio,
            'years_experience' => (int) $profile->years_experience,
            'city' => $profile->city ? ['id' => $profile->city->id, 'name' => $profile->city->name] : null,
            'base_address' => $profile->base_address,
            'latitude' => $profile->latitude,
            'longitude' => $profile->longitude,
            'service_radius_km' => (int) $profile->service_radius_km,
            'offers_emergency_service' => (bool) $profile->offers_emergency_service,
            'categories' => $profile->services
                ->where('is_active', true)
                ->filter(fn ($s) => $s->category !== null)
                ->map(fn ($s) => ['id' => $s->category->uuid, 'name' => $s->category->name, 'slug' => $s->category->slug, 'icon' => $s->category->icon])
                ->values()
                ->all(),
            'onboarding_percent' => (int) $profile->onboarding_percent,
            'verification' => [
                'status' => $profile->verification_status->value,
                'submitted_at' => $verification?->submitted_at?->toIso8601String(),
                'reviewed_at' => $verification?->reviewed_at?->toIso8601String(),
                'rejection_reason' => $verification?->rejection_reason,
            ],
            'checklist' => $this->onboarding->checklist($profile),
        ];
    }
}
