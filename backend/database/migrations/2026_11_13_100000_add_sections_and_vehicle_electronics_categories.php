<?php

declare(strict_types=1);

use App\Support\ContentCache;
use Database\Seeders\ServiceCategorySeeder;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Groups the catalogue into sections (Home, Car & Bike, Electronics), adds
 * the Car & Bike and Electronics categories, and folds three near-duplicate
 * categories under their parent (Deep Cleaning under Cleaning, False Ceiling
 * under Ceiling, Masonry under Construction). Nothing is deleted: folded
 * categories keep their id, slug, requests, bookings and professionals, and
 * a professional who chose the parent now also sees its sub-services' jobs.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_categories', function (Blueprint $table) {
            $table->string('section', 20)->default('home')->after('parent_id')->index();
        });

        // A database the seeder has not filled yet (a fresh install) is
        // seeded in full later; only a live catalogue needs the additions.
        if (DB::table('service_categories')->exists()) {
            (new ServiceCategorySeeder)->addMissing();
            ContentCache::flush();
        }
    }

    public function down(): void
    {
        // The added categories stay: requests and bookings may point at them.
        Schema::table('service_categories', function (Blueprint $table) {
            $table->dropIndex(['section']);
            $table->dropColumn('section');
        });
    }
};
