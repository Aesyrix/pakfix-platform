'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Wrench } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export function FinalCtaSection() {
  const t = useT();
  const [text, setText] = useState('');

  return (
    <section className="py-20 sm:py-28 bg-premium-dark text-white relative isolate overflow-hidden">
      <Container size="narrow">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/[0.06] border border-white/15 text-brand-on-dark text-xs font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>{t('Ready to Fix It?', 'ٹھیک کرنے کے لیے تیار؟')}</span>
          </div>

          <h2 className="section-title text-white sm:text-5xl">
            {t('Something needs fixing?', 'کچھ ٹھیک کرنے کی ضرورت ہے؟')}
          </h2>

          <p className="text-sm sm:text-base text-ink-300 max-w-lg mx-auto">
            {t('Show PakFix the problem and get an instant AI diagnosis or book a trusted professional today.', 'پاک فکس کو مسئلہ دکھائیں اور فوری اے آئی تشخیص حاصل کریں یا آج ہی قابلِ اعتماد پروفیشنل بک کریں۔')}
          </p>

          {/* Quick Input Bar inside Dark CTA */}
          <div className="mt-8 max-w-xl mx-auto bg-ink-900 p-2 rounded-2xl border border-ink-800 flex items-center gap-2 shadow-2xl">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('Describe your home problem...', 'اپنا گھریلو مسئلہ بیان کریں...')}
              className="flex-1 bg-transparent px-4 py-2.5 text-xs text-white placeholder-ink-500 outline-none"
            />

            <Link
              href={{ pathname: '/ai', query: { text } }}
              className="px-5 py-2.5 rounded-xl bg-brand-solid hover:bg-brand-solid-hover text-white text-xs font-bold transition-colors shrink-0"
            >
              {t('Ask PakFix AI', 'پاک فکس اے آئی سے پوچھیں')}
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/ai"
              className="px-6 py-3 rounded-xl bg-brand-solid hover:bg-brand-solid-hover text-white text-xs font-bold transition-colors shadow-md"
            >
              {t('Ask PakFix AI', 'پاک فکس اے آئی سے پوچھیں')}
            </Link>

            <Link
              href="/find-a-technician"
              className="px-6 py-3 rounded-xl bg-ink-800 hover:bg-ink-700 text-white text-xs font-bold transition-colors border border-ink-700"
            >
              {t('Book a Professional', 'پروفیشنل بک کریں')}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
