<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A service company is an organisation that employs technicians and can
 * assign them work. The owner is a user holding the company role; other
 * staff join through company_members.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('owner_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('legal_name')->nullable();
            $table->string('registration_number')->nullable();
            $table->string('ntn', 32)->nullable();
            $table->text('description')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('website')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone', 20)->nullable();

            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('address_line')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->string('verification_status', 32)->default('not_submitted')->index();
            $table->timestamp('verified_at')->nullable();
            $table->unsignedInteger('year_founded')->nullable();
            $table->unsignedInteger('team_size')->nullable();

            $table->decimal('rating_average', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->unsignedInteger('completed_jobs_count')->default(0);

            // Overrides the platform default when present.
            $table->decimal('commission_percentage', 5, 2)->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['city_id', 'is_active']);
        });

        Schema::create('company_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // owner, manager, dispatcher or technician
            $table->string('role', 32)->default('technician');
            $table->string('job_title')->nullable();
            $table->boolean('can_assign_jobs')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'user_id']);
            $table->index(['user_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_members');
        Schema::dropIfExists('companies');
    }
};
