<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The professional side of the marketplace: the profile a customer sees, the
 * documents an admin vets, the services a technician offers and the areas
 * they will travel to. Performance counters are denormalised onto the profile
 * because the matcher reads them on every single search.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('technician_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();

            $table->string('slug')->unique();
            $table->string('business_name')->nullable();
            $table->text('bio')->nullable();
            $table->unsignedInteger('years_experience')->default(0);
            $table->json('languages')->nullable();
            $table->json('skills')->nullable();

            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('base_address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->unsignedInteger('service_radius_km')->default(15);

            $table->unsignedBigInteger('hourly_rate_minor')->nullable();
            $table->unsignedBigInteger('visit_fee_minor')->nullable();
            $table->decimal('commission_percentage', 5, 2)->nullable();

            $table->string('verification_status', 32)->default('not_submitted')->index();
            $table->timestamp('verified_at')->nullable();

            $table->boolean('offers_emergency_service')->default(false);
            $table->boolean('is_available')->default(true);
            $table->boolean('is_accepting_jobs')->default(true);
            // Weekly availability windows, keyed by three-letter weekday.
            $table->json('availability')->nullable();

            $table->decimal('rating_average', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->unsignedInteger('completed_jobs_count')->default(0);
            $table->unsignedInteger('cancelled_jobs_count')->default(0);
            // Share of invitations accepted, and median first response time.
            $table->decimal('acceptance_rate', 5, 2)->default(0);
            $table->unsignedInteger('avg_response_minutes')->nullable();

            $table->unsignedTinyInteger('onboarding_percent')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['city_id', 'verification_status', 'is_available']);
            $table->index(['latitude', 'longitude']);
        });

        Schema::create('technician_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technician_profile_id')->constrained()->cascadeOnDelete();
            $table->string('status', 32)->default('pending')->index();
            $table->string('cnic', 20)->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->text('reviewer_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        Schema::create('technician_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technician_verification_id')->constrained()->cascadeOnDelete();
            // cnic_front, cnic_back, photo, certificate, utility_bill,
            // business_registration or other
            $table->string('type', 40);
            // Private disk only. Never served without a signed URL.
            $table->string('disk', 32)->default('local');
            $table->string('path');
            $table->string('original_name')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->timestamps();

            $table->index(['technician_verification_id', 'type']);
        });

        Schema::create('technician_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technician_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedBigInteger('price_minor')->nullable();
            $table->string('pricing_model', 20)->nullable();
            $table->unsignedInteger('experience_years')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['technician_profile_id', 'service_category_id', 'service_id'], 'tech_service_unique');
            $table->index(['service_category_id', 'is_active']);
        });

        Schema::create('technician_service_areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technician_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('city_id')->constrained()->cascadeOnDelete();
            // A null area means the whole city is covered.
            $table->foreignId('area_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('travel_fee_minor')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['technician_profile_id', 'city_id', 'area_id'], 'tech_area_unique');
            $table->index(['city_id', 'area_id', 'is_active']);
        });

        Schema::create('technician_portfolio_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technician_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('before_image_path')->nullable();
            $table->string('after_image_path')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('technician_portfolio_items');
        Schema::dropIfExists('technician_service_areas');
        Schema::dropIfExists('technician_services');
        Schema::dropIfExists('technician_documents');
        Schema::dropIfExists('technician_verifications');
        Schema::dropIfExists('technician_profiles');
    }
};
