<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A quote request goes out to several professionals; each replies with its
 * own quote, and the customer compares them. Accepting one creates (or
 * updates) the booking, which is why a quote carries its own money breakdown
 * rather than editing the booking in place.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quote_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('reference', 24)->unique();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('service_category_id')->constrained()->restrictOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('ai_diagnosis_id')->nullable()->constrained()->nullOnDelete();

            $table->text('description');
            $table->foreignId('city_id')->constrained()->restrictOnDelete();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->string('urgency', 16)->default('standard');
            $table->unsignedBigInteger('budget_min_minor')->nullable();
            $table->unsignedBigInteger('budget_max_minor')->nullable();
            $table->date('preferred_date')->nullable();

            // open, closed or expired
            $table->string('status', 16)->default('open')->index();
            $table->unsignedInteger('quotes_count')->default(0);
            $table->timestamp('expires_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['customer_id', 'status']);
            $table->index(['service_category_id', 'city_id', 'status']);
        });

        Schema::create('quote_request_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_request_id')->constrained()->cascadeOnDelete();
            $table->string('type', 16)->default('image');
            $table->string('disk', 32)->default('local');
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->string('original_name')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->timestamps();
        });

        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('reference', 24)->unique();
            $table->foreignId('quote_request_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('technician_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();

            $table->string('status', 16)->default('draft')->index();

            $table->unsignedBigInteger('labour_minor')->default(0);
            $table->unsignedBigInteger('materials_minor')->default(0);
            $table->unsignedBigInteger('visit_fee_minor')->default(0);
            $table->unsignedBigInteger('discount_minor')->default(0);
            $table->unsignedBigInteger('tax_minor')->default(0);
            $table->unsignedBigInteger('total_minor')->default(0);
            $table->string('currency', 3)->default('PKR');

            $table->unsignedInteger('estimated_minutes')->nullable();
            $table->text('notes')->nullable();
            $table->text('terms')->nullable();
            // Dates and windows the professional could attend.
            $table->json('available_slots')->nullable();

            $table->timestamp('sent_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['customer_id', 'status']);
            $table->index(['technician_profile_id', 'status']);
        });

        Schema::create('quote_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_id')->constrained()->cascadeOnDelete();
            // labour, material, visit_fee or other
            $table->string('type', 24)->default('labour');
            $table->string('description');
            $table->decimal('quantity', 10, 2)->default(1);
            $table->string('unit', 24)->nullable();
            $table->unsignedBigInteger('unit_price_minor')->default(0);
            $table->unsignedBigInteger('total_minor')->default(0);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('quote_id');
        });

        /** Questions a customer asks about a specific quote, before deciding. */
        Schema::create('quote_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quote_id')->constrained()->cascadeOnDelete();
            $table->foreignId('asked_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->text('question');
            $table->text('answer')->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();

            $table->index('quote_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quote_questions');
        Schema::dropIfExists('quote_items');
        Schema::dropIfExists('quotes');
        Schema::dropIfExists('quote_request_media');
        Schema::dropIfExists('quote_requests');
    }
};
