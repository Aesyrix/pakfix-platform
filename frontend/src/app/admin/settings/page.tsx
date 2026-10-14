'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminShell';
import { useT } from '@/components/i18n/LocaleProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import { adminApi } from '@/lib/api/endpoints';
import type { AdminSetting } from '@/lib/api/types';

const GROUP_LABELS: Record<string, { title: string; titleUr: string; description: string; descriptionUr: string }> = {
  general: { title: 'Brand and contact', titleUr: 'برانڈ اور رابطہ', description: 'Shown in the header, the footer and on the contact page.', descriptionUr: 'ہیڈر، فوٹر اور رابطہ صفحے پر دکھایا جاتا ہے۔' },
  social: { title: 'Social links', titleUr: 'سوشل لنکس', description: 'Leave a field empty to hide that network.', descriptionUr: 'اس نیٹ ورک کو چھپانے کے لیے خانہ خالی چھوڑیں۔' },
  seo: { title: 'Search engines', titleUr: 'سرچ انجن', description: 'Defaults used where a page has no title or description of its own.', descriptionUr: 'وہ ڈیفالٹس جو ایسے صفحات پر استعمال ہوتے ہیں جن کا اپنا عنوان یا تفصیل نہ ہو۔' },
};

/**
 * Marketing settings only.
 *
 * Commission, payment gateways and AI credentials are deliberately not here:
 * they move money or hold secrets, and get their own screens with their own
 * permissions in a later phase.
 */
export default function AdminSettingsPage() {
  const t = useT();
  const query = useQuery({ queryKey: ['admin-settings'], queryFn: adminApi.settings, staleTime: 30_000 });

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
    return <ErrorState description={t('Settings could not be loaded.', 'ترتیبات لوڈ نہیں ہو سکیں۔')} onRetry={() => query.refetch()} />;
  }

  // Keyed on the saved values: a background refresh brings newer values in by
  // remounting the form, rather than an effect overwriting what is being typed.
  const fingerprint = query.data.map((setting) => `${setting.key}=${String(setting.value ?? '')}`).join('|');

  return <SettingsForm key={fingerprint} settings={query.data} />;
}

function SettingsForm({ settings }: { settings: AdminSetting[] }) {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(settings.map((setting) => [setting.key, String(setting.value ?? '')]))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = useMutation({
    mutationFn: () => adminApi.updateSettings(values),
    onSuccess: (response) => {
      setErrors({});
      toast.success(response.message);
      void queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isValidationError) {
        setErrors(
          Object.fromEntries(
            Object.entries(error.errors).map(([field, messages]) => [field.replace(/^values\./, ''), messages[0]])
          )
        );
        toast.error(t('Check the highlighted fields.', 'نمایاں کیے گئے خانے چیک کریں۔'));

        return;
      }

      toast.error(error instanceof ApiError ? error.message : t('Could not save.', 'محفوظ نہیں ہو سکا۔'));
    },
  });

  const groups = settings.reduce<Record<string, AdminSetting[]>>((collected, setting) => {
    (collected[setting.group] ??= []).push(setting);

    return collected;
  }, {});

  return (
    <>
      <AdminPageHeader title={t('Settings', 'ترتیبات')} description={t('Brand details and defaults used across the public site.', 'برانڈ کی تفصیلات اور پوری عوامی سائٹ پر استعمال ہونے والے ڈیفالٹس۔')} />

      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        {Object.entries(groups).map(([group, settings]) => (
          <Card key={group}>
            <CardBody className="flex flex-col gap-4">
              <div>
                <h2 className="font-semibold">{t(GROUP_LABELS[group]?.title ?? group, GROUP_LABELS[group]?.titleUr)}</h2>
                {GROUP_LABELS[group]?.description ? (
                  <p className="mt-1 text-sm text-ink-600">{t(GROUP_LABELS[group].description, GROUP_LABELS[group].descriptionUr)}</p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {settings.map((setting) => (
                  <Input
                    key={setting.key}
                    label={setting.label ?? setting.key}
                    value={values[setting.key] ?? ''}
                    onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value }))}
                    error={errors[setting.key]}
                    type={setting.key.startsWith('social.') ? 'url' : 'text'}
                    inputMode={setting.key.includes('phone') ? 'tel' : undefined}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        ))}

        <div className="flex items-center gap-3">
          <Button type="submit" loading={save.isPending}>
            {t('Save settings', 'ترتیبات محفوظ کریں')}
          </Button>
          <p className="text-sm text-ink-500">{t('Changes appear on the site immediately.', 'تبدیلیاں فوراً سائٹ پر ظاہر ہو جاتی ہیں۔')}</p>
        </div>
      </form>
    </>
  );
}
