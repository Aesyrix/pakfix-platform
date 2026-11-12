<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Enums\UserRole;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\ServiceCategorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * The catalogue's sections (Home, Car & Bike, Electronics), the categories
 * added in November 2026, and the folded near-duplicates.
 */
class CatalogueSectionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_every_category_says_its_section_and_the_new_ones_are_grouped(): void
    {
        $top = collect($this->getJson('/api/v1/services/categories')->assertOk()->json('data'));

        $this->assertTrue($top->every(fn (array $c) => in_array($c['section'], ['home', 'vehicle', 'electronics'], true)));
        $this->assertEqualsCanonicalizing(
            ['roadside-help', 'car-mechanic', 'car-electrician', 'car-ac', 'car-wash-detailing', 'bike-mechanic'],
            $top->where('section', 'vehicle')->pluck('slug')->all()
        );
        $this->assertEqualsCanonicalizing(
            ['tv-led-repair', 'laptop-computer-repair', 'mobile-phone-repair'],
            $top->where('section', 'electronics')->pluck('slug')->all()
        );

        $roadside = $top->firstWhere('slug', 'roadside-help');
        $this->assertTrue($roadside['is_emergency']);
        $this->assertContains('battery-jump-start', array_column($roadside['children'], 'slug'));
        // Sub-services carry their parent's section.
        $this->assertSame(['vehicle'], array_values(array_unique(array_column($roadside['children'], 'section'))));
    }

    public function test_near_duplicates_are_sub_services_not_separate_categories(): void
    {
        $top = collect($this->getJson('/api/v1/services/categories')->assertOk()->json('data'));

        foreach (['cleaning' => 'deep-cleaning', 'ceiling' => 'false-ceiling', 'construction' => 'masonry'] as $parent => $child) {
            $this->assertNull($top->firstWhere('slug', $child), "$child should not be top level");
            $this->assertContains($child, array_column($top->firstWhere('slug', $parent)['children'], 'slug'));
        }
        // Their own pages still work.
        $this->getJson('/api/v1/services/categories/deep-cleaning')->assertOk();
    }

    public function test_adding_to_a_live_catalogue_folds_duplicates_and_keeps_admin_edits(): void
    {
        // A live database from before: Deep Cleaning top level, no Car & Bike yet.
        ServiceCategory::where('slug', 'deep-cleaning')->update(['parent_id' => null]);
        Service::whereIn('service_category_id', ServiceCategory::whereIn('section', ['vehicle', 'electronics'])->pluck('id'))->forceDelete();
        ServiceCategory::whereIn('section', ['vehicle', 'electronics'])->whereNotNull('parent_id')->forceDelete();
        ServiceCategory::whereIn('section', ['vehicle', 'electronics'])->forceDelete();
        // A category the admin deleted stays deleted.
        ServiceCategory::where('slug', 'gardening')->delete();
        ServiceCategory::query()->update(['section' => 'home']);
        ServiceCategory::where('slug', 'plumbing')->update(['name' => 'Plumbing (edited by admin)', 'sort_order' => 99]);

        (new ServiceCategorySeeder)->addMissing();
        (new ServiceCategorySeeder)->addMissing(); // safe to run twice

        $plumbing = ServiceCategory::where('slug', 'plumbing')->first();
        $this->assertSame('Plumbing (edited by admin)', $plumbing->name);
        $this->assertSame(99, $plumbing->sort_order);
        $this->assertSame('cleaning', ServiceCategory::find(ServiceCategory::where('slug', 'deep-cleaning')->value('parent_id'))->slug);
        $this->assertSame(1, ServiceCategory::where('slug', 'car-ac')->count());
        $this->assertSame(0, ServiceCategory::where('slug', 'gardening')->count());
        $this->assertSame(2, Service::whereIn('slug', ['car-wash-at-home', 'car-interior-detailing'])->count());
        $this->assertSame('vehicle', ServiceCategory::where('slug', 'car-ac-repair')->value('section'));
    }

    public function test_an_admin_moving_a_category_moves_its_sub_services_too(): void
    {
        $admin = User::factory()->create();
        $admin->forceFill(['status' => 'active'])->save();
        $admin->assignRole(UserRole::Admin->value);
        $tv = ServiceCategory::where('slug', 'tv-led-repair')->first();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/service-categories/{$tv->uuid}", ['section' => 'home'])
            ->assertOk()
            ->assertJsonPath('data.section', 'home');

        $this->assertSame(['home'], ServiceCategory::where('parent_id', $tv->id)->distinct()->pluck('section')->all());

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/service-categories/{$tv->uuid}", ['section' => 'garage'])
            ->assertUnprocessable();
    }

    #[DataProvider('problems')]
    public function test_triage_sends_vehicle_and_gadget_problems_to_the_right_category(string $description, string $slug): void
    {
        $data = $this->postJson('/api/v1/ai/triage', ['description' => $description])->assertOk()->json('data');

        $this->assertSame($slug, $data['matches'][0]['category']['slug'] ?? null, $description);
    }

    public static function problems(): array
    {
        return [
            'car ac' => ['My car AC is not cooling', 'car-ac'],
            'home ac still home' => ['My AC is running but not cooling', 'ac-hvac'],
            'flat tyre' => ['I have a flat tyre on the motorway', 'roadside-help'],
            'car battery' => ['car battery is dead, need a jump start', 'roadside-help'],
            'car locked' => ['locked out of car, keys inside', 'roadside-help'],
            'house lock' => ['I am locked out of my house', 'door-locks'],
            'generator' => ['generator not starting', 'generator'],
            'ups battery' => ['ups battery not charging', 'ups-inverter'],
            'bike' => ['my bike needs tuning', 'bike-mechanic'],
            'tv' => ['LED TV has sound but no picture', 'tv-led-repair'],
            'laptop' => ['laptop is very slow and has a virus', 'laptop-computer-repair'],
            'phone' => ['phone screen broken', 'mobile-phone-repair'],
            'car wash' => ['need a car wash at home', 'car-wash-detailing'],
        ];
    }
}
