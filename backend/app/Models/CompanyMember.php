<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanyMember extends Model
{
    public const ROLE_OWNER = 'owner';
    public const ROLE_MANAGER = 'manager';
    public const ROLE_DISPATCHER = 'dispatcher';
    public const ROLE_TECHNICIAN = 'technician';

    protected $fillable = [
        'company_id', 'user_id', 'role', 'job_title',
        'can_assign_jobs', 'is_active', 'joined_at',
    ];

    protected function casts(): array
    {
        return [
            'can_assign_jobs' => 'boolean',
            'is_active' => 'boolean',
            'joined_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function canAssignJobs(): bool
    {
        return $this->is_active
            && ($this->can_assign_jobs || in_array($this->role, [self::ROLE_OWNER, self::ROLE_MANAGER], true));
    }
}
