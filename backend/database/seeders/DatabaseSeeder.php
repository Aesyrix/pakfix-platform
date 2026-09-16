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
            SettingsSeeder::class,
            CmsSeeder::class,
        ]);

        if ($this->shouldSeedDemoData()) {
            $this->call(DemoDataSeeder::class);

            return;
        }

        $this->command?->warn(
            'Skipped demo data in production. Set PAKFIX_SEED_DEMO=1 to include it.'
        );
    }

    private function shouldSeedDemoData(): bool
    {
        if (! app()->environment('production')) {
            return true;
        }

        return filter_var(env('PAKFIX_SEED_DEMO', false), FILTER_VALIDATE_BOOL);
    }
}
