'use client';

import Link from 'next/link';
import { Phone, Mail, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
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
    <footer className="bg-[#161616] text-white border-t border-gray-800 pt-16 pb-12">
      <Container>
        {/* Main 6-Column Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-gray-800">
          {/* Column 1: PakFix Brand & Motto */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
            <PakFixLogo isDarkBackground showWordmark />
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              {t(
                "Pakistan's smart home repair platform. Diagnose issues with AI, compare upfront quotes, and book identity-verified local professionals.",
                'پاکستان کا سمارٹ ہوم ریپیئر پلیٹ فارم۔ اے آئی سے مسئلہ تشخیص کریں، پہلے سے قیمت کا موازنہ کریں، اور تصدیق شدہ مقامی پروفیشنل بک کریں۔'
              )}
            </p>

            {/* Direct Contact Handles */}
            <div className="pt-2 space-y-2 text-xs text-gray-300 font-medium">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#4ADE80]" />
                <span>{t('Call Us:', 'کال کریں:')} <bdi dir="ltr">+92 300 123 4567</bdi></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#4ADE80]" />
                <span>{t('Email:', 'ای میل:')} <bdi dir="ltr">support@pakfix.pk</bdi></span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-[#00A85B]" />
                <span>{t('WhatsApp:', 'واٹس ایپ:')} <bdi dir="ltr">+92 345 987 6543</bdi></span>
              </div>
            </div>
          </div>

          {/* Column 2: Popular Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00A85B]">
              {t('Services', 'خدمات')}
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              {popularCategories && popularCategories.length > 0 ? (
                popularCategories.slice(0, 5).map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/services/${cat.slug}`} className="hover:text-white transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/services/plumbing" className="hover:text-white transition-colors">{t('Plumbing', 'پلمبنگ')}</Link></li>
                  <li><Link href="/services/electrical" className="hover:text-white transition-colors">{t('Electrical Repair', 'بجلی کی مرمت')}</Link></li>
                  <li><Link href="/services/ac-repair" className="hover:text-white transition-colors">{t('AC Repair', 'اے سی مرمت')}</Link></li>
                  <li><Link href="/services/cleaning" className="hover:text-white transition-colors">{t('Home Cleaning', 'گھر کی صفائی')}</Link></li>
                  <li><Link href="/services/kitchen-appliances" className="hover:text-white transition-colors">{t('Appliance Care', 'آلات کی دیکھ بھال')}</Link></li>
                </>
              )}
              <li><Link href="/services" className="hover:text-[#00A85B] font-semibold transition-colors">{t('All Services', 'تمام خدمات')} &rarr;</Link></li>
            </ul>
          </div>

          {/* Column 3: Platform Features */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00A85B]">PakFix</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/ai" className="hover:text-white transition-colors">{t('AI Assistant', 'اے آئی معاون')}</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition-colors">{t('How It Works', 'یہ کیسے کام کرتا ہے')}</Link></li>
              <li><Link href="/find-a-technician" className="hover:text-white transition-colors">{t('Find a Pro', 'پروفیشنل تلاش کریں')}</Link></li>
              <li><Link href="/home-maintenance" className="hover:text-white transition-colors">{t('Home Maintenance', 'گھر کی دیکھ بھال')}</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">{t('Pricing & Estimates', 'قیمتیں اور اندازے')}</Link></li>
            </ul>
          </div>

          {/* Column 4: For Professionals */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00A85B]">
              {t('Professionals', 'پروفیشنلز')}
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/become-a-technician" className="hover:text-white transition-colors">{t('Become a Pro', 'پروفیشنل بنیں')}</Link></li>
              <li><Link href="/for-service-companies" className="hover:text-white transition-colors">{t('Service Companies', 'سروس کمپنیاں')}</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">{t('Pro Portal Login', 'پرو پورٹل لاگ اِن')}</Link></li>
              <li><Link href="/safety" className="hover:text-white transition-colors">{t('Verification Process', 'تصدیق کا عمل')}</Link></li>
            </ul>
          </div>

          {/* Column 5: Support & Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#00A85B]">
              {t('Support', 'مدد')}
            </h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/contact" className="hover:text-white transition-colors">{t('Help Center', 'مدد مرکز')}</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">{t('Contact Support', 'مدد سے رابطہ')}</Link></li>
              <li><Link href="/safety" className="hover:text-white transition-colors">{t('Safety Rules', 'حفاظتی اصول')}</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">{t('FAQs', 'عام سوالات')}</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">{t('Privacy Policy', 'پرائیویسی پالیسی')}</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors">{t('Terms of Service', 'شرائطِ خدمت')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>
              &copy; {new Date().getFullYear()} PakFix.pk. {t('All rights reserved.', 'جملہ حقوق محفوظ ہیں۔')}
            </span>
            <span className="inline-flex items-center gap-1 text-[#4ADE80] font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" /> {t('Verified Platform', 'تصدیق شدہ پلیٹ فارم')}
            </span>
          </div>

          <div className="flex items-center gap-1 text-gray-400">
            <span>{t('Made with', 'بنایا گیا')}</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>{t('for homes across Pakistan.', 'پاکستان بھر کے گھروں کے لیے۔')}</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
