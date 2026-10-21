<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BookingStatus;
use App\Enums\PaymentStatus;
use App\Enums\UrgencyLevel;
use App\Models\Concerns\HasReference;
use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A job. Status is only ever changed through BookingStateMachine, which
 * validates the transition and appends to booking_status_history; assigning
 * to `status` directly anywhere else would lose the audit trail.
 *
 * Money fields are integer PKR minor units and are all computed server-side.
 */
class Booking extends Model
{
    use HasFactory;
    use HasReference;
    use HasUuid;
    use SoftDeletes;

    public const TYPE_BOOK_NOW = 'book_now';
    public const TYPE_SCHEDULE = 'schedule';
    public const TYPE_REQUEST_QUOTES = 'request_quotes';
    public const TYPE_EMERGENCY = 'emergency';

    protected $fillable = [
        'customer_id', 'property_id', 'service_category_id', 'service_id',
        'ai_diagnosis_id', 'technician_profile_id', 'company_id', 'assigned_by_user_id',
        'status', 'urgency', 'booking_type', 'problem_description', 'customer_notes',
        'contact_name', 'contact_phone', 'address_line', 'city_id', 'area_id',
        'landmark', 'latitude', 'longitude', 'preferred_date', 'preferred_time_slot',
        'scheduled_for', 'budget_min_minor', 'budget_max_minor', 'coupon_id',
        'payment_method', 'payment_status', 'technician_notes', 'work_performed',
    ];

    protected function casts(): array
    {
        return [
            'status' => BookingStatus::class,
            'urgency' => UrgencyLevel::class,
            'payment_status' => PaymentStatus::class,
            'preferred_date' => 'date',
            'scheduled_for' => 'datetime',
            'assigned_at' => 'datetime',
            'accepted_at' => 'datetime',
            'on_way_at' => 'datetime',
            'arrived_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'latitude' => 'float',
            'longitude' => 'float',
            'is_reviewed' => 'boolean',
            'labour_minor' => 'integer',
            'materials_minor' => 'integer',
            'visit_fee_minor' => 'integer',
            'discount_minor' => 'integer',
            'tax_minor' => 'integer',
            'total_minor' => 'integer',
            'commission_minor' => 'integer',
            'technician_payout_minor' => 'integer',
        ];
    }

    // ---------------------------------------------------------------------
    // Relationships
    // ---------------------------------------------------------------------

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function technicianProfile(): BelongsTo
    {
        return $this->belongsTo(TechnicianProfile::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(BookingStatusHistory::class)->orderBy('created_at');
    }

    public function media(): HasMany
    {
        return $this->hasMany(BookingMedium::class);
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(BookingInvitation::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(BookingMessage::class)->orderBy('id');
    }

    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    // ---------------------------------------------------------------------
    // Scopes
    // ---------------------------------------------------------------------

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNotIn('status', [
            BookingStatus::CustomerConfirmed->value,
            BookingStatus::Cancelled->value,
            BookingStatus::Refunded->value,
        ]);
    }

    public function scopeForCustomer(Builder $query, int $userId): Builder
    {
        return $query->where('customer_id', $userId);
    }

    public function scopeForTechnician(Builder $query, int $technicianProfileId): Builder
    {
        return $query->where('technician_profile_id', $technicianProfileId);
    }

    // ---------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------

    public function isAssigned(): bool
    {
        return $this->technician_profile_id !== null;
    }

    public function isCancellable(): bool
    {
        return ! $this->status->isTerminal();
    }

    public function isReviewable(): bool
    {
        return ! $this->is_reviewed && in_array($this->status, [
            BookingStatus::Completed,
            BookingStatus::CustomerConfirmed,
        ], true);
    }

    /** The address as recorded on the job, not as it looks on the property now. */
    public function fullAddress(): string
    {
        return collect([
            $this->address_line,
            $this->landmark,
            $this->area?->name,
            $this->city?->name,
        ])->filter()->implode(', ');
    }
}
