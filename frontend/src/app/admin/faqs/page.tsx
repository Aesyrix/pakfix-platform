'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
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
import type { AdminFaq } from '@/lib/api/types';

const GROUPS = ['general', 'safety', 'payments', 'service', 'professionals', 'city'] as const;

/** Questions shown on the homepage, /faq, service pages and city pages. */
export default function AdminFaqsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  const query = useQuery({ queryKey: ['admin-faqs'], queryFn: adminApi.faqs, staleTime: 30_000 });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });

  const create = useMutation({
    mutationFn: (input: { question: string; answer: string; group: string }) => adminApi.createFaq(input),
    onSuccess: (response) => {
      toast.success(response.message);
      setCreating(false);
      void refresh();
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Could not add the FAQ.'),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deleteFaq(id),
    onSuccess: () => {
      toast.success('FAQ deleted.');
      void refresh();
    },
    onError: () => toast.error('Could not delete that FAQ.'),
  });

  return (
    <>
      <AdminPageHeader
        title="FAQs"
        description="A FAQ with no service and no city shows on the homepage and the FAQ page. Attach a service or city to move it to that page."
        action={
          <Button onClick={() => setCreating((open) => !open)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a FAQ
          </Button>
        }
      />

      {creating ? (
        <Card className="mb-6">
          <CardBody>
            <form
              className="flex flex-col gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                create.mutate({
                  question: String(form.get('question') ?? ''),
                  answer: String(form.get('answer') ?? ''),
                  group: String(form.get('group') ?? 'general'),
                });
              }}
            >
              <Input name="question" label="Question" required minLength={5} />
              <Textarea name="answer" label="Answer" rows={3} required minLength={5} />
              <Select name="group" label="Where it appears" defaultValue="general">
                {GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </Select>
              <div className="flex gap-2">
                <Button type="submit" loading={create.isPending}>
                  Add FAQ
                </Button>
                <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}

      {query.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : query.isError || !query.data ? (
        <ErrorState description="The FAQs could not be loaded." onRetry={() => query.refetch()} />
      ) : query.data.length === 0 ? (
        <EmptyState title="No FAQs yet" description="Add the questions customers ask most often." />
      ) : (
        <ul className="flex flex-col gap-3">
          {query.data.map((faq) => (
            <li key={faq.id}>
              <FaqRow faq={faq} onDeleted={() => remove.mutate(faq.id)} deleting={remove.isPending} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FaqRow({ faq, onDeleted, deleting }: { faq: AdminFaq; onDeleted: () => void; deleting: boolean }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const [open, setOpen] = useState(false);

  const save = useMutation({
    mutationFn: (input: Record<string, unknown>) => adminApi.updateFaq(faq.id, input),
    onSuccess: (response) => {
      toast.success(response.message);
      void queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Could not save.'),
  });

  const dirty = question !== faq.question || answer !== faq.answer;

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <button type="button" onClick={() => setOpen((value) => !value)} className="text-left font-medium hover:text-[#15803D]">
            {faq.question}
          </button>
          <div className="flex shrink-0 items-center gap-2">
            <Badge tone="neutral">{faq.group}</Badge>
            {faq.service_category ? <Badge tone="brand">{faq.service_category.name}</Badge> : null}
            {faq.city ? <Badge tone="accent">{faq.city.name}</Badge> : null}
            <Badge tone={faq.is_active ? 'safe' : 'warn'}>{faq.is_active ? 'Live' : 'Hidden'}</Badge>
          </div>
        </div>

        {open ? (
          <>
            <Input label="Question" value={question} onChange={(event) => setQuestion(event.target.value)} />
            <Textarea label="Answer" rows={3} value={answer} onChange={(event) => setAnswer(event.target.value)} />

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => save.mutate({ question, answer })} loading={save.isPending} disabled={!dirty}>
                Save
              </Button>
              <Button variant="secondary" onClick={() => save.mutate({ is_active: !faq.is_active })} loading={save.isPending}>
                {faq.is_active ? 'Hide from the site' : 'Show on the site'}
              </Button>
              <Button variant="ghost" className="text-danger-600" onClick={onDeleted} loading={deleting}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          </>
        ) : (
          <p className="line-clamp-2 text-sm text-ink-600">{faq.answer}</p>
        )}
      </CardBody>
    </Card>
  );
}
