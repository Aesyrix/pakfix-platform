'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Lock, Plus } from 'lucide-react';
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
import type { AdminPage } from '@/lib/api/types';

/** Terms, Privacy, Refunds, Safety, About, and any page the team adds. */
export default function AdminPagesPage() {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const list = useQuery({ queryKey: ['admin-pages'], queryFn: adminApi.pages, staleTime: 30_000 });
  const selected = useQuery({
    queryKey: ['admin-page', selectedId],
    queryFn: () => adminApi.page(selectedId as string),
    enabled: Boolean(selectedId),
  });

  const create = useMutation({
    mutationFn: (input: Record<string, unknown>) => adminApi.createPage(input),
    onSuccess: (response) => {
      toast.success(response.message);
      setCreating(false);
      setSelectedId(response.data.id);
      void queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : t('Could not create the page.', 'صفحہ بنایا نہیں جا سکا۔')),
  });

  return (
    <>
      <AdminPageHeader
        title={t('Pages', 'صفحات')}
        description={t('Written in Markdown. Legal pages can be edited but not deleted or taken offline.', 'مارک ڈاؤن میں لکھا گیا۔ قانونی صفحات میں ترمیم کی جا سکتی ہے مگر انہیں حذف یا آف لائن نہیں کیا جا سکتا۔')}
        action={
          <Button onClick={() => { setCreating(true); setSelectedId(null); }}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('New page', 'نیا صفحہ')}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div>
          {list.isPending ? (
            <SkeletonCard />
          ) : list.isError || !list.data ? (
            <ErrorState description={t('Pages could not be loaded.', 'صفحات لوڈ نہیں ہو سکے۔')} onRetry={() => list.refetch()} />
          ) : (
            <ul className="flex flex-col gap-2">
              {list.data.map((page) => (
                <li key={page.id}>
                  <button
                    type="button"
                    onClick={() => { setSelectedId(page.id); setCreating(false); }}
                    aria-current={selectedId === page.id ? 'true' : undefined}
                    className={`flex w-full min-h-12 items-center justify-between gap-2 rounded-[var(--radius-control)] border px-3 text-left text-sm ${
                      selectedId === page.id ? 'border-[#00824A] bg-[#DCFCE7]' : 'border-[var(--border)] bg-surface hover:bg-surface-muted'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{page.title}</span>
                      <span className="block truncate text-xs text-ink-500">/{page.slug}</span>
                    </span>
                    {page.is_system ? <Lock className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-label={t('System page', 'سسٹم صفحہ')} /> : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          {creating ? (
            <Card>
              <CardBody>
                <h2 className="mb-4 font-semibold">{t('New page', 'نیا صفحہ')}</h2>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    create.mutate({
                      title: String(form.get('title') ?? ''),
                      body: String(form.get('body') ?? ''),
                      is_published: true,
                    });
                  }}
                >
                  <Input name="title" label={t('Title', 'عنوان')} required minLength={2} />
                  <Textarea name="body" label={t('Content (Markdown)', 'مواد (مارک ڈاؤن)')} rows={12} />
                  <div className="flex gap-2">
                    <Button type="submit" loading={create.isPending}>
                      {t('Create page', 'صفحہ بنائیں')}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
                      {t('Cancel', 'منسوخ کریں')}
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          ) : selectedId && selected.data ? (
            <PageEditor page={selected.data} />
          ) : selectedId && selected.isPending ? (
            <SkeletonCard />
          ) : (
            <Card>
              <CardBody>
                <p className="text-sm text-ink-600">{t('Choose a page on the left to edit it.', 'ترمیم کے لیے بائیں جانب سے ایک صفحہ منتخب کریں۔')}</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function PageEditor({ page }: { page: AdminPage }) {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(page.title);
  const [body, setBody] = useState(page.body ?? '');
  const [seoTitle, setSeoTitle] = useState(page.seo_title ?? '');
  const [seoDescription, setSeoDescription] = useState(page.seo_description ?? '');

  const save = useMutation({
    mutationFn: () =>
      adminApi.updatePage(page.id, {
        title,
        body,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
      }),
    onSuccess: (response) => {
      toast.success(response.message);
      void queryClient.invalidateQueries({ queryKey: ['admin-pages'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-page', page.id] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : t('Could not save.', 'محفوظ نہیں ہو سکا۔')),
  });

  const publicPath = page.is_system ? `/${page.slug}` : `/pages/${page.slug}`;

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">{t(`Editing ${page.title}`, `${page.title} میں ترمیم`)}</h2>
            {page.is_system ? <Badge tone="neutral">{t('System page', 'سسٹم صفحہ')}</Badge> : null}
            <Badge tone={page.is_published ? 'safe' : 'warn'}>{page.is_published ? t('Live', 'لائیو') : t('Draft', 'ڈرافٹ')}</Badge>
          </div>
          <a
            href={publicPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00824A] hover:text-[#15803D]"
          >
            {t('View page', 'صفحہ دیکھیں')}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <Input label={t('Title', 'عنوان')} value={title} onChange={(event) => setTitle(event.target.value)} />
        <Textarea
          label={t('Content (Markdown)', 'مواد (مارک ڈاؤن)')}
          rows={18}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          hint={t('Markdown only. HTML is stripped before the page is shown.', 'صرف مارک ڈاؤن۔ صفحہ دکھانے سے پہلے HTML ہٹا دیا جاتا ہے۔')}
        />
        <Input label={t('Search engine title', 'سرچ انجن عنوان')} value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} />
        <Textarea
          label={t('Search engine description', 'سرچ انجن تفصیل')}
          rows={2}
          value={seoDescription}
          onChange={(event) => setSeoDescription(event.target.value)}
        />

        <div className="flex items-center gap-3">
          <Button onClick={() => save.mutate()} loading={save.isPending}>
            {t('Save page', 'صفحہ محفوظ کریں')}
          </Button>
          {page.updated_at ? (
            <span className="text-xs text-ink-500">
              {t('Last saved', 'آخری بار محفوظ')} {new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(page.updated_at))}
            </span>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
