<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Cross-cutting infrastructure: the settings an admin edits, the audit trail
 * of what they changed, per-user notification preferences and the device
 * tokens the future mobile apps will register.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            // Dotted key, e.g. ai.provider or commission.percentage.
            $table->string('key')->unique();
            $table->string('group', 64)->default('general')->index();
            $table->text('value')->nullable();
            // string, integer, boolean, json, array or secret
            $table->string('type', 16)->default('string');
            $table->string('label')->nullable();
            $table->text('description')->nullable();
            // Secrets are encrypted at rest and never leave the API.
            $table->boolean('is_secret')->default(false);
            // Safe to expose to the public frontend bootstrap endpoint.
            $table->boolean('is_public')->default(false);
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_role', 32)->nullable();
            // user.suspended, technician.approved, refund.issued, ...
            $table->string('action', 64)->index();
            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('description')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            // Audit rows are written once and never modified.
            $table->timestamp('created_at')->useCurrent();

            $table->index(['auditable_type', 'auditable_id']);
            $table->index(['actor_id', 'created_at']);
        });

        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // booking_accepted, quote_received, maintenance_reminder, ...
            $table->string('notification_type', 64);
            $table->boolean('database')->default(true);
            $table->boolean('mail')->default(true);
            $table->boolean('sms')->default(false);
            $table->boolean('whatsapp')->default(false);
            $table->boolean('push')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'notification_type'], 'notification_pref_unique');
        });

        Schema::create('device_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('token', 512);
            // android, ios or web
            $table->string('platform', 16);
            $table->string('device_name')->nullable();
            $table->string('app_version', 32)->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
        });

        /**
         * One-time codes for phone verification and OTP sign-in. Only the
         * hash is stored, so a database leak does not hand out live codes.
         */
        Schema::create('verification_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            // phone or email
            $table->string('channel', 16);
            $table->string('destination');
            $table->string('code_hash');
            // login, verify_phone, verify_email or reset_password
            $table->string('purpose', 32)->default('verify_phone');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
            $table->timestamps();

            $table->index(['destination', 'purpose']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('verification_codes');
        Schema::dropIfExists('device_tokens');
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('settings');
    }
};
