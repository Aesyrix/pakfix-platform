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
    <section className="py-16 sm:py-24 bg-white border-b border-line">
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
              className="bg-surface-muted hover:bg-brand-100 border border-line hover:border-brand-600 rounded-xl p-3.5 text-center transition-all group"
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-ink-900 group-hover:text-brand-600">
                <Building2 className="h-4 w-4 text-ink-500 group-hover:text-brand-600" />
                <span>{t(c.name, c.ur)}</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
