<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;

/**
 * A single admin-editable setting, keyed by a dotted name such as
 * `ai.provider`. Reads normally go through SettingsRepository, which caches
 * the whole table; this model is the storage detail underneath.
 *
 * Secrets (API keys) are encrypted at rest and are never returned by the API,
 * so a compromised admin session leaks the fact that a key exists, not the key.
 */
class Setting extends Model
{
    public const TYPE_STRING = 'string';
    public const TYPE_INTEGER = 'integer';
    public const TYPE_BOOLEAN = 'boolean';
    public const TYPE_JSON = 'json';
    public const TYPE_SECRET = 'secret';

    protected $fillable = [
        'key', 'group', 'value', 'type', 'label', 'description', 'is_secret', 'is_public',
    ];

    protected function casts(): array
    {
        return [
            'is_secret' => 'boolean',
            'is_public' => 'boolean',
        ];
    }

    /** The stored value, decoded to its declared type. */
    public function typedValue(): mixed
    {
        if ($this->value === null) {
            return null;
        }

        if ($this->is_secret) {
            try {
                return Crypt::decryptString($this->value);
            } catch (DecryptException) {
                // A value written before the key rotated is unusable rather
                // than fatal; the caller falls back to config.
                return null;
            }
        }

        return match ($this->type) {
            self::TYPE_INTEGER => (int) $this->value,
            self::TYPE_BOOLEAN => filter_var($this->value, FILTER_VALIDATE_BOOL),
            self::TYPE_JSON => json_decode($this->value, true),
            default => $this->value,
        };
    }

    /** Encodes a value for storage, encrypting it when the key is a secret. */
    public function setTypedValue(mixed $value): void
    {
        if ($value === null) {
            $this->value = null;

            return;
        }

        if ($this->is_secret) {
            $this->value = Crypt::encryptString((string) $value);

            return;
        }

        $this->value = match ($this->type) {
            self::TYPE_BOOLEAN => $value ? '1' : '0',
            self::TYPE_JSON => json_encode($value),
            default => (string) $value,
        };
    }

    /** What the public frontend is allowed to see. Secrets never qualify. */
    public function isSafeForPublicApi(): bool
    {
        return $this->is_public && ! $this->is_secret;
    }
}
