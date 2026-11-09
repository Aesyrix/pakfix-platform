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
    <section className="py-16 sm:py-24 bg-surface-muted border-b border-line">
      <Container>
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="eyebrow">{t('Verified Professionals', 'تصدیق شدہ پروفیشنلز')}</span>
            <h2 className="section-title text-ink-900 mt-3">
              {t('Professionals you can check before you book.', 'بکنگ سے پہلے جانچنے کے قابل پروفیشنلز۔')}
            </h2>
            <p className="text-sm text-ink-600 mt-1">
              {t('Every professional is checked by our team before they can offer on a job.', 'ہر پروفیشنل کی جانچ ہماری ٹیم کرتی ہے، اس کے بعد ہی وہ کسی کام پر آفر دے سکتا ہے۔')}
            </p>
          </div>

          <Link
            href="/find-a-technician"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <span>{t('Browse All Professionals', 'تمام پروفیشنلز دیکھیں')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {pros.length > 0 ? (
          <ProfessionalGrid professionals={pros} />
        ) : (
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-line p-5 shadow-2xs">
              <ShieldCheck className="h-6 w-6 text-brand-600" />
              <h3 className="mt-3 text-base font-bold text-ink-900">{t('Checked by people', 'انسانوں کی جانچ')}</h3>
              <p className="mt-1 text-xs text-ink-500">{t('Our team reviews every CNIC and selfie by hand.', 'ہماری ٹیم ہر شناختی کارڈ اور سیلفی خود دیکھتی ہے۔')}</p>
            </div>
            <div className="bg-white rounded-2xl border border-line p-5 shadow-2xs">
              <MapPin className="h-6 w-6 text-brand-600" />
              <h3 className="mt-3 text-base font-bold text-ink-900">{t('Launching near you', 'آپ کے قریب آغاز')}</h3>
              <p className="mt-1 text-xs text-ink-500">{t('We are starting in Islamabad and Rawalpindi.', 'ہم اسلام آباد اور راولپنڈی سے آغاز کر رہے ہیں۔')}</p>
            </div>
            <Link
              href="/become-a-technician"
              className="bg-white rounded-2xl border border-line hover:border-brand-300 p-5 shadow-2xs transition-all"
            >
              <UserPlus className="h-6 w-6 text-brand-600" />
              <h3 className="mt-3 text-base font-bold text-ink-900">{t('Are you a professional?', 'کیا آپ پروفیشنل ہیں؟')}</h3>
              <p className="mt-1 text-xs text-ink-500">{t('Join PakFix and be among the first in your area.', 'پاک فکس میں شامل ہوں اور اپنے علاقے کے پہلے پروفیشنلز میں شامل ہوں۔')}</p>
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
