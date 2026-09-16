<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Categories are a self-referencing tree rather than the category /
 * subcategory pair the brief sketches: the brief also asks for "unlimited
 * categories and subcategories", and a parent_id gives that at any depth
 * without a second near-identical table. `services` are the bookable items
 * that hang off a category, e.g. "AC general service" under AC / HVAC.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_categories', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('parent_id')->nullable()
                ->constrained('service_categories')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon', 64)->nullable();
            $table->string('image_path')->nullable();
            $table->string('color', 9)->nullable();

            $table->boolean('is_emergency')->default(false);
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);

            // Indicative range shown on marketing pages, in PKR minor units.
            $table->unsignedBigInteger('typical_min_minor')->nullable();
            $table->unsignedBigInteger('typical_max_minor')->nullable();

            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['parent_id', 'is_active', 'sort_order']);
            $table->index(['is_popular', 'is_active']);
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('service_category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('inclusions')->nullable();
            $table->text('exclusions')->nullable();

            // pricing_model: fixed | hourly | quote_only | visit_fee
            $table->string('pricing_model', 20)->default('quote_only');
            $table->unsignedBigInteger('base_price_minor')->nullable();
            $table->unsignedBigInteger('visit_fee_minor')->nullable();
            $table->unsignedInteger('estimated_minutes')->nullable();

            $table->boolean('is_emergency')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);

            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['service_category_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
        Schema::dropIfExists('service_categories');
    }
};
