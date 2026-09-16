<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A schedule is the recurring rule ("service the AC every 6 months"); a task
 * is one dated occurrence of it; a log is what actually happened. Keeping the
 * three apart means changing a schedule never rewrites history, and a
 * property keeps an honest maintenance record.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_schedules', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_asset_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('service_category_id')->nullable()->constrained()->nullOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            // Recurrence expressed in months, which covers every case the
            // brief lists (monthly filter, quarterly pest control, six-monthly
            // AC service) without dragging in a cron expression parser.
            $table->unsignedSmallInteger('interval_months')->default(6);
            $table->date('starts_on');
            $table->date('ends_on')->nullable();
            $table->date('next_due_on')->index();

            // How many days ahead to notify.
            $table->unsignedSmallInteger('reminder_days_before')->default(7);
            $table->boolean('is_active')->default(true);
            // Seeded schedules come from the platform, not the customer.
            $table->boolean('is_system_generated')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'is_active']);
            $table->index(['property_id', 'is_active']);
        });

        Schema::create('maintenance_tasks', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('maintenance_schedule_id')->nullable()
                ->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_asset_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('service_category_id')->nullable()->constrained()->nullOnDelete();
            // Set when the customer turned the reminder into a real job.
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();

            $table->string('title');
            $table->text('description')->nullable();
            $table->date('due_on')->index();
            // pending, notified, snoozed, booked, completed, skipped or overdue
            $table->string('status', 16)->default('pending')->index();
            $table->unsignedTinyInteger('priority')->default(2);

            $table->timestamp('notified_at')->nullable();
            $table->date('snoozed_until')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status', 'due_on']);
        });

        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->foreignId('property_asset_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('maintenance_task_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('recorded_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();

            $table->string('title');
            $table->text('work_performed')->nullable();
            $table->date('performed_on');
            $table->unsignedBigInteger('cost_minor')->nullable();
            $table->string('currency', 3)->default('PKR');
            $table->string('performed_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['property_id', 'performed_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
        Schema::dropIfExists('maintenance_tasks');
        Schema::dropIfExists('maintenance_schedules');
    }
};
