'use client';

import Link from 'next/link';
import { Globe, HelpCircle, UserPlus } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';
import { localeLabel } from '@/lib/i18n';
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

export function TopUtilityBar() {
  const t = useT();
  const { locale, toggleLocale } = useLocale();

  return (
    <div className="hidden sm:block border-b border-line bg-ink-900 text-white text-xs font-medium py-2">
      <Container size="wide">
        <div className="flex items-center justify-between gap-4">
          {/* Left Side Tagline */}
          <div className="flex items-center gap-2 text-ink-300 min-w-0">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-brand-on-dark animate-pulse" />
            <span className="truncate">
              {t("Pakistan's Smart Home Repair Platform", 'پاکستان کا سمارٹ ہوم ریپیئر پلیٹ فارم')}
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

            <div className="h-3 w-px bg-ink-700" />

            <ThemeSwitcher onDark className="-my-1" />

            {/* Language Selector Switcher */}
            <button
              type="button"
              onClick={toggleLocale}
              aria-label={t('Switch language', 'زبان تبدیل کریں')}
              lang={locale === 'en' ? 'ur' : 'en'}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-ink-800/80 px-2 py-0.5 rounded text-[11px]"
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
