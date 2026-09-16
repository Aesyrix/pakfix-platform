<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Support tickets and job disputes. A dispute is deliberately separate from a
 * ticket: it is attached to a booking, it can move money, and its outcome is
 * recorded as a decision rather than a conversation.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('reference', 24)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('assigned_to_user_id')->nullable()
                ->constrained('users')->nullOnDelete();

            // booking_issue, payment_issue, technician_issue, refund,
            // account, safety or other
            $table->string('category', 32)->index();
            $table->string('subject');
            $table->text('description');
            $table->string('status', 24)->default('open')->index();
            // low, normal, high or urgent
            $table->string('priority', 16)->default('normal');

            $table->timestamp('first_responded_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->unsignedTinyInteger('satisfaction_rating')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'priority']);
        });

        Schema::create('support_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->text('body');
            // Notes staff leave for each other, never shown to the customer.
            $table->boolean('is_internal_note')->default(false);
            $table->timestamps();

            $table->index(['support_ticket_id', 'created_at']);
        });

        Schema::create('support_message_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_message_id')->constrained()->cascadeOnDelete();
            $table->string('disk', 32)->default('local');
            $table->string('path');
            $table->string('original_name')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->timestamps();
        });

        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('reference', 24)->unique();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('raised_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('technician_profile_id')->nullable()
                ->constrained()->nullOnDelete();
            $table->foreignId('assigned_to_user_id')->nullable()
                ->constrained('users')->nullOnDelete();

            $table->text('description');
            $table->text('requested_resolution')->nullable();
            $table->unsignedBigInteger('requested_amount_minor')->nullable();

            $table->string('status', 24)->default('open')->index();
            // no_action, partial_refund, full_refund,
            // technician_adjustment or account_credit
            $table->string('resolution', 32)->nullable();
            $table->unsignedBigInteger('resolved_amount_minor')->nullable();
            $table->text('resolution_note')->nullable();
            $table->foreignId('resolved_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
        });

        Schema::create('dispute_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dispute_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploaded_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->string('type', 16)->default('image');
            $table->string('disk', 32)->default('local');
            $table->string('path');
            $table->string('original_name')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->timestamps();

            $table->index('dispute_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispute_media');
        Schema::dropIfExists('disputes');
        Schema::dropIfExists('support_message_attachments');
        Schema::dropIfExists('support_messages');
        Schema::dropIfExists('support_tickets');
    }
};
