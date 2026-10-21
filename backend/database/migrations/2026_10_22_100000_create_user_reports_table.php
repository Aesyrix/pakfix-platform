<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Safety: people report someone (or one of their messages) for PakFix to
 * review. Required by the App Store and Play policies for apps where users
 * talk to each other. Blocks use the existing `user_blocks` table.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_reports', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reported_user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('booking_message_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reason', 30);
            $table->text('details')->nullable();
            // What was reported, copied at the time, so the evidence survives edits.
            $table->text('snapshot')->nullable();
            $table->string('status', 20)->default('open');
            $table->text('resolution')->nullable();
            $table->foreignId('handled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('handled_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('reported_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_reports');
    }
};
