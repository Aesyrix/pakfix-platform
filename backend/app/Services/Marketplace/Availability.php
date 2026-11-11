<?php

declare(strict_types=1);

namespace App\Services\Marketplace;

use App\Models\TechnicianProfile;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * When a professional wants to hear about new jobs.
 *
 *  - Working hours: a morning or evening shift, any time (24/7), or their
 *    own start and end time (which may run past midnight).
 *  - Available: their own switch to pause alerts, even within their hours.
 *  - Emergency jobs: opt in to receive them. Emergency requests are shown and
 *    alerted only to professionals who opted in.
 *
 * Outside their hours or while paused they get no alerts, but can still open
 * the app, see nearby jobs and send an offer. Times are Pakistan time.
 */
class Availability
{
    public const WORK_HOURS = ['morning', 'evening', 'always', 'custom'];

    /**
     * Validation rules for availability input.
     *
     * @return array<string, mixed>
     */
    public static function rules(): array
    {
        return [
            'work_hours' => ['sometimes', 'nullable', Rule::in(self::WORK_HOURS)],
            'work_start' => ['nullable', 'required_if:work_hours,custom', 'date_format:H:i'],
            'work_end' => ['nullable', 'required_if:work_hours,custom', 'date_format:H:i', 'different:work_start'],
            'is_available' => ['sometimes', 'boolean'],
            'offers_emergency_service' => ['sometimes', 'boolean'],
        ];
    }

    /** @return array<string, string> */
    public static function messages(): array
    {
        return [
            'work_start.required_if' => 'Choose when your working hours start.',
            'work_end.required_if' => 'Choose when your working hours end.',
            'work_end.different' => 'Your hours must start and end at different times.',
        ];
    }

    /**
     * Applies validated input (only the keys present) to the profile, unsaved.
     *
     * @param  array<string, mixed>  $data
     */
    public function fill(TechnicianProfile $profile, array $data): TechnicianProfile
    {
        if (array_key_exists('work_hours', $data) && $data['work_hours'] !== null) {
            $custom = $data['work_hours'] === 'custom';
            $profile->forceFill([
                'work_hours' => $data['work_hours'],
                'work_start' => $custom ? $data['work_start'] : null,
                'work_end' => $custom ? $data['work_end'] : null,
            ]);
        }
        if (array_key_exists('is_available', $data)) {
            $profile->forceFill(['is_available' => (bool) $data['is_available']]);
        }
        if (array_key_exists('offers_emergency_service', $data)) {
            $profile->forceFill(['offers_emergency_service' => (bool) $data['offers_emergency_service']]);
        }

        return $profile;
    }

    /** Whether it is within the professional's working hours right now. */
    public function isWithinHours(TechnicianProfile $profile, ?Carbon $at = null): bool
    {
        [$start, $end] = $this->window($profile);
        if ($start === null || $end === null) {
            return true; // any time
        }

        $now = ($at ?? now())->copy()->setTimezone($this->timezone())->format('H:i');

        // A window that runs past midnight (22:00–06:00) wraps around.
        return $start < $end
            ? $now >= $start && $now < $end
            : $now >= $start || $now < $end;
    }

    /** Whether new-job alerts reach this professional right now. */
    public function receivesAlerts(TechnicianProfile $profile, bool $emergency = false, ?Carbon $at = null): bool
    {
        if (! $profile->is_available || ! $profile->is_accepting_jobs) {
            return false;
        }
        if ($emergency && ! $profile->offers_emergency_service) {
            return false;
        }

        return $this->isWithinHours($profile, $at);
    }

    /** @return array<string, mixed> */
    public function present(TechnicianProfile $profile): array
    {
        [$start, $end] = $this->window($profile);

        return [
            'work_hours' => $profile->work_hours ?? 'always',
            'work_start' => $start,
            'work_end' => $end,
            'is_available' => (bool) $profile->is_available,
            'offers_emergency_service' => (bool) $profile->offers_emergency_service,
            'within_hours_now' => $this->isWithinHours($profile),
            'receiving_alerts_now' => $this->receivesAlerts($profile),
            'shifts' => config('pakfix.marketplace.availability.shifts'),
        ];
    }

    /** @return array{0: string|null, 1: string|null} Start and end as H:i, or nulls for any time. */
    private function window(TechnicianProfile $profile): array
    {
        $hours = $profile->work_hours ?? 'always';

        if ($hours === 'custom' && $profile->work_start && $profile->work_end) {
            return [substr((string) $profile->work_start, 0, 5), substr((string) $profile->work_end, 0, 5)];
        }

        $shift = config("pakfix.marketplace.availability.shifts.{$hours}");

        return is_array($shift) ? [$shift[0], $shift[1]] : [null, null];
    }

    private function timezone(): string
    {
        return (string) config('pakfix.marketplace.availability.timezone', 'Asia/Karachi');
    }
}
