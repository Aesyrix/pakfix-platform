'use client';

import Link from 'next/link';
import {
  Wrench,
  Zap,
  Wind,
  Refrigerator,
  Droplets,
  ZapOff,
  Sparkles,
  Paintbrush,
  Hammer,
  Bug,
  ShieldCheck,
  Home,
  Sun,
  Camera,
  Grid,
  ArrowRight,
} from 'lucide-react';
import { useT } from '@/components/i18n/LocaleProvider';

interface MegaMenuProps {
  onClose?: () => void;
}

interface MegaItem {
  href: string;
  en: string;
  ur: string;
  icon: typeof Wrench;
  badge?: { en: string; ur: string };
}

interface MegaColumn {
  en: string;
  ur: string;
  descriptionEn: string;
  descriptionUr: string;
  items: MegaItem[];
}

export function MegaMenu({ onClose }: MegaMenuProps) {
  const t = useT();

  const categories: MegaColumn[] = [
    {
      en: 'Repairs & Fixes',
      ur: 'مرمت اور حل',
      descriptionEn: 'Quick resolution for urgent household utility issues.',
      descriptionUr: 'گھریلو یوٹیلیٹی کے فوری مسائل کا فوری حل۔',
      items: [
        { href: '/services/plumbing', en: 'Plumbing', ur: 'پلمبنگ', icon: Droplets, badge: { en: 'Popular', ur: 'مقبول' } },
        { href: '/services/electrical', en: 'Electrical Wiring', ur: 'بجلی کی وائرنگ', icon: Zap, badge: { en: 'High Demand', ur: 'زیادہ مانگ' } },
        { href: '/services/ac-repair', en: 'AC Repair & Gas', ur: 'اے سی مرمت اور گیس', icon: Wind, badge: { en: 'Hot', ur: 'ہاٹ' } },
        { href: '/services/kitchen-appliances', en: 'Appliance Care', ur: 'آلات کی دیکھ بھال', icon: Refrigerator },
        { href: '/services/water-motor', en: 'Water Motor & Pump', ur: 'واٹر موٹر اور پمپ', icon: Wrench },
        { href: '/services/generator', en: 'Generator Repair', ur: 'جنریٹر مرمت', icon: ZapOff },
        { href: '/services/ups-inverter', en: 'UPS & Solar Inverter', ur: 'یو پی ایس اور سولر اِنورٹر', icon: Sun },
      ],
    },
    {
      en: 'Home Care & Protection',
      ur: 'گھر کی دیکھ بھال اور تحفظ',
      descriptionEn: 'Regular maintenance and protection for your property.',
      descriptionUr: 'آپ کی جائیداد کی باقاعدہ دیکھ بھال اور حفاظت۔',
      items: [
        { href: '/services/cleaning', en: 'Home Deep Cleaning', ur: 'گھر کی گہری صفائی', icon: Sparkles },
        { href: '/services/painting', en: 'Interior & Exterior Painting', ur: 'اندرونی و بیرونی پینٹنگ', icon: Paintbrush },
        { href: '/services/carpentry', en: 'Carpentry & Woodwork', ur: 'بڑھئی کا کام اور لکڑی', icon: Hammer },
        { href: '/services/pest-control', en: 'Pest Control', ur: 'کیڑوں کا کنٹرول', icon: Bug },
        { href: '/services/waterproofing', en: 'Waterproofing & Sealing', ur: 'واٹر پروفنگ اور سیلنگ', icon: ShieldCheck },
        { href: '/services/roof-repair', en: 'Roofing & Seepage Repair', ur: 'چھت اور رساؤ کی مرمت', icon: Home },
      ],
    },
    {
      en: 'Home Improvement & Tech',
      ur: 'گھر کی بہتری اور ٹیکنالوجی',
      descriptionEn: 'Upgrade your living spaces with modern smart technology.',
      descriptionUr: 'جدید سمارٹ ٹیکنالوجی سے اپنے گھر کو بہتر بنائیں۔',
      items: [
        { href: '/services/home-renovation', en: 'Full Home Renovation', ur: 'مکمل گھر کی تجدید', icon: Grid },
        { href: '/services/tiles', en: 'Flooring & Tile Work', ur: 'فرش اور ٹائل کا کام', icon: Home },
        { href: '/services/false-ceiling', en: 'False Ceiling & Lighting', ur: 'فالس سیلنگ اور لائٹنگ', icon: Sparkles },
        { href: '/services/cctv', en: 'CCTV & Security Systems', ur: 'سی سی ٹی وی اور سیکیورٹی سسٹم', icon: Camera },
        { href: '/services/smart-home-installation', en: 'Smart Home Automation', ur: 'سمارٹ ہوم آٹومیشن', icon: Zap },
        { href: '/services/solar-installation', en: 'Solar Panel Setup', ur: 'سولر پینل کی تنصیب', icon: Sun, badge: { en: 'Trending', ur: 'رائج' } },
      ],
    },
  ];

  return (
    <div className="absolute top-full left-0 w-full bg-white border-b border-[#E5E7EB] shadow-2xl z-50">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((col) => (
            <div key={col.en} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#161616] tracking-wider uppercase flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00824A]" />
                  {t(col.en, col.ur)}
                </h3>
                <p className="text-xs text-[#667085] mt-0.5">{t(col.descriptionEn, col.descriptionUr)}</p>
              </div>

              <div className="space-y-1.5 border-t border-[#E5E7EB] pt-3">
                {col.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center justify-between p-2 rounded-lg text-sm text-[#475467] hover:text-[#00824A] hover:bg-[#F4FBF7] transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-[#667085] group-hover:text-[#00824A] transition-colors" />
                        <span className="font-medium group-hover:font-semibold">{t(item.en, item.ur)}</span>
                      </div>
                      {item.badge ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EAF7F0] text-[#006838]">
                          {t(item.badge.en, item.badge.ur)}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner Bar inside Mega Menu */}
        <div className="mt-8 pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-4 bg-[#F8FAF9] p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF7F0] text-[#00532C] font-bold">
              {t('AI', 'اے آئی')}
            </span>
            <div>
              <p className="text-xs font-bold text-[#161616]">
                {t('Not sure which service you need?', 'سمجھ نہیں آ رہا کون سی سروس چاہیے؟')}
              </p>
              <p className="text-xs text-[#667085]">
                {t('Let PakFix AI diagnose your issue in 10 seconds.', 'پاک فکس اے آئی 10 سیکنڈ میں آپ کا مسئلہ تشخیص کرے گا۔')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/ai"
              onClick={onClose}
              className="text-xs font-bold text-[#00824A] hover:underline"
            >
              {t('Try AI Diagnosis', 'اے آئی تشخیص آزمائیں')} &rarr;
            </Link>

            <Link
              href="/services"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg bg-[#00824A] text-white hover:bg-[#006B3C] transition-colors shadow-xs"
            >
              <span>{t('View All Services', 'تمام خدمات دیکھیں')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
