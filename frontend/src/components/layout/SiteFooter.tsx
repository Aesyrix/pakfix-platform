'use client';

import Link from 'next/link';
import { ModeToggle } from '@/components/theme/ModeToggle';
import { Mail, ShieldCheck, Heart } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { PakFixLogo } from '@/components/layout/PakFixLogo';
import { useT } from '@/components/i18n/LocaleProvider';
import type { Bootstrap, ServiceCategory } from '@/lib/api/types';

interface SiteFooterProps {
  bootstrap?: Bootstrap | null;
  popularCategories?: ServiceCategory[];
}

export function SiteFooter({ popularCategories }: SiteFooterProps) {
  const t = useT();

  return (
    <footer className="relative isolate overflow-hidden bg-premium-dark text-white pt-20 pb-10">
      {/* Decoration: grid, glow, top hairline and a faded wordmark */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark opacity-70" />
      <div aria-hidden="true" className="absolute -top-40 left-1/2 -z-10 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-[120px]" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-on-dark/50 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-[0.18em] -z-10 select-none text-center font-display text-[22vw] font-bold leading-none tracking-[-0.05em] text-white/[0.03] lg:text-[16rem]">PakFix</div>
      <Container>
        {/* Main 6-Column Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-10 pb-14">
          {/* Column 1: PakFix Brand & Motto */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
            <PakFixLogo isDarkBackground showWordmark />
            <p className="text-sm text-ink-300 leading-relaxed max-w-sm">
              {t(
                "Pakistan's smart repair platform. Diagnose issues with AI, compare upfront quotes, and book identity-verified local professionals.",
                'پاکستان کا سمارٹ ریپیئر پلیٹ فارم۔ اے آئی سے مسئلہ تشخیص کریں، پہلے سے قیمت کا موازنہ کریں، اور تصدیق شدہ مقامی پروفیشنل بک کریں۔'
              )}
            </p>

            {/* Direct Contact Handles */}
            <div className="pt-2 text-xs text-ink-200 font-medium">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 backdrop-blur-sm">
                <Mail className="h-3.5 w-3.5 text-brand-on-dark" aria-hidden="true" />
                <span>{t('Email:', 'ای میل:')} <bdi dir="ltr">support@pakfix.pk</bdi></span>
              </div>
            </div>
          </div>

          {/* Column 2: Popular Services */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-white before:h-3 before:w-0.5 before:rounded-full before:bg-brand-on-dark">
              {t('Services', 'خدمات')}
            </h3>
            <ul className="space-y-2.5 text-sm text-ink-400">
              {popularCategories && popularCategories.length > 0 ? (
                popularCategories.slice(0, 5).map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/services/${cat.slug}`} className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/services/plumbing" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('Plumbing', 'پلمبنگ')}</Link></li>
                  <li><Link href="/services/electrical" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('Electrical Repair', 'بجلی کی مرمت')}</Link></li>
                  <li><Link href="/services/ac-repair" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('AC Repair', 'اے سی مرمت')}</Link></li>
                  <li><Link href="/services/cleaning" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('Home Cleaning', 'گھر کی صفائی')}</Link></li>
                  <li><Link href="/services/kitchen-appliances" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('Appliance Care', 'آلات کی دیکھ بھال')}</Link></li>
                </>
              )}
              <li><Link href="/services" className="text-brand-on-dark hover:text-white font-semibold transition-colors">{t('All Services', 'تمام خدمات')} &rarr;</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform Features */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-white before:h-3 before:w-0.5 before:rounded-full before:bg-brand-on-dark">PakFix</h3>
            <ul className="space-y-2.5 text-sm text-ink-400">
              <li><Link href="/ai" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('AI Assistant', 'اے آئی معاون')}</Link></li>
              <li><Link href="/how-it-works" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('How It Works', 'یہ کیسے کام کرتا ہے')}</Link></li>
              <li><Link href="/find-a-technician" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('Find a Pro', 'پروفیشنل تلاش کریں')}</Link></li>
              <li><Link href="/pricing" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('How Pricing Works', 'قیمتیں کیسے طے ہوتی ہیں')}</Link></li>
            </ul>
          </div>

          {/* Column 4: For Professionals */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-white before:h-3 before:w-0.5 before:rounded-full before:bg-brand-on-dark">
              {t('Professionals', 'پروفیشنلز')}
            </h3>
            <ul className="space-y-2.5 text-sm text-ink-400">
              <li><Link href="/become-a-technician" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('Become a Pro', 'پروفیشنل بنیں')}</Link></li>
              <li><Link href="/login" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('Pro Portal Login', 'پرو پورٹل لاگ اِن')}</Link></li>
              <li><Link href="/safety" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('Verification Process', 'تصدیق کا عمل')}</Link></li>
            </ul>
          </div>

          {/* Column 5: Support & Legal */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-white before:h-3 before:w-0.5 before:rounded-full before:bg-brand-on-dark">
              {t('Support', 'مدد')}
            </h3>
            <ul className="space-y-2.5 text-sm text-ink-400">
              <li><Link href="/contact" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('Help Center', 'مدد مرکز')}</Link></li>
              <li><Link href="/contact" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('Contact Support', 'مدد سے رابطہ')}</Link></li>
              <li><Link href="/safety" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('Safety Rules', 'حفاظتی اصول')}</Link></li>
              <li><Link href="/faq" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('FAQs', 'عام سوالات')}</Link></li>
              <li><Link href="/privacy-policy" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('Privacy Policy', 'پرائیویسی پالیسی')}</Link></li>
              <li><Link href="/terms-of-service" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('Terms of Service', 'شرائطِ خدمت')}</Link></li>
              <li><Link href="/delete-account" className="inline-block transition-all hover:translate-x-0.5 hover:text-white rtl:hover:-translate-x-0.5">{t('Delete account', 'اکاؤنٹ حذف کریں')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="relative pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink-400">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
          <div className="flex items-center gap-2">
            <span>
              &copy; {new Date().getFullYear()} PakFix.pk. {t('All rights reserved.', 'جملہ حقوق محفوظ ہیں۔')}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-on-dark/25 bg-brand-on-dark/10 px-2.5 py-0.5 text-brand-on-dark font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> {t('Verified Platform', 'تصدیق شدہ پلیٹ فارم')}
            </span>
          </div>

          <ModeToggle onDark className="rounded-full border border-white/10 bg-white/5" />

          <div className="flex items-center gap-1 text-ink-400">
            <span>{t('Made with', 'بنایا گیا')}</span>
            <Heart className="h-3 w-3 text-danger-500 fill-danger-500" />
            <span>{t('for homes, cars and gadgets in Pakistan.', 'پاکستان میں گھروں، گاڑیوں اور آلات کے لیے۔')}</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
