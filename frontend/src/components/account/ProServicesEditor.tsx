'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import { useT } from '@/components/i18n/LocaleProvider';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import { accountApi, catalogueApi } from '@/lib/api/endpoints';
import type { ProProfileSummary } from '@/lib/api/types';
import { groupBySection } from '@/lib/catalogue-sections';
import { cn } from '@/lib/utils/cn';

const MAX = 10;

/**
 * The services a professional offers, grouped Home / Car & Bike / Electronics.
 * Same choice as the app (Account › My services); changing it does not undo
 * verification.
 */
export function ProServicesEditor({ profile, onDone }: { profile: ProProfileSummary; onDone: () => void }) {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const catalogue = useQuery({ queryKey: ['catalogue-categories'], queryFn: () => catalogueApi.categories(), staleTime: 300_000 });
  const [chosen, setChosen] = useState<Set<string>>(() => new Set(profile.categories.map((c) => c.id)));

  const save = useMutation({
    mutationFn: () => accountApi.saveProServices([...chosen]),
    onSuccess: (r) => {
      queryClient.setQueryData(['account-pro-profile'], r.data);
      toast.success(t('Services saved.', 'خدمات محفوظ ہو گئیں۔'));
      onDone();
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? (e.errors.category_ids?.[0] ?? e.message) : t('Could not save. Please try again.', 'محفوظ نہیں ہو سکا۔ دوبارہ کوشش کریں۔')),
  });

  const toggle = (id: string) =>
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < MAX) next.add(id);
      else toast.error(t(`Choose up to ${MAX} services.`, `زیادہ سے زیادہ ${MAX} خدمات منتخب کریں۔`));
      return next;
    });

  if (catalogue.isPending) return <p className="text-sm text-ink-500">{t('Loading services…', 'خدمات لوڈ ہو رہی ہیں…')}</p>;
  if (catalogue.isError || !catalogue.data) {
    return <p className="text-sm text-danger-600">{t('The service list could not be loaded.', 'خدمات کی فہرست لوڈ نہیں ہو سکی۔')}</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-ink-600">
        {t(
          `Choose what you do (up to ${MAX}). You get jobs for these and their sub-services. Your verification stays as it is.`,
          `جو کام آپ کرتے ہیں وہ منتخب کریں (زیادہ سے زیادہ ${MAX})۔ آپ کو انہی اور ان کی ذیلی خدمات کے کام ملیں گے۔ آپ کی تصدیق برقرار رہے گی۔`
        )}
      </p>
      {groupBySection(catalogue.data).map((group) => (
        <div key={group.key}>
          <h3 className="mb-2 text-sm font-semibold text-ink-900">{t(group.en, group.ur)}</h3>
          <div className="flex flex-wrap gap-2">
            {group.categories.map((c) => {
              const on = chosen.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(c.id)}
                  className={cn(
                    'inline-flex min-h-10 items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 text-sm font-medium transition-colors',
                    on ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-line bg-surface text-ink-700 hover:border-brand-300'
                  )}
                >
                  <CategoryIcon name={c.icon} className="h-4 w-4" />
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => save.mutate()} loading={save.isPending} disabled={chosen.size === 0}>
          {t('Save services', 'خدمات محفوظ کریں')}
        </Button>
        <Button variant="ghost" onClick={onDone}>
          {t('Cancel', 'منسوخ')}
        </Button>
        <span className="text-xs text-ink-500">
          {t(`${chosen.size} of ${MAX} chosen`, `${MAX} میں سے ${chosen.size} منتخب`)}
        </span>
      </div>
    </div>
  );
}
