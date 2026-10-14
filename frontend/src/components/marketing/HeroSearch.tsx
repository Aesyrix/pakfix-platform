'use client';

import { ArrowRight, Camera, Mic } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';
import { cn } from '@/lib/utils/cn';

/**
 * The box in the hero. This is the front door to the whole product: whatever
 * the visitor types is carried straight into the assistant, so they never
 * have to repeat themselves.
 *
 * Photo and voice entry live here too. Both hand off to the assistant rather
 * than trying to do anything on the marketing page.
 */
export function HeroSearch({ examples = [] }: { examples?: string[] }) {
  const router = useRouter();
  const t = useT();
  const { locale } = useLocale();
  const [value, setValue] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    const problem = value.trim();
    router.push(problem ? `/ai?q=${encodeURIComponent(problem)}` : '/ai');
  }

  const defaultExamples = examples.length > 0 ? examples : locale === 'ur' ? [
    'اے سی چل رہا ہے مگر ٹھنڈا نہیں کر رہا',
    'کچن کا سنک الماری کے نیچے سے لیک ہو رہا ہے',
    'استری آن کرنے پر بریکر ٹرپ ہو جاتا ہے',
  ] : [
    'AC running but not cooling',
    'Kitchen sink leaking under cabinet',
    'Breaker trips when iron is turned on',
  ];

  return (
    <div className="w-full">
      <form onSubmit={submit} className="w-full">
        <label htmlFor="hero-problem" className="sr-only">
          {t('What needs fixing?', 'کیا ٹھیک کرانا ہے؟')}
        </label>

        <div
          className={cn(
            'flex flex-col gap-3 rounded-[var(--radius-card)] border-2 border-[#00824A]/20',
            'bg-surface p-3 shadow-xl backdrop-blur-sm',
            'transition-all duration-200 focus-within:border-[#00824A] focus-within:shadow-2xl'
          )}
        >
          <div className="flex items-center gap-2">
            <input
              id="hero-problem"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={t('What needs fixing in your home?', 'آپ کے گھر میں کیا ٹھیک کرانا ہے؟')}
              autoComplete="off"
              className={cn(
                'min-h-[48px] w-full flex-1 rounded-[var(--radius-control)] bg-transparent px-4',
                'text-base font-medium text-foreground outline-none placeholder:text-ink-400'
              )}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] pt-2.5">
            <div className="flex items-center gap-1.5 text-xs">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push('/ai?input=camera')}
                className="h-9 px-2.5 text-xs text-ink-600 hover:text-[#00824A] hover:bg-brand-50"
                title={t('Take or upload a photo', 'تصویر لیں یا اپ لوڈ کریں')}
              >
                <Camera className="h-4 w-4 text-[#00824A]" aria-hidden="true" />
                <span>{t('Upload Photo', 'تصویر اپ لوڈ کریں')}</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push('/ai?input=voice')}
                className="h-9 px-2.5 text-xs text-ink-600 hover:text-[#2563EB] hover:bg-accent-50"
                title={t('Describe it out loud', 'اسے بول کر بیان کریں')}
              >
                <Mic className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                <span>{t('Voice Input', 'آواز سے ان پٹ')}</span>
              </Button>
            </div>

            <Button type="submit" size="md" variant="primary" className="min-w-[140px]">
              {t('Diagnose Problem', 'مسئلہ تشخیص کریں')}
              <ArrowRight className="h-4 w-4 ms-1 rtl:rotate-180" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-3.5">
        <p className="text-xs font-medium text-ink-500 mb-1.5">{t('Try describing an issue:', 'کوئی مسئلہ بیان کر کے دیکھیں:')}</p>
        <ul className="flex flex-wrap items-center gap-2">
          {defaultExamples.map((example) => (
            <li key={example}>
              <button
                type="button"
                onClick={() => setValue(example)}
                className={cn(
                  'rounded-full border border-[var(--border)] bg-surface/90',
                  'px-3 py-1.5 text-xs font-medium text-ink-600 transition-all',
                  'hover:border-[#00824A] hover:text-[#15803D] hover:bg-[#DCFCE7]/50'
                )}
              >
                &ldquo;{example}&rdquo;
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
