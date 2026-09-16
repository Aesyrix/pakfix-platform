<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Models\City;
use App\Models\CustomerProfile;
use App\Models\TechnicianProfile;
use App\Models\User;
use Database\Seeders\LocationSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RolePermissionSeeder::class, LocationSeeder::class]);
    }

    public function test_a_customer_can_register_and_receives_a_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Ayesha Siddiqui',
            'email' => 'ayesha@example.com',
            'phone' => '03001234567',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Customer->value,
            'accepts_terms' => true,
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['success', 'message', 'data' => ['user' => ['id', 'name', 'roles'], 'token']]);

        $user = User::where('email', 'ayesha@example.com')->first();

        $this->assertNotNull($user);
        // The phone is normalised to the international form on the way in.
        $this->assertSame('+923001234567', $user->phone);
        $this->assertTrue($user->hasRole(UserRole::Customer->value));
        $this->assertSame(User::STATUS_ACTIVE, $user->status);
        $this->assertNotNull($user->uuid);
        $this->assertNotNull($user->referral_code);
        // A customer gets the profile rows that go with the role.
        $this->assertDatabaseHas('user_profiles', ['user_id' => $user->id]);
        $this->assertDatabaseHas('customer_profiles', ['user_id' => $user->id]);
    }

    public function test_registering_as_a_technician_creates_a_pending_profile(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Ahmed Raza',
            'email' => 'ahmed@example.com',
            'phone' => '+923001112221',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Technician->value,
            'accepts_terms' => true,
        ])->assertCreated();

        $user = User::where('email', 'ahmed@example.com')->firstOrFail();

        // A technician can sign in but is not yet bookable.
        $this->assertSame(User::STATUS_PENDING, $user->status);
        $this->assertTrue($user->canAuthenticate());

        $profile = TechnicianProfile::where('user_id', $user->id)->firstOrFail();
        $this->assertFalse($profile->isVerified());
        $this->assertFalse($profile->isBookable());
        $this->assertDatabaseMissing('customer_profiles', ['user_id' => $user->id]);
    }

    public function test_a_staff_role_cannot_be_claimed_at_registration(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Not An Admin',
            'email' => 'sneaky@example.com',
            'phone' => '03009998887',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::SuperAdmin->value,
            'accepts_terms' => true,
        ])->assertStatus(422)->assertJsonPath('success', false)->assertJsonValidationErrors('role');

        $this->assertDatabaseMissing('users', ['email' => 'sneaky@example.com']);
    }

    public function test_registration_rejects_a_duplicate_email_and_a_bad_phone(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Someone Else',
            'email' => 'taken@example.com',
            'phone' => '12345',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Customer->value,
            'accepts_terms' => true,
        ])->assertStatus(422)->assertJsonValidationErrors(['email', 'phone']);
    }

    public function test_a_user_can_sign_in_with_email_or_phone(): void
    {
        $user = $this->makeCustomer();

        $this->postJson('/api/v1/auth/login', [
            'login' => 'sana@example.com',
            'password' => 'password123',
        ])->assertOk()->assertJsonPath('data.user.id', $user->uuid);

        // The same account, reached by its phone number in local format.
        $this->postJson('/api/v1/auth/login', [
            'login' => '03004445553',
            'password' => 'password123',
        ])->assertOk()->assertJsonPath('data.user.id', $user->uuid);
    }

    public function test_bad_credentials_are_rejected_without_revealing_whether_the_account_exists(): void
    {
        $this->makeCustomer();

        $known = $this->postJson('/api/v1/auth/login', [
            'login' => 'sana@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(422);

        $unknown = $this->postJson('/api/v1/auth/login', [
            'login' => 'nobody@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(422);

        $this->assertSame(
            $known->json('errors.login'),
            $unknown->json('errors.login'),
            'A wrong password and an unknown account must give the same answer.'
        );
    }

    public function test_a_suspended_account_cannot_sign_in(): void
    {
        $user = $this->makeCustomer();
        $user->forceFill([
            'status' => User::STATUS_SUSPENDED,
            'status_reason' => 'Suspended pending review.',
        ])->save();

        $this->postJson('/api/v1/auth/login', [
            'login' => 'sana@example.com',
            'password' => 'password123',
        ])->assertForbidden()
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Suspended pending review.');
    }

    public function test_suspending_a_signed_in_user_revokes_access_on_the_next_request(): void
    {
        $user = $this->makeCustomer();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)->getJson('/api/v1/auth/me')->assertOk();

        $user->forceFill(['status' => User::STATUS_BANNED])->save();

        // No waiting for the token to expire: the next call is refused.
        $this->forgetAuthenticatedUser()
            ->withToken($token)->getJson('/api/v1/auth/me')->assertForbidden();
        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_me_requires_authentication_and_returns_the_current_user(): void
    {
        $this->getJson('/api/v1/auth/me')
            ->assertUnauthorized()
            ->assertJsonPath('success', false);

        $user = $this->makeCustomer();

        $this->actingAs($user)->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->uuid)
            ->assertJsonPath('data.email', 'sana@example.com')
            ->assertJsonPath('data.primary_role', UserRole::Customer->value)
            ->assertJsonPath('data.home_path', '/dashboard');
    }

    public function test_the_internal_id_is_never_exposed(): void
    {
        $user = $this->makeCustomer();

        $payload = $this->actingAs($user)->getJson('/api/v1/auth/me')->json('data');

        $this->assertSame($user->uuid, $payload['id']);
        $this->assertNotSame($user->id, $payload['id']);
    }

    public function test_logging_out_revokes_only_the_current_token(): void
    {
        $user = $this->makeCustomer();
        $phone = $user->createToken('phone')->plainTextToken;
        $user->createToken('laptop');

        $this->withToken($phone)->postJson('/api/v1/auth/logout')->assertOk();

        $this->assertSame(1, $user->fresh()->tokens()->count());
        $this->forgetAuthenticatedUser()
            ->withToken($phone)->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_logging_out_everywhere_revokes_every_token(): void
    {
        $user = $this->makeCustomer();
        $token = $user->createToken('phone')->plainTextToken;
        $user->createToken('laptop');

        $this->withToken($token)->postJson('/api/v1/auth/logout-all')
            ->assertOk()
            ->assertJsonPath('data.revoked', 2);

        $this->assertSame(0, $user->fresh()->tokens()->count());
    }

    public function test_login_is_rate_limited(): void
    {
        $this->makeCustomer();

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/v1/auth/login', [
                'login' => 'sana@example.com',
                'password' => 'wrong-password',
            ])->assertStatus(422);
        }

        $this->postJson('/api/v1/auth/login', [
            'login' => 'sana@example.com',
            'password' => 'password123',
        ])->assertStatus(422)->assertJsonFragment(['login' => ['Too many attempts. Try again in 60 seconds.']]);
    }

    public function test_a_referral_code_links_the_two_accounts(): void
    {
        $referrer = $this->makeCustomer();

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Invited Friend',
            'email' => 'friend@example.com',
            'phone' => '03007776665',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Customer->value,
            'referral_code' => $referrer->referral_code,
            'accepts_terms' => true,
        ])->assertCreated();

        $invited = User::where('email', 'friend@example.com')->firstOrFail();

        $this->assertSame($referrer->id, $invited->referred_by_user_id);
        // Registered, but not yet earning: that needs a completed booking.
        $this->assertDatabaseHas('referrals', [
            'referrer_id' => $referrer->id,
            'invited_user_id' => $invited->id,
            'status' => 'registered',
        ]);
    }

    private function makeCustomer(): User
    {
        $user = User::create([
            'name' => 'Sana Malik',
            'email' => 'sana@example.com',
            'phone' => '+923004445553',
            'password' => Hash::make('password123'),
            'city_id' => City::value('id'),
            'status' => User::STATUS_ACTIVE,
        ]);

        $user->assignRole(UserRole::Customer->value);
        CustomerProfile::create(['user_id' => $user->id]);

        return $user;
    }
}
