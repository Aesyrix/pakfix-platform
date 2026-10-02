<?php

declare(strict_types=1);

namespace App\Services\Audit;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * The one way consequential actions get recorded.
 *
 * Callers pass the before and after values they care about; secrets are
 * redacted here so a credential never lands in an audit row, whoever wrote
 * the calling code.
 */
class AuditLogger
{
    private const REDACTED_KEYS = ['password', 'token', 'secret', 'api_key', 'value_secret'];

    public function __construct(private readonly Request $request)
    {
    }

    public function record(
        string $action,
        ?Model $subject = null,
        array $oldValues = [],
        array $newValues = [],
        ?string $description = null,
        ?User $actor = null
    ): AuditLog {
        $actor ??= $this->request->user();

        return AuditLog::create([
            'actor_id' => $actor?->getKey(),
            'actor_role' => $actor?->primaryRole()?->value,
            'action' => $action,
            'auditable_type' => $subject?->getMorphClass(),
            'auditable_id' => $subject?->getKey(),
            'old_values' => $this->redact($oldValues) ?: null,
            'new_values' => $this->redact($newValues) ?: null,
            'description' => $description,
            'ip_address' => $this->request->ip(),
            'user_agent' => substr((string) $this->request->userAgent(), 0, 255),
        ]);
    }

    /** Records only the attributes that actually changed on a saved model. */
    public function recordChanges(string $action, Model $subject, array $original, ?string $description = null): ?AuditLog
    {
        $changes = $subject->getChanges();
        unset($changes['updated_at']);

        if ($changes === []) {
            return null;
        }

        return $this->record(
            $action,
            $subject,
            array_intersect_key($original, $changes),
            $changes,
            $description
        );
    }

    private function redact(array $values): array
    {
        foreach ($values as $key => $value) {
            foreach (self::REDACTED_KEYS as $needle) {
                if (str_contains(strtolower((string) $key), $needle)) {
                    $values[$key] = '[redacted]';
                    continue 2;
                }
            }

            if (is_array($value)) {
                $values[$key] = $this->redact($value);
            }
        }

        return $values;
    }
}
