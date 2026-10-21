<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Enums\QuoteStatus;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Booking;
use App\Models\City;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\ServiceCategory;
use App\Models\TechnicianDocument;
use App\Models\TechnicianProfile;
use App\Models\TechnicianService;
use App\Models\User;
use Database\Seeders\LocationSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\ServiceCategorySeeder;
use Database\Seeders\SettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Deleting your own account: password confirmed, refused mid-job, personal
 * details erased, job records kept without the name.
 */
class AccountDeletionTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;

    private User $pro;

    private TechnicianProfile $profile;

    private City $rawalpindi;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([LocationSeeder::class, ServiceCategorySeeder::class, RolePermissionSeeder::class, SettingsSeeder::class]);
        $this->rawalpindi = City::where('slug', 'rawalpindi')->firstOrFail();
        $this->customer = $this->user(UserRole::Customer, 'Ayesha Siddiqui');
        [$this->pro, $this->profile] = $this->professional();
    }

    public function test_a_customer_deletes_their_account_and_their_details_are_erased(): void
    {
        $requestId = $this->postRequest();
        $email = $this->customer->email;
        $token = $this->customer->createToken('phone')->plainTextToken;

        $this->withToken($token)->deleteJson('/api/v1/account', ['password' => 'wrong'])
            ->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->withToken($token)->getJson('/api/v1/account/deletion')->assertJsonPath('data.can_delete', true);
        $this->withToken($token)->deleteJson('/api/v1/account', ['password' => 'password', 'reason' => 'Moving abroad'])
            ->assertOk();

        $user = User::withTrashed()->findOrFail($this->customer->id);
        $this->assertSoftDeleted($user);
        $this->assertSame('Deleted user', $user->name);
        $this->assertNotSame($email, $user->email);
        $this->assertNull($user->phone);
        $this->assertSame(User::STATUS_DELETED, $user->status);
        $this->assertSame(0, $user->tokens()->count(), 'every device is signed out');
        $this->assertSame(QuoteRequest::STATUS_CLOSED, QuoteRequest::where('uuid', $requestId)->value('status'), 'open requests are cancelled');

        // The old token and the old login no longer work.
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/v1/auth/me')->assertUnauthorized();
        $this->postJson('/api/v1/auth/login', ['login' => $email, 'password' => 'password', 'device_name' => 't'])
            ->assertStatus(422);
    }

    public function test_an_account_cannot_be_deleted_while_a_job_is_in_progress(): void
    {
        $this->job();

        $this->actingAs($this->customer)->getJson('/api/v1/account/deletion')
            ->assertJsonPath('data.can_delete', false)
            ->assertJsonPath('data.active_bookings', 1);
        $this->actingAs($this->customer)->deleteJson('/api/v1/account', ['password' => 'password'])
            ->assertUnprocessable()->assertJsonValidationErrors('account');
        $this->actingAs($this->pro)->deleteJson('/api/v1/account', ['password' => 'password'])
            ->assertUnprocessable()->assertJsonValidationErrors('account');
        $this->assertNotSoftDeleted($this->customer);
    }

    public function test_a_professional_deleting_removes_their_cnic_and_listing_but_keeps_past_jobs(): void
    {
        Storage::fake('local');
        $booking = $this->job(finish: true);

        // An open offer on another request, then CNIC files (uploads need an editable verification).
        $openRequest = $this->postRequest();
        $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$openRequest}/quotes", ['labour_minor' => 90000])->assertCreated();
        $this->profile->forceFill(['verification_status' => VerificationStatus::NotSubmitted])->save();
        $this->actingAs($this->pro)->post('/api/v1/pro/verification/documents', [
            'type' => 'cnic_front',
            'file' => UploadedFile::fake()->image('cnic.jpg'),
        ], ['Accept' => 'application/json'])->assertOk();
        $path = TechnicianDocument::query()->latest('id')->value('path');
        Storage::disk('local')->assertExists($path);

        $this->actingAs($this->pro)->deleteJson('/api/v1/account', ['password' => 'password'])->assertOk();

        Storage::disk('local')->assertMissing($path);
        $this->profile->refresh();
        $this->assertSame(VerificationStatus::Suspended, $this->profile->verification_status);
        $this->assertFalse((bool) $this->profile->is_accepting_jobs);
        $this->assertSame(0, Quote::where('technician_profile_id', $this->profile->id)->where('status', QuoteStatus::Sent->value)->count());

        // The customer still has the finished job in their history.
        $this->app['auth']->forgetGuards();
        $this->actingAs($this->customer)->getJson("/api/v1/bookings/{$booking->uuid}")->assertOk();
    }

    // -----------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------

    private function postRequest(): string
    {
        return $this->actingAs($this->customer)->postJson('/api/v1/requests', [
            'service_category_id' => ServiceCategory::where('slug', 'plumbing')->firstOrFail()->uuid,
            'description' => 'The bathroom tap keeps dripping all night and the washer looks worn out.',
            'city_id' => $this->rawalpindi->id,
            'address_line' => 'House 12, Street 4, Saddar',
            'latitude' => 33.5973,
            'longitude' => 73.0479,
        ])->assertCreated()->json('data.id');
    }

    private function job(bool $finish = false): Booking
    {
        $requestId = $this->postRequest();
        $quoteId = $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", ['labour_minor' => 200000])
            ->assertCreated()->json('data.id');
        $bookingId = $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$quoteId}/accept")->assertOk()->json('data.booking.id');

        if ($finish) {
            foreach (['on_way', 'arrived', 'inspecting', 'working', 'completed'] as $step) {
                $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$bookingId}/status", ['step' => $step])->assertOk();
            }
            $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$bookingId}/confirm")->assertOk();
        }

        return Booking::where('uuid', $bookingId)->firstOrFail();
    }

    private function user(UserRole $role, string $name): User
    {
        $user = User::factory()->create(['name' => $name, 'password' => Hash::make('password')]);
        $user->forceFill([
            'phone' => '+923'.str_pad((string) random_int(0, 999999999), 9, '0', STR_PAD_LEFT),
            'status' => 'active',
            'city_id' => $this->rawalpindi->id,
        ])->save();
        $user->assignRole($role->value);

        return $user;
    }

    /** @return array{0: User, 1: TechnicianProfile} */
    private function professional(): array
    {
        $user = $this->user(UserRole::Technician, 'Pro '.Str::random(5));
        $profile = new TechnicianProfile;
        $profile->forceFill([
            'user_id' => $user->id,
            'slug' => 'pro-'.Str::lower(Str::random(8)),
            'city_id' => $this->rawalpindi->id,
            'latitude' => 33.5651,
            'longitude' => 73.0169,
            'service_radius_km' => 20,
            'verification_status' => VerificationStatus::Verified,
            'is_available' => true,
            'is_accepting_jobs' => true,
        ])->save();

        TechnicianService::create([
            'technician_profile_id' => $profile->id,
            'service_category_id' => ServiceCategory::where('slug', 'plumbing')->firstOrFail()->id,
            'is_active' => true,
        ]);

        return [$user, $profile];
    }
}
