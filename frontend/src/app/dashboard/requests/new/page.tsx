'use client';

import { useQuery } from '@tanstack/react-query';
import { LocateFixed } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState, type FormEvent } from 'react';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { currentPositionOrNull, errorText, MoneyField, rupeesToMinor } from '@/components/jobs/JobDialogs';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import { catalogueApi, locationApi } from '@/lib/api/endpoints';
import { customerApi } from '@/lib/api/marketplace';
import type { ServiceCategory } from '@/lib/api/types';
import { CATALOGUE_SECTIONS, sectionOf } from '@/lib/catalogue-sections';
import { useAppText } from '@/lib/i18n/app-text';
import { cn } from '@/lib/utils/cn';

/** Post a request: the app's form, field for field (PostRequestScreen). */
export default function PostRequestPage() {
  return (
    <Suspense fallback={<Container className="py-6"><SkeletonCard /></Container>}>
      <PostRequest />
    </Suspense>
  );
}

const URGENCIES = [
  ['standard', 'urgencyStandard'],
  ['urgent', 'urgencyUrgent'],
  ['emergency', 'urgencyEmergency'],
] as const;

const SLOTS = [
  ['anytime', 'slotAnytime'],
  ['morning', 'slotMorning'],
  ['afternoon', 'slotAfternoon'],
  ['evening', 'slotEvening'],
] as const;

function PostRequest() {
  const t = useAppText();
  const { locale } = useLocale();
  const router = useRouter();
  const toast = useToast();
  const preset = useSearchParams().get('category');
  const presetDescription = useSearchParams().get('description') ?? '';

  const categories = useQuery({ queryKey: ['catalogue-categories'], queryFn: () => catalogueApi.categories(), staleTime: 300_000 });
  const cities = useQuery({ queryKey: ['cities-served'], queryFn: () => locationApi.cities(true), staleTime: 300_000 });

  const flat = useMemo(() => {
    const out: Array<{ c: ServiceCategory; child: boolean }> = [];
    for (const c of categories.data ?? []) {
      out.push({ c, child: false });
      for (const child of c.children ?? []) out.push({ c: child, child: true });
    }
    return out;
  }, [categories.data]);
  const served = useMemo(() => (cities.data ?? []).filter((c) => c.is_served), [cities.data]);

  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState(presetDescription);
  const [cityId, setCityId] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [urgency, setUrgency] = useState<'standard' | 'urgent' | 'emergency'>('standard');
  const [slot, setSlot] = useState<string>('anytime');
  const [offer, setOffer] = useState('');
  const [gps, setGps] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Defaults, like the app: the category from the link, and Rawalpindi.
  const chosenCategory = categoryId || flat.find((f) => f.c.slug === preset)?.c.id || '';
  const chosenCity = cityId ?? served.find((c) => c.slug === 'rawalpindi')?.id ?? served[0]?.id ?? null;
  const guide = flat.find((f) => f.c.id === chosenCategory)?.c.typical_price?.display?.replace(' - ', ' – ');

  async function locate() {
    setLocating(true);
    const position = await currentPositionOrNull();
    setLocating(false);
    if (position) {
      setGps(position);
      setLocationNote(t('postLocationSet'));
    } else {
      setLocationNote(t('postLocationDenied'));
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!chosenCategory) next.service_category_id = t('postServiceHint');
    if (description.trim().length < 10) next.description = t('postDescriptionHint');
    if (address.trim().length < 5) next.address_line = t('postAddressHint');
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    const city = served.find((c) => c.id === chosenCity);
    const latitude = gps?.latitude ?? city?.latitude ?? null;
    const longitude = gps?.longitude ?? city?.longitude ?? null;
    if (!city || latitude === null || longitude === null) {
      setFormError(t('postLocationApprox'));
      return;
    }

    setBusy(true);
    try {
      const created = await customerApi.postRequest({
        service_category_id: chosenCategory,
        description: description.trim(),
        city_id: city.id,
        address_line: address.trim(),
        landmark: landmark.trim() || null,
        latitude,
        longitude,
        urgency,
        customer_offer_minor: rupeesToMinor(offer),
        preferred_time_slot: slot,
      });
      toast.success(t('postSuccess'));
      router.replace(`/dashboard/requests/view?id=${created.id}`);
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.errors).length > 0) {
        setErrors(Object.fromEntries(Object.entries(e.errors).map(([k, v]) => [k, v[0]])));
        setFormError(e.errors.request?.[0] ?? null);
      } else {
        setFormError(errorText(e));
      }
    } finally {
      setBusy(false);
    }
  }

  if (categories.isPending || cities.isPending) {
    return (
      <Container className="max-w-2xl py-6">
        <SkeletonCard />
      </Container>
    );
  }
  if (categories.isError || cities.isError) {
    return (
      <Container className="max-w-2xl py-6">
        <ErrorState
          description={t('errorGeneric')}
          onRetry={() => {
            void categories.refetch();
            void cities.refetch();
          }}
        />
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl py-6 sm:py-8">
      <h1 className="mb-5 font-display text-2xl font-bold">{t('postTitle')}</h1>
      <form onSubmit={submit} noValidate>
        <Card>
          <CardBody className="flex flex-col gap-5">
            <Select
              label={t('postService')}
              value={chosenCategory}
              onChange={(e) => setCategoryId(e.target.value)}
              error={errors.service_category_id}
            >
              <option value="" disabled>
                {t('postServiceHint')}
              </option>
              {CATALOGUE_SECTIONS.map((section) => {
                const rows = flat.filter((f) => sectionOf(f.c) === section.key || (f.child && sectionOfParent(flat, f.c) === section.key));
                if (rows.length === 0) return null;
                return (
                  <optgroup key={section.key} label={locale === 'ur' ? section.ur : section.en}>
                    {rows.map(({ c, child }) => (
                      <option key={c.id} value={c.id}>
                        {child ? `— ${c.name}` : c.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </Select>

            <Textarea
              label={t('postDescription')}
              placeholder={t('postDescriptionHint')}
              rows={4}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
            />

            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 font-semibold">{t('postLocation')}</legend>
              <Select label={t('fieldCity')} value={chosenCity ?? ''} onChange={(e) => setCityId(Number(e.target.value))} error={errors.city_id}>
                {served.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Input
                label={t('postAddress')}
                placeholder={t('postAddressHint')}
                maxLength={255}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                error={errors.address_line}
              />
              <Input label={t('postLandmark')} maxLength={255} value={landmark} onChange={(e) => setLandmark(e.target.value)} error={errors.landmark} />
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="secondary" size="sm" onClick={locate} loading={locating}>
                  <LocateFixed className="h-4 w-4" aria-hidden="true" />
                  {t('postUseMyLocation')}
                </Button>
                <span className="text-sm text-ink-500">{locationNote ?? t('postLocationApprox')}</span>
              </div>
              {errors.latitude ? <p className="text-sm text-danger-600">{errors.latitude}</p> : null}
            </fieldset>

            <ChipGroup
              label={t('postUrgency')}
              options={URGENCIES.map(([value, key]) => [value, t(key)])}
              value={urgency}
              onChange={(v) => setUrgency(v as typeof urgency)}
            />
            <ChipGroup label={t('postWhen')} options={SLOTS.map(([value, key]) => [value, t(key)])} value={slot} onChange={setSlot} />

            <div className="flex flex-col gap-1">
              <MoneyField label={t('postOffer')} value={offer} onChange={setOffer} error={errors.customer_offer_minor} />
              {guide && !errors.customer_offer_minor ? (
                <p className="text-sm font-semibold text-brand-700">{t('typicalPrice', { price: guide })}</p>
              ) : null}
              <p className="text-sm text-ink-500">{t('postOfferHelp')}</p>
            </div>

            {formError ? (
              <p role="alert" className="rounded-xl bg-danger-50 p-3 text-sm text-danger-700">
                {formError}
              </p>
            ) : null}

            <Button type="submit" size="lg" block loading={busy}>
              {t('postSubmit')}
            </Button>
          </CardBody>
        </Card>
      </form>
    </Container>
  );
}

/** A sub-service belongs to its parent's section. */
function sectionOfParent(flat: Array<{ c: ServiceCategory; child: boolean }>, child: ServiceCategory): string {
  const parent = flat.find((f) => !f.child && (f.c.children ?? []).some((c) => c.id === child.id));
  return parent ? sectionOf(parent.c) : sectionOf(child);
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<readonly [string, string]>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup">
        {options.map(([v, text]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(v)}
            className={cn(
              'min-h-10 rounded-[var(--radius-pill)] border px-4 text-sm font-medium transition-colors',
              value === v ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-line bg-surface text-ink-700 hover:border-brand-300'
            )}
          >
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
