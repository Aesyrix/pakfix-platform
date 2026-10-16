<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Models\TechnicianDocument;
use App\Models\TechnicianProfile;
use App\Models\TechnicianVerification;
use App\Services\Marketplace\VerificationReview;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * The verification queue: professionals waiting for a person to check their
 * CNIC and selfie. Documents are streamed from the private disk only through
 * this controller, behind `technicians.verify`.
 */
class VerificationController extends Controller
{
    public function __construct(private readonly VerificationReview $review)
    {
    }

    /** `GET /admin/verifications?status=pending` — oldest submission first. */
    public function index(Request $request): JsonResponse
    {
        $status = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'verified', 'rejected', 'not_submitted'])],
        ])['status'] ?? 'pending';

        $profiles = TechnicianProfile::query()
            ->where('verification_status', $status)
            ->with(['user', 'city', 'services.category', 'verification'])
            ->orderBy(
                TechnicianVerification::select('submitted_at')
                    ->whereColumn('technician_verifications.technician_profile_id', 'technician_profiles.id')
                    ->limit(1)
            )
            ->paginate(min($request->integer('per_page', 20), 50));

        $profiles->getCollection()->transform(fn (TechnicianProfile $p) => $this->summary($p));

        return ApiResponse::success($profiles);
    }

    /** `GET /admin/verifications/{profile}` */
    public function show(string $profile): JsonResponse
    {
        $p = $this->find($profile);
        $p->loadMissing('verification.documents');

        return ApiResponse::success([
            ...$this->summary($p),
            'bio' => $p->bio,
            'base_address' => $p->base_address,
            'service_radius_km' => (int) $p->service_radius_km,
            'reviewer_notes' => $p->verification?->reviewer_notes,
            'documents' => ($p->verification?->documents ?? collect())
                ->map(fn (TechnicianDocument $d) => [
                    'id' => $d->id,
                    'type' => $d->type,
                    'mime_type' => $d->mime_type,
                    'uploaded_at' => $d->created_at?->toIso8601String(),
                    // Same-origin path: the admin site and the API share a domain, so
                    // this works whatever APP_URL is set to.
                    'url' => "/api/v1/admin/verifications/{$p->uuid}/documents/{$d->id}",
                ])
                ->values()
                ->all(),
        ]);
    }

    /** `GET /admin/verifications/{profile}/documents/{id}` — the file itself. */
    public function document(string $profile, int $id): StreamedResponse
    {
        $p = $this->find($profile);
        $document = TechnicianDocument::query()
            ->where('id', $id)
            ->where('technician_verification_id', $p->verification?->id)
            ->firstOrFail();

        abort_unless(Storage::disk($document->disk)->exists($document->path), 404, 'That file is missing.');

        return Storage::disk($document->disk)->response($document->path, null, [
            'Content-Type' => $document->mime_type ?? 'application/octet-stream',
            // Personal documents: never cached by a browser or a proxy.
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    /** `POST /admin/verifications/{profile}/approve` */
    public function approve(Request $request, string $profile): JsonResponse
    {
        $data = $request->validate(['notes' => ['nullable', 'string', 'max:1000']]);
        $p = $this->review->approve($this->find($profile), $request->user(), $data['notes'] ?? null);

        return ApiResponse::success($this->summary($p), "{$p->displayName()} is now verified.");
    }

    /** `POST /admin/verifications/{profile}/reject` — `{ "reason": "…" }`, shown to the professional. */
    public function reject(Request $request, string $profile): JsonResponse
    {
        $data = $request->validate(['reason' => ['required', 'string', 'min:5', 'max:500']]);
        $p = $this->review->reject($this->find($profile), $request->user(), $data['reason']);

        return ApiResponse::success($this->summary($p), 'Sent back to the professional with your reason.');
    }

    private function find(string $uuid): TechnicianProfile
    {
        return TechnicianProfile::where('uuid', $uuid)->with(['user', 'city', 'services.category', 'verification'])->firstOrFail();
    }

    /** @return array<string, mixed> */
    private function summary(TechnicianProfile $p): array
    {
        $cnic = $p->verification?->cnic;

        return [
            'id' => $p->uuid,
            'name' => $p->displayName(),
            'phone' => $p->user?->phone,
            'email' => $p->user?->email,
            'city' => $p->city?->name,
            'years_experience' => (int) $p->years_experience,
            'trades' => $p->services->where('is_active', true)->map(fn ($s) => $s->category?->name)->filter()->values()->all(),
            'status' => $p->verification_status->value,
            // Masked: reviewers compare the last digits with the card in the photo.
            'cnic_masked' => $cnic ? str_repeat('•', max(0, strlen($cnic) - 4)) . substr($cnic, -4) : null,
            'submitted_at' => $p->verification?->submitted_at?->toIso8601String(),
            'reviewed_at' => $p->verification?->reviewed_at?->toIso8601String(),
            'rejection_reason' => $p->verification?->rejection_reason,
            'is_verified' => $p->verification_status === VerificationStatus::Verified,
        ];
    }
}
