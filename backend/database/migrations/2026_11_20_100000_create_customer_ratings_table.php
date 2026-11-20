<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Professionals rate customers after a job (1 to 5 stars, an optional note
 * only PakFix sees), so customers build a track record too. One rating per
 * booking.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_ratings', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('booking_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('technician_profile_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            // Seen by PakFix staff only, never by the customer or other pros.
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_ratings');
    }
};
