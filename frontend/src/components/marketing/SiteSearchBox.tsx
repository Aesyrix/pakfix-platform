'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { useT } from '@/components/i18n/LocaleProvider';
import { cn } from '@/lib/utils/cn';

/** A search box that hands off to /search. */
export function SiteSearchBox({
  defaultValue = '',
  placeholder,
  className,
}: {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const t = useT();
  const [value, setValue] = useState(defaultValue);
  const effectivePlaceholder = placeholder ?? t('Search services, professionals and guides', 'خدمات، پروفیشنلز اور گائیڈز تلاش کریں');

  function submit(event: FormEvent) {
    event.preventDefault();
    const q = value.trim();

    if (q.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <form role="search" onSubmit={submit} className={cn('flex w-full max-w-2xl gap-2', className)}>
      <label htmlFor="site-search" className="sr-only">
        {t('Search PakFix', 'پاک فکس تلاش کریں')}
      </label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        <input
          id="site-search"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={effectivePlaceholder}
          minLength={2}
          className="min-h-12 w-full rounded-[var(--radius-control)] border border-[var(--border)] bg-surface ps-10 pe-3.5 text-base outline-none focus:border-brand-500"
        />
      </div>
      <Button type="submit">{t('Search', 'تلاش کریں')}</Button>
    </form>
  );
}
