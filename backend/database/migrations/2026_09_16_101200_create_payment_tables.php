<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Money. Three rules hold everywhere in this file:
 *
 *  1. Amounts are integer minor units, never floats.
 *  2. `payments` is what the customer owes and pays; `transactions` is the
 *     append-only ledger of every movement, including gateway callbacks.
 *  3. The commission split is computed server-side at completion and frozen
 *     onto the earning row, so a later change to commission rates cannot
 *     silently rewrite what a technician was already promised.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('reference', 32)->unique();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->constrained('users')->restrictOnDelete();

            $table->string('method', 24);
            $table->string('gateway', 32)->nullable();
            $table->string('status', 32)->default('pending')->index();

            $table->unsignedBigInteger('amount_minor');
            $table->unsignedBigInteger('refunded_minor')->default(0);
            $table->string('currency', 3)->default('PKR');

            // Gateway identifiers and the raw callback, kept for reconciliation.
            $table->string('gateway_reference')->nullable()->index();
            $table->json('gateway_payload')->nullable();
            $table->text('failure_reason')->nullable();

            $table->timestamp('paid_at')->nullable();
            // Offline payments are confirmed by a person, and we record who.
            $table->foreignId('confirmed_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['customer_id', 'status']);
            $table->index(['status', 'created_at']);
        });

        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // charge, refund, commission, payout, adjustment or credit
            $table->string('type', 24)->index();
            // credit or debit, from the platform point of view
            $table->string('direction', 8);
            $table->bigInteger('amount_minor');
            $table->string('currency', 3)->default('PKR');
            $table->string('description')->nullable();
            $table->json('meta')->nullable();
            // Ledger rows are never edited.
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'type']);
            $table->index(['booking_id', 'type']);
        });

        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('dispute_id')->nullable();
            $table->foreignId('requested_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();

            $table->unsignedBigInteger('amount_minor');
            $table->string('currency', 3)->default('PKR');
            // pending, approved, processing, completed, rejected or failed
            $table->string('status', 24)->default('pending')->index();
            $table->text('reason')->nullable();
            $table->string('gateway_reference')->nullable();
            $table->timestamp('processed_at')->nullable();

            $table->timestamps();
        });

        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            // Most specific rule wins: technician, then company, then
            // category, then the platform default in config/pakfix.php.
            $table->foreignId('service_category_id')->nullable()
                ->constrained()->cascadeOnDelete();
            $table->foreignId('technician_profile_id')->nullable()
                ->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->cascadeOnDelete();

            // percentage or flat
            $table->string('type', 16)->default('percentage');
            $table->decimal('percentage', 5, 2)->nullable();
            $table->unsignedBigInteger('flat_minor')->nullable();
            $table->unsignedBigInteger('min_minor')->nullable();
            $table->unsignedBigInteger('max_minor')->nullable();

            $table->boolean('is_active')->default(true);
            $table->date('effective_from')->nullable();
            $table->date('effective_to')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'effective_from']);
        });

        Schema::create('technician_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('technician_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payout_id')->nullable();

            $table->unsignedBigInteger('gross_minor');
            $table->unsignedBigInteger('commission_minor');
            $table->unsignedBigInteger('net_minor');
            $table->string('currency', 3)->default('PKR');
            // The rate actually applied, frozen at completion time.
            $table->decimal('commission_percentage', 5, 2)->nullable();

            // pending, available, paid or reversed
            $table->string('status', 16)->default('pending')->index();
            $table->timestamp('available_at')->nullable();
            $table->timestamps();

            $table->unique('booking_id');
            $table->index(['technician_profile_id', 'status']);
        });

        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('reference', 32)->unique();
            $table->foreignId('technician_profile_id')->nullable()
                ->constrained()->nullOnDelete();
            $table->foreignId('company_id')->nullable()->constrained()->nullOnDelete();

            $table->unsignedBigInteger('amount_minor');
            $table->string('currency', 3)->default('PKR');
            // pending, processing, paid or failed
            $table->string('status', 16)->default('pending')->index();
            // bank_transfer, jazzcash or easypaisa
            $table->string('method', 24)->nullable();
            $table->string('account_title')->nullable();
            $table->string('account_number')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('gateway_reference')->nullable();
            $table->text('notes')->nullable();

            $table->foreignId('processed_by_user_id')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payout_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('method', 24);
            $table->string('account_title');
            $table->string('account_number');
            $table->string('bank_name')->nullable();
            $table->string('branch_code', 16)->nullable();
            $table->boolean('is_default')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'is_default']);
        });

        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('number', 32)->unique();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained('users')->restrictOnDelete();

            $table->unsignedBigInteger('subtotal_minor');
            $table->unsignedBigInteger('discount_minor')->default(0);
            $table->unsignedBigInteger('tax_minor')->default(0);
            $table->unsignedBigInteger('total_minor');
            $table->string('currency', 3)->default('PKR');

            // draft, issued, paid, void
            $table->string('status', 16)->default('issued')->index();
            $table->date('issued_on');
            $table->date('due_on')->nullable();
            // Rendered PDF, generated on a queue.
            $table->string('pdf_path')->nullable();
            $table->timestamps();

            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('payout_accounts');
        Schema::dropIfExists('payouts');
        Schema::dropIfExists('technician_earnings');
        Schema::dropIfExists('commissions');
        Schema::dropIfExists('refunds');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('payments');
    }
};
