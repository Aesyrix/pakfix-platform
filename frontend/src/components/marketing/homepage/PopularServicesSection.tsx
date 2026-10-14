'use client';

import Link from 'next/link';
import {
  Droplets,
  Zap,
  Wind,
  Refrigerator,
  Sparkles,
  Hammer,
  Paintbrush,
  Sun,
  Bug,
  Grid,
  ArrowRight,
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';
import { serviceImage } from '@/lib/images';

export function PopularServicesSection() {
  const t = useT();
  const services = [
    { en: 'Plumbing', ur: 'پلمبنگ', den: 'Leaks, pipes, drainage & motors', dur: 'رساؤ، پائپ، نکاسی اور موٹرز', icon: Droplets, href: '/services/plumbing' },
    { en: 'Electrical', ur: 'الیکٹریکل', den: 'Wiring, switches, breakers & UPS', dur: 'وائرنگ، سوئچ، بریکر اور یو پی ایس', icon: Zap, href: '/services/electrical' },
    { en: 'AC Repair', ur: 'اے سی مرمت', den: 'Installation, gas filling & servicing', dur: 'انسٹالیشن، گیس فلنگ اور سروسنگ', icon: Wind, href: '/services/ac-repair' },
    { en: 'Appliance Repair', ur: 'آلات کی مرمت', den: 'Fridge, washing machine, microwave', dur: 'فریج، واشنگ مشین، مائیکروویو', icon: Refrigerator, href: '/services/kitchen-appliances' },
    { en: 'Cleaning', ur: 'صفائی', den: 'Home, office & sofa deep cleaning', dur: 'گھر، دفتر اور صوفے کی گہری صفائی', icon: Sparkles, href: '/services/cleaning' },
    { en: 'Carpentry', ur: 'بڑھئی کا کام', den: 'Furniture, doors, locks & cabinets', dur: 'فرنیچر، دروازے، تالے اور الماریاں', icon: Hammer, href: '/services/carpentry' },
    { en: 'Painting', ur: 'پینٹنگ', den: 'Interior, exterior & damp proofing', dur: 'اندرونی، بیرونی اور نمی سے حفاظت', icon: Paintbrush, href: '/services/painting' },
    { en: 'Solar', ur: 'سولر', den: 'Installation, inverter & panel care', dur: 'انسٹالیشن، انورٹر اور پینل کی دیکھ بھال', icon: Sun, href: '/services/solar-installation' },
    { en: 'Pest Control', ur: 'کیڑوں پر قابو', den: 'Termites, cockroaches & general', dur: 'دیمک، کاکروچ اور عمومی', icon: Bug, href: '/services/pest-control' },
    { en: 'Home Renovation', ur: 'گھر کی تجدید', den: 'Tile, ceiling, bath & kitchen remodeling', dur: 'ٹائل، چھت، باتھ روم اور کچن کی تجدید', icon: Grid, href: '/services/home-renovation' },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">{t('Services', 'خدمات')}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161616] mt-1">
              {t('Whatever needs fixing, start here.', 'جو بھی ٹھیک کرانا ہو، یہاں سے شروع کریں۔')}
            </h2>
            <p className="text-sm text-[#475467] mt-1">
              {t('Find the right verified professional for common household repairs across Pakistan.', 'پاکستان بھر میں عام گھریلو مرمت کے لیے صحیح تصدیق شدہ پروفیشنل تلاش کریں۔')}
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00824A] hover:text-[#006B3C] transition-colors"
          >
            <span>{t('View All Services', 'تمام خدمات دیکھیں')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {services.map((s) => {
            const Icon = s.icon;
            const image = serviceImage(s.href);
            return (
              <Link
                key={s.en}
                href={s.href}
                className="group relative bg-[#F8FAF9] hover:bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#00824A] p-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-card flex flex-col justify-between h-full"
              >
                <div>
                  <div className="relative mb-4 h-24 w-full overflow-hidden rounded-xl bg-[#EAF7F0]">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={t(s.en, s.ur)}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : null}
                    <span className="absolute bottom-2 start-2 flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white/95 text-[#161616] shadow-sm backdrop-blur-xs transition-colors group-hover:text-[#00824A]">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="px-2 text-base font-bold text-[#161616] group-hover:text-[#00824A] transition-colors">
                    {t(s.en, s.ur)}
                  </h3>
                  <p className="px-2 text-xs text-[#667085] mt-1 leading-relaxed">{t(s.den, s.dur)}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-semibold text-[#00824A]">
                  <span>{t('Book Now', 'ابھی بک کریں')}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
