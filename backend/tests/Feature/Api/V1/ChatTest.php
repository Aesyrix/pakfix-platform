<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Booking;
use App\Models\City;
use App\Models\ServiceCategory;
use App\Models\TechnicianProfile;
use App\Models\TechnicianService;
use App\Models\User;
use App\Services\Marketplace\Chat;
use Database\Seeders\LocationSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\ServiceCategorySeeder;
use Database\Seeders\SettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Booking chat: only the customer and the professional on a job can talk,
 * contact details are masked, photos stay private, and the chat closes after
 * the job.
 */
class ChatTest extends TestCase
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

    public function test_both_sides_chat_and_see_read_receipts(): void
    {
        $booking = $this->job();
        $url = "/api/v1/bookings/{$booking->uuid}/messages";

        $first = $this->actingAs($this->customer)->postJson($url, ['body' => 'Please bring a new washer.'])
            ->assertCreated()
            ->assertJsonPath('data.mine', true)
            ->assertJsonPath('data.from', 'customer')
            ->assertJsonPath('data.read', false)
            ->json('data.id');

        $this->actingAs($this->pro)->getJson('/api/v1/conversations')
            ->assertOk()
            ->assertJsonPath('meta.unread_total', 1)
            ->assertJsonPath('data.0.with.name', 'Ayesha')
            ->assertJsonPath('data.0.unread_count', 1)
            ->assertJsonPath('data.0.last_message.preview', 'Please bring a new washer.');

        $this->actingAs($this->pro)->getJson($url)
            ->assertOk()
            ->assertJsonPath('data.0.mine', false)
            ->assertJsonPath('data.0.read', null)
            ->assertJsonPath('meta.chat.role', 'technician')
            ->assertJsonPath('meta.chat.can_send', true);
        $this->actingAs($this->pro)->postJson($url, ['body' => 'Sure, on my way soon.'])->assertCreated();

        // Polling with ?after returns only the new message; the first now shows as read.
        $this->actingAs($this->customer)->getJson("{$url}?after={$first}")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.body', 'Sure, on my way soon.');
        $this->actingAs($this->customer)->getJson($url)->assertJsonPath('data.0.read', true);
        $this->actingAs($this->customer)->getJson('/api/v1/conversations/unread')->assertJsonPath('data.unread_total', 0);
    }

    public function test_phone_numbers_and_emails_are_masked(): void
    {
        $booking = $this->job();

        $body = $this->actingAs($this->pro)->postJson("/api/v1/bookings/{$booking->uuid}/messages", [
            'body' => 'Call me on 0300-1234567 or +92 321 7654321, mail fahad@example.com. Price 2500, house 12.',
        ])->assertCreated()->json('data.body');

        $this->assertSame(
            'Call me on [number hidden] or [number hidden], mail [email hidden]. Price 2500, house 12.',
            $body,
        );
    }

    public function test_only_the_two_people_on_the_job_can_use_the_chat(): void
    {
        $booking = $this->job();
        [$otherPro] = $this->professional();
        $stranger = $this->user(UserRole::Customer, 'Someone Else');
        $url = "/api/v1/bookings/{$booking->uuid}/messages";

        $this->actingAs($stranger)->getJson($url)->assertNotFound();
        $this->actingAs($otherPro)->postJson($url, ['body' => 'hi'])->assertNotFound();
        $this->actingAs($stranger)->getJson('/api/v1/conversations')->assertOk()->assertJsonCount(0, 'data');

        $this->app['auth']->forgetGuards();
        $this->getJson($url)->assertUnauthorized();
    }

    public function test_photos_are_private_to_the_job(): void
    {
        Storage::fake('local');
        $booking = $this->job();
        $url = "/api/v1/bookings/{$booking->uuid}/messages";

        $path = $this->actingAs($this->customer)->post($url, [
            'photo' => UploadedFile::fake()->image('leak.jpg', 800, 600),
        ], ['Accept' => 'application/json'])->assertCreated()->json('data.photo.path');

        $this->actingAs($this->pro)->get("/api/v1/{$path}")->assertOk();
        $this->actingAs($this->user(UserRole::Customer, 'Nosy Neighbour'))->getJson("/api/v1/{$path}")->assertNotFound();

        $this->actingAs($this->customer)->post($url, [
            'photo' => UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertUnprocessable();
        $this->actingAs($this->customer)->postJson($url, ['body' => '   '])->assertUnprocessable();
    }

    public function test_the_chat_closes_a_week_after_the_job(): void
    {
        $booking = $this->job(['on_way', 'arrived', 'inspecting', 'working', 'completed'], confirm: true);
        $url = "/api/v1/bookings/{$booking->uuid}/messages";

        $this->actingAs($this->customer)->postJson($url, ['body' => 'Thanks!'])->assertCreated();

        $this->travel(Chat::OPEN_AFTER_DAYS + 1)->days();
        $this->actingAs($this->customer)->getJson($url)->assertOk()->assertJsonPath('meta.chat.can_send', false);
        $this->actingAs($this->customer)->postJson($url, ['body' => 'One more thing'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.body.0', 'This chat is closed.');
    }

    public function test_a_cancelled_job_is_read_only(): void
    {
        $booking = $this->job();
        $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$booking->uuid}/cancel", ['reason' => 'Fixed it myself'])->assertOk();

        $this->actingAs($this->pro)->postJson("/api/v1/bookings/{$booking->uuid}/messages", ['body' => 'Why?'])
            ->assertUnprocessable();
    }

    // -----------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------

    /** A booked job between the customer and the professional, moved through `$steps`. */
    private function job(array $steps = [], bool $confirm = false): Booking
    {
        $plumbing = ServiceCategory::where('slug', 'plumbing')->firstOrFail();
        $requestId = $this->actingAs($this->customer)->postJson('/api/v1/requests', [
            'service_category_id' => $plumbing->uuid,
            'description' => 'Water is leaking under the kitchen sink and the cabinet floor is wet.',
            'city_id' => $this->rawalpindi->id,
            'address_line' => 'House 12, Street 4, Saddar',
            'latitude' => 33.5973,
            'longitude' => 73.0479,
        ])->assertCreated()->json('data.id');

        $quoteId = $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", ['labour_minor' => 200000])
            ->assertCreated()->json('data.id');
        $bookingId = $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$quoteId}/accept")->assertOk()->json('data.booking.id');

        foreach ($steps as $step) {
            $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$bookingId}/status", ['step' => $step])->assertOk();
        }
        if ($confirm) {
            $this->actingAs($this->customer)->postJson("/api/v1/bookings/{$bookingId}/confirm")->assertOk();
        }

        return Booking::where('uuid', $bookingId)->firstOrFail();
    }

    private function user(UserRole $role, string $name): User
    {
        $user = User::factory()->create(['name' => $name]);
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
