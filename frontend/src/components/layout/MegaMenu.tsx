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
      descriptionEn: 'Quick resolution for urgent utility issues.',
      descriptionUr: 'یوٹیلیٹی کے فوری مسائل کا فوری حل۔',
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
      en: 'Property Care & Protection',
      ur: 'پراپرٹی کی دیکھ بھال اور تحفظ',
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
      en: 'Property Improvement & Tech',
      ur: 'پراپرٹی کی بہتری اور ٹیکنالوجی',
      descriptionEn: 'Upgrade your spaces with modern smart technology.',
      descriptionUr: 'جدید سمارٹ ٹیکنالوجی سے اپنی جگہ کو بہتر بنائیں۔',
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

  // One accent icon per column heading.
  const columnIcons = [Wrench, ShieldCheck, Sparkles];

  return (
    // The wrapper starts flush with the header so the pointer never crosses a
    // gap; the visible card floats inside it.
    <div className="absolute top-full left-0 z-50 w-full px-3 pt-2 sm:px-6">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-3xl border border-line/70 bg-surface shadow-floating animate-[megaIn_180ms_ease-out] motion-reduce:animate-none">
        <div className="grid grid-cols-1 gap-2 p-4 md:grid-cols-3 lg:p-6">
          {categories.map((col, colIndex) => {
            const ColIcon = columnIcons[colIndex] ?? Wrench;
            return (
              <div key={col.en} className="rounded-2xl p-3 transition-colors hover:bg-surface-muted/60">
                <div className="flex min-h-[4.25rem] items-start gap-3 px-2 pb-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/25">
                    <ColIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-sm font-bold uppercase tracking-[0.06em] text-ink-900">{t(col.en, col.ur)}</h3>
                    <p className="mt-0.5 text-xs leading-snug text-ink-500">{t(col.descriptionEn, col.descriptionUr)}</p>
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-line via-line to-transparent" aria-hidden="true" />

                <ul className="mt-2 space-y-0.5">
                  {col.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className="group flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-ink-700 transition-all hover:bg-surface hover:text-brand-700 hover:shadow-xs hover:ring-1 hover:ring-line/70"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-ink-500 ring-1 ring-line/60 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:ring-brand-100">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1 truncate">{t(item.en, item.ur)}</span>
                          {item.badge ? (
                            <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 ring-1 ring-brand-100">
                              {t(item.badge.en, item.badge.ur)}
                            </span>
                          ) : null}
                          <ArrowRight
                            className="h-3.5 w-3.5 shrink-0 -translate-x-1 text-brand-600 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 rtl:rotate-180 rtl:translate-x-1"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* AI banner along the bottom */}
        <div className="relative isolate flex flex-wrap items-center justify-between gap-4 overflow-hidden bg-premium-dark px-6 py-4 text-white lg:px-8">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grid-dark opacity-60" />
          <div aria-hidden="true" className="absolute -right-10 -top-16 -z-10 h-40 w-72 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 font-display text-sm font-bold text-brand-on-dark backdrop-blur-sm">
              {t('AI', 'اے آئی')}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                {t('Not sure which service you need?', 'سمجھ نہیں آ رہا کون سی سروس چاہیے؟')}
              </p>
              <p className="text-xs text-ink-300">
                {t('Let PakFix AI diagnose your issue in 10 seconds.', 'پاک فکس اے آئی 10 سیکنڈ میں آپ کا مسئلہ تشخیص کرے گا۔')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ai"
              onClick={onClose}
              className="inline-flex min-h-10 items-center rounded-full border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t('Try AI Diagnosis', 'اے آئی تشخیص آزمائیں')} &rarr;
            </Link>

            <Link
              href="/services"
              onClick={onClose}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-solid px-4 text-xs font-semibold text-white shadow-md shadow-brand-500/30 transition-all hover:-translate-y-px hover:bg-brand-solid-hover"
            >
              <span>{t('View All Services', 'تمام خدمات دیکھیں')}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
