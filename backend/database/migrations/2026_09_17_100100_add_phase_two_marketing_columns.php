<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 2: the columns and tables the public site needs.
 *
 *  - A category's "trade" name powers local SEO URLs. People search for
 *    "plumber lahore", not "plumbing lahore", so /plumber/lahore is keyed on
 *    the trade, and the category keeps its own name for everything else.
 *  - Common problems give each service page content of its own, which is
 *    what keeps generated pages from being thin duplicates of each other.
 *  - Contact messages come from people who have no account yet, so they
 *    cannot be support tickets (a ticket needs a user).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_categories', function (Blueprint $table) {
            $table->string('trade_slug', 64)->nullable()->unique()->after('slug');
            $table->string('trade_name', 80)->nullable()->after('trade_slug');
            $table->json('common_problems')->nullable()->after('description');
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('phone', 20)->nullable();
            // general, booking, professional, partnership, press or other
            $table->string('topic', 32)->default('general')->index();
            $table->string('subject');
            $table->text('message');
            // new, in_progress or handled
            $table->string('status', 16)->default('new')->index();
            $table->foreignId('handled_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->timestamp('handled_at')->nullable();
            $table->text('internal_note')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');

        Schema::table('service_categories', function (Blueprint $table) {
            $table->dropUnique(['trade_slug']);
            $table->dropColumn(['trade_slug', 'trade_name', 'common_problems']);
        });
    }
};
