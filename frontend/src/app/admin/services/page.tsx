'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
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
import type { AdminServiceCategory } from '@/lib/api/types';

/**
 * The service catalogue.
 *
 * Categories are switched off rather than deleted: bookings and reviews point
 * at them, and a job history that says "unknown service" helps nobody.
 */
export default function AdminServicesPage() {
  const t = useT();
  const [editing, setEditing] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['admin-categories'], queryFn: adminApi.categories, staleTime: 60_000 });

  return (
    <>
      <AdminPageHeader
        title={t('Services', 'خدمات')}
        description={t('Names, descriptions, typical prices and the trade name used in local pages such as /plumber/lahore.', 'نام، تفصیلات، عام قیمتیں اور مقامی صفحات جیسے /plumber/lahore میں استعمال ہونے والا پیشے کا نام۔')}
      />

      {query.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : query.isError || !query.data ? (
        <ErrorState description={t('Services could not be loaded.', 'خدمات لوڈ نہیں ہو سکیں۔')} onRetry={() => query.refetch()} />
      ) : (
        <ul className="flex flex-col gap-3">
          {query.data.map((category) => (
            <li key={category.id}>
              {editing === category.id ? (
                <CategoryEditor category={category} onClose={() => setEditing(null)} />
              ) : (
                <Card>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <button type="button" onClick={() => setEditing(category.id)} className="text-left font-medium hover:text-[#15803D]">
                        {category.parent ? <span className="text-ink-400">{category.parent.name} › </span> : null}
                        {category.name}
                      </button>
                      <p className="mt-0.5 text-xs text-ink-500">
                        /services/{category.slug}
                        {category.trade_slug ? t(` · local pages as /${category.trade_slug}/<city>`, ` · مقامی صفحات بطور /${category.trade_slug}/<city>`) : t(' · no local pages', ' · کوئی مقامی صفحات نہیں')}
                        {category.typical_min_rupees
                          ? ` · Rs ${category.typical_min_rupees.toLocaleString()}–${(category.typical_max_rupees ?? category.typical_min_rupees).toLocaleString()}`
                          : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {category.is_popular ? <Badge tone="brand">{t('Popular', 'مقبول')}</Badge> : null}
                      {category.is_emergency ? <Badge tone="danger">{t('Emergency', 'ہنگامی')}</Badge> : null}
                      <Badge tone={category.is_active ? 'safe' : 'warn'}>{category.is_active ? t('Live', 'لائیو') : t('Off', 'بند')}</Badge>
                      <a
                        href={`/services/${category.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink-400 hover:text-[#00824A]"
                        aria-label={t(`View ${category.name}`, `${category.name} دیکھیں`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </CardBody>
                </Card>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function CategoryEditor({ category, onClose }: { category: AdminServiceCategory; onClose: () => void }) {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? '');
  const [tradeSlug, setTradeSlug] = useState(category.trade_slug ?? '');
  const [tradeName, setTradeName] = useState(category.trade_name ?? '');
  const [minRupees, setMinRupees] = useState(category.typical_min_rupees?.toString() ?? '');
  const [maxRupees, setMaxRupees] = useState(category.typical_max_rupees?.toString() ?? '');
  const [problems, setProblems] = useState(category.common_problems.join('\n'));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = useMutation({
    mutationFn: () =>
      adminApi.updateCategory(category.id, {
        name,
        description: description || null,
        trade_slug: tradeSlug || null,
        trade_name: tradeName || null,
        typical_min_rupees: minRupees ? Number(minRupees) : null,
        typical_max_rupees: maxRupees ? Number(maxRupees) : null,
        common_problems: problems.split('\n').map((line) => line.trim()).filter(Boolean),
      }),
    onSuccess: (response) => {
      toast.success(response.message);
      void queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      onClose();
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

  const toggle = useMutation({
    mutationFn: (input: Record<string, unknown>) => adminApi.updateCategory(category.id, input),
    onSuccess: (response) => {
      toast.success(response.message);
      void queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  return (
    <Card className="border-[#00824A]">
      <CardBody className="flex flex-col gap-4">
        <h2 className="font-semibold">{t(`Editing ${category.name}`, `${category.name} میں ترمیم`)}</h2>

        <Input label={t('Name', 'نام')} value={name} onChange={(event) => setName(event.target.value)} error={errors.name} />
        <Textarea label={t('Description', 'تفصیل')} rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('Trade name', 'پیشے کا نام')}
            value={tradeName}
            onChange={(event) => setTradeName(event.target.value)}
            hint={t('What people call this professional, e.g. Plumber.', 'لوگ اس پیشہ ور کو کیا کہتے ہیں، مثلاً پلمبر۔')}
            error={errors.trade_name}
          />
          <Input
            label={t('Local page slug', 'مقامی صفحے کا سلگ')}
            value={tradeSlug}
            onChange={(event) => setTradeSlug(event.target.value)}
            hint={t('Used as /<slug>/<city>. Leave blank for no local pages.', '/<slug>/<city> کے طور پر استعمال ہوتا ہے۔ مقامی صفحات نہ چاہیں تو خالی چھوڑیں۔')}
            error={errors.trade_slug}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t('Typical price from (PKR)', 'عام قیمت سے (PKR)')}
            type="number"
            inputMode="numeric"
            value={minRupees}
            onChange={(event) => setMinRupees(event.target.value)}
            error={errors.typical_min_rupees}
          />
          <Input
            label={t('Typical price to (PKR)', 'عام قیمت تک (PKR)')}
            type="number"
            inputMode="numeric"
            value={maxRupees}
            onChange={(event) => setMaxRupees(event.target.value)}
            error={errors.typical_max_rupees}
          />
        </div>

        <Textarea
          label={t('Common problems', 'عام مسائل')}
          rows={6}
          value={problems}
          onChange={(event) => setProblems(event.target.value)}
          hint={t('One per line. These appear on the service page and the local pages.', 'ہر سطر میں ایک۔ یہ سروس صفحے اور مقامی صفحات پر ظاہر ہوتے ہیں۔')}
          error={errors.common_problems}
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => save.mutate()} loading={save.isPending}>
            {t('Save service', 'سروس محفوظ کریں')}
          </Button>
          <Button variant="secondary" onClick={() => toggle.mutate({ is_popular: !category.is_popular })} loading={toggle.isPending}>
            {category.is_popular ? t('Remove from homepage', 'ہوم پیج سے ہٹائیں') : t('Show on homepage', 'ہوم پیج پر دکھائیں')}
          </Button>
          <Button variant="secondary" onClick={() => toggle.mutate({ is_active: !category.is_active })} loading={toggle.isPending}>
            {category.is_active ? t('Switch off', 'بند کریں') : t('Switch on', 'آن کریں')}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t('Cancel', 'منسوخ کریں')}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
