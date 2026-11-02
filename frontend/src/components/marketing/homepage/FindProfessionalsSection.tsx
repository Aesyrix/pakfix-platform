'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, MapPin, ShieldCheck, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { ProfessionalGrid } from '@/components/marketing/Cards';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';
import { technicianApi } from '@/lib/api/endpoints';

/** Real verified professionals only. Until there are some, it says what is coming. */
export function FindProfessionalsSection() {
  const t = useT();
  const query = useQuery({
    queryKey: ['home-professionals'],
    queryFn: () => technicianApi.list({ per_page: 3 }),
    staleTime: 60_000,
  });
  const pros = query.data?.data ?? [];

  return (
    <section className="py-16 sm:py-24 bg-[#F8FAF9] border-b border-[#E5E7EB]">
      <Container>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-[#00824A] uppercase tracking-wider">{t('Verified Professionals', 'تصدیق شدہ پروفیشنلز')}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161616] mt-1">
              {t('Professionals you can check before you book.', 'بکنگ سے پہلے جانچنے کے قابل پروفیشنلز۔')}
            </h2>
            <p className="text-sm text-[#475467] mt-1">
              {t('Every professional is checked by our team before they can offer on a job.', 'ہر پروفیشنل کی جانچ ہماری ٹیم کرتی ہے، اس کے بعد ہی وہ کسی کام پر آفر دے سکتا ہے۔')}
            </p>
          </div>

          <Link
            href="/find-a-technician"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00824A] hover:text-[#006B3C] transition-colors"
          >
            <span>{t('Browse All Professionals', 'تمام پروفیشنلز دیکھیں')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {pros.length > 0 ? (
          <ProfessionalGrid professionals={pros} />
        ) : (
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs">
              <ShieldCheck className="h-6 w-6 text-[#00824A]" />
              <h3 className="mt-3 text-base font-bold text-[#161616]">{t('Checked by people', 'انسانوں کی جانچ')}</h3>
              <p className="mt-1 text-xs text-[#667085]">{t('Our team reviews every CNIC and selfie by hand.', 'ہماری ٹیم ہر شناختی کارڈ اور سیلفی خود دیکھتی ہے۔')}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs">
              <MapPin className="h-6 w-6 text-[#00824A]" />
              <h3 className="mt-3 text-base font-bold text-[#161616]">{t('Launching near you', 'آپ کے قریب آغاز')}</h3>
              <p className="mt-1 text-xs text-[#667085]">{t('We are starting in Islamabad and Rawalpindi.', 'ہم اسلام آباد اور راولپنڈی سے آغاز کر رہے ہیں۔')}</p>
            </div>
            <Link
              href="/become-a-technician"
              className="bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#00824A] p-5 shadow-2xs transition-all"
            >
              <UserPlus className="h-6 w-6 text-[#00824A]" />
              <h3 className="mt-3 text-base font-bold text-[#161616]">{t('Are you a professional?', 'کیا آپ پروفیشنل ہیں؟')}</h3>
              <p className="mt-1 text-xs text-[#667085]">{t('Join PakFix and be among the first in your area.', 'پاک فکس میں شامل ہوں اور اپنے علاقے کے پہلے پروفیشنلز میں شامل ہوں۔')}</p>
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
