<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Laravel's stock users table carries name/email/password. PakFix adds the
 * things every role shares: a public UUID (sequential ids never appear in a
 * URL), a phone that can be used to sign in, verification stamps, locale and
 * account status. Role-specific data lives in the profile tables.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->uuid('uuid')->after('id')->nullable()->unique();
            $table->string('phone', 20)->after('email')->nullable()->unique();
            $table->timestamp('phone_verified_at')->after('email_verified_at')->nullable();
            $table->string('avatar_path')->nullable();
            $table->string('locale', 8)->default('en');

            // active | pending | suspended | banned. Kept as a string rather
            // than an enum column so operations can add states without a
            // migration on a live table.
            $table->string('status', 20)->default('active')->index();
            $table->text('status_reason')->nullable();

            $table->foreignId('city_id')->nullable()->after('locale')
                ->constrained()->nullOnDelete();

            $table->string('referral_code', 32)->nullable()->unique();
            $table->foreignId('referred_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();

            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();
            $table->timestamp('onboarding_completed_at')->nullable();

            // 2FA-ready: columns exist so enabling it later is not a migration
            // against a large live table.
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();

            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('city_id');
            $table->dropConstrainedForeignId('referred_by_user_id');
            $table->dropColumn([
                'uuid', 'phone', 'phone_verified_at', 'avatar_path', 'locale',
                'status', 'status_reason', 'referral_code', 'last_login_at',
                'last_login_ip', 'onboarding_completed_at', 'two_factor_secret',
                'two_factor_recovery_codes', 'two_factor_confirmed_at', 'deleted_at',
            ]);
        });
    }
};
