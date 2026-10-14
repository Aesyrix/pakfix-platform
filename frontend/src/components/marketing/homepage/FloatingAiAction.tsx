'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useT } from '@/components/i18n/LocaleProvider';

export function FloatingAiAction() {
  const t = useT();
  return (
    <div className="fixed bottom-6 end-6 z-40 hidden md:block">
      <Link
        href="/ai"
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#00824A] hover:bg-[#006B3C] text-white text-xs font-extrabold shadow-floating transition-all hover:scale-105 border-2 border-white"
        aria-label={t('Ask PakFix AI', 'پاک فکس اے آئی سے پوچھیں')}
      >
        <Sparkles className="h-4 w-4 animate-pulse text-amber-300" />
        <span>{t('Ask PakFix AI', 'پاک فکس اے آئی سے پوچھیں')}</span>
      </Link>
    </div>
  );
}
