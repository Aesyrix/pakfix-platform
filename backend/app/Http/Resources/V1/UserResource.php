<?php

declare(strict_types=1);

namespace App\Http\Resources\V1;

use App\Http\Resources\Concerns\ResolvesRelations;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * The authenticated user, as the clients need them.
 *
 * The internal id is never exposed; `id` here is the UUID. Email and phone
 * are only included when the requester is the user themselves or a staff
 * member, so one customer cannot read another's contact details through an
 * endpoint that happens to embed a user.
 *
 * @mixin \App\Models\User
 */
class UserResource extends JsonResource
{
    use ResolvesRelations;

    public function toArray(Request $request): array
    {
        $viewer = $request->user();
        $isSelf = $viewer !== null && $viewer->getKey() === $this->resource->getKey();
        $canSeeContact = $isSelf || (bool) $viewer?->isStaff();

        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'avatar_url' => $this->avatar_path ? Storage::url($this->avatar_path) : null,
            'locale' => $this->locale,
            'roles' => $this->getRoleNames()->values(),
            'primary_role' => $this->primaryRole()?->value,

            $this->mergeWhen($canSeeContact, fn () => [
                'email' => $this->email,
                'phone' => $this->phone,
                'email_verified' => $this->email_verified_at !== null,
                'phone_verified' => $this->phone_verified_at !== null,
                'status' => $this->status,
                'referral_code' => $this->referral_code,
                'onboarding_completed' => $this->hasCompletedOnboarding(),
                'permissions' => $this->getAllPermissions()->pluck('name')->values(),
                'home_path' => $this->primaryRole()?->homePath(),
            ]),

            'city' => $this->relation('city', CityResource::class),

            'profile' => $this->whenRelation('profile', fn ($profile) => [
                'first_name' => $profile->first_name,
                'last_name' => $profile->last_name,
                'bio' => $profile->bio,
            ]),

            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
