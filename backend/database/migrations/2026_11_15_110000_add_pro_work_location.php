<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Where a professional is working today. Jobs are matched (and alerts sent)
 * around this place instead of their base while it is set: their current
 * position, or the centre of a city they chose. Clearing it goes back to the
 * base. `follow_location` lets the app update it each time it is opened in
 * Pro mode (only while the app is open; nothing is tracked in the background).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('technician_profiles', function (Blueprint $table) {
            $table->decimal('work_latitude', 10, 7)->nullable()->after('longitude');
            $table->decimal('work_longitude', 10, 7)->nullable()->after('work_latitude');
            // 'here' (their position) or 'city' (a city centre); null = the base.
            $table->string('work_location_source', 8)->nullable()->after('work_longitude');
            $table->foreignId('work_city_id')->nullable()->after('work_location_source')->constrained('cities')->nullOnDelete();
            $table->timestamp('work_location_at')->nullable()->after('work_city_id');
            $table->boolean('follow_location')->default(false)->after('work_location_at');
        });
    }

    public function down(): void
    {
        Schema::table('technician_profiles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('work_city_id');
            $table->dropColumn(['work_latitude', 'work_longitude', 'work_location_source', 'work_location_at', 'follow_location']);
        });
    }
};
