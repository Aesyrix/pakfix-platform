'use client';

import Link from 'next/link';
import { BookOpen, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function HomeGuidesSection() {
  const t = useT();
  const articles = [
    {
      en: "Why Your AC Isn't Cooling & How to Fix It",
      ur: 'آپ کا اے سی ٹھنڈا کیوں نہیں کر رہا اور اسے کیسے ٹھیک کریں',
      cen: 'AC Care',
      cur: 'اے سی کی دیکھ بھال',
      ren: '4 min read',
      rur: '4 منٹ مطالعہ',
      href: '/blog/why-your-ac-is-running-but-not-cooling',
    },
    {
      en: 'How Often Should You Clean Your Home Water Tank?',
      ur: 'گھر کی پانی کی ٹنکی کتنی بار صاف کرنی چاہیے؟',
      cen: 'Hygiene',
      cur: 'صفائی',
      ren: '3 min read',
      rur: '3 منٹ مطالعہ',
      href: '/blog/water-tank-cleaning-how-often-and-why-it-matters',
    },
    {
      en: 'Gas Smell at Home: What to Do in the First 5 Minutes',
      ur: 'گھر میں گیس کی بو: پہلے 5 منٹ میں کیا کریں',
      cen: 'Safety',
      cur: 'حفاظت',
      ren: '5 min read',
      rur: '5 منٹ مطالعہ',
      href: '/blog/gas-smell-at-home-what-to-do-in-the-first-five-minutes',
    },
    {
      en: 'Preparing Your Home for Monsoon Season',
      ur: 'مون سون کے لیے اپنا گھر تیار کریں',
      cen: 'Seasonal',
      cur: 'موسمی',
      ren: '4 min read',
      rur: '4 منٹ مطالعہ',
      href: '/blog/preparing-your-home-for-monsoon-season',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-b border-[#E5E7EB]">
      <Container>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">{t('Home Guides', 'گھریلو رہنمائی')}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161616] mt-1">
              {t('Help for your home.', 'آپ کے گھر کے لیے مدد۔')}
            </h2>
            <p className="text-sm text-[#475467] mt-1">
              {t('Expert DIY tips, safety advice and maintenance guides written for Pakistani homes.', 'پاکستانی گھروں کے لیے لکھی گئی ماہرانہ ٹپس، حفاظتی مشورے اور دیکھ بھال کی رہنمائی۔')}
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00824A] hover:text-[#006B3C] transition-colors"
          >
            <span>{t('View All Home Guides', 'تمام رہنمائی دیکھیں')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((art) => (
            <Link
              key={art.en}
              href={art.href}
              className="bg-[#F8FAF9] rounded-2xl border border-[#E5E7EB] hover:border-[#00824A] p-5 shadow-2xs hover:shadow-card transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#667085] mb-3">
                  <span className="font-bold px-2 py-0.5 rounded bg-[#EAF7F0] text-[#006838]">
                    {t(art.cen, art.cur)}
                  </span>
                  <span>{t(art.ren, art.rur)}</span>
                </div>
                <h3 className="text-sm font-bold text-[#161616] group-hover:text-[#00824A] transition-colors leading-snug">
                  {t(art.en, art.ur)}
                </h3>
              </div>

              <div className="mt-6 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-semibold text-[#00824A]">
                <span>{t('Read Article', 'مضمون پڑھیں')}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
