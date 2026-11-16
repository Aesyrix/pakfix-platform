<?php

declare(strict_types=1);

use App\Support\ContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Custom requests: a customer whose job is not in the list picks "Something
 * else" and describes it. The request goes to verified professionals nearby
 * who take custom requests (on by default, switchable in Availability),
 * whatever their trades.
 *
 * "Something else" is a real category flagged `is_custom`, so a request
 * stays an ordinary request everywhere (offers, bookings, chat). It is left
 * out of public lists (services pages, search, a professional's trades).
 */
return new class extends Migration
{
    public const SLUG = 'something-else';

    public function up(): void
    {
        Schema::table('service_categories', function (Blueprint $table) {
            $table->boolean('is_custom')->default(false)->after('is_emergency');
        });

        Schema::table('technician_profiles', function (Blueprint $table) {
            $table->boolean('accepts_custom_requests')->default(true)->after('offers_emergency_service');
        });

        // A database the seeder has not filled yet gets the category from the seeder.
        if (DB::table('service_categories')->exists() && ! DB::table('service_categories')->where('slug', self::SLUG)->exists()) {
            DB::table('service_categories')->insert([
                'uuid' => (string) Str::uuid(),
                'parent_id' => null,
                'section' => 'home',
                'name' => 'Something else',
                'slug' => self::SLUG,
                'description' => 'Not in the list? Describe the job, and nearby professionals who take custom requests will send offers.',
                'icon' => 'circle-help',
                'is_emergency' => false,
                'is_custom' => true,
                'is_popular' => false,
                'is_active' => true,
                'sort_order' => 1000,
                'seo_title' => 'Something else | PakFix',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        ContentCache::flush();
    }

    public function down(): void
    {
        Schema::table('technician_profiles', function (Blueprint $table) {
            $table->dropColumn('accepts_custom_requests');
        });
        Schema::table('service_categories', function (Blueprint $table) {
            $table->dropColumn('is_custom');
        });
    }
};
