'use client';

import { FileWarning, Languages } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/marketing/PageHeader';
import { Container } from '@/components/ui/Container';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';

/**
 * The legal pages come from "PakFix Legal Pages" (draft of 13 November 2026),
 * which must be approved by a lawyer before it is published. While this is
 * true every legal page shows a draft banner. Set it to false only once the
 * lawyer has approved the text and every [placeholder] has been filled in.
 */
export const LEGAL_DRAFT = true;

/** A value still to be filled in before publishing, e.g. <Ph>Company legal name</Ph>. */
export function Ph({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded-[4px] bg-warn-100 px-1 py-0.5 font-medium text-warn-800 [box-decoration-break:clone]">
      [{children}]
    </mark>
  );
}

/** Shared shell: header, draft banner, and the long-form text. */
export function LegalPage({
  title,
  titleUr,
  effective = true,
  children,
}: {
  title: string;
  titleUr: string;
  /** Show the "Effective [date]" line under the title. */
  effective?: boolean;
  children: ReactNode;
}) {
  const t = useT();
  const { locale } = useLocale();

  return (
    <>
      <PageHeader
        size="narrow"
        breadcrumbs={[{ name: t('Home', 'ہوم'), href: '/' }, { name: t(title, titleUr) }]}
        title={t(title, titleUr)}
        subtitle={
          effective ? (
            <span dir="ltr" lang="en">
              Effective <Ph>Effective date</Ph>
            </span>
          ) : undefined
        }
      />
      <section className="bg-surface py-12 sm:py-16">
        <Container size="narrow">
          <div className="mx-auto max-w-[70ch] space-y-4">
            {LEGAL_DRAFT ? (
              <div role="note" className="flex items-start gap-3 rounded-2xl border border-warn-200 bg-warn-50 p-4 text-sm text-warn-800">
                <FileWarning className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p dir="ltr" lang="en">
                  <strong>Draft for legal review.</strong> This text has not yet been approved by a lawyer. Values in{' '}
                  <Ph>brackets</Ph> are still to be filled in.
                </p>
              </div>
            ) : null}
            {locale === 'ur' ? (
              <div role="note" className="flex items-start gap-3 rounded-2xl border border-line bg-surface-muted p-4 text-sm text-ink-600">
                <Languages className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
                <p>یہ صفحہ فی الحال صرف انگریزی میں دستیاب ہے۔ اردو ترجمہ قانونی منظوری کے بعد شامل کیا جائے گا۔</p>
              </div>
            ) : null}
          </div>

          {/* English legal text reads left to right, even when the site is in Urdu. */}
          <div dir="ltr" lang="en" className="rich-text mx-auto mt-8">
            {children}
          </div>
        </Container>
      </section>
    </>
  );
}
