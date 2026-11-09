'use client';

import Link from 'next/link';
import { PakFixLogo } from '@/components/layout/PakFixLogo';
import { LocaleToggle } from '@/components/i18n/LocaleToggle';
import { useT } from '@/components/i18n/LocaleProvider';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = useT();

  return (
    <div className="relative flex min-h-dvh flex-col lg:flex-row bg-background">
      <div className="absolute end-3 top-3 z-30">
        <LocaleToggle />
      </div>
      {/* Left Marketing/Branding Panel (Desktop Split) */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-brand-950 via-ink-900 to-accent-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Subtle Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-brand-400)_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="relative z-10">
          <Link href="/" aria-label={t('PakFix home', 'پاک فکس ہوم')} className="inline-block">
            <PakFixLogo isDarkBackground className="h-10" />
          </Link>
          <div className="mt-12 space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600/20 px-3.5 py-1 text-xs font-bold text-brand-on-dark border border-brand-600/40">
              <Sparkles className="h-3.5 w-3.5" />
              {t('Trusted Home Services Platform', 'قابلِ اعتماد ہوم سروسز پلیٹ فارم')}
            </span>
            <h2 className="text-3xl font-extrabold leading-tight">
              {t("Pakistan's smarter way to fix your home", 'اپنے گھر کی مرمت کا پاکستان کا زیادہ سمجھدار طریقہ')}
            </h2>
            <p className="text-ink-300 text-sm leading-relaxed">
              {t('Get offers from verified professionals, compare them, and approve every price before work starts.', 'تصدیق شدہ پروفیشنلز سے آفرز لیں، موازنہ کریں، اور کام سے پہلے ہر قیمت کی منظوری دیں۔')}
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4 pt-8 border-t border-ink-700/60">
          <div className="flex items-center gap-3 text-xs font-medium text-ink-200">
            <CheckCircle2 className="h-4 w-4 text-brand-on-dark" />
            <span>{t('Every professional checked by our team', 'ہر پروفیشنل کی جانچ ہماری ٹیم کرتی ہے')}</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-ink-200">
            <CheckCircle2 className="h-4 w-4 text-brand-on-dark" />
            <span>{t('Transparent Upfront Quotes', 'شفاف اور پیشگی کوٹیشن')}</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-ink-200">
            <ShieldCheck className="h-4 w-4 text-brand-on-dark" />
            <span>{t('Price changes only with your approval', 'قیمت میں تبدیلی صرف آپ کی منظوری سے')}</span>
          </div>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
        <header className="flex items-center justify-center lg:hidden pb-6">
          <Link href="/" aria-label={t('PakFix home', 'پاک فکس ہوم')}>
            <PakFixLogo className="h-9" />
          </Link>
        </header>

        <main id="main" className="mx-auto w-full max-w-md">
          {children}
        </main>
      </div>
    </div>
  );
}
