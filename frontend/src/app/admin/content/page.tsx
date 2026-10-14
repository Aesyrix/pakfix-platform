'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminShell';
import { useT } from '@/components/i18n/LocaleProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input, Textarea } from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import { adminApi } from '@/lib/api/endpoints';
import type { AdminContentBlock, ContentListItem, ContentValue } from '@/lib/api/types';

/**
 * Editing the public pages' text.
 *
 * Each block is a section the site renders. The editor shows whatever shape
 * that block's content has -- a line of text, a list of examples, or a list of
 * titled points -- rather than asking anyone to edit JSON.
 */
export default function AdminContentPage() {
  const t = useT();
  const query = useQuery({ queryKey: ['admin-blocks'], queryFn: adminApi.blocks, staleTime: 30_000 });

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState description={t('The page sections could not be loaded.', 'صفحے کے حصے لوڈ نہیں ہو سکے۔')} onRetry={() => query.refetch()} />;
  }

  const byPage = query.data.reduce<Record<string, AdminContentBlock[]>>((groups, block) => {
    (groups[block.page] ??= []).push(block);

    return groups;
  }, {});

  return (
    <>
      <AdminPageHeader
        title={t('Page sections', 'صفحے کے حصے')}
        description={t('The words on the homepage and in the footer. Saving publishes straight away; visitors see the change on their next page load.', 'ہوم پیج اور فوٹر کے الفاظ۔ محفوظ کرنے پر فوراً شائع ہو جاتا ہے؛ وزٹرز اگلی بار صفحہ کھولنے پر تبدیلی دیکھیں گے۔')}
      />

      {Object.entries(byPage).map(([page, blocks]) => (
        <section key={page} aria-labelledby={`page-${page}`} className="mb-10">
          <h2 id={`page-${page}`} className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">
            {page === 'global' ? t('Site-wide', 'پوری سائٹ پر') : page}
          </h2>
          <div className="flex flex-col gap-4">
            {blocks.map((block) => (
              // Keyed on the saved timestamp: a background refresh that brings
              // newer values remounts the form with them, instead of an effect
              // that would overwrite what someone is typing.
              <BlockEditor key={`${block.key}:${block.updated_at ?? ''}`} block={block} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function BlockEditor({ block }: { block: AdminContentBlock }) {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(block.title ?? '');
  const [subtitle, setSubtitle] = useState(block.subtitle ?? '');
  const [ctaLabel, setCtaLabel] = useState(block.cta_label ?? '');
  const [ctaUrl, setCtaUrl] = useState(block.cta_url ?? '');
  const [content, setContent] = useState<Record<string, ContentValue>>(block.content ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = useMutation({
    mutationFn: () =>
      adminApi.updateBlock(block.key, {
        title: title || null,
        subtitle: subtitle || null,
        cta_label: ctaLabel || null,
        cta_url: ctaUrl || null,
        content,
      } as Partial<AdminContentBlock>),
    onSuccess: (response) => {
      setErrors({});
      toast.success(response.message);
      void queryClient.invalidateQueries({ queryKey: ['admin-blocks'] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isValidationError) {
        setErrors(Object.fromEntries(Object.entries(error.errors).map(([field, messages]) => [field, messages[0]])));
        toast.error(t('Check the highlighted fields.', 'نمایاں کیے گئے خانے چیک کریں۔'));

        return;
      }

      toast.error(error instanceof ApiError ? error.message : t('Could not save.', 'محفوظ نہیں ہو سکا۔'));
    },
  });

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{block.title || block.key}</h3>
            <Badge tone="neutral">{block.key}</Badge>
            {!block.is_active ? <Badge tone="warn">{t('Hidden', 'پوشیدہ')}</Badge> : null}
          </div>
          {block.page !== 'global' ? (
            <a
              href={block.page === 'home' ? '/' : `/${block.page}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00824A] hover:text-[#15803D]"
            >
              {t('View page', 'صفحہ دیکھیں')}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </div>

        <Input label={t('Heading', 'سرخی')} value={title} onChange={(event) => setTitle(event.target.value)} error={errors.title} />
        <Textarea
          label={t('Supporting text', 'معاون متن')}
          rows={2}
          value={subtitle}
          onChange={(event) => setSubtitle(event.target.value)}
          error={errors.subtitle}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('Button label', 'بٹن لیبل')}
            value={ctaLabel}
            onChange={(event) => setCtaLabel(event.target.value)}
            error={errors.cta_label}
          />
          <Input
            label={t('Button link', 'بٹن لنک')}
            value={ctaUrl}
            onChange={(event) => setCtaUrl(event.target.value)}
            hint={t('A site path such as /ai, or a full https:// address.', 'ایک سائٹ راستہ جیسے /ai، یا مکمل https:// پتہ۔')}
            error={errors.cta_url}
          />
        </div>

        {Object.entries(content).map(([key, value]) => (
          <ContentField
            key={key}
            name={key}
            value={value}
            error={errors.content}
            onChange={(next) => setContent((current) => ({ ...current, [key]: next }))}
          />
        ))}

        <div className="flex items-center gap-3">
          <Button onClick={() => save.mutate()} loading={save.isPending}>
            {t('Save section', 'سیکشن محفوظ کریں')}
          </Button>
          {save.isSuccess ? <span className="text-sm text-[#15803D]">{t('Saved and live.', 'محفوظ اور لائیو۔')}</span> : null}
        </div>
      </CardBody>
    </Card>
  );
}

function humanise(key: string): string {
  return key.replace(/_/g, ' ').replace(/^./, (character) => character.toUpperCase());
}

/** Renders the editor that matches the shape of this field's value. */
function ContentField({
  name,
  value,
  error,
  onChange,
}: {
  name: string;
  value: ContentValue;
  error?: string;
  onChange: (value: ContentValue) => void;
}) {
  const t = useT();

  if (typeof value === 'string') {
    return (
      <Input label={humanise(name)} value={value} onChange={(event) => onChange(event.target.value)} error={error} />
    );
  }

  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
    return (
      <Textarea
        label={humanise(name)}
        rows={Math.min(8, Math.max(3, value.length + 1))}
        value={(value as string[]).join('\n')}
        onChange={(event) => onChange(event.target.value.split('\n'))}
        hint={t('One per line. Blank lines are ignored.', 'ہر سطر میں ایک۔ خالی سطریں نظر انداز کر دی جاتی ہیں۔')}
        error={error}
      />
    );
  }

  if (Array.isArray(value)) {
    const items = value as ContentListItem[];

    return (
      <fieldset className="rounded-[var(--radius-control)] border border-[var(--border)] p-4">
        <legend className="px-1 text-sm font-medium">{humanise(name)}</legend>

        <div className="flex flex-col gap-4">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col gap-2 border-l-2 border-[var(--border)] pl-3">
              <Input
                label={t(`Item ${index + 1} title`, `آئٹم ${index + 1} کا عنوان`)}
                value={item.title ?? ''}
                onChange={(event) =>
                  onChange(items.map((entry, position) => (position === index ? { ...entry, title: event.target.value } : entry)))
                }
              />
              <Textarea
                label={t('Text', 'متن')}
                rows={2}
                value={item.body ?? ''}
                onChange={(event) =>
                  onChange(items.map((entry, position) => (position === index ? { ...entry, body: event.target.value } : entry)))
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(items.filter((_, position) => position !== index))}
                className="self-start text-danger-600"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {t('Remove item', 'آئٹم ہٹائیں')}
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onChange([...items, { title: '', body: '' }])}
            className="self-start"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('Add item', 'آئٹم شامل کریں')}
          </Button>
        </div>

        {error ? (
          <p role="alert" className="mt-2 text-sm text-danger-600">
            {error}
          </p>
        ) : null}
      </fieldset>
    );
  }

  // A flat map, such as the footer's contact details.
  const entries = Object.entries(value as Record<string, string>);

  return (
    <fieldset className="rounded-[var(--radius-control)] border border-[var(--border)] p-4">
      <legend className="px-1 text-sm font-medium">{humanise(name)}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map(([key, entryValue]) => (
          <Input
            key={key}
            label={humanise(key)}
            value={entryValue ?? ''}
            onChange={(event) =>
              onChange({ ...(value as Record<string, string>), [key]: event.target.value })
            }
          />
        ))}
      </div>
    </fieldset>
  );
}
