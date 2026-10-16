<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\City;
use App\Models\ServiceCategory;
use App\Models\TechnicianDocument;
use App\Models\TechnicianProfile;
use App\Models\User;
use Database\Seeders\LocationSeeder;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\ServiceCategorySeeder;
use Database\Seeders\SettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Becoming a verified professional: profile, private CNIC and selfie uploads,
 * submitting, and a person at PakFix approving or rejecting. Documents never
 * leave the API except to a reviewer.
 */
class ProVerificationTest extends TestCase
{
    use RefreshDatabase;

    private City $rawalpindi;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        $this->seed([LocationSeeder::class, ServiceCategorySeeder::class, RolePermissionSeeder::class, SettingsSeeder::class]);
        $this->rawalpindi = City::where('slug', 'rawalpindi')->firstOrFail();
    }

    public function test_a_new_professional_starts_unverified_and_cannot_see_jobs(): void
    {
        $pro = $this->registerPro();

        $this->actingAs($pro)->getJson('/api/v1/pro/profile')
            ->assertOk()
            ->assertJsonPath('data.verification.status', 'not_submitted')
            ->assertJsonPath('data.checklist.can_submit', false)
            ->assertJsonPath('data.checklist.missing_documents', ['cnic_front', 'cnic_back', 'photo']);

        $this->actingAs($pro)->getJson('/api/v1/pro/requests')->assertForbidden();
    }

    public function test_the_profile_sets_trades_city_and_a_20_km_default_radius(): void
    {
        $pro = $this->registerPro();

        $this->actingAs($pro)->putJson('/api/v1/pro/profile', $this->profilePayload())
            ->assertOk()
            ->assertJsonPath('data.city.name', 'Rawalpindi')
            ->assertJsonPath('data.service_radius_km', 20)
            ->assertJsonPath('data.categories.0.slug', 'plumbing')
            ->assertJsonPath('data.checklist.profile_complete', true);

        // Base location falls back to the city centre when no pin is sent.
        $profile = $pro->technicianProfile->refresh();
        $this->assertEqualsWithDelta($this->rawalpindi->latitude, $profile->latitude, 0.0001);

        $this->actingAs($pro)->putJson('/api/v1/pro/profile', [...$this->profilePayload(), 'category_ids' => []])
            ->assertUnprocessable()
            ->assertJsonPath('errors.category_ids.0', 'Choose at least one trade.');
    }

    public function test_documents_are_private_and_a_new_upload_replaces_the_old_one(): void
    {
        $pro = $this->registerPro();

        $this->upload($pro, 'cnic_front')->assertOk()->assertJsonPath('data.checklist.documents', ['cnic_front']);
        $first = TechnicianDocument::where('type', 'cnic_front')->firstOrFail();
        Storage::disk('local')->assertExists($first->path);
        $this->assertStringStartsWith('verification/', $first->path);

        $this->upload($pro, 'cnic_front')->assertOk();
        Storage::disk('local')->assertMissing($first->path);
        $this->assertSame(1, TechnicianDocument::where('type', 'cnic_front')->count());

        // A CNIC must be a photo; only a certificate may be a PDF.
        $this->actingAs($pro)->post('/api/v1/pro/verification/documents', [
            'type' => 'cnic_back',
            'file' => UploadedFile::fake()->create('cnic.pdf', 100, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('file');

        // The storage path never reaches the professional.
        $this->assertStringNotContainsString('verification/', json_encode($this->actingAs($pro)->getJson('/api/v1/pro/profile')->json()));
    }

    public function test_submitting_needs_a_complete_profile_and_all_three_documents(): void
    {
        $pro = $this->registerPro();

        $this->actingAs($pro)->postJson('/api/v1/pro/verification/submit', ['cnic' => '37405-1234567-1'])
            ->assertUnprocessable()->assertJsonValidationErrors('profile');

        $this->actingAs($pro)->putJson('/api/v1/pro/profile', $this->profilePayload())->assertOk();
        $this->upload($pro, 'cnic_front');
        $this->actingAs($pro)->postJson('/api/v1/pro/verification/submit', ['cnic' => '37405-1234567-1'])
            ->assertUnprocessable()->assertJsonValidationErrors('documents');

        $this->upload($pro, 'cnic_back');
        $this->upload($pro, 'photo');
        $this->actingAs($pro)->postJson('/api/v1/pro/verification/submit', ['cnic' => '123'])
            ->assertUnprocessable()->assertJsonValidationErrors('cnic');

        $this->actingAs($pro)->postJson('/api/v1/pro/verification/submit', ['cnic' => '37405-1234567-1'])
            ->assertOk()
            ->assertJsonPath('data.verification.status', 'pending');

        // Locked while under review.
        $this->upload($pro, 'photo')->assertUnprocessable()->assertJsonValidationErrors('verification');
        $this->assertStringNotContainsString('1234567', json_encode($this->actingAs($pro)->getJson('/api/v1/pro/profile')->json()));
    }

    public function test_an_admin_reviews_the_documents_and_approves(): void
    {
        $pro = $this->submittedPro();
        $admin = $this->staff(UserRole::Admin);
        $profile = $pro->technicianProfile;

        $this->actingAs($admin)->getJson('/api/v1/admin/overview')->assertJsonPath('data.permissions.verifications', true);

        $this->actingAs($admin)->getJson('/api/v1/admin/verifications')
            ->assertOk()
            ->assertJsonPath('data.0.id', $profile->uuid)
            ->assertJsonPath('data.0.cnic_masked', '•••••••••5671')
            ->assertJsonPath('data.0.trades', ['Plumbing']);

        $detail = $this->actingAs($admin)->getJson("/api/v1/admin/verifications/{$profile->uuid}")->assertOk()->json('data');
        $this->assertCount(3, $detail['documents']);

        $file = $this->actingAs($admin)->get($detail['documents'][0]['url']);
        $file->assertOk();
        $this->assertStringContainsString('no-store', (string) $file->headers->get('Cache-Control'));

        $this->actingAs($admin)->postJson("/api/v1/admin/verifications/{$profile->uuid}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'verified');

        $this->assertSame('active', $pro->refresh()->status);
        $this->assertNotNull($profile->refresh()->verified_at);
        $this->assertTrue(AuditLog::where('action', 'technician.verified')->exists());

        // Verified: the professional can now see nearby jobs.
        $this->actingAs($pro)->getJson('/api/v1/pro/requests')->assertOk();

        // Only a pending submission can be decided.
        $this->actingAs($admin)->postJson("/api/v1/admin/verifications/{$profile->uuid}/approve")->assertUnprocessable();
    }

    public function test_a_rejection_shows_the_reason_and_the_professional_can_resubmit(): void
    {
        $pro = $this->submittedPro();
        $admin = $this->staff(UserRole::Admin);
        $uuid = $pro->technicianProfile->uuid;

        $this->actingAs($admin)->postJson("/api/v1/admin/verifications/{$uuid}/reject", ['reason' => 'The CNIC photo is blurry.'])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $this->actingAs($pro)->getJson('/api/v1/pro/profile')
            ->assertJsonPath('data.verification.status', 'rejected')
            ->assertJsonPath('data.verification.rejection_reason', 'The CNIC photo is blurry.')
            ->assertJsonPath('data.checklist.can_submit', true);

        $this->upload($pro, 'cnic_front')->assertOk();
        $this->actingAs($pro)->postJson('/api/v1/pro/verification/submit', ['cnic' => '3740512345671'])
            ->assertOk()
            ->assertJsonPath('data.verification.status', 'pending');
    }

    public function test_only_reviewers_can_see_the_queue_or_the_documents(): void
    {
        $pro = $this->submittedPro();
        $uuid = $pro->technicianProfile->uuid;
        $doc = TechnicianDocument::firstOrFail();

        foreach ([$pro, $this->staff(UserRole::Customer), $this->staff(UserRole::SupportAgent)] as $user) {
            $this->actingAs($user)->getJson('/api/v1/admin/verifications')->assertForbidden();
            $this->actingAs($user)->get("/api/v1/admin/verifications/{$uuid}/documents/{$doc->id}", ['Accept' => 'application/json'])->assertForbidden();
            $this->actingAs($user)->postJson("/api/v1/admin/verifications/{$uuid}/approve")->assertForbidden();
        }

        $this->app['auth']->forgetGuards();
        $this->getJson('/api/v1/admin/verifications')->assertUnauthorized();
    }

    // -----------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------

    private function registerPro(): User
    {
        $this->postJson('/api/v1/auth/register', [
            'role' => 'technician',
            'name' => 'Bilal Hussain',
            'email' => 'bilal'.random_int(1000, 9999).'@example.com',
            'phone' => '0300'.random_int(1000000, 9999999),
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'city_id' => $this->rawalpindi->id,
            'accepts_terms' => true,
            'device_name' => 'test',
        ])->assertCreated();

        $user = User::latest('id')->firstOrFail();
        $this->assertSame('pending', $user->status);
        $this->assertNotNull($user->technicianProfile);

        return $user;
    }

    private function submittedPro(): User
    {
        $pro = $this->registerPro();
        $this->actingAs($pro)->putJson('/api/v1/pro/profile', $this->profilePayload())->assertOk();
        foreach (['cnic_front', 'cnic_back', 'photo'] as $type) {
            $this->upload($pro, $type)->assertOk();
        }
        $this->actingAs($pro)->postJson('/api/v1/pro/verification/submit', ['cnic' => '37405-1234567-1'])->assertOk();

        return $pro->refresh();
    }

    private function staff(UserRole $role): User
    {
        $user = User::factory()->create();
        $user->forceFill(['status' => 'active', 'phone' => '+923'.random_int(100000000, 999999999)])->save();
        $user->assignRole($role->value);

        return $user;
    }

    /** @return array<string, mixed> */
    private function profilePayload(): array
    {
        return [
            'business_name' => 'Hussain Plumbing',
            'years_experience' => 8,
            'city_id' => $this->rawalpindi->id,
            'category_ids' => [ServiceCategory::where('slug', 'plumbing')->firstOrFail()->uuid],
        ];
    }

    private function upload(User $pro, string $type): \Illuminate\Testing\TestResponse
    {
        return $this->actingAs($pro)->post('/api/v1/pro/verification/documents', [
            'type' => $type,
            'file' => UploadedFile::fake()->image("{$type}.jpg", 1200, 800),
        ], ['Accept' => 'application/json']);
    }
}
