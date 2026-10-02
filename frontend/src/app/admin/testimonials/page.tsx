'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminShell';
import { StarRating } from '@/components/marketing/Cards';
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

/**
 * Homepage testimonials.
 *
 * These are marketing quotes chosen by the team. They are deliberately
 * separate from reviews, which can only come from a customer whose booking
 * was completed and which nobody here can write.
 */
export default function AdminTestimonialsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  const query = useQuery({ queryKey: ['admin-testimonials'], queryFn: adminApi.testimonials, staleTime: 30_000 });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });

  const create = useMutation({
    mutationFn: (input: Record<string, unknown>) => adminApi.createTestimonial(input),
    onSuccess: (response) => {
      toast.success(response.message);
      setCreating(false);
      void refresh();
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : 'Could not add it.'),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: Record<string, unknown> }) => adminApi.updateTestimonial(id, input),
    onSuccess: (response) => {
      toast.success(response.message);
      void refresh();
    },
    onError: () => toast.error('Could not save.'),
  });

  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deleteTestimonial(id),
    onSuccess: () => {
      toast.success('Testimonial deleted.');
      void refresh();
    },
    onError: () => toast.error('Could not delete it.'),
  });

  return (
    <>
      <AdminPageHeader
        title="Testimonials"
        description="Quotes shown on the homepage. Use the customer's words, with their permission."
        action={
          <Button onClick={() => setCreating((open) => !open)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a testimonial
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
                  author_name: String(form.get('author_name') ?? ''),
                  author_location: String(form.get('author_location') ?? ''),
                  rating: Number(form.get('rating') ?? 5),
                  quote: String(form.get('quote') ?? ''),
                });
              }}
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <Input name="author_name" label="Name" required minLength={2} />
                <Input name="author_location" label="City" />
                <Select name="rating" label="Rating" defaultValue="5">
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} stars
                    </option>
                  ))}
                </Select>
              </div>
              <Textarea name="quote" label="Quote" rows={3} required minLength={10} />
              <div className="flex gap-2">
                <Button type="submit" loading={create.isPending}>
                  Add testimonial
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
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : query.isError || !query.data ? (
        <ErrorState description="Testimonials could not be loaded." onRetry={() => query.refetch()} />
      ) : query.data.length === 0 ? (
        <EmptyState title="No testimonials yet" description="Add a few real customer quotes for the homepage." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {query.data.map((testimonial) => (
            <li key={testimonial.id}>
              <Card className="h-full">
                <CardBody className="flex h-full flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <StarRating value={testimonial.rating} />
                    <Badge tone={testimonial.is_published ? 'safe' : 'warn'}>
                      {testimonial.is_published ? 'Live' : 'Hidden'}
                    </Badge>
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-ink-700">{testimonial.quote}</p>
                  <p className="text-sm font-medium">
                    {testimonial.author_name}
                    {testimonial.author_location ? <span className="text-ink-500"> · {testimonial.author_location}</span> : null}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={update.isPending}
                      onClick={() => update.mutate({ id: testimonial.id, input: { is_published: !testimonial.is_published } })}
                    >
                      {testimonial.is_published ? 'Hide' : 'Publish'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger-600"
                      loading={remove.isPending}
                      onClick={() => remove.mutate(testimonial.id)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Delete
                    </Button>
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
