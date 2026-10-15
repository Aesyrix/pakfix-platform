<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Turns a quote request into a marketplace request that nearby professionals
 * can bid on: where the job is (so a pro can see if it is within reach), and
 * the price the customer would like to pay, if they name one.
 *
 * Every column is nullable and nothing existing changes, so this is safe to
 * run against a live database with requests already in it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quote_requests', function (Blueprint $table) {
            $table->string('address_line')->nullable()->after('area_id');
            $table->string('landmark')->nullable()->after('address_line');
            $table->decimal('latitude', 10, 7)->nullable()->after('landmark');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');

            // The customer's own price, inDrive style. Optional; pros may
            // accept it or bid their own.
            $table->unsignedBigInteger('customer_offer_minor')->nullable()->after('budget_max_minor');
            $table->string('preferred_time_slot', 32)->nullable()->after('preferred_date');
            $table->timestamp('cancelled_at')->nullable()->after('expires_at');

            $table->index(['latitude', 'longitude'], 'quote_requests_location_index');
        });
    }

    public function down(): void
    {
        Schema::table('quote_requests', function (Blueprint $table) {
            $table->dropIndex('quote_requests_location_index');
            $table->dropColumn([
                'address_line', 'landmark', 'latitude', 'longitude',
                'customer_offer_minor', 'preferred_time_slot', 'cancelled_at',
            ]);
        });
    }
};
