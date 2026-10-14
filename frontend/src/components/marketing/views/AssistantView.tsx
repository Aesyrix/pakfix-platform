'use client';

import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Camera, Mic, MicOff, Phone, ShieldAlert, Sparkles, TriangleAlert } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { PageHeader } from '@/components/marketing/PageHeader';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';
import { ApiError } from '@/lib/api/client';
import { triageApi } from '@/lib/api/endpoints';
import type { SafetyLevel, TriageResult } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';

const EXAMPLES = [
  { en: 'My AC is running but not cooling', ur: 'میرا اے سی چل رہا ہے مگر ٹھنڈا نہیں کر رہا' },
  { en: 'Kitchen sink is leaking under the cabinet', ur: 'کچن کا سنک الماری کے نیچے سے لیک ہو رہا ہے' },
  { en: 'Breaker trips when the iron is on', ur: 'استری آن ہونے پر بریکر ٹرپ ہو جاتا ہے' },
  { en: 'Cockroaches in the kitchen', ur: 'کچن میں کاکروچ' },
  { en: 'Water motor hums but no water reaches the tank', ur: 'واٹر موٹر آواز کرتی ہے مگر ٹینک تک پانی نہیں پہنچتا' },
];

/* ------------------------------------------------------------------------- */
/* Voice dictation, where the browser supports it                            */
/* ------------------------------------------------------------------------- */

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function recognitionConstructor(): (new () => Recognition) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** False during server rendering, so the first client render matches it. */
function useDictationSupported(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => recognitionConstructor() !== null,
    () => false
  );
}

/* ------------------------------------------------------------------------- */

export function AssistantView() {
  const t = useT();
  const { locale } = useLocale();
  const params = useSearchParams();
  const initialQuery = params.get('q') ?? '';
  const inputMode = params.get('input');

  const [description, setDescription] = useState(initialQuery);
  const [listening, setListening] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const autoRan = useRef(false);
  const dictationSupported = useDictationSupported();

  const triage = useMutation({
    mutationFn: (text: string) => triageApi.triage(text),
    onSuccess: () => {
      // Move focus to the result so screen reader users hear it.
      window.setTimeout(() => resultRef.current?.focus(), 50);
    },
  });

  // Arriving from the homepage box with a problem already typed: check it at once.
  useEffect(() => {
    if (!autoRan.current && initialQuery.trim().length >= 3) {
      autoRan.current = true;
      triage.mutate(initialQuery.trim());
    }
  }, [initialQuery, triage]);

  useEffect(() => () => recognition.current?.stop(), []);

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = description.trim();

    if (text.length >= 3) {
      triage.mutate(text);
    }
  }

  function toggleDictation() {
    if (listening) {
      recognition.current?.stop();
      return;
    }

    const Constructor = recognitionConstructor();
    if (!Constructor) return;

    const instance = new Constructor();
    instance.lang = locale === 'ur' ? 'ur-PK' : 'en-PK';
    instance.interimResults = false;
    instance.continuous = false;
    instance.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? '')
        .join(' ')
        .trim();

      if (transcript) {
        setDescription((current) => (current ? `${current} ${transcript}` : transcript));
      }
    };
    instance.onend = () => setListening(false);
    instance.onerror = () => setListening(false);

    recognition.current = instance;
    setListening(true);
    instance.start();
  }

  const fieldError = triage.error instanceof ApiError ? triage.error.fieldError('description') : undefined;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('Ask PakFix', 'پاک فکس سے پوچھیں') }]}
        eyebrow={
          <div className="flex items-center gap-2">
            <Badge tone="accent">
              <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
              {t('PakFix AI Engine Online', 'پاک فکس اے آئی انجن آن لائن')}
            </Badge>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00824A] animate-pulse" />
              {t('Live Safety Audit', 'لائیو حفاظتی آڈٹ')}
            </span>
          </div>
        }
        title={t('What is wrong at home?', 'گھر میں کیا خراب ہے؟')}
        subtitle={t('Describe the problem in your own words (English or Roman Urdu) or upload a photo. PakFix AI checks for hazards, estimates repair costs, and connects you with top-rated local pros.', 'اپنے الفاظ میں مسئلہ بیان کریں (انگریزی یا رومن اردو) یا تصویر اپ لوڈ کریں۔ پاک فکس اے آئی خطرات چیک کرتا ہے، مرمت کے اخراجات کا اندازہ لگاتا ہے، اور آپ کو اعلیٰ درجہ بند مقامی پروفیشنلز سے جوڑتا ہے۔')}
        size="narrow"
      />

      <Container size="narrow" className="py-8 sm:py-10">
        {inputMode === 'camera' ? (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#2563EB]/30 bg-[#EFF6FF] p-4 text-sm text-ink-700 dark:bg-slate-900">
            <Camera className="mt-0.5 h-5 w-5 shrink-0 text-[#2563EB]" aria-hidden="true" />
            <div>
              <p className="font-bold text-foreground">{t('Photo Diagnostic Mode Active', 'فوٹو تشخیصی موڈ فعال')}</p>
              <p className="text-xs text-ink-600 mt-0.5">
                {t('Snap or upload a photo of the leaking pipe, noisy AC, or faulty socket. Describe what happens when it runs.', 'لیک ہوتے پائپ، شور کرتے اے سی یا خراب ساکٹ کی تصویر لیں یا اپ لوڈ کریں۔ بتائیں چلنے پر کیا ہوتا ہے۔')}
              </p>
            </div>
          </div>
        ) : null}

        <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
          <label htmlFor="problem" className="text-sm font-bold text-foreground flex items-center justify-between">
            <span>{t('Describe the problem', 'مسئلہ بیان کریں')}</span>
            <span className="text-xs font-normal text-ink-500">{t('English or Roman Urdu', 'انگریزی یا رومن اردو')}</span>
          </label>
          <div className="relative">
            <textarea
              id="problem"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              maxLength={2000}
              placeholder={t('e.g. My AC runs but blows warm air. The outdoor fan is spinning. / Bijli ki iron chalne par breaker trip hota hai.', 'مثلاً میرا اے سی چلتا ہے مگر گرم ہوا پھینکتا ہے۔ باہر کا پنکھا گھوم رہا ہے۔ / Bijli ki iron chalne par breaker trip hota hai.')}
              aria-invalid={fieldError ? true : undefined}
              aria-describedby={fieldError ? 'problem-error' : undefined}
              className={cn(
                'min-h-32 w-full resize-y rounded-[var(--radius-card)] border bg-surface p-4 pe-14 text-base outline-none transition-all',
                'focus:ring-2 focus:ring-[#00824A] focus:border-transparent',
                fieldError ? 'border-danger-500' : 'border-[var(--border)]'
              )}
            />
            {dictationSupported ? (
              <Button
                type="button"
                variant={listening ? 'danger' : 'ghost'}
                size="icon"
                onClick={toggleDictation}
                className="absolute bottom-3 end-3"
                aria-pressed={listening}
                aria-label={listening ? t('Stop dictation', 'ڈکٹیشن روکیں') : t('Describe it out loud', 'اسے بول کر بیان کریں')}
              >
                {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-[#2563EB]" />}
              </Button>
            ) : null}
          </div>
          {fieldError ? (
            <p id="problem-error" role="alert" className="text-sm text-danger-600 font-medium">
              {fieldError}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2" aria-label={t('Examples', 'مثالیں')}>
            {EXAMPLES.map((example) => (
              <button
                key={example.en}
                type="button"
                onClick={() => setDescription(t(example.en, example.ur))}
                className="rounded-full border border-[var(--border)] bg-surface px-3 py-1.5 text-xs font-medium text-ink-600 hover:border-[#00824A] hover:text-[#15803D] hover:bg-[#DCFCE7]/40 transition-colors"
              >
                {t(example.en, example.ur)}
              </button>
            ))}
          </div>

          <Button type="submit" size="lg" variant="primary" loading={triage.isPending} disabled={description.trim().length < 3} className="mt-3 self-start">
            <Sparkles className="h-4 w-4 me-1" />
            {t('Diagnose My Problem', 'میرا مسئلہ تشخیص کریں')}
            <ArrowRight className="h-4 w-4 ms-1 rtl:rotate-180" aria-hidden="true" />
          </Button>
        </form>

        <div ref={resultRef} tabIndex={-1} className="mt-8 outline-none" aria-live="polite">
          {triage.isError && !fieldError ? (
            <p role="alert" className="rounded-xl border border-danger-500/40 bg-danger-500/10 p-4 text-sm text-danger-600">
              {triage.error instanceof ApiError ? triage.error.message : t('That did not work. Try again.', 'یہ کام نہیں ہوا۔ دوبارہ کوشش کریں۔')}
            </p>
          ) : null}

          {triage.data ? <TriageOutcome result={triage.data} /> : null}
        </div>
      </Container>
    </>
  );
}

function TriageOutcome({ result }: { result: TriageResult }) {
  const t = useT();
  const SAFETY: Record<SafetyLevel, { label: string; tone: 'safe' | 'warn' | 'danger' }> = {
    low: { label: t('Low risk: safe to inspect', 'کم خطرہ: معائنہ محفوظ ہے'), tone: 'safe' },
    medium: { label: t('Medium: take care', 'درمیانہ: احتیاط کریں'), tone: 'warn' },
    high: { label: t('High: a professional is recommended', 'زیادہ: پروفیشنل کی سفارش کی جاتی ہے'), tone: 'danger' },
    emergency: { label: t('Emergency: do not attempt', 'ہنگامی: کوشش نہ کریں'), tone: 'danger' },
  };
  const safety = SAFETY[result.safety_level];

  return (
    <div className="flex flex-col gap-5">
      {result.emergency ? (
        <section
          aria-labelledby="emergency-heading"
          className="rounded-[var(--radius-card)] border-2 border-danger-500 bg-danger-500/10 p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-8 w-8 shrink-0 text-danger-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-danger-600">{result.emergency.title}</p>
              <h2 id="emergency-heading" className="mt-1 text-xl font-bold sm:text-2xl">
                {result.emergency.headline}
              </h2>
            </div>
          </div>

          <ol className="mt-5 flex list-decimal flex-col gap-2 ps-6 text-base">
            {result.emergency.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <div className="mt-6 flex flex-wrap gap-2">
            {result.emergency.emergency_numbers.map((entry) => (
              <a
                key={entry.number}
                href={`tel:${entry.number}`}
                className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-control)] bg-danger-600 px-4 font-semibold text-white hover:bg-danger-500"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {entry.label}: {entry.number}
              </a>
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-600">{t('Safety level:', 'حفاظت کی سطح:')}</span>
          <Badge tone={safety.tone}>{safety.label}</Badge>
        </div>
      )}

      {result.matches.length > 0 ? (
        <section aria-labelledby="matches-heading">
          <h2 id="matches-heading" className="text-lg font-semibold">
            {result.is_emergency ? t('Once it is safe, the professional you need', 'محفوظ ہونے کے بعد، آپ کا مطلوبہ پروفیشنل') : t('The service you probably need', 'وہ خدمت جو آپ کو غالباً چاہیے')}
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {result.matches.map((match) => (
              <li key={match.category.id}>
                <Card>
                  <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-brand-50 text-brand-700">
                        <CategoryIcon name={match.category.icon} className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold">{match.category.name}</p>
                        <p className="text-sm text-ink-500">
                          {match.confidence === 'high' ? t('Strong match', 'مضبوط مطابقت') : match.confidence === 'medium' ? t('Likely match', 'غالباً مطابقت') : t('Possible match', 'ممکنہ مطابقت')}
                          {match.category.typical_price ? t(` · typically ${match.category.typical_price.display}`, ` · عام طور پر ${match.category.typical_price.display}`) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <ButtonLink href={`/services/${match.category.slug}`} variant="secondary" size="sm">
                        {t('About this service', 'اس خدمت کے بارے میں')}
                      </ButtonLink>
                      <ButtonLink href={`/find-a-technician?category=${match.category.slug}`} size="sm">
                        {t('Find a professional', 'پروفیشنل تلاش کریں')}
                      </ButtonLink>
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <Card>
          <CardBody>
            <p className="font-semibold">{t('We could not match that to a service yet.', 'ہم ابھی اسے کسی خدمت سے نہیں ملا سکے۔')}</p>
            <p className="mt-1 text-sm text-ink-600">
              {t('Try naming the appliance or the room, or', 'آلے یا کمرے کا نام بتائیں، یا')}{' '}
              <Link href="/services" className="font-semibold text-brand-600 hover:text-brand-700">
                {t('browse every service', 'ہر خدمت دیکھیں')}
              </Link>
              .
            </p>
          </CardBody>
        </Card>
      )}

      <p className="flex items-start gap-2 text-sm text-ink-500">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {result.disclaimer}
      </p>
    </div>
  );
}
