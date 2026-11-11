'use client';

import { Clock, Moon, Siren, Sun, Timer } from 'lucide-react';
import type { ReactNode } from 'react';
import { useT } from '@/components/i18n/LocaleProvider';
import { Checkbox, Input } from '@/components/ui/Input';
import type { WorkHours } from '@/lib/api/endpoints';
import { cn } from '@/lib/utils/cn';

/** What a professional chooses: working hours and emergency jobs. Same as the app's picker. */
export interface AvailabilityChoice {
  work_hours: WorkHours;
  work_start: string;
  work_end: string;
  offers_emergency_service: boolean;
}

export const DEFAULT_AVAILABILITY: AvailabilityChoice = {
  work_hours: 'always',
  work_start: '',
  work_end: '',
  offers_emergency_service: false,
};

/** Custom hours need a start and a different end. */
export function availabilityComplete(c: AvailabilityChoice): boolean {
  return c.work_hours !== 'custom' || (c.work_start !== '' && c.work_end !== '' && c.work_start !== c.work_end);
}

/** The fields the API takes (times only for custom hours). */
export function availabilityPayload(c: AvailabilityChoice) {
  return {
    work_hours: c.work_hours,
    offers_emergency_service: c.offers_emergency_service,
    ...(c.work_hours === 'custom' ? { work_start: c.work_start, work_end: c.work_end } : {}),
  };
}

const OPTIONS: Array<{ value: WorkHours; icon: ReactNode; label: [string, string]; hint: [string, string] }> = [
  { value: 'morning', icon: <Sun className="h-5 w-5" />, label: ['Morning', 'صبح'], hint: ['6 AM – 2 PM', 'صبح 6 – دوپہر 2'] },
  { value: 'evening', icon: <Moon className="h-5 w-5" />, label: ['Evening', 'شام'], hint: ['2 PM – 10 PM', 'دوپہر 2 – رات 10'] },
  { value: 'always', icon: <Clock className="h-5 w-5" />, label: ['24/7', '24/7'], hint: ['Any time, day or night', 'کسی بھی وقت، دن ہو یا رات'] },
  { value: 'custom', icon: <Timer className="h-5 w-5" />, label: ['My own hours', 'اپنے اوقات'], hint: ['Choose when you start and finish', 'شروع اور ختم ہونے کا وقت خود چنیں'] },
];

export function AvailabilityPicker({
  value,
  onChange,
  error,
}: {
  value: AvailabilityChoice;
  onChange: (next: AvailabilityChoice) => void;
  error?: string | null;
}) {
  const t = useT();

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-bold text-foreground">{t('When do you want job alerts?', 'آپ کو کام کے الرٹ کب چاہییں؟')}</p>
        <p className="mt-0.5 text-xs text-ink-500">
          {t(
            'We only alert you to new jobs during these hours (Pakistan time). You can change this any time.',
            'ہم صرف انہی اوقات (پاکستان کا وقت) میں نئے کام کا الرٹ بھیجیں گے۔ آپ اسے کبھی بھی بدل سکتے ہیں۔'
          )}
        </p>
      </div>

      <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected = value.work_hours === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-all duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500',
                selected ? 'border-brand-600 bg-brand-100/40 shadow-xs' : 'border-line hover:bg-surface-muted'
              )}
            >
              <input
                type="radio"
                name="work_hours"
                value={option.value}
                checked={selected}
                onChange={() => onChange({ ...value, work_hours: option.value })}
                className="sr-only"
              />
              <span className={selected ? 'text-brand-600' : 'text-ink-500'} aria-hidden="true">
                {option.icon}
              </span>
              <span>
                <span className="block text-sm font-bold text-foreground">{t(...option.label)}</span>
                <span className="block text-xs text-ink-500">{t(...option.hint)}</span>
              </span>
            </label>
          );
        })}
      </div>

      {value.work_hours === 'custom' ? (
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="time"
            label={t('From', 'سے')}
            value={value.work_start}
            onChange={(event) => onChange({ ...value, work_start: event.target.value })}
          />
          <Input
            type="time"
            label={t('To', 'تک')}
            value={value.work_end}
            onChange={(event) => onChange({ ...value, work_end: event.target.value })}
          />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm font-medium text-danger-600">
          {error}
        </p>
      ) : null}

      <div className="rounded-2xl border border-line p-3.5">
        <Checkbox
          label={
            <span className="flex items-start gap-2">
              <Siren className="mt-0.5 h-4 w-4 shrink-0 text-danger-600" aria-hidden="true" />
              <span>
                <span className="block font-bold">{t('Emergency jobs', 'ایمرجنسی کام')}</span>
                <span className="block text-xs font-normal text-ink-500">
                  {t(
                    'Get urgent jobs that need someone fast, like gas leaks, burst pipes or power faults.',
                    'ایسے فوری کام جن میں جلد کسی کی ضرورت ہو، جیسے گیس لیک، پائپ پھٹنا یا بجلی کی خرابی۔'
                  )}
                </span>
              </span>
            </span>
          }
          checked={value.offers_emergency_service}
          onChange={(event) => onChange({ ...value, offers_emergency_service: event.target.checked })}
        />
      </div>
    </div>
  );
}
