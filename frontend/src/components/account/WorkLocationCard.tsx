'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Crosshair, Home } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { formatWhen } from '@/components/jobs/JobParts';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Checkbox } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import { accountApi, locationApi, type ProAvailability, type WorkLocation, type WorkPlace } from '@/lib/api/endpoints';
import { useAppText, type AppStringKey } from '@/lib/i18n/app-text';
import { cn } from '@/lib/utils/cn';

type T = (key: AppStringKey, params?: Record<string, string | number>) => string;

/** How the work location reads, e.g. "Your current location, near Islamabad" (describeWorkLocation). */
export function describeWorkLocation(t: T, w: WorkLocation): string {
  if (w.source === 'here') return w.city_name ? t('wlHereNear', { city: w.city_name }) : t('wlHere');
  if (w.source === 'city') return t('wlCity', { city: w.city_name ?? '' });
  return w.city_name ? t('wlBaseIn', { city: w.city_name }) : t('wlBase');
}

/** The radius line on Jobs: "Within 20 km of Islamabad" (describeJobsRadius). */
export function describeJobsRadius(t: T, w: WorkLocation | undefined, km: number): string {
  if (w?.source === 'here') return t('jobsRadiusHere', { km });
  if (w?.source === 'city' && w.city_name) return t('jobsRadiusCity', { km, city: w.city_name });
  return t('jobsRadius', { km });
}

type Located = { latitude: number; longitude: number } | 'no-permission' | 'failed';

/** This device's position. With `ask` false it only reads it when location is already allowed. */
async function readPosition(ask: boolean): Promise<Located> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return 'failed';
  if (!ask) {
    try {
      const status = await navigator.permissions?.query({ name: 'geolocation' as PermissionName });
      if (status?.state !== 'granted') return 'no-permission';
    } catch {
      return 'no-permission';
    }
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => resolve(err.code === err.PERMISSION_DENIED ? 'no-permission' : 'failed'),
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
    );
  });
}

/**
 * "Where you work today": the base, the current position or a chosen city,
 * and the auto-update switch. Each change is saved at once (the app's
 * WorkLocationCard).
 */
export function WorkLocationCard({ value, onSaved }: { value: ProAvailability; onSaved: (next: ProAvailability) => void }) {
  const t = useAppText();
  const { locale } = useLocale();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<'here' | 'city' | 'base' | 'follow' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const cities = useQuery({ queryKey: ['cities', 'served'], queryFn: () => locationApi.cities(true), enabled: picking, staleTime: 300_000 });

  const w = value.work_location;
  const source = w?.source ?? 'base';
  const away = source !== 'base';

  async function save(what: NonNullable<typeof busy>, place?: WorkPlace, follow?: boolean) {
    setBusy(what);
    setError(null);
    try {
      let body: Parameters<typeof accountApi.saveWorkLocation>[0] = { ...(place ?? {}) };
      if (place?.mode === 'here') {
        const pos = await readPosition(true);
        if (pos === 'no-permission' || pos === 'failed') {
          setError(t(pos === 'no-permission' ? 'wlNoPermission' : 'wlLocateFailed'));
          return;
        }
        body = { ...body, latitude: pos.latitude, longitude: pos.longitude };
      }
      if (follow !== undefined) body = { ...body, follow_location: follow };
      const r = await accountApi.saveWorkLocation(body);
      onSaved(r.data);
      queryClient.setQueryData(['pro-availability'], r.data);
      void queryClient.invalidateQueries({ queryKey: ['pro-nearby'] });
      toast.success(t('wlSaved'));
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.errors.latitude?.[0] ?? e.errors.longitude?.[0] ?? e.errors.city_id?.[0] ?? e.message);
      } else {
        setError(t('errorGeneric'));
      }
    } finally {
      setBusy(null);
    }
  }

  const Icon = source === 'here' ? Crosshair : source === 'city' ? Building2 : Home;

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div>
          <p className="font-semibold">{t('wlTitle')}</p>
          <p className="mt-0.5 text-sm text-ink-500">{t('wlBody', { km: w?.service_radius_km ?? 20 })}</p>
        </div>

        <div className={cn('flex items-center gap-3 rounded-2xl p-3.5', away ? 'bg-brand-50' : 'bg-surface-muted')}>
          <Icon className="h-5 w-5 shrink-0 text-brand-700" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-bold">{w ? describeWorkLocation(t, w) : t('wlBase')}</p>
            {away && w?.updated_at ? (
              <p className="text-xs text-ink-500">{t('wlUpdated', { when: formatWhen(w.updated_at, locale) })}</p>
            ) : null}
          </div>
        </div>

        {error ? (
          <p role="alert" className="text-sm font-medium text-danger-600">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            loading={busy === 'here'}
            disabled={busy !== null}
            onClick={() => save('here', { mode: 'here' })}
          >
            <Crosshair className="h-4 w-4" aria-hidden="true" />
            {t('wlUseHere')}
          </Button>
          <Button variant="secondary" size="sm" loading={busy === 'city'} disabled={busy !== null} onClick={() => setPicking(true)}>
            <Building2 className="h-4 w-4" aria-hidden="true" />
            {t('wlChooseCity')}
          </Button>
          {away ? (
            <Button variant="ghost" size="sm" loading={busy === 'base'} disabled={busy !== null} onClick={() => save('base', { mode: 'base' })}>
              <Home className="h-4 w-4" aria-hidden="true" />
              {t('wlBackToBase')}
            </Button>
          ) : null}
        </div>

        <div className="rounded-2xl border border-line p-3.5">
          <Checkbox
            label={
              <span>
                <span className="block font-bold">{t('wlFollowTitle')}</span>
                <span className="block text-xs font-normal text-ink-500">{t('wlFollowBody')}</span>
              </span>
            }
            checked={w?.follow_location ?? false}
            disabled={busy !== null}
            // Turning it on starts from where they are now.
            onChange={(event) =>
              event.target.checked ? save('follow', { mode: 'here' }, true) : save('follow', undefined, false)
            }
          />
        </div>
      </CardBody>

      <Dialog open={picking} onClose={() => setPicking(false)} title={t('wlPickCity')} closeLabel={t('actionCancel')}>
        {cities.isPending ? (
          <p className="text-sm text-ink-500">…</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {(cities.data ?? []).map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  onClick={() => {
                    setPicking(false);
                    void save('city', { mode: 'city', city_id: c.id });
                  }}
                >
                  <Building2 className="h-4 w-4 text-ink-500" aria-hidden="true" />
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Dialog>
    </Card>
  );
}

/** When this browser last sent its position (at most every five minutes). */
let lastFollowUpdate = 0;

/**
 * On Jobs: when "Update automatically" is on, sends this device's position
 * each time Jobs opens, only if location is already allowed (never asks).
 */
export function useFollowWorkLocation(availability: ProAvailability | undefined) {
  const queryClient = useQueryClient();
  const started = useRef(false);
  const follow = availability?.work_location?.follow_location === true;
  const mutation = useMutation({
    mutationFn: (pos: { latitude: number; longitude: number }) => accountApi.saveWorkLocation({ mode: 'here', ...pos }),
    onSuccess: (r) => {
      queryClient.setQueryData(['pro-availability'], r.data);
      void queryClient.invalidateQueries({ queryKey: ['pro-nearby'] });
    },
  });
  const { mutate } = mutation;

  useEffect(() => {
    if (!follow || started.current || Date.now() - lastFollowUpdate < 5 * 60_000) return;
    started.current = true;
    lastFollowUpdate = Date.now();
    void readPosition(false).then((pos) => {
      if (typeof pos === 'object') mutate(pos);
    });
  }, [follow, mutate]);
}
