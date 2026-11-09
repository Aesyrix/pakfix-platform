'use client';

import Link from 'next/link';
import { ArrowLeft, Camera, CheckCircle2, ShieldCheck, Sparkles, Users, Wallet } from 'lucide-react';
import { PakFixLogo } from '@/components/layout/PakFixLogo';
import { LocaleToggle } from '@/components/i18n/LocaleToggle';
import { useT } from '@/components/i18n/LocaleProvider';
import { ModeToggle } from '@/components/theme/ModeToggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useT();

  const steps = [
    {
      icon: Camera,
      title: t('Show the problem', 'مسئلہ دکھائیں'),
      body: t('Describe it or upload a photo. PakFix explains what is likely wrong.', 'بیان کریں یا تصویر اپلوڈ کریں۔ پاک فکس بتاتا ہے کہ ممکنہ مسئلہ کیا ہے۔'),
    },
    {
      icon: Users,
      title: t('Compare offers', 'آفرز کا موازنہ کریں'),
      body: t('Verified professionals near you send their price.', 'آپ کے قریب تصدیق شدہ پروفیشنلز اپنی قیمت بھیجتے ہیں۔'),
    },
    {
      icon: Wallet,
      title: t('Approve and pay', 'منظوری دیں اور ادائیگی کریں'),
      body: t('Nothing starts without your approval. Pay when the job is done.', 'آپ کی منظوری کے بغیر کچھ شروع نہیں ہوتا۔ کام مکمل ہونے پر ادائیگی کریں۔'),
    },
  ];

  return (
    <div className="relative flex min-h-dvh flex-col bg-background lg:flex-row">
      {/* Brand panel (desktop) */}
      <aside className="relative isolate hidden flex-col justify-between overflow-hidden bg-premium-dark p-12 text-white lg:flex lg:w-[44%] xl:p-14">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark" />
        <div aria-hidden="true" className="absolute -bottom-32 -right-24 -z-10 h-96 w-96 rounded-full bg-brand-500/25 blur-[110px]" />

        <div>
          <Link href="/" aria-label={t('PakFix home', 'پاک فکس ہوم')} className="inline-block">
            <PakFixLogo isDarkBackground className="h-10" />
          </Link>

          <span className="mt-12 flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-surface/[0.06] px-3.5 py-1.5 text-xs font-semibold text-brand-on-dark backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {t('Trusted Home Services Platform', 'قابلِ اعتماد ہوم سروسز پلیٹ فارم')}
          </span>
          <h2 className="mt-5 max-w-md text-4xl font-bold leading-[1.12] tracking-[-0.018em] xl:text-[2.75rem]">
            {t("Pakistan's smarter way", 'اپنے گھر کی مرمت کا')}{' '}
            <span className="text-gradient-on-dark">{t('to fix your home', 'زیادہ سمجھدار طریقہ')}</span>
          </h2>

          {/* How it works */}
          <ol className="mt-10 max-w-md space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                  {index < steps.length - 1 ? (
                    <span aria-hidden="true" className="absolute left-5 top-11 bottom-1 w-px bg-gradient-to-b from-surface/25 to-surface/5" />
                  ) : null}
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-surface/[0.07] text-brand-on-dark backdrop-blur-sm">
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <div className="pt-0.5">
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-300">{step.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Example offer, labelled as an example, like the homepage preview */}
        <div className="mt-10 max-w-sm rounded-2xl border border-white/10 bg-surface/[0.06] p-4 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-300">
              {t('Offer received', 'آفر موصول')}
            </span>
            <span className="rounded-full bg-surface/10 px-2 py-0.5 text-[0.625rem] font-semibold text-ink-300">
              {t('Example', 'مثال')}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-semibold text-white ring-2 ring-surface/20">
              P
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-semibold text-white">
                {t('Verified plumber', 'تصدیق شدہ پلمبر')}
                <ShieldCheck className="h-3.5 w-3.5 text-brand-on-dark" aria-hidden="true" />
              </p>
              <p className="text-xs text-ink-300">{t('Leaking tap, bathroom', 'ٹپکتا نل، باتھ روم')}</p>
            </div>
            <p className="font-display text-lg font-bold tabular-nums text-white">PKR 2,500</p>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-ink-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-brand-on-dark" aria-hidden="true" />
            {t('Price changes only with your approval', 'قیمت میں تبدیلی صرف آپ کی منظوری سے')}
          </div>
        </div>
      </aside>

      {/* Form side */}
      <div className="relative isolate flex flex-1 flex-col">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40rem_22rem_at_100%_0%,var(--color-brand-50),transparent_70%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(var(--color-ink-200)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_60%)] opacity-70" />

        <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-10">
          {/* Phones and tablets have no brand panel, so the logo leads here. */}
          <Link href="/" aria-label={t('PakFix home', 'پاک فکس ہوم')} className="lg:hidden">
            <PakFixLogo className="h-8" />
          </Link>
          <Link
            href="/"
            className="hidden min-h-9 items-center gap-1.5 rounded-[var(--radius-control)] px-2.5 text-xs font-semibold text-ink-600 transition-colors hover:bg-surface-muted hover:text-foreground lg:inline-flex"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            {t('Back to home', 'ہوم پر واپس')}
          </Link>
          <div className="flex items-center gap-1">
            <ModeToggle />
            <LocaleToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-center px-4 pb-10 sm:px-6 lg:px-12">
          <main id="main" className="mx-auto w-full max-w-md">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
