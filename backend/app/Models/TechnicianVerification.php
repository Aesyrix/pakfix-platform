<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VerificationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * One vetting submission. A rejected technician can submit again, so this is
 * a has-many and the profile reads the latest.
 */
class TechnicianVerification extends Model
{
    protected $fillable = [
        'technician_profile_id', 'status', 'cnic', 'submitted_at',
        'reviewed_at', 'reviewed_by_user_id', 'reviewer_notes', 'rejection_reason',
    ];

    // The CNIC is personal data: it never leaves the API in a serialised model.
    protected $hidden = ['cnic'];

    protected function casts(): array
    {
        return [
            'status' => VerificationStatus::class,
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function technicianProfile(): BelongsTo
    {
        return $this->belongsTo(TechnicianProfile::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(TechnicianDocument::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    public function isPending(): bool
    {
        return $this->status === VerificationStatus::Pending;
    }
}
