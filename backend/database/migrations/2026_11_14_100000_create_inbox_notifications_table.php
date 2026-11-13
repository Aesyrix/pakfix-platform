<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The notifications inbox: every notification PakFix sends a person (new
 * job, new offer, job updates, verification, reviews) is kept here, so the
 * app and the website can list them. Chat messages are not: chat has its own
 * unread count. Text is stored in English and Urdu, so the inbox follows the
 * language the person picks on each device.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inbox_notifications', function (Blueprint $table) {
            $table->id();
            $table->uuid()->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 32);
            $table->string('title_en', 160);
            $table->string('body_en', 300)->nullable();
            $table->string('title_ur', 160);
            $table->string('body_ur', 300)->nullable();
            // The app screen it opens, e.g. /bookings/<uuid>; the website path is derived from it.
            $table->string('route', 120)->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'read_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inbox_notifications');
    }
};
