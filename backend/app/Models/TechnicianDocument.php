<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * An identity document. These live on a private disk and are only ever
 * reachable through a short-lived signed URL, never a public path.
 */
class TechnicianDocument extends Model
{
    public const TYPE_CNIC_FRONT = 'cnic_front';
    public const TYPE_CNIC_BACK = 'cnic_back';
    public const TYPE_PHOTO = 'photo';
    public const TYPE_CERTIFICATE = 'certificate';
    public const TYPE_UTILITY_BILL = 'utility_bill';
    public const TYPE_BUSINESS_REGISTRATION = 'business_registration';
    public const TYPE_OTHER = 'other';

    protected $fillable = [
        'technician_verification_id', 'type', 'disk', 'path',
        'original_name', 'mime_type', 'size_bytes',
    ];

    // The storage path is never exposed; callers ask for a signed URL instead.
    protected $hidden = ['path', 'disk'];

    public function verification(): BelongsTo
    {
        return $this->belongsTo(TechnicianVerification::class, 'technician_verification_id');
    }

    /** A signed, expiring URL. Only ever handed to an authorised reviewer. */
    public function temporaryUrl(): string
    {
        $minutes = (int) config('pakfix.uploads.private_url_minutes', 10);

        return Storage::disk($this->disk)->temporaryUrl($this->path, now()->addMinutes($minutes));
    }
}
