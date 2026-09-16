<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A handful of relationships are circular across migration files -- a booking
 * points at a coupon, a diagnosis points at the booking it became, an earning
 * points at the payout that settled it. The columns are declared with their
 * tables; the constraints are added here, once every table exists.
 *
 * SQLite cannot add a foreign key to an existing table without rebuilding it,
 * so on SQLite (used for the local zero-dependency spin-up and the test
 * suite) the columns stay plain integers. PostgreSQL and MySQL -- every
 * environment that matters -- get the real constraints.
 */
return new class extends Migration
{
    public function up(): void
    {
        if ($this->isSqlite()) {
            return;
        }

        Schema::table('customer_profiles', function (Blueprint $table) {
            $table->foreign('default_property_id')->references('id')->on('properties')
                ->nullOnDelete();
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->foreign('coupon_id')->references('id')->on('coupons')->nullOnDelete();
        });

        Schema::table('ai_diagnoses', function (Blueprint $table) {
            $table->foreign('converted_booking_id')->references('id')->on('bookings')
                ->nullOnDelete();
        });

        Schema::table('refunds', function (Blueprint $table) {
            $table->foreign('dispute_id')->references('id')->on('disputes')->nullOnDelete();
        });

        Schema::table('technician_earnings', function (Blueprint $table) {
            $table->foreign('payout_id')->references('id')->on('payouts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        if ($this->isSqlite()) {
            return;
        }

        Schema::table('technician_earnings', fn (Blueprint $t) => $t->dropForeign(['payout_id']));
        Schema::table('refunds', fn (Blueprint $t) => $t->dropForeign(['dispute_id']));
        Schema::table('ai_diagnoses', fn (Blueprint $t) => $t->dropForeign(['converted_booking_id']));
        Schema::table('bookings', fn (Blueprint $t) => $t->dropForeign(['coupon_id']));
        Schema::table('customer_profiles', fn (Blueprint $t) => $t->dropForeign(['default_property_id']));
    }

    private function isSqlite(): bool
    {
        return DB::connection()->getDriverName() === 'sqlite';
    }
};
