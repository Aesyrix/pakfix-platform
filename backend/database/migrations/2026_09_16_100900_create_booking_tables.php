<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The centre of the platform. A booking carries a human reference
 * (PF-2026-000125) that customers quote on the phone, a full money breakdown
 * in PKR minor units, and a status that only ever moves through
 * BookingStatus. Its history is append-only: booking_status_history is never
 * updated or pruned, so a dispute months later can still be reconstructed.
 *
 * The address is copied onto the booking rather than joined from the
 * property, because a property can be renamed or deleted and the job record
 * must still say where the technician actually went.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('reference', 24)->unique();

            $table->foreignId('customer_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('service_category_id')->constrained()->restrictOnDelete();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('ai_diagnosis_id')->nullable()->constrained()->nullOnDelete();

            $table->foreignId('technician_profile_id')->nullable()
                ->constrained()->nullOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('assigned_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();

            $table->string('status', 40)->default('pending')->index();
            // flexible, standard, urgent or emergency
            $table->string('urgency', 16)->default('standard')->index();
            // book_now, schedule, request_quotes or emergency
            $table->string('booking_type', 24)->default('schedule');

            $table->text('problem_description');
            $table->text('customer_notes')->nullable();

            // Address snapshot, taken at creation time.
            $table->string('contact_name');
            $table->string('contact_phone', 20);
            $table->string('address_line');
            $table->foreignId('city_id')->constrained()->restrictOnDelete();
            $table->foreignId('area_id')->nullable()->constrained()->nullOnDelete();
            $table->string('landmark')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->date('preferred_date')->nullable();
            // A named window such as morning or 14:00-16:00.
            $table->string('preferred_time_slot', 32)->nullable();
            $table->timestamp('scheduled_for')->nullable();

            $table->unsignedBigInteger('budget_min_minor')->nullable();
            $table->unsignedBigInteger('budget_max_minor')->nullable();

            // Money. Every figure is server-calculated; nothing here is ever
            // taken from the client.
            $table->unsignedBigInteger('labour_minor')->default(0);
            $table->unsignedBigInteger('materials_minor')->default(0);
            $table->unsignedBigInteger('visit_fee_minor')->default(0);
            $table->unsignedBigInteger('discount_minor')->default(0);
            $table->unsignedBigInteger('tax_minor')->default(0);
            $table->unsignedBigInteger('total_minor')->default(0);
            $table->unsignedBigInteger('commission_minor')->default(0);
            $table->unsignedBigInteger('technician_payout_minor')->default(0);
            $table->string('currency', 3)->default('PKR');

            $table->foreignId('coupon_id')->nullable();
            $table->string('payment_method', 24)->nullable();
            $table->string('payment_status', 32)->default('pending')->index();

            // Job tracking timestamps.
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('on_way_at')->nullable();
            $table->timestamp('arrived_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('cancelled_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->text('cancellation_reason')->nullable();

            $table->text('technician_notes')->nullable();
            $table->text('work_performed')->nullable();
            $table->boolean('is_reviewed')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['customer_id', 'status']);
            $table->index(['technician_profile_id', 'status']);
            $table->index(['city_id', 'status', 'created_at']);
            $table->index(['service_category_id', 'created_at']);
            $table->index('scheduled_for');
        });

        Schema::create('booking_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('from_status', 40)->nullable();
            $table->string('to_status', 40);
            $table->foreignId('changed_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            // customer, technician, company, admin or system
            $table->string('actor_role', 32)->nullable();
            $table->text('note')->nullable();
            $table->json('meta')->nullable();
            // Append-only: there is no updated_at because a row is never edited.
            $table->timestamp('created_at')->useCurrent();

            $table->index(['booking_id', 'created_at']);
        });

        Schema::create('booking_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            // problem, before, after, invoice or other
            $table->string('context', 24)->default('problem');
            $table->string('type', 16)->default('image');
            $table->string('disk', 32)->default('local');
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->string('original_name')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->timestamps();

            $table->index(['booking_id', 'context']);
        });

        /**
         * Who was invited to a job and what they did about it. This is also
         * where acceptance rate and response time come from.
         */
        Schema::create('booking_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('technician_profile_id')->constrained()->cascadeOnDelete();
            // pending, accepted, declined or expired
            $table->string('status', 16)->default('pending')->index();
            $table->decimal('distance_km', 8, 2)->nullable();
            $table->decimal('match_score', 8, 4)->nullable();
            $table->text('decline_reason')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->unique(['booking_id', 'technician_profile_id']);
            $table->index(['technician_profile_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_invitations');
        Schema::dropIfExists('booking_media');
        Schema::dropIfExists('booking_status_history');
        Schema::dropIfExists('bookings');
    }
};
