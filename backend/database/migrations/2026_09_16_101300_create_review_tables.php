<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Reviews are tied to a booking, one per booking, and the booking must have
 * been completed. That constraint is what makes the verified badge mean
 * something; it is enforced in the policy and by the unique index here.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('technician_profile_id')->nullable()
                ->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();

            // The headline score, plus the five dimensions behind it.
            $table->unsignedTinyInteger('rating');
            $table->unsignedTinyInteger('quality_rating')->nullable();
            $table->unsignedTinyInteger('professionalism_rating')->nullable();
            $table->unsignedTinyInteger('communication_rating')->nullable();
            $table->unsignedTinyInteger('value_rating')->nullable();
            $table->unsignedTinyInteger('timeliness_rating')->nullable();

            $table->text('comment')->nullable();
            $table->boolean('is_verified')->default(true);
            $table->boolean('is_published')->default(true);
            $table->boolean('would_recommend')->nullable();

            // The professional gets one right of reply.
            $table->text('response')->nullable();
            $table->timestamp('responded_at')->nullable();

            $table->foreignId('hidden_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->text('moderation_note')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // One review per booking.
            $table->unique('booking_id');
            $table->index(['technician_profile_id', 'is_published', 'created_at']);
            $table->index(['company_id', 'is_published']);
        });

        Schema::create('review_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->constrained()->cascadeOnDelete();
            $table->string('disk', 32)->default('local');
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->timestamps();

            $table->index('review_id');
        });

        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Polymorphic so one table covers saved technicians, companies
            // and frequently used services.
            $table->string('favoritable_type');
            $table->unsignedBigInteger('favoritable_id');
            $table->string('note')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'favoritable_type', 'favoritable_id'], 'favorites_unique');
            $table->index(['favoritable_type', 'favoritable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorites');
        Schema::dropIfExists('review_media');
        Schema::dropIfExists('reviews');
    }
};
