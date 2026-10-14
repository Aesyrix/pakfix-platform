'use client';

import Link from 'next/link';
import { Globe, HelpCircle, UserPlus, PhoneCall } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';
import { localeLabel } from '@/lib/i18n';

export function TopUtilityBar() {
  const t = useT();
  const { locale, toggleLocale } = useLocale();

  return (
    <div className="hidden sm:block border-b border-[#E5E7EB] bg-[#161616] text-white text-xs font-medium py-2">
      <Container size="wide">
        <div className="flex items-center justify-between gap-4">
          {/* Left Side Tagline */}
          <div className="flex items-center gap-2 text-gray-300 min-w-0">
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[#4ADE80] animate-pulse" />
            <span className="truncate">
              {t("Pakistan's Smart Home Repair Platform", 'پاکستان کا سمارٹ ہوم ریپیئر پلیٹ فارم')}
            </span>
            <span className="hidden md:inline text-gray-400">|</span>
            <span className="text-[#00A85B] font-semibold hidden md:flex items-center gap-1 whitespace-nowrap">
              <PhoneCall className="h-3 w-3" />
              {t('24/7 Support:', '24/7 مدد:')} <bdi dir="ltr">+92 300 123 4567</bdi>
            </span>
          </div>

          {/* Right Side Links */}
          <div className="flex items-center gap-3 md:gap-5 text-gray-300 shrink-0">
            <Link
              href="/contact"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{t('Support', 'مدد')}</span>
            </Link>

            <Link
              href="/become-a-technician"
              className="hover:text-[#00A85B] transition-colors flex items-center gap-1 font-semibold"
            >
              <UserPlus className="h-3.5 w-3.5 text-[#4ADE80]" />
              <span>{t('Become a Pro', 'پروفیشنل بنیں')}</span>
            </Link>

            <div className="h-3 w-px bg-gray-700" />

            {/* Language Selector Switcher */}
            <button
              type="button"
              onClick={toggleLocale}
              aria-label={t('Switch language', 'زبان تبدیل کریں')}
              lang={locale === 'en' ? 'ur' : 'en'}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-gray-800/80 px-2 py-0.5 rounded text-[11px]"
            >
              <Globe className="h-3 w-3 text-[#4ADE80]" />
              <span>{localeLabel(locale === 'en' ? 'ur' : 'en')}</span>
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
