<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Coupons, referrals and the subscription tables. Subscriptions are not
 * switched on at launch, but the schema exists so PakFix Plus does not need a
 * migration against a large live database later.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('code', 40)->unique();
            $table->string('name');
            $table->text('description')->nullable();

            // percentage or fixed
            $table->string('type', 16)->default('percentage');
            $table->decimal('percentage', 5, 2)->nullable();
            $table->unsignedBigInteger('amount_minor')->nullable();
            $table->unsignedBigInteger('max_discount_minor')->nullable();
            $table->unsignedBigInteger('min_booking_minor')->nullable();

            // Empty restriction tables mean the coupon applies everywhere.
            $table->boolean('first_booking_only')->default(false);
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('usage_limit_per_user')->default(1);
            $table->unsignedInteger('used_count')->default(0);

            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'expires_at']);
        });

        Schema::create('coupon_service_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_category_id')->constrained()->cascadeOnDelete();

            $table->unique(['coupon_id', 'service_category_id'], 'coupon_category_unique');
        });

        Schema::create('coupon_cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();

            $table->unique(['coupon_id', 'city_id']);
        });

        Schema::create('coupon_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('discount_minor');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['coupon_id', 'user_id']);
        });

        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('invited_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->string('code', 32)->index();
            $table->string('invited_email')->nullable();
            $table->string('invited_phone', 20)->nullable();

            // pending, registered, qualified or rewarded. A referral only
            // qualifies once the invited user completes a first booking.
            $table->string('status', 16)->default('pending')->index();
            $table->foreignId('qualifying_booking_id')->nullable()
                ->constrained('bookings')->nullOnDelete();

            $table->unsignedBigInteger('referrer_reward_minor')->default(0);
            $table->unsignedBigInteger('invited_reward_minor')->default(0);
            $table->timestamp('registered_at')->nullable();
            $table->timestamp('qualified_at')->nullable();
            $table->timestamp('rewarded_at')->nullable();

            $table->timestamps();

            $table->index(['referrer_id', 'status']);
        });

        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('price_minor');
            $table->string('currency', 3)->default('PKR');
            // monthly or yearly
            $table->string('billing_period', 16)->default('monthly');
            $table->unsignedSmallInteger('trial_days')->default(0);
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained()->restrictOnDelete();
            // trialing, active, past_due, cancelled or expired
            $table->string('status', 16)->default('active')->index();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->string('gateway', 32)->nullable();
            $table->string('gateway_reference')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('plans');
        Schema::dropIfExists('referrals');
        Schema::dropIfExists('coupon_usages');
        Schema::dropIfExists('coupon_cities');
        Schema::dropIfExists('coupon_service_categories');
        Schema::dropIfExists('coupons');
    }
};
