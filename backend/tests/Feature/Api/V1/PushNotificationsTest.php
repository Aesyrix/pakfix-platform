<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\City;
use App\Models\DeviceToken;
use App\Models\ServiceCategory;
use App\Models\TechnicianProfile;
use App\Models\TechnicianService;
use App\Models\User;
use Database\Seeders\LocationSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\ServiceCategorySeeder;
use Database\Seeders\SettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * Push notifications: the right person hears about the right event, in their
 * language; dead tokens are dropped; preferences are respected. Google's token
 * endpoint and FCM are faked; the service account is a throwaway test key.
 */
class PushNotificationsTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;

    private User $pro;

    private City $rawalpindi;

    private string $credentials;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutDefer();

        $pem = $this->throwawayKey();
        $this->credentials = tempnam(sys_get_temp_dir(), 'fcm');
        file_put_contents($this->credentials, json_encode([
            'type' => 'service_account',
            'project_id' => 'pakfix-test',
            'client_email' => 'push@pakfix-test.iam.gserviceaccount.com',
            'private_key' => $pem,
            'token_uri' => 'https://oauth2.googleapis.com/token',
        ]));
        config(['pakfix.push.enabled' => true, 'pakfix.push.credentials_path' => $this->credentials]);
        Cache::flush();

        Http::fake([
            'oauth2.googleapis.com/*' => Http::response(['access_token' => 'test-access-token', 'expires_in' => 3600]),
            'fcm.googleapis.com/*' => function (HttpRequest $request) {
                return $request['message']['token'] === 'dead-token'
                    ? Http::response(['error' => ['status' => 'NOT_FOUND', 'details' => [['errorCode' => 'UNREGISTERED']]]], 404)
                    : Http::response(['name' => 'projects/pakfix-test/messages/1']);
            },
        ]);

        $this->seed([LocationSeeder::class, ServiceCategorySeeder::class, RolePermissionSeeder::class, SettingsSeeder::class]);
        $this->rawalpindi = City::where('slug', 'rawalpindi')->firstOrFail();
        $this->customer = $this->user(UserRole::Customer, 'Ayesha Siddiqui');
        $this->pro = $this->professional();
    }

    protected function tearDown(): void
    {
        @unlink($this->credentials);
        parent::tearDown();
    }

    public function test_a_phone_registers_and_the_api_reports_push_is_ready(): void
    {
        $this->actingAs($this->customer)->postJson('/api/v1/push-tokens', ['token' => 'phone-1', 'platform' => 'android'])->assertOk();
        // Signing in as someone else on the same phone moves the token.
        $this->actingAs($this->pro)->postJson('/api/v1/push-tokens', ['token' => 'phone-1', 'platform' => 'android'])->assertOk();

        $this->assertSame([$this->pro->id], DeviceToken::where('token', 'phone-1')->pluck('user_id')->all());
        $this->getJson('/api/v1')->assertJsonPath('data.push', 'ready');

        $this->actingAs($this->pro)->deleteJson('/api/v1/push-tokens', ['token' => 'phone-1'])->assertOk();
        $this->assertSame(0, DeviceToken::count());
    }

    public function test_the_whole_job_notifies_each_side_at_each_step(): void
    {
        $this->device($this->customer, 'customer-phone');
        $this->device($this->pro, 'pro-phone');

        $requestId = $this->postRequest();
        $this->assertPushed('pro-phone', 'New job near you', "/pro/jobs/{$requestId}");

        $quoteId = $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", ['labour_minor' => 250000])
            ->assertCreated()->json('data.id');
        $this->assertPushed('customer-phone', 'New offer: Rs 2,500', "/requests/{$requestId}");

        $bookingId = $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$quoteId}/accept")->assertOk()->json('data.booking.id');
        $this->assertPushed('pro-phone', 'Your offer was accepted', "/pro/bookings/{$bookingId}");

        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$bookingId}/status", ['step' => 'on_way'])->assertOk();
        $this->assertPushed('customer-phone', 'On the way', "/bookings/{$bookingId}");

        $this->actingAs($this->pro)->postJson("/api/v1/bookings/{$bookingId}/messages", ['body' => 'Reaching in 10 minutes'])->assertCreated();
        $this->assertPushed('customer-phone', 'Pro Fahad', "/chat/{$bookingId}", 'Reaching in 10 minutes');
    }

    public function test_every_notification_except_chat_goes_into_the_inbox(): void
    {
        $requestId = $this->postRequest();
        $quoteId = $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", ['labour_minor' => 250000])
            ->assertCreated()->json('data.id');
        $bookingId = $this->actingAs($this->customer)->postJson("/api/v1/quotes/{$quoteId}/accept")->assertOk()->json('data.booking.id');
        $this->actingAs($this->pro)->postJson("/api/v1/pro/bookings/{$bookingId}/status", ['step' => 'on_way'])->assertOk();
        $this->actingAs($this->pro)->postJson("/api/v1/bookings/{$bookingId}/messages", ['body' => 'Reaching in 10 minutes'])->assertCreated();

        // The customer: the offer and "on the way", newest first; no chat message.
        $customer = $this->actingAs($this->customer)->getJson('/api/v1/notifications')->assertOk();
        $customer->assertJsonPath('meta.unread', 2)
            ->assertJsonPath('data.0.type', 'job_update')
            ->assertJsonPath('data.0.title.en', 'On the way')
            ->assertJsonPath('data.0.title.ur', 'راستے میں')
            ->assertJsonPath('data.0.route', "/bookings/{$bookingId}")
            ->assertJsonPath('data.0.web_path', "/dashboard/bookings/view?id={$bookingId}")
            ->assertJsonPath('data.1.type', 'new_offer')
            ->assertJsonPath('data.1.web_path', "/dashboard/requests/view?id={$requestId}")
            ->assertJsonPath('data.1.read', false);
        $this->assertCount(2, $customer->json('data'));

        // The professional: the new job and the accepted offer.
        $this->actingAs($this->pro)->getJson('/api/v1/notifications')
            ->assertJsonPath('meta.unread', 2)
            ->assertJsonPath('data.0.type', 'offer_accepted')
            ->assertJsonPath('data.0.web_path', "/pro/bookings/view?id={$bookingId}")
            ->assertJsonPath('data.1.type', 'new_job')
            ->assertJsonPath('data.1.web_path', "/pro/jobs/view?id={$requestId}");

        // Reading: one, then all; someone else's is not found.
        $first = $customer->json('data.0.id');
        $this->actingAs($this->pro)->postJson("/api/v1/notifications/{$first}/read")->assertNotFound();
        $this->actingAs($this->customer)->postJson("/api/v1/notifications/{$first}/read")
            ->assertOk()->assertJsonPath('data.read', true)->assertJsonPath('meta.unread', 1);
        $this->actingAs($this->customer)->getJson('/api/v1/notifications/unread')->assertJsonPath('data.unread', 1);
        $this->actingAs($this->customer)->postJson('/api/v1/notifications/read-all')->assertOk()->assertJsonPath('data.unread', 0);
        $this->actingAs($this->customer)->getJson('/api/v1/notifications/unread')->assertJsonPath('data.unread', 0);

        $this->forgetAuthenticatedUser();
        $this->getJson('/api/v1/notifications')->assertUnauthorized();
    }

    public function test_the_inbox_fills_even_when_push_is_off(): void
    {
        config(['pakfix.push.enabled' => false]);
        $this->device($this->customer, 'customer-phone');

        $requestId = $this->postRequest();
        $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", ['labour_minor' => 100000])->assertCreated();

        Http::assertNotSent(fn (HttpRequest $r) => str_contains($r->url(), 'fcm.googleapis.com'));
        $this->actingAs($this->customer)->getJson('/api/v1/notifications')
            ->assertJsonPath('meta.unread', 1)
            ->assertJsonPath('data.0.title.en', 'New offer: Rs 1,000');
    }

    public function test_urdu_speakers_get_urdu_and_dead_tokens_are_switched_off(): void
    {
        $this->customer->forceFill(['locale' => 'ur'])->save();
        $this->device($this->customer, 'dead-token');
        $this->device($this->customer, 'live-token');

        $requestId = $this->postRequest();
        $this->actingAs($this->pro)->postJson("/api/v1/pro/requests/{$requestId}/quotes", ['labour_minor' => 100000])->assertCreated();

        $this->assertPushed('live-token', 'نئی آفر: Rs 1,000', "/requests/{$requestId}");
        $this->assertFalse(DeviceToken::where('token', 'dead-token')->value('is_active'));
        $this->assertTrue(DeviceToken::where('token', 'live-token')->value('is_active'));
    }

    public function test_a_turned_off_type_is_not_sent(): void
    {
        $this->device($this->pro, 'pro-phone');
        DB::table('notification_preferences')->insert([
            'user_id' => $this->pro->id, 'notification_type' => 'new_job', 'push' => false,
            'created_at' => now(), 'updated_at' => now(),
        ]);

        $this->postRequest();

        Http::assertNotSent(fn (HttpRequest $r) => str_contains($r->url(), 'fcm.googleapis.com'));
    }

    public function test_new_job_alerts_follow_working_hours_and_the_available_switch(): void
    {
        $this->device($this->pro, 'pro-phone');
        $profile = $this->pro->technicianProfile;
        $profile->forceFill(['work_hours' => 'morning'])->save(); // 06:00–14:00 Pakistan time

        // 16:00 in Pakistan (11:00 UTC): outside the morning shift, no alert.
        $this->travelTo(now()->setTimezone('Asia/Karachi')->setTime(16, 0)->utc());
        $this->postRequest();
        Http::assertNotSent(fn (HttpRequest $r) => str_contains($r->url(), 'fcm.googleapis.com'));

        // 09:00 in Pakistan: within the shift, alert sent.
        $this->travelTo(now()->setTimezone('Asia/Karachi')->addDay()->setTime(9, 0)->utc());
        $requestId = $this->postRequest();
        $this->assertPushed('pro-phone', 'New job near you', "/pro/jobs/{$requestId}");

        // Paused: no alert even within the shift.
        Http::fake([
            'oauth2.googleapis.com/*' => Http::response(['access_token' => 'test-access-token', 'expires_in' => 3600]),
            'fcm.googleapis.com/*' => Http::response(['name' => 'projects/pakfix-test/messages/2']),
        ]);
        $this->actingAs($this->pro)->patchJson('/api/v1/pro/availability', ['is_available' => false])->assertOk();
        $this->postRequest();
        Http::assertNotSent(fn (HttpRequest $r) => str_contains($r->url(), 'fcm.googleapis.com'));
    }

    public function test_emergency_alerts_reach_only_professionals_who_opted_in(): void
    {
        $this->device($this->pro, 'pro-phone');

        $this->postRequest('emergency');
        Http::assertNotSent(fn (HttpRequest $r) => str_contains($r->url(), 'fcm.googleapis.com'));

        $this->actingAs($this->pro)->patchJson('/api/v1/pro/availability', ['offers_emergency_service' => true])->assertOk();
        $requestId = $this->postRequest('emergency');
        $this->assertPushed('pro-phone', 'New job near you', "/pro/jobs/{$requestId}");
    }

    public function test_nothing_is_sent_and_nothing_breaks_without_credentials(): void
    {
        config(['pakfix.push.credentials_path' => '/no/such/file.json']);
        Cache::flush();
        $this->device($this->pro, 'pro-phone');

        $this->postRequest();

        Http::assertNothingSent();
        $this->getJson('/api/v1')->assertJsonPath('data.push', 'not_configured');
    }

    // -----------------------------------------------------------------

    /** A fresh RSA key for this run only (Windows PHP needs its bundled openssl.cnf). */
    private function throwawayKey(): string
    {
        $options = ['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA];
        foreach ([null, getenv('OPENSSL_CONF') ?: null, dirname(PHP_BINARY).'/extras/ssl/openssl.cnf'] as $config) {
            if ($config !== null && ! is_file($config)) {
                continue;
            }
            $key = @openssl_pkey_new($config === null ? $options : [...$options, 'config' => $config]);
            if ($key !== false && @openssl_pkey_export($key, $pem, null, $config === null ? [] : ['config' => $config])) {
                return $pem;
            }
        }
        $this->markTestSkipped('OpenSSL cannot generate keys on this machine.');
    }

    private function assertPushed(string $token, string $title, string $route, ?string $body = null): void
    {
        Http::assertSent(function (HttpRequest $r) use ($token, $title, $route, $body) {
            if (! str_contains($r->url(), 'fcm.googleapis.com')) {
                return false;
            }
            $m = $r['message'];

            return $m['token'] === $token
                && $m['notification']['title'] === $title
                && $m['data']['route'] === $route
                && ($body === null || $m['notification']['body'] === $body)
                && $r->hasHeader('Authorization', 'Bearer test-access-token');
        });
    }

    private function device(User $user, string $token): void
    {
        DeviceToken::create(['user_id' => $user->id, 'token' => $token, 'platform' => 'android', 'is_active' => true]);
    }

    private function postRequest(string $urgency = 'standard'): string
    {
        return $this->actingAs($this->customer)->postJson('/api/v1/requests', [
            'service_category_id' => ServiceCategory::where('slug', 'plumbing')->firstOrFail()->uuid,
            'description' => 'The bathroom tap keeps dripping all night and the washer looks worn out.',
            'city_id' => $this->rawalpindi->id,
            'address_line' => 'House 12, Street 4, Saddar',
            'latitude' => 33.5973,
            'longitude' => 73.0479,
            'urgency' => $urgency,
        ])->assertCreated()->json('data.id');
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

    private function professional(): User
    {
        $user = $this->user(UserRole::Technician, 'Fahad Khan');
        $profile = new TechnicianProfile;
        $profile->forceFill([
            'user_id' => $user->id,
            'business_name' => 'Pro Fahad',
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

        return $user;
    }
}
