<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * What makes a job's completion trustworthy: the customer's completion code,
 * where the professional was when they said "arrived" and "done", how the job
 * was completed, strikes against professionals, and the kind and outcome of a
 * dispute. Every column is nullable or has a default, so existing rows stay valid.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('completion_code', 6)->nullable()->after('payment_status');
            // code, customer, professional, auto or admin
            $table->string('completed_via', 16)->nullable()->after('completion_code');
            $table->decimal('arrived_latitude', 10, 7)->nullable()->after('completed_via');
            $table->decimal('arrived_longitude', 10, 7)->nullable()->after('arrived_latitude');
            $table->unsignedInteger('arrived_distance_m')->nullable()->after('arrived_longitude');
            $table->decimal('completed_latitude', 10, 7)->nullable()->after('arrived_distance_m');
            $table->decimal('completed_longitude', 10, 7)->nullable()->after('completed_latitude');
            $table->unsignedInteger('completed_distance_m')->nullable()->after('completed_longitude');
        });

        Schema::table('technician_profiles', function (Blueprint $table) {
            $table->unsignedSmallInteger('strikes_count')->default(0)->after('cancelled_jobs_count');
        });

        Schema::table('disputes', function (Blueprint $table) {
            // problem, no_show or not_paid
            $table->string('kind', 24)->default('problem')->after('technician_profile_id');
            $table->string('raised_by_role', 16)->nullable()->after('kind');
            // complete or cancel: where the job ended up
            $table->string('outcome', 16)->nullable()->after('resolution');
            $table->boolean('strike_given')->default(false)->after('outcome');
        });
    }

    public function down(): void
    {
        Schema::table('disputes', function (Blueprint $table) {
            $table->dropColumn(['kind', 'raised_by_role', 'outcome', 'strike_given']);
        });
        Schema::table('technician_profiles', function (Blueprint $table) {
            $table->dropColumn('strikes_count');
        });
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'completion_code', 'completed_via',
                'arrived_latitude', 'arrived_longitude', 'arrived_distance_m',
                'completed_latitude', 'completed_longitude', 'completed_distance_m',
            ]);
        });
    }
};
