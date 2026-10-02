'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
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
import type { AdminServiceCategory } from '@/lib/api/types';

/**
 * The service catalogue.
 *
 * Categories are switched off rather than deleted: bookings and reviews point
 * at them, and a job history that says "unknown service" helps nobody.
 */
export default function AdminServicesPage() {
  const [editing, setEditing] = useState<string | null>(null);
  const query = useQuery({ queryKey: ['admin-categories'], queryFn: adminApi.categories, staleTime: 60_000 });

  return (
    <>
      <AdminPageHeader
        title="Services"
        description="Names, descriptions, typical prices and the trade name used in local pages such as /plumber/lahore."
      />

      {query.isPending ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : query.isError || !query.data ? (
        <ErrorState description="Services could not be loaded." onRetry={() => query.refetch()} />
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
                        {category.trade_slug ? ` · local pages as /${category.trade_slug}/<city>` : ' · no local pages'}
                        {category.typical_min_rupees
                          ? ` · Rs ${category.typical_min_rupees.toLocaleString()}–${(category.typical_max_rupees ?? category.typical_min_rupees).toLocaleString()}`
                          : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {category.is_popular ? <Badge tone="brand">Popular</Badge> : null}
                      {category.is_emergency ? <Badge tone="danger">Emergency</Badge> : null}
                      <Badge tone={category.is_active ? 'safe' : 'warn'}>{category.is_active ? 'Live' : 'Off'}</Badge>
                      <a
                        href={`/services/${category.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink-400 hover:text-[#00824A]"
                        aria-label={`View ${category.name}`}
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
        toast.error('Check the highlighted fields.');

        return;
      }

      toast.error(error instanceof ApiError ? error.message : 'Could not save.');
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
        <h2 className="font-semibold">Editing {category.name}</h2>

        <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} />
        <Textarea label="Description" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Trade name"
            value={tradeName}
            onChange={(event) => setTradeName(event.target.value)}
            hint="What people call this professional, e.g. Plumber."
            error={errors.trade_name}
          />
          <Input
            label="Local page slug"
            value={tradeSlug}
            onChange={(event) => setTradeSlug(event.target.value)}
            hint="Used as /<slug>/<city>. Leave blank for no local pages."
            error={errors.trade_slug}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Typical price from (PKR)"
            type="number"
            inputMode="numeric"
            value={minRupees}
            onChange={(event) => setMinRupees(event.target.value)}
            error={errors.typical_min_rupees}
          />
          <Input
            label="Typical price to (PKR)"
            type="number"
            inputMode="numeric"
            value={maxRupees}
            onChange={(event) => setMaxRupees(event.target.value)}
            error={errors.typical_max_rupees}
          />
        </div>

        <Textarea
          label="Common problems"
          rows={6}
          value={problems}
          onChange={(event) => setProblems(event.target.value)}
          hint="One per line. These appear on the service page and the local pages."
          error={errors.common_problems}
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => save.mutate()} loading={save.isPending}>
            Save service
          </Button>
          <Button variant="secondary" onClick={() => toggle.mutate({ is_popular: !category.is_popular })} loading={toggle.isPending}>
            {category.is_popular ? 'Remove from homepage' : 'Show on homepage'}
          </Button>
          <Button variant="secondary" onClick={() => toggle.mutate({ is_active: !category.is_active })} loading={toggle.isPending}>
            {category.is_active ? 'Switch off' : 'Switch on'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
