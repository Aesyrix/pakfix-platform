<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A customer can hold any number of properties, and each property accumulates
 * a permanent maintenance history. Assets are the appliances inside a
 * property, which is what makes warranty tracking and service reminders
 * possible rather than guesswork.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('type', 32)->default('house');
            // owner or tenant, from the customer point of view
            $table->string('occupancy', 16)->nullable();

            $table->string('address_line');
            $table->string('address_line_2')->nullable();
            $table->foreignId('city_id')->constrained()->restrictOnDelete();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->string('postal_code', 12)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            // Free-text landmark, which is how most Pakistani addresses are
            // actually found on the ground.
            $table->string('landmark')->nullable();

            $table->unsignedSmallInteger('bedrooms')->nullable();
            $table->unsignedSmallInteger('bathrooms')->nullable();
            $table->unsignedSmallInteger('floors')->nullable();
            $table->unsignedInteger('size_value')->nullable();
            // marla, kanal, sqft or sqyd
            $table->string('size_unit', 12)->nullable();
            $table->unsignedSmallInteger('year_built')->nullable();

            $table->text('notes')->nullable();
            $table->string('access_instructions')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'is_active']);
            $table->index(['city_id', 'area_id']);
        });

        Schema::create('property_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->string('disk', 32)->default('local');
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->string('caption')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('property_assets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_category_id')->nullable()
                ->constrained()->nullOnDelete();

            $table->string('name');
            // ac, refrigerator, washing_machine, water_heater, ups, inverter,
            // water_pump, generator, microwave, dishwasher or other
            $table->string('type', 40);
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('location_in_property')->nullable();

            $table->date('purchase_date')->nullable();
            $table->unsignedBigInteger('purchase_price_minor')->nullable();
            $table->date('warranty_expires_on')->nullable();
            $table->date('last_serviced_on')->nullable();
            $table->date('next_service_due_on')->nullable();
            // How often this asset wants attention, in months.
            $table->unsignedSmallInteger('service_interval_months')->nullable();

            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['property_id', 'is_active']);
            $table->index('next_service_due_on');
        });

        Schema::create('property_asset_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_asset_id')->constrained()->cascadeOnDelete();
            // photo, invoice, warranty_card, manual or other
            $table->string('type', 32)->default('photo');
            $table->string('disk', 32)->default('local');
            $table->string('path');
            $table->string('original_name')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->timestamps();

            $table->index(['property_asset_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_asset_media');
        Schema::dropIfExists('property_assets');
        Schema::dropIfExists('property_images');
        Schema::dropIfExists('properties');
    }
};
