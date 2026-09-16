import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CategoryIcon } from '@/components/marketing/CategoryIcon';
import type { ServiceCategory } from '@/lib/api/types';

/**
 * The service grid. Rendered entirely from the API, so adding a category in
 * the admin dashboard puts it on the homepage without a code change.
 */
export function ServiceCategoryGrid({
  categories,
  limit,
}: {
  categories: ServiceCategory[];
  limit?: number;
}) {
  if (categories.length === 0) {
    return (
      <EmptyState
        title="Services are being updated"
        description="Our service list is not available right now. Please try again shortly."
      />
    );
  }

  const shown = limit ? categories.slice(0, limit) : categories;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {shown.map((category) => (
        <li key={category.id}>
          <Link href={`/services/${category.slug}`} className="block h-full">
            <Card
              interactive
              className="flex h-full flex-col gap-3 p-4 focus-within:ring-2 focus-within:ring-brand-500"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-control)] bg-brand-50 text-brand-700">
                <CategoryIcon name={category.icon} className="h-5 w-5" />
              </span>

              <div className="flex-1">
                <h3 className="text-sm font-semibold leading-snug">{category.name}</h3>
                {category.typical_price ? (
                  <p className="mt-1 text-xs text-ink-500">{category.typical_price.display}</p>
                ) : null}
              </div>

              {category.is_emergency ? (
                <Badge tone="danger" className="self-start">
                  Emergency
                </Badge>
              ) : null}
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
