'use client';

import Link from 'next/link';
import { useT } from '@/components/i18n/LocaleProvider';

/** The "New here? Create an account" line under an auth card. */
export function AuthSwitch({
  prompt,
  promptUr,
  href,
  linkLabel,
  linkLabelUr,
}: {
  prompt: string;
  promptUr?: string;
  href: string;
  linkLabel: string;
  linkLabelUr?: string;
}) {
  const t = useT();

  return (
    <p className="mt-6 text-center text-sm text-ink-600">
      {t(prompt, promptUr)}{' '}
      <Link href={href} className="font-semibold text-brand-600 hover:text-brand-700">
        {t(linkLabel, linkLabelUr)}
      </Link>
    </p>
  );
}
