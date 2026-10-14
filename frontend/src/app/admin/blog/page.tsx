'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminShell';
import { useT } from '@/components/i18n/LocaleProvider';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { ApiError } from '@/lib/api/client';
import { adminApi } from '@/lib/api/endpoints';
import type { AdminBlogPost } from '@/lib/api/types';

const BLANK = {
  title: '',
  body: '',
  excerpt: '',
  blog_category_slug: '',
  service_category_slug: '',
  tags: '',
  seo_title: '',
  seo_description: '',
  cta_label: '',
  cta_url: '',
  status: 'draft' as const,
};

/** Writing and publishing the guides on /blog. */
export default function AdminBlogPage() {
  const t = useT();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const list = useQuery({
    queryKey: ['admin-posts', status],
    queryFn: () => adminApi.posts({ status: status || undefined }),
    staleTime: 30_000,
  });

  const options = useQuery({ queryKey: ['admin-blog-options'], queryFn: adminApi.blogOptions, staleTime: 300_000 });
  const editing = useQuery({
    queryKey: ['admin-post', editingId],
    queryFn: () => adminApi.post(editingId as string),
    enabled: Boolean(editingId),
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminApi.deletePost(id),
    onSuccess: () => {
      toast.success(t('Guide deleted.', 'گائیڈ حذف ہو گئی۔'));
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
    onError: () => toast.error(t('Could not delete that guide.', 'وہ گائیڈ حذف نہیں ہو سکی۔')),
  });

  if (creating || editingId) {
    const post = editingId ? editing.data : null;

    if (editingId && editing.isPending) return <SkeletonCard />;

    return (
      <PostEditor
        post={post ?? null}
        options={options.data}
        onClose={() => {
          setCreating(false);
          setEditingId(null);
        }}
        onDelete={post ? () => remove.mutate(post.id) : undefined}
      />
    );
  }

  return (
    <>
      <AdminPageHeader
        title={t('Guides', 'گائیڈز')}
        description={t('Articles on /blog. Publishing with a future date schedules it; it appears on its own when the time arrives.', '/blog پر مضامین۔ مستقبل کی تاریخ کے ساتھ شائع کرنے سے یہ شیڈول ہو جاتا ہے؛ وقت آنے پر خودبخود ظاہر ہو جاتا ہے۔')}
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('Write a guide', 'گائیڈ لکھیں')}
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Select label={t('Show', 'دکھائیں')} value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">{t('All guides', 'تمام گائیڈز')}</option>
          <option value="published">{t('Published', 'شائع شدہ')}</option>
          <option value="draft">{t('Drafts', 'ڈرافٹس')}</option>
        </Select>
      </div>

      {list.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : list.isError || !list.data ? (
        <ErrorState description={t('Guides could not be loaded.', 'گائیڈز لوڈ نہیں ہو سکیں۔')} onRetry={() => list.refetch()} />
      ) : list.data.data.length === 0 ? (
        <EmptyState title={t('No guides yet', 'ابھی کوئی گائیڈ نہیں')} description={t('Write the questions customers ask you most often.', 'وہ سوالات لکھیں جو گاہک آپ سے سب سے زیادہ پوچھتے ہیں۔')} />
      ) : (
        <ul className="flex flex-col gap-3">
          {list.data.data.map((post) => (
            <li key={post.id}>
              <Card>
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <button type="button" onClick={() => setEditingId(post.id)} className="text-left font-medium hover:text-[#15803D]">
                      {post.title}
                    </button>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {post.blog_category_name ?? t('Uncategorised', 'بغیر زمرہ')}
                      {post.published_at
                        ? ` · ${new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium' }).format(new Date(post.published_at))}`
                        : ''}
                      {post.author ? ` · ${post.author}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={post.status === 'published' ? 'safe' : post.status === 'scheduled' ? 'info' : 'warn'}>
                      {post.status}
                    </Badge>
                    {post.status === 'published' ? (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink-400 hover:text-[#00824A]"
                        aria-label={t(`View ${post.title}`, `${post.title} دیکھیں`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function PostEditor({
  post,
  options,
  onClose,
  onDelete,
}: {
  post: AdminBlogPost | null;
  options?: { categories: Array<{ name: string; slug: string }>; service_categories: Array<{ name: string; slug: string }> };
  onClose: () => void;
  onDelete?: () => void;
}) {
  const t = useT();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    ...BLANK,
    ...(post
      ? {
          title: post.title,
          body: post.body ?? '',
          excerpt: post.excerpt ?? '',
          blog_category_slug: post.blog_category_slug ?? '',
          service_category_slug: post.service_category_slug ?? '',
          tags: post.tags.join(', '),
          seo_title: post.seo_title ?? '',
          seo_description: post.seo_description ?? '',
          cta_label: post.cta_label ?? '',
          cta_url: post.cta_url ?? '',
          status: post.status === 'scheduled' ? ('published' as const) : (post.status as 'draft' | 'published'),
        }
      : {}),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title,
        body: form.body,
        excerpt: form.excerpt || null,
        blog_category_slug: form.blog_category_slug || null,
        service_category_slug: form.service_category_slug || null,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        cta_label: form.cta_label || null,
        cta_url: form.cta_url || null,
        status: form.status,
      };

      return post ? adminApi.updatePost(post.id, payload) : adminApi.createPost(payload);
    },
    onSuccess: (response) => {
      setErrors({});
      toast.success(response.message);
      void queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
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

  return (
    <>
      <AdminPageHeader
        title={post ? t('Edit guide', 'گائیڈ میں ترمیم کریں') : t('Write a guide', 'گائیڈ لکھیں')}
        action={
          <div className="flex gap-2">
            {onDelete ? (
              <Button variant="ghost" className="text-danger-600" onClick={onDelete}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                {t('Delete', 'حذف کریں')}
              </Button>
            ) : null}
            <Button variant="secondary" onClick={onClose}>
              {t('Back to list', 'فہرست پر واپس جائیں')}
            </Button>
          </div>
        }
      />

      <Card>
        <CardBody className="flex flex-col gap-4">
          <Input label={t('Title', 'عنوان')} value={form.title} onChange={(event) => set('title', event.target.value)} error={errors.title} required />

          <Textarea
            label={t('Article (Markdown)', 'مضمون (مارک ڈاؤن)')}
            rows={18}
            value={form.body}
            onChange={(event) => set('body', event.target.value)}
            error={errors.body}
            hint={t('Markdown only; HTML is stripped. Use ## for section headings.', 'صرف مارک ڈاؤن؛ HTML ہٹا دیا جاتا ہے۔ سیکشن سرخیوں کے لیے ## استعمال کریں۔')}
            required
          />

          <Textarea
            label={t('Summary', 'خلاصہ')}
            rows={2}
            value={form.excerpt}
            onChange={(event) => set('excerpt', event.target.value)}
            hint={t('Shown on cards and in search results. Written for you if left blank.', 'کارڈز اور سرچ نتائج میں دکھایا جاتا ہے۔ خالی چھوڑنے پر آپ کے لیے لکھ دیا جائے گا۔')}
            error={errors.excerpt}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label={t('Category', 'زمرہ')} value={form.blog_category_slug} onChange={(event) => set('blog_category_slug', event.target.value)}>
              <option value="">{t('No category', 'کوئی زمرہ نہیں')}</option>
              {options?.categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>

            <Select
              label={t('Related service', 'متعلقہ سروس')}
              value={form.service_category_slug}
              onChange={(event) => set('service_category_slug', event.target.value)}
              hint={t('Adds a booking call to action at the end of the article.', 'مضمون کے آخر میں بکنگ کا کال ٹو ایکشن شامل کرتا ہے۔')}
            >
              <option value="">{t('None', 'کوئی نہیں')}</option>
              {options?.service_categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <Input
            label={t('Tags', 'ٹیگز')}
            value={form.tags}
            onChange={(event) => set('tags', event.target.value)}
            hint={t('Separated by commas.', 'کوما سے الگ کریں۔')}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t('Search engine title', 'سرچ انجن عنوان')} value={form.seo_title} onChange={(event) => set('seo_title', event.target.value)} />
            <Input label={t('Button label', 'بٹن لیبل')} value={form.cta_label} onChange={(event) => set('cta_label', event.target.value)} error={errors.cta_label} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Textarea
              label={t('Search engine description', 'سرچ انجن تفصیل')}
              rows={2}
              value={form.seo_description}
              onChange={(event) => set('seo_description', event.target.value)}
            />
            <Input
              label={t('Button link', 'بٹن لنک')}
              value={form.cta_url}
              onChange={(event) => set('cta_url', event.target.value)}
              hint={t('A path such as /services/plumbing.', 'ایک راستہ جیسے /services/plumbing۔')}
              error={errors.cta_url}
            />
          </div>

          <Select label={t('Status', 'حالت')} value={form.status} onChange={(event) => set('status', event.target.value)} error={errors.status}>
            <option value="draft">{t('Draft — only visible here', 'ڈرافٹ — صرف یہاں نظر آتا ہے')}</option>
            <option value="published">{t('Published — live on the site', 'شائع شدہ — سائٹ پر لائیو')}</option>
          </Select>

          <div className="flex gap-2">
            <Button onClick={() => save.mutate()} loading={save.isPending}>
              {post ? t('Save guide', 'گائیڈ محفوظ کریں') : t('Create guide', 'گائیڈ بنائیں')}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {t('Cancel', 'منسوخ کریں')}
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
