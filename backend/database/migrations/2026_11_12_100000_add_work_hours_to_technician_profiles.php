<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * When a professional wants new-job alerts: a shift (morning, evening, any
 * time) or their own hours. Existing professionals default to "any time",
 * which is how alerts already work, so nothing changes for them until they
 * choose.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('technician_profiles', function (Blueprint $table) {
            // morning, evening, always or custom
            $table->string('work_hours', 16)->default('always')->after('is_accepting_jobs');
            // Only for "custom", in Pakistan time; the end may be after midnight.
            $table->time('work_start')->nullable()->after('work_hours');
            $table->time('work_end')->nullable()->after('work_start');
        });
    }

    public function down(): void
    {
        Schema::table('technician_profiles', function (Blueprint $table) {
            $table->dropColumn(['work_hours', 'work_start', 'work_end']);
        });
    }
};
