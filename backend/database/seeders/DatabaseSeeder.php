<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Order matters: roles before users, locations before anything with an
 * address, categories before technicians and bookings.
 *
 * Reference data is always seeded. Demo data is skipped in production unless
 * the operator explicitly asks for it with --force plus PAKFIX_SEED_DEMO=1,
 * so a production deploy cannot accidentally create sign-in-able accounts
 * with a known password.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            LocationSeeder::class,
            ServiceCategorySeeder::class,
            ServiceContentSeeder::class,
            SettingsSeeder::class,
            CmsSeeder::class,
        ]);

        if ($this->shouldSeedDemoData()) {
            $this->call(DemoDataSeeder::class);
        } else {
            $this->command?->warn(
                'Skipped demo data in production. Set PAKFIX_SEED_DEMO=1 to include it.'
            );
        }

        // Last, so launch articles are attributed to the admin when one exists.
        $this->call(BlogSeeder::class);
    }

    /**
     * An explicit PAKFIX_SEED_DEMO always wins. Without one, demo accounts are
     * seeded everywhere except production. Content seeders only create what
     * is missing, so re-running this never overwrites admin edits.
     */
    private function shouldSeedDemoData(): bool
    {
        $explicit = getenv('PAKFIX_SEED_DEMO');

        if ($explicit !== false && $explicit !== '') {
            return filter_var($explicit, FILTER_VALIDATE_BOOL);
        }

        return ! app()->environment('production');
    }
}
