<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One row per user for details every role shares, plus a customer-specific
 * table for the answers collected during onboarding.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 16)->nullable();
            $table->text('bio')->nullable();
            $table->string('address_line')->nullable();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->string('postal_code', 12)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 20)->nullable();
            $table->timestamps();
        });

        Schema::create('customer_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();

            // owner | tenant — decides which maintenance prompts we show.
            $table->string('occupancy', 16)->nullable();

            // What the customer said they wanted PakFix for, at onboarding.
            $table->json('interests')->nullable();

            $table->foreignId('default_property_id')->nullable();
            $table->unsignedBigInteger('lifetime_spend_minor')->default(0);
            $table->unsignedInteger('completed_bookings_count')->default(0);
            $table->unsignedBigInteger('wallet_balance_minor')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_profiles');
        Schema::dropIfExists('user_profiles');
    }
};
