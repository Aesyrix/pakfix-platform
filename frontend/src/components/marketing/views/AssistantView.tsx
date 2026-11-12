'use client';

import { useMutation } from '@tanstack/react-query';
import { ArrowRight, Camera, Droplets, Mic, MicOff, Phone, ShieldAlert, ShieldCheck, Sparkles, TriangleAlert, Wind, Wrench, Zap } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { Breadcrumbs } from '@/components/marketing/PageHeader';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';
import { ApiError } from '@/lib/api/client';
import { triageApi } from '@/lib/api/endpoints';
import type { SafetyLevel, TriageResult } from '@/lib/api/types';
import type { CSSProperties } from 'react';
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
/* Continuous motion                                                         */
/* ------------------------------------------------------------------------- */

/**
 * Types the example problems into the empty box one after another, then
 * erases each. Runs only while `active` (box empty and not focused) and never
 * for visitors who ask for reduced motion.
 */
function useTypewriter(lines: string[], active: boolean): string {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!active || lines.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let line = 0;
    let char = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const full = lines[line] ?? '';
      if (!deleting) {
        char += 1;
        setText(full.slice(0, char));
        if (char >= full.length) {
          deleting = true;
          timer = setTimeout(tick, 1800);
          return;
        }
        timer = setTimeout(tick, 40 + Math.random() * 45);
      } else {
        char -= 1;
        setText(full.slice(0, char));
        if (char <= 0) {
          deleting = false;
          line = (line + 1) % lines.length;
          timer = setTimeout(tick, 380);
          return;
        }
        timer = setTimeout(tick, 22);
      }
    };

    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  }, [active, lines]);

  return active ? text : '';
}

/** Fixed positions so server and client render the same sparks. */
const SPARKS = [
  { left: 6, delay: 0, duration: 11, warm: false },
  { left: 14, delay: -4, duration: 14, warm: true },
  { left: 22, delay: -8, duration: 10, warm: false },
  { left: 31, delay: -2, duration: 13, warm: false },
  { left: 39, delay: -6, duration: 12, warm: true },
  { left: 47, delay: -10, duration: 15, warm: false },
  { left: 55, delay: -3, duration: 11, warm: false },
  { left: 63, delay: -7, duration: 13, warm: true },
  { left: 71, delay: -1, duration: 12, warm: false },
  { left: 79, delay: -9, duration: 14, warm: false },
  { left: 87, delay: -5, duration: 10, warm: true },
  { left: 94, delay: -11, duration: 13, warm: false },
];

const ORBIT_ICONS = [Wrench, Zap, Droplets, Wind];

/* ------------------------------------------------------------------------- */

/** The assistant with `?q=` / `?input=` read from the URL (needs a Suspense boundary). */
export function AssistantViewFromUrl() {
  return <AssistantView params={useSearchParams()} />;
}

const NO_PARAMS = new URLSearchParams();

/**
 * The assistant. Without URL parameters it is what the page is built with,
 * so visitors see it straight away instead of "Loading".
 */
export function AssistantView({ params = NO_PARAMS }: { params?: Pick<URLSearchParams, 'get'> }) {
  const t = useT();
  const { locale } = useLocale();
  const initialQuery = params.get('q') ?? '';
  const inputMode = params.get('input');

  const [description, setDescription] = useState(initialQuery);
  const [listening, setListening] = useState(false);
  const recognition = useRef<Recognition | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const autoRan = useRef(false);
  const dictationSupported = useDictationSupported();
  const [focused, setFocused] = useState(false);
  const exampleLines = useMemo(() => EXAMPLES.map((example) => (locale === 'ur' ? example.ur : example.en)), [locale]);
  const typed = useTypewriter(exampleLines, description === '' && !focused);

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
      {/* Hero: dark teal night, the question, and the console floating over its edge */}
      <section data-no-reveal className="relative isolate overflow-hidden bg-premium-dark pb-44 pt-10 text-white sm:pb-48 sm:pt-14">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-dark" />
          <div className="anim-drift absolute -left-32 top-0 h-[28rem] w-[36rem] rounded-full bg-brand-400/35 blur-[120px]" />
          <div className="anim-drift-slow absolute -right-20 top-10 h-[24rem] w-[26rem] rounded-full bg-glow-warm/30 blur-[120px]" />
          {SPARKS.map((spark) => (
            <span
              key={spark.left}
              className={cn('pf-spark absolute bottom-0 h-1 w-1 rounded-full', spark.warm ? 'bg-glow-warm' : 'bg-brand-on-dark')}
              style={{ left: `${spark.left}%`, animationDelay: `${spark.delay}s`, animationDuration: `${spark.duration}s` }}
            />
          ))}
        </div>

        <Container size="narrow" className="text-center">
          <Breadcrumbs
            items={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t('Ask PakFix', 'پاک فکس سے پوچھیں') }]}
            className="anim-rise mb-8 flex justify-center [&_[aria-current]]:text-white [&_a:hover]:text-brand-on-dark [&_ol]:text-ink-400"
          />

          {/* Pulsing AI orb */}
          <div className="anim-rise relative mx-auto mb-8 flex h-32 w-32 items-center justify-center" style={{ '--d': '60ms' } as CSSProperties}>
            {/* Service icons circling the orb */}
            <div aria-hidden="true" className="pf-orbit absolute inset-0 rounded-full border border-dashed border-white/15">
              {ORBIT_ICONS.map((Icon, index) => (
                <span key={index} className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${index * 90}deg) translateY(-64px)` }}>
                  <span
                    className="pf-orbit-counter flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-brand-on-dark backdrop-blur-md"
                    style={{ '--start': `${-index * 90}deg` } as CSSProperties}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </span>
              ))}
            </div>
            <span aria-hidden="true" className="anim-ring absolute inset-8 rounded-2xl" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 via-brand-600 to-brand-800 shadow-[0_10px_40px_-8px_color-mix(in_oklab,var(--color-brand-400)_70%,transparent)] ring-1 ring-white/20">
              <Sparkles className="h-7 w-7 text-white" aria-hidden="true" />
            </span>
          </div>

          <div className="anim-rise flex flex-wrap items-center justify-center gap-2" style={{ '--d': '120ms' } as CSSProperties}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-accent-300 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t('PakFix AI Engine Online', 'پاک فکس اے آئی انجن آن لائن')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-brand-on-dark backdrop-blur-sm">
              <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-on-dark opacity-70 motion-reduce:hidden" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-on-dark" />
              </span>
              {t('Live Safety Audit', 'لائیو حفاظتی آڈٹ')}
            </span>
          </div>

          <h1 className="anim-rise mt-6 text-4xl font-bold tracking-[-0.03em] sm:text-5xl lg:text-6xl" style={{ '--d': '180ms' } as CSSProperties}>
            <span className="text-gradient-on-dark">{t('What needs fixing?', 'کیا ٹھیک کرنا ہے؟')}</span>
          </h1>
          <p className="anim-rise mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-300 sm:text-lg" style={{ '--d': '240ms' } as CSSProperties}>
            {t('Describe the problem in your own words (English or Roman Urdu) or upload a photo. PakFix AI checks for hazards, estimates repair costs, and connects you with top-rated local pros.', 'اپنے الفاظ میں مسئلہ بیان کریں (انگریزی یا رومن اردو) یا تصویر اپ لوڈ کریں۔ پاک فکس اے آئی خطرات چیک کرتا ہے، مرمت کے اخراجات کا اندازہ لگاتا ہے، اور آپ کو اعلیٰ درجہ بند مقامی پروفیشنلز سے جوڑتا ہے۔')}
          </p>
        </Container>
      </section>

      <Container size="narrow" className="relative z-10 -mt-36 pb-16 sm:pb-24">
        {inputMode === 'camera' ? (
          <div className="anim-rise mb-4 flex items-start gap-3 rounded-2xl border border-accent-200 bg-surface p-4 text-sm text-ink-700 shadow-lifted">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 ring-1 ring-accent-100">
              <Camera className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold text-foreground">{t('Photo Diagnostic Mode Active', 'فوٹو تشخیصی موڈ فعال')}</p>
              <p className="text-xs text-ink-600 mt-0.5">
                {t('Snap or upload a photo of the leaking pipe, noisy AC, or faulty socket. Describe what happens when it runs.', 'لیک ہوتے پائپ، شور کرتے اے سی یا خراب ساکٹ کی تصویر لیں یا اپ لوڈ کریں۔ بتائیں چلنے پر کیا ہوتا ہے۔')}
              </p>
            </div>
          </div>
        ) : null}

        {/* The console */}
        <form
          onSubmit={submit}
          noValidate
          className="anim-rise pf-border-spin group/console relative rounded-[1.75rem] p-[1.5px] shadow-floating"
          style={{ '--d': '320ms' } as CSSProperties}
        >
          <div className="flex flex-col gap-4 rounded-[calc(1.75rem-1.5px)] bg-surface p-5 sm:p-7">
            <label htmlFor="problem" className="flex items-center justify-between gap-3 text-sm font-bold text-foreground">
              <span className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </span>
                {t('Describe the problem', 'مسئلہ بیان کریں')}
              </span>
              <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-500">{t('English or Roman Urdu', 'انگریزی یا رومن اردو')}</span>
            </label>

            <div className="relative">
              <textarea
                id="problem"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                rows={4}
                maxLength={2000}
                placeholder={typed ? `${typed}|` : t('e.g. My AC runs but blows warm air. The outdoor fan is spinning. / Bijli ki iron chalne par breaker trip hota hai.', 'مثلاً میرا اے سی چلتا ہے مگر گرم ہوا پھینکتا ہے۔ باہر کا پنکھا گھوم رہا ہے۔ / Bijli ki iron chalne par breaker trip hota hai.')}
                aria-invalid={fieldError ? true : undefined}
                aria-describedby={fieldError ? 'problem-error' : undefined}
                className={cn(
                  'min-h-36 w-full resize-y rounded-2xl border bg-surface-muted/60 p-4 pe-16 text-base leading-relaxed outline-none transition-[border-color,box-shadow,background-color] duration-300 placeholder:text-ink-400',
                  'hover:border-ink-300 focus:border-brand-500 focus:bg-surface focus:ring-4 focus:ring-brand-500/15',
                  fieldError ? 'border-danger-500' : 'border-line'
                )}
              />
              {dictationSupported ? (
                <button
                  type="button"
                  onClick={toggleDictation}
                  aria-pressed={listening}
                  aria-label={listening ? t('Stop dictation', 'ڈکٹیشن روکیں') : t('Describe it out loud', 'اسے بول کر بیان کریں')}
                  className={cn(
                    'absolute bottom-3 end-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-all',
                    listening
                      ? 'anim-ring-danger bg-danger-500 text-white shadow-lg shadow-danger-500/40'
                      : 'bg-surface text-accent-600 shadow-sm ring-1 ring-line hover:scale-105 hover:ring-accent-200'
                  )}
                >
                  {listening ? <MicOff className="h-5 w-5" aria-hidden="true" /> : <Mic className="h-5 w-5" aria-hidden="true" />}
                </button>
              ) : null}
            </div>
            {fieldError ? (
              <p id="problem-error" role="alert" className="text-sm text-danger-600 font-medium">
                {fieldError}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2" aria-label={t('Examples', 'مثالیں')}>
              {EXAMPLES.map((example, index) => (
                <button
                  key={example.en}
                  type="button"
                  onClick={() => setDescription(t(example.en, example.ur))}
                  style={{ '--d': `${420 + index * 60}ms` } as CSSProperties}
                  className="anim-rise inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line/80 bg-surface px-3.5 py-2 text-xs font-medium text-ink-600 shadow-xs transition-all hover:-translate-y-px hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  <Sparkles className="h-3 w-3 text-brand-500" aria-hidden="true" />
                  {t(example.en, example.ur)}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500">
                <ShieldCheck className="h-4 w-4 text-safe-500" aria-hidden="true" />
                {t('Live Safety Audit', 'لائیو حفاظتی آڈٹ')}
              </span>
              <Button type="submit" size="lg" variant="primary" loading={triage.isPending} disabled={description.trim().length < 3} className="rounded-full px-6">
                <Sparkles className="h-4 w-4 me-1" aria-hidden="true" />
                {t('Diagnose My Problem', 'میرا مسئلہ تشخیص کریں')}
                <ArrowRight className="h-4 w-4 ms-1 rtl:rotate-180" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </form>

        <div ref={resultRef} tabIndex={-1} className="mt-8 outline-none" aria-live="polite" aria-busy={triage.isPending}>
          {triage.isPending ? <Analyzing /> : null}

          {triage.isError && !fieldError ? (
            <p role="alert" className="anim-rise rounded-2xl border border-danger-500/40 bg-danger-50 p-4 text-sm text-danger-600">
              {triage.error instanceof ApiError ? triage.error.message : t('That did not work. Try again.', 'یہ کام نہیں ہوا۔ دوبارہ کوشش کریں۔')}
            </p>
          ) : null}

          {triage.data && !triage.isPending ? <TriageOutcome result={triage.data} /> : null}
        </div>
      </Container>
    </>
  );
}

/** Purely visual "thinking" state while the check runs: a scanning beam over placeholder lines. */
function Analyzing() {
  return (
    <div aria-hidden="true" className="anim-rise relative overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-card">
      <div className="pf-scan pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-brand-200/50 to-transparent" />
      <div className="flex items-center gap-3">
        <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </span>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="pf-dot-bounce h-2 w-2 rounded-full bg-brand-500" style={{ animationDelay: `${dot * 150}ms` }} />
          ))}
        </div>
      </div>
      <div className="mt-5 space-y-2.5">
        <div className="skeleton h-3 w-3/4 rounded-full" />
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-5/6 rounded-full" />
      </div>
    </div>
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
          className="anim-rise relative overflow-hidden rounded-3xl border-2 border-danger-500 bg-danger-50 p-5 shadow-lifted sm:p-7"
        >
          <div className="flex items-start gap-3">
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-danger-500 text-white shadow-lg shadow-danger-500/30">
              <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-2xl bg-danger-500/40 motion-reduce:hidden" />
              <ShieldAlert className="relative h-6 w-6" aria-hidden="true" />
            </span>
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
                className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-control)] bg-danger-solid-hover px-4 font-semibold text-white hover:bg-danger-500"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {entry.label}: {entry.number}
              </a>
            ))}
          </div>
        </section>
      ) : (
        <div className="anim-rise flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
          <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', safety.tone === 'safe' ? 'bg-safe-500 text-white' : safety.tone === 'warn' ? 'bg-warn-500 text-white' : 'bg-danger-500 text-white')}>
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-ink-600">{t('Safety level:', 'حفاظت کی سطح:')}</span>
          <Badge tone={safety.tone}>{safety.label}</Badge>
        </div>
      )}

      {result.matches.length > 0 ? (
        <section aria-labelledby="matches-heading">
          <h2 id="matches-heading" className="anim-rise font-display text-xl font-bold text-ink-900" style={{ '--d': '80ms' } as CSSProperties}>
            {result.is_emergency ? t('Once it is safe, the professional you need', 'محفوظ ہونے کے بعد، آپ کا مطلوبہ پروفیشنل') : t('The service you probably need', 'وہ خدمت جو آپ کو غالباً چاہیے')}
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {result.matches.map((match, index) => (
              <li key={match.category.id} className="anim-rise" style={{ '--d': `${160 + index * 90}ms` } as CSSProperties}>
                <div className="card-lift relative overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-card">
                  {index === 0 ? <span aria-hidden="true" className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-brand-500 to-accent-500" /> : null}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3.5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/25">
                        <CategoryIcon name={match.category.icon} className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-display text-base font-bold text-ink-900">{match.category.name}</p>
                        <p className="text-sm text-ink-500">
                          {match.confidence === 'high' ? t('Strong match', 'مضبوط مطابقت') : match.confidence === 'medium' ? t('Likely match', 'غالباً مطابقت') : t('Possible match', 'ممکنہ مطابقت')}
                          {match.category.typical_price ? t(` · usually ${match.category.typical_price.display}`, ` · عموماً ${match.category.typical_price.display}`) : ''}
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
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="anim-rise rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div>
            <p className="font-semibold">{t('We could not match that to a service yet.', 'ہم ابھی اسے کسی خدمت سے نہیں ملا سکے۔')}</p>
            <p className="mt-1 text-sm text-ink-600">
              {t('Try naming the appliance or the room, or', 'آلے یا کمرے کا نام بتائیں، یا')}{' '}
              <Link href="/services" className="font-semibold text-brand-600 hover:text-brand-700">
                {t('browse every service', 'ہر خدمت دیکھیں')}
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      <p className="anim-rise flex items-start gap-2 rounded-xl bg-surface-muted p-3.5 text-sm text-ink-500" style={{ '--d': '300ms' } as CSSProperties}>
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {result.disclaimer}
      </p>
    </div>
  );
}
