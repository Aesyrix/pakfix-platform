'use client';

import Link from 'next/link';
import { Globe, HelpCircle, UserPlus } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';
import { localeLabel } from '@/lib/i18n';
import { ModeToggle } from '@/components/theme/ModeToggle';

export function TopUtilityBar() {
  const t = useT();
  const { locale, toggleLocale } = useLocale();

  return (
    <div className="hidden sm:block relative bg-premium-dark text-white text-xs font-medium py-2">
      <Container size="wide">
        <div className="flex items-center justify-between gap-4">
          {/* Left Side Tagline */}
          <div className="flex items-center gap-2 text-ink-300 min-w-0">
            <span aria-hidden="true" className="relative flex h-2 w-2 shrink-0"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-on-dark opacity-60 motion-reduce:hidden" /><span className="relative inline-flex h-2 w-2 rounded-full bg-brand-on-dark" /></span>
            <span className="truncate">
              {t("Pakistan's Smart Repair Platform", 'پاکستان کا سمارٹ ریپیئر پلیٹ فارم')}
            </span>
          </div>

          {/* Right Side Links */}
          <div className="flex items-center gap-3 md:gap-5 text-ink-300 shrink-0">
            <Link
              href="/contact"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{t('Support', 'مدد')}</span>
            </Link>

            <Link
              href="/become-a-technician"
              className="hover:text-white transition-colors flex items-center gap-1 font-semibold"
            >
              <UserPlus className="h-3.5 w-3.5 text-brand-on-dark" />
              <span>{t('Become a Pro', 'پروفیشنل بنیں')}</span>
            </Link>

            <div aria-hidden="true" className="h-3 w-px bg-white/15" />

            <ModeToggle onDark className="-my-1 h-7 w-7" />

            {/* Language Selector Switcher */}
            <button
              type="button"
              onClick={toggleLocale}
              aria-label={t('Switch language', 'زبان تبدیل کریں')}
              lang={locale === 'en' ? 'ur' : 'en'}
              className="flex items-center gap-1.5 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-white/15 bg-white/5 px-2.5 py-0.5 rounded-full text-[11px]"
            >
              <Globe className="h-3 w-3 text-brand-on-dark" />
              <span>{localeLabel(locale === 'en' ? 'ur' : 'en')}</span>
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
