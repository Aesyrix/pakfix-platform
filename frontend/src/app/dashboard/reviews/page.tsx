'use client';

import { Star, Pencil, MessageSquareQuote } from 'lucide-react';
import { PageHeader, SectionTitle } from '@/components/dashboard/DashboardPage';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

interface Review {
  id: string;
  customer: string;
  customerUr: string;
  stars: number;
  service: string;
  serviceUr: string;
  date: string;
  quote: string;
  quoteUr: string;
}

const BREAKDOWN: { stars: number; count: number }[] = [
  { stars: 5, count: 9 },
  { stars: 4, count: 2 },
  { stars: 3, count: 1 },
  { stars: 2, count: 0 },
  { stars: 1, count: 0 },
];

const REVIEWS: Review[] = [
  {
    id: 'RV-501',
    customer: 'Muhammad Usman',
    customerUr: 'محمد عثمان',
    stars: 5,
    service: 'AC Jet Servicing',
    serviceUr: 'اے سی جیٹ سروسنگ',
    date: '10 Oct 2026',
    quote: 'Arrived on time, explained the fault clearly and left the room spotless.',
    quoteUr: 'وقت پر پہنچے، خرابی واضح طور پر بتائی اور کمرہ بالکل صاف چھوڑا۔',
  },
  {
    id: 'RV-498',
    customer: 'Ayesha Farooq',
    customerUr: 'عائشہ فاروق',
    stars: 5,
    service: 'Deep House Cleaning',
    serviceUr: 'گہری گھریلو صفائی',
    date: '04 Oct 2026',
    quote: 'The team was polite and thorough. Great value for the price.',
    quoteUr: 'ٹیم خوش اخلاق اور مکمل تھی۔ قیمت کے لحاظ سے بہترین۔',
  },
  {
    id: 'RV-492',
    customer: 'Tariq Mahmood',
    customerUr: 'طارق محمود',
    stars: 4,
    service: 'DB Breaker Repair',
    serviceUr: 'ڈی بی بریکر مرمت',
    date: '28 Sep 2026',
    quote: 'Fixed the tripping issue quickly. Slightly late but kept me informed.',
    quoteUr: 'ٹرپنگ کا مسئلہ جلدی ٹھیک کر دیا۔ تھوڑی دیر ہوئی مگر اطلاع دیتے رہے۔',
  },
  {
    id: 'RV-487',
    customer: 'Bilal Ahmed',
    customerUr: 'بلال احمد',
    stars: 3,
    service: 'Bathroom Plumbing',
    serviceUr: 'باتھ روم پلمبنگ',
    date: '21 Sep 2026',
    quote: 'Job was done, but a follow-up visit was needed to stop a small drip.',
    quoteUr: 'کام ہو گیا، مگر چھوٹی ٹپک روکنے کے لیے دوبارہ وزٹ کی ضرورت پڑی۔',
  },
];

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={
            n <= value
              ? 'h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]'
              : 'h-3.5 w-3.5 text-ink-300'
          }
        />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const t = useT();
  const total = 12;

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Feedback"
        eyebrowUr="رائے"
        title="Reviews"
        titleUr="جائزے"
        description="See what customers said and manage your own feedback."
        descriptionUr="دیکھیں گاہکوں نے کیا کہا اور اپنی رائے کا انتظام کریں۔"
      />

      <Card className="mb-8">
        <CardBody className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="text-center sm:border-r sm:border-[var(--border)] sm:pr-8">
            <p className="text-5xl font-extrabold tracking-tight text-foreground">4.8</p>
            <div className="mt-2 flex justify-center">
              <Stars value={5} />
            </div>
            <p className="mt-1 text-xs text-ink-500">{t(`Based on ${total} reviews`, `${total} جائزوں کی بنیاد پر`)}</p>
          </div>

          <div className="space-y-2">
            {BREAKDOWN.map((row) => {
              const percent = Math.round((row.count / total) * 100);
              return (
                <div key={row.stars} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 text-xs font-semibold text-ink-500">
                    {t(`${row.stars} star`, `${row.stars} ستارہ`)}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <span
                      className="block h-full rounded-full bg-[#00824A]"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <span className="w-8 shrink-0 text-right text-xs font-medium text-ink-500">{row.count}</span>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <SectionTitle urdu="حالیہ جائزے" className="mb-4">
        Recent reviews
      </SectionTitle>

      <div className="space-y-4">
        {REVIEWS.map((review) => (
          <Card key={review.id}>
            <CardHeader className="flex-row items-start justify-between gap-4 pb-0">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7] text-sm font-bold text-[#15803D]">
                  {review.customer
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{t(review.customer, review.customerUr)}</h3>
                  <p className="text-xs text-ink-500">
                    {t(review.service, review.serviceUr)} &bull; {review.date}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" type="button">
                <Pencil className="h-4 w-4" />
                {t('Edit', 'ترمیم')}
              </Button>
            </CardHeader>
            <CardBody className="pt-3">
              <Stars value={review.stars} />
              <p className="mt-2 flex items-start gap-2 text-sm text-ink-600">
                <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                {t(review.quote, review.quoteUr)}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </Container>
  );
}
