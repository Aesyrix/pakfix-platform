<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A professional's rating of the customer on one job. The note is for PakFix only. */
class CustomerRating extends Model
{
    use HasUuid;

    protected $fillable = ['booking_id', 'customer_id', 'technician_profile_id', 'rating', 'note'];

    protected function casts(): array
    {
        return ['rating' => 'integer'];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function technicianProfile(): BelongsTo
    {
        return $this->belongsTo(TechnicianProfile::class);
    }
}
