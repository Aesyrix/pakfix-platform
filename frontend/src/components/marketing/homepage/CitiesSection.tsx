'use client';

import Link from 'next/link';
import { MapPin, Building2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function CitiesSection() {
  const t = useT();
  const cities = [
    { name: 'Islamabad', ur: 'اسلام آباد', slug: 'islamabad', active: true },
    { name: 'Rawalpindi', ur: 'راولپنڈی', slug: 'rawalpindi', active: true },
    { name: 'Lahore', ur: 'لاہور', slug: 'lahore', active: true },
    { name: 'Karachi', ur: 'کراچی', slug: 'karachi', active: true },
    { name: 'Faisalabad', ur: 'فیصل آباد', slug: 'faisalabad', active: true },
    { name: 'Peshawar', ur: 'پشاور', slug: 'peshawar', active: true },
    { name: 'Multan', ur: 'ملتان', slug: 'multan', active: true },
    { name: 'Gujranwala', ur: 'گوجرانوالہ', slug: 'gujranwala', active: true },
    { name: 'Sialkot', ur: 'سیالکوت', slug: 'sialkot', active: true },
    { name: 'Quetta', ur: 'کوئٹہ', slug: 'quetta', active: true },
  ];

  return (
    <section className="py-16 sm:py-24 bg-surface">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-2 mb-10">
          <span className="eyebrow">{t('Our Cities', 'ہمارے شہر')}</span>
          <h2 className="section-title text-ink-900">
            {t('Starting in Islamabad and Rawalpindi.', 'اسلام آباد اور راولپنڈی سے آغاز۔')}
          </h2>
          <p className="text-sm text-ink-600">
            {t('More major cities across Pakistan are on the way.', 'پاکستان کے مزید بڑے شہر جلد شامل ہوں گے۔')}
          </p>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {cities.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="card-lift bg-surface border border-line rounded-2xl p-4 text-center shadow-xs group"
            >
              <div className="flex items-center justify-center gap-1.5 text-sm font-semibold text-ink-900 group-hover:text-brand-700">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100"><Building2 className="h-4 w-4" aria-hidden="true" /></span>
                <span>{t(c.name, c.ur)}</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
