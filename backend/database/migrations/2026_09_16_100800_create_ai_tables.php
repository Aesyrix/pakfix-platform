<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Every AI conversation is kept: the raw turns, the structured diagnosis the
 * model produced, the media the customer attached, and whether any of it
 * turned into a booking. That last link is what lets the admin dashboard
 * report an honest AI-to-booking conversion rate instead of a guess.
 *
 * Sessions survive the user, anonymously: a guest can diagnose a problem on
 * the marketing site before an account exists, and the session is claimed
 * once they register.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_sessions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            // Identifies a guest before they have an account, so the session
            // can be claimed at registration.
            $table->string('guest_token', 64)->nullable()->index();

            $table->string('title')->nullable();
            // active, completed or abandoned
            $table->string('status', 20)->default('active')->index();

            // Which provider and model answered, recorded per session because
            // an admin can switch providers at any time.
            $table->string('provider', 32)->nullable();
            $table->string('model', 64)->nullable();

            $table->unsignedInteger('message_count')->default(0);
            $table->unsignedInteger('total_input_tokens')->default(0);
            $table->unsignedInteger('total_output_tokens')->default(0);

            $table->string('ip_address', 45)->nullable();
            $table->timestamp('last_message_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'created_at']);
        });

        Schema::create('ai_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_session_id')->constrained()->cascadeOnDelete();
            // user, assistant or system
            $table->string('role', 16);
            $table->text('content');
            // The parsed structured payload when the assistant returned one.
            $table->json('structured')->nullable();
            $table->unsignedInteger('input_tokens')->nullable();
            $table->unsignedInteger('output_tokens')->nullable();
            $table->unsignedInteger('latency_ms')->nullable();
            // Set when the provider call failed, so a failed turn is visible
            // rather than silently missing.
            $table->text('error')->nullable();
            $table->timestamps();

            $table->index(['ai_session_id', 'created_at']);
        });

        Schema::create('ai_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ai_message_id')->nullable()->constrained()->cascadeOnDelete();
            // image, video, document or audio
            $table->string('type', 16)->default('image');
            $table->string('disk', 32)->default('local');
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->string('original_name')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->timestamps();

            $table->index(['ai_session_id', 'type']);
        });

        Schema::create('ai_diagnoses', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('ai_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ai_message_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('property_asset_id')->nullable()->constrained()->nullOnDelete();

            $table->text('problem_description');
            $table->string('detected_issue');
            $table->text('summary')->nullable();
            $table->json('possible_causes')->nullable();
            $table->json('safe_checks')->nullable();

            // low, medium or high
            $table->string('confidence', 16)->default('medium');
            // low, medium, high or emergency. Drives what guidance is allowed.
            $table->string('safety_level', 16)->default('medium')->index();
            $table->text('safety_notice')->nullable();
            // easy, medium or expert
            $table->string('diy_difficulty', 16)->nullable();

            $table->foreignId('suggested_category_id')->nullable()
                ->constrained('service_categories')->nullOnDelete();

            $table->unsignedBigInteger('estimated_cost_min_minor')->nullable();
            $table->unsignedBigInteger('estimated_cost_max_minor')->nullable();
            $table->unsignedInteger('estimated_minutes_min')->nullable();
            $table->unsignedInteger('estimated_minutes_max')->nullable();

            $table->string('provider', 32)->nullable();
            $table->string('model', 64)->nullable();
            // The untouched provider response, for auditing a bad diagnosis.
            $table->json('raw_response')->nullable();

            // Filled in when this diagnosis became a job.
            $table->foreignId('converted_booking_id')->nullable();
            $table->timestamp('converted_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'created_at']);
            $table->index(['suggested_category_id', 'created_at']);
        });

        Schema::create('ai_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_diagnosis_id')->constrained()->cascadeOnDelete();
            // service, technician, maintenance_task or safety_action
            $table->string('type', 32);
            $table->foreignId('service_category_id')->nullable()
                ->constrained()->nullOnDelete();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('priority')->default(1);
            $table->timestamps();

            $table->index(['ai_diagnosis_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_recommendations');
        Schema::dropIfExists('ai_diagnoses');
        Schema::dropIfExists('ai_media');
        Schema::dropIfExists('ai_messages');
        Schema::dropIfExists('ai_sessions');
    }
};
