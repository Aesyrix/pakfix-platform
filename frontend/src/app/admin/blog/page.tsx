'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminShell';
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
      toast.success('Guide deleted.');
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
    },
    onError: () => toast.error('Could not delete that guide.'),
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
        title="Guides"
        description="Articles on /blog. Publishing with a future date schedules it; it appears on its own when the time arrives."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Write a guide
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Select label="Show" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All guides</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </Select>
      </div>

      {list.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : list.isError || !list.data ? (
        <ErrorState description="Guides could not be loaded." onRetry={() => list.refetch()} />
      ) : list.data.data.length === 0 ? (
        <EmptyState title="No guides yet" description="Write the questions customers ask you most often." />
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
                      {post.blog_category_name ?? 'Uncategorised'}
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
                        className="text-ink-400 hover:text-[#16A34A]"
                        aria-label={`View ${post.title}`}
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
        toast.error('Check the highlighted fields.');

        return;
      }

      toast.error(error instanceof ApiError ? error.message : 'Could not save.');
    },
  });

  return (
    <>
      <AdminPageHeader
        title={post ? 'Edit guide' : 'Write a guide'}
        action={
          <div className="flex gap-2">
            {onDelete ? (
              <Button variant="ghost" className="text-danger-600" onClick={onDelete}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </Button>
            ) : null}
            <Button variant="secondary" onClick={onClose}>
              Back to list
            </Button>
          </div>
        }
      />

      <Card>
        <CardBody className="flex flex-col gap-4">
          <Input label="Title" value={form.title} onChange={(event) => set('title', event.target.value)} error={errors.title} required />

          <Textarea
            label="Article (Markdown)"
            rows={18}
            value={form.body}
            onChange={(event) => set('body', event.target.value)}
            error={errors.body}
            hint="Markdown only; HTML is stripped. Use ## for section headings."
            required
          />

          <Textarea
            label="Summary"
            rows={2}
            value={form.excerpt}
            onChange={(event) => set('excerpt', event.target.value)}
            hint="Shown on cards and in search results. Written for you if left blank."
            error={errors.excerpt}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Category" value={form.blog_category_slug} onChange={(event) => set('blog_category_slug', event.target.value)}>
              <option value="">No category</option>
              {options?.categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>

            <Select
              label="Related service"
              value={form.service_category_slug}
              onChange={(event) => set('service_category_slug', event.target.value)}
              hint="Adds a booking call to action at the end of the article."
            >
              <option value="">None</option>
              {options?.service_categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Tags"
            value={form.tags}
            onChange={(event) => set('tags', event.target.value)}
            hint="Separated by commas."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Search engine title" value={form.seo_title} onChange={(event) => set('seo_title', event.target.value)} />
            <Input label="Button label" value={form.cta_label} onChange={(event) => set('cta_label', event.target.value)} error={errors.cta_label} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Textarea
              label="Search engine description"
              rows={2}
              value={form.seo_description}
              onChange={(event) => set('seo_description', event.target.value)}
            />
            <Input
              label="Button link"
              value={form.cta_url}
              onChange={(event) => set('cta_url', event.target.value)}
              hint="A path such as /services/plumbing."
              error={errors.cta_url}
            />
          </div>

          <Select label="Status" value={form.status} onChange={(event) => set('status', event.target.value)} error={errors.status}>
            <option value="draft">Draft — only visible here</option>
            <option value="published">Published — live on the site</option>
          </Select>

          <div className="flex gap-2">
            <Button onClick={() => save.mutate()} loading={save.isPending}>
              {post ? 'Save guide' : 'Create guide'}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
