'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Lock, Plus } from 'lucide-react';
import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminShell';
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
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Could not create the page.'),
  });

  return (
    <>
      <AdminPageHeader
        title="Pages"
        description="Written in Markdown. Legal pages can be edited but not deleted or taken offline."
        action={
          <Button onClick={() => { setCreating(true); setSelectedId(null); }}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            New page
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div>
          {list.isPending ? (
            <SkeletonCard />
          ) : list.isError || !list.data ? (
            <ErrorState description="Pages could not be loaded." onRetry={() => list.refetch()} />
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
                    {page.is_system ? <Lock className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-label="System page" /> : null}
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
                <h2 className="mb-4 font-semibold">New page</h2>
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
                  <Input name="title" label="Title" required minLength={2} />
                  <Textarea name="body" label="Content (Markdown)" rows={12} />
                  <div className="flex gap-2">
                    <Button type="submit" loading={create.isPending}>
                      Create page
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
                      Cancel
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
                <p className="text-sm text-ink-600">Choose a page on the left to edit it.</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function PageEditor({ page }: { page: AdminPage }) {
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
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Could not save.'),
  });

  const publicPath = page.is_system ? `/${page.slug}` : `/pages/${page.slug}`;

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Editing {page.title}</h2>
            {page.is_system ? <Badge tone="neutral">System page</Badge> : null}
            <Badge tone={page.is_published ? 'safe' : 'warn'}>{page.is_published ? 'Live' : 'Draft'}</Badge>
          </div>
          <a
            href={publicPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#00824A] hover:text-[#15803D]"
          >
            View page
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Textarea
          label="Content (Markdown)"
          rows={18}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          hint="Markdown only. HTML is stripped before the page is shown."
        />
        <Input label="Search engine title" value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} />
        <Textarea
          label="Search engine description"
          rows={2}
          value={seoDescription}
          onChange={(event) => setSeoDescription(event.target.value)}
        />

        <div className="flex items-center gap-3">
          <Button onClick={() => save.mutate()} loading={save.isPending}>
            Save page
          </Button>
          {page.updated_at ? (
            <span className="text-xs text-ink-500">
              Last saved {new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(page.updated_at))}
            </span>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}
