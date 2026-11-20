'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Check, MapPin, Search, TriangleAlert } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { currentPositionOrNull, errorText, MoneyField, rupeesToMinor } from '@/components/jobs/JobDialogs';
import { PinMap, type LatLng } from '@/components/jobs/PinMap';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Dialog } from '@/components/ui/Dialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input, Textarea } from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import { catalogueApi, locationApi, triageApi, type PinPlace } from '@/lib/api/endpoints';
import { customerApi } from '@/lib/api/marketplace';
import type { ServiceCategory } from '@/lib/api/types';
import { useAppText } from '@/lib/i18n/app-text';
import { cn } from '@/lib/utils/cn';

/**
 * Post a job in three simple steps, exactly like the app (PostRequestScreen):
 *  1. What do you need? (the service is suggested from the words)
 *  2. Where? (move the map; the address and city fill themselves)
 *  3. Your price and time (optional), then "Find professionals".
 * Every way in (Check my problem, a service, Post a request) lands here.
 */
export default function PostRequestPage() {
  return (
    <Suspense fallback={<Container className="py-6"><SkeletonCard /></Container>}>
      <PostRequest />
    </Suspense>
  );
}

/** Islamabad: where the map starts until the browser's position is known. */
const FALLBACK_CENTER: LatLng = { lat: 33.6844, lng: 73.0479 };

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

const WHERE_FIELDS = ['city_id', 'latitude', 'longitude', 'address_line'];

function PostRequest() {
  const t = useAppText();
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const preset = params.get('category');

  const categories = useQuery({
    queryKey: ['catalogue-categories-with-custom'],
    queryFn: () => catalogueApi.categories({ withCustom: true }),
    staleTime: 300_000,
  });

  // The listed services (with sub-services), then "Something else".
  const flat = useMemo(() => {
    const all = categories.data ?? [];
    const out: ServiceCategory[] = [];
    for (const c of all.filter((c) => !c.is_custom)) out.push(c, ...(c.children ?? []));
    out.push(...all.filter((c) => c.is_custom));
    return out;
  }, [categories.data]);

  const [step, setStep] = useState(0);

  // Step 1
  const [description, setDescription] = useState(params.get('description') ?? '');
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [picking, setPicking] = useState(false);
  const detectRun = useRef(0);

  // Step 2
  const [pin, setPin] = useState<LatLng | null>(null);
  const [moveTo, setMoveTo] = useState<LatLng | null>(null);
  const [place, setPlace] = useState<PinPlace | null>(null);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [placeFailed, setPlaceFailed] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const askedForPosition = useRef(false);
  const placeRun = useRef(0);
  const placeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 3
  const [offer, setOffer] = useState('');
  const [urgency, setUrgency] = useState<'standard' | 'urgent' | 'emergency'>('standard');
  const [slot, setSlot] = useState('anytime');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Chosen by hand, else from the link (a service or "Something else"), else suggested from the words.
  const category =
    flat.find((c) => c.id === pickedId) ?? flat.find((c) => c.slug === preset) ?? flat.find((c) => c.slug === suggestedSlug) ?? null;

  // Suggest the service from the words, a moment after typing stops.
  useEffect(() => {
    const text = description.trim();
    if (text.length < 10) return;
    const run = ++detectRun.current;
    const timer = setTimeout(async () => {
      setDetecting(true);
      try {
        const result = await triageApi.triage(text);
        if (run !== detectRun.current) return;
        setEmergency(result.is_emergency);
        if (result.is_emergency) setUrgency('emergency');
        setSuggestedSlug(result.matches[0]?.category.slug ?? result.custom_category?.slug ?? null);
      } catch {
        // No suggestion: the person picks the service themselves.
      } finally {
        if (run === detectRun.current) setDetecting(false);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [description]);

  const lookUp = useCallback(
    (at: LatLng) => {
      setPin(at);
      setPlaceLoading(true);
      setPlaceFailed(false);
      if (placeTimer.current) clearTimeout(placeTimer.current);
      placeTimer.current = setTimeout(async () => {
        const run = ++placeRun.current;
        try {
          const found = await locationApi.reverse(at.lat, at.lng);
          if (run !== placeRun.current) return;
          setPlace(found);
          setErrors((e) => withoutKeys(e, WHERE_FIELDS));
        } catch {
          if (run !== placeRun.current) return;
          setPlace(null);
          setPlaceFailed(true);
        } finally {
          if (run === placeRun.current) setPlaceLoading(false);
        }
      }, 450);
    },
    []
  );

  async function goToMyLocation() {
    setLocating(true);
    setLocationNote(null);
    const position = await currentPositionOrNull();
    setLocating(false);
    if (position) setMoveTo({ lat: position.latitude, lng: position.longitude });
    else setLocationNote(t('postLocationOff'));
  }

  const step1Ready = description.trim().length >= 10 && category !== null;
  const step2Ready = pin !== null && !placeLoading && (place?.served ?? false);

  function next() {
    setStep((s) => s + 1);
    // Opening the map for the first time: start at the browser's position.
    if (step === 0 && !askedForPosition.current) {
      askedForPosition.current = true;
      void goToMyLocation();
    }
  }

  async function submit() {
    if (!category || !pin || !place) return;
    setBusy(true);
    setErrors({});
    setFormError(null);
    try {
      const created = await customerApi.postRequest({
        service_category_id: category.id,
        description: description.trim(),
        city_id: place.city?.id ?? null,
        address_line: place.address,
        landmark: details.trim() || null,
        latitude: pin.lat,
        longitude: pin.lng,
        urgency,
        customer_offer_minor: rupeesToMinor(offer),
        preferred_time_slot: slot,
      });
      toast.success(t('postSuccess'));
      router.replace(`/dashboard/requests/view?id=${created.id}`);
    } catch (e) {
      if (e instanceof ApiError && Object.keys(e.errors).length > 0) {
        const found = Object.fromEntries(Object.entries(e.errors).map(([k, v]) => [k, v[0]]));
        setErrors(found);
        setFormError(e.errors.request?.[0] ?? null);
        // Show the step the problem is on.
        if ('description' in found || 'service_category_id' in found) setStep(0);
        else if (WHERE_FIELDS.some((k) => k in found)) setStep(1);
      } else {
        setFormError(errorText(e));
      }
    } finally {
      setBusy(false);
    }
  }

  if (categories.isPending) {
    return (
      <Container className="max-w-2xl py-6">
        <SkeletonCard />
      </Container>
    );
  }
  if (categories.isError) {
    return (
      <Container className="max-w-2xl py-6">
        <ErrorState description={t('errorGeneric')} onRetry={() => void categories.refetch()} />
      </Container>
    );
  }

  const tooShort = description.trim().length > 0 && description.trim().length < 10;
  const whereError = errors.city_id ?? errors.latitude ?? errors.address_line;
  const placeText = placeLoading || !pin
    ? t('postFindingAddress')
    : placeFailed
      ? t('postAddressFailed')
      : place && !place.served
        ? t('postNotServed')
        : placeLabel(place);
  const placeBad = !placeLoading && pin !== null && (placeFailed || (place !== null && !place.served));
  const categoryName = category ? (category.is_custom ? t('postSomethingElse') : category.name) : '';
  const guide = category?.typical_price?.display?.replace(' - ', ' – ');

  return (
    <Container className="max-w-2xl py-6 sm:py-8">
      <div className="mb-5 flex items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            aria-label={t('actionBack')}
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface-muted"
          >
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
          </button>
        ) : null}
        <h1 className="font-display text-2xl font-bold">{t('postTitle')}</h1>
      </div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden="true">
        <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${((step + 1) / 3) * 100}%` }} />
      </div>

      <p className="text-sm text-ink-500">{t('postStepOf', { n: step + 1 })}</p>

      {step === 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl font-bold">{t('postWhatTitle')}</h2>
          <Textarea
            aria-label={t('postWhatTitle')}
            rows={5}
            maxLength={2000}
            autoFocus={description === ''}
            placeholder={t('postWhatHint')}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((e) => withoutKeys(e, ['description']));
            }}
            error={errors.description ?? (tooShort ? t('postWhatTooShort') : undefined)}
            className="text-base"
          />
          {emergency ? (
            <p className="flex items-start gap-3 rounded-2xl bg-danger-50 p-4 text-danger-800">
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              {t('postEmergencyNote')}
            </p>
          ) : null}
          <div>
            <p className="mb-2 font-semibold">{t('postServiceLabel')}</p>
            <button
              type="button"
              onClick={() => setPicking(true)}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl border bg-surface p-3 text-start shadow-card transition-colors hover:border-brand-300',
                errors.service_category_id ? 'border-danger-500' : 'border-line'
              )}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                {category ? <CategoryIcon name={category.icon} className="h-5 w-5" /> : <Search className="h-5 w-5" aria-hidden="true" />}
              </span>
              <span className="flex-1 text-base font-semibold">
                {category ? categoryName : detecting ? t('postServiceFinding') : t('postServiceChoose')}
              </span>
              {category ? <span className="text-sm font-semibold text-brand-600">{t('postServiceChange')}</span> : null}
            </button>
            {errors.service_category_id ? <p className="mt-1 text-sm text-danger-600">{errors.service_category_id}</p> : null}
            {category?.is_custom ? <p className="mt-2 text-sm text-brand-700">{t('postCustomHelp')}</p> : null}
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="flex flex-col gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">{t('postWhereTitle')}</h2>
            <p className="mt-1 text-ink-500">{t('postWhereHint')}</p>
          </div>
          <PinMap
            className="h-[min(55vh,420px)]"
            center={pin ?? FALLBACK_CENTER}
            onSettled={lookUp}
            moveTo={moveTo}
            onMyLocation={goToMyLocation}
            locating={locating}
            myLocationLabel={t('postMyLocation')}
            attribution={t('mapAttribution')}
          />
          {locationNote ? <p className="text-sm text-ink-500">{locationNote}</p> : null}
          <p className={cn('flex items-start gap-2 font-semibold', whereError || placeBad ? 'text-danger-600' : 'text-ink-900')} aria-live="polite">
            {whereError || placeBad ? (
              <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            ) : (
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
            )}
            {whereError ?? placeText}
          </p>
          <Input label={t('postDetails')} maxLength={255} value={details} onChange={(e) => setDetails(e.target.value)} error={errors.landmark} />
        </section>
      ) : null}

      {step === 2 ? (
        <section className="flex flex-col gap-6">
          <h2 className="font-display text-2xl font-bold">{t('postPriceTitle')}</h2>
          <div className="flex items-center gap-3 rounded-2xl bg-surface-muted p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <CategoryIcon name={category?.icon ?? null} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="font-bold">{categoryName}</p>
              <p className="truncate text-sm text-ink-500">{placeLabel(place)}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <MoneyField label={t('postOffer')} value={offer} onChange={setOffer} error={errors.customer_offer_minor} />
            {guide && !errors.customer_offer_minor ? <p className="text-sm font-semibold text-brand-700">{t('typicalPrice', { price: guide })}</p> : null}
            <p className="text-sm text-ink-500">{t('postOfferHelp')}</p>
          </div>
          <ChipGroup
            label={t('postUrgentLabel')}
            options={URGENCIES.map(([value, key]) => [value, t(key)])}
            value={urgency}
            onChange={(v) => setUrgency(v as typeof urgency)}
          />
          <ChipGroup label={t('postWhen')} options={SLOTS.map(([value, key]) => [value, t(key)])} value={slot} onChange={setSlot} />
        </section>
      ) : null}

      {formError ? (
        <p role="alert" className="mt-5 rounded-xl bg-danger-50 p-3 text-sm text-danger-700">
          {formError}
        </p>
      ) : null}

      <div className="mt-6">
        {step < 2 ? (
          <Button size="lg" block disabled={step === 0 ? !step1Ready : !step2Ready} onClick={next}>
            {t('postNext')}
          </Button>
        ) : (
          <Button size="lg" block loading={busy} onClick={submit}>
            <Search className="h-5 w-5" aria-hidden="true" />
            {t('postFind')}
          </Button>
        )}
      </div>

      <Dialog open={picking} onClose={() => setPicking(false)} title={t('postServiceChoose')} closeLabel={t('actionCancel')}>
        <ServicePicker
          categories={flat}
          selectedId={category ? category.id : null}
          searchLabel={t('postServiceSearch')}
          somethingElse={t('postSomethingElse')}
          onPick={(c) => {
            setPickedId(c.id);
            setPicking(false);
            setErrors((e) => withoutKeys(e, ['service_category_id']));
          }}
        />
      </Dialog>
    </Container>
  );
}

function withoutKeys(errors: Record<string, string>, keys: string[]): Record<string, string> {
  return Object.fromEntries(Object.entries(errors).filter(([k]) => !keys.includes(k)));
}

function placeLabel(place: PinPlace | null): string {
  if (!place) return '';
  const city = place.city?.name;
  return city && !place.address.includes(city) ? `${place.address} · ${city}` : place.address;
}

function ServicePicker({
  categories,
  selectedId,
  searchLabel,
  somethingElse,
  onPick,
}: {
  categories: ServiceCategory[];
  selectedId: string | null;
  searchLabel: string;
  somethingElse: string;
  onPick: (c: ServiceCategory) => void;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const shown = categories.filter((c) => c.is_custom || q === '' || c.name.toLowerCase().includes(q));
  return (
    <div className="flex flex-col gap-3">
      <Input aria-label={searchLabel} placeholder={searchLabel} value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul className="max-h-[55vh] overflow-y-auto">
        {shown.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onPick(c)}
              className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-start hover:bg-surface-muted"
            >
              <CategoryIcon name={c.icon} className="h-5 w-5 text-brand-600" />
              <span className="flex-1 font-medium">{c.is_custom ? somethingElse : c.name}</span>
              {c.id === selectedId ? <Check className="h-5 w-5 text-brand-600" aria-hidden="true" /> : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
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
              'min-h-11 rounded-[var(--radius-pill)] border px-4 text-sm font-medium transition-colors',
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
