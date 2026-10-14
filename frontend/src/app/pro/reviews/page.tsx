'use client';

import { MessageSquare, ShieldCheck, Star, ThumbsUp } from 'lucide-react';
import { PageHeader, SectionTitle, StatTile } from '@/components/dashboard/DashboardPage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

interface StarBreakdown {
  stars: number;
  count: number;
}

interface Review {
  id: string;
  name: string;
  nameUr: string;
  initials: string;
  stars: number;
  service: string;
  serviceUr: string;
  date: string;
  dateUr: string;
  quote: string;
  quoteUr: string;
}

const BREAKDOWN: StarBreakdown[] = [
  { stars: 5, count: 128 },
  { stars: 4, count: 11 },
  { stars: 3, count: 2 },
  { stars: 2, count: 1 },
  { stars: 1, count: 0 },
];

const REVIEWS: Review[] = [
  {
    id: 'RV-501',
    name: 'Hamza Ahmed',
    nameUr: 'حمزہ احمد',
    initials: 'HA',
    stars: 5,
    service: 'AC Inverter Cooling Repair',
    serviceUr: 'اے سی اِنورٹر کولنگ مرمت',
    date: '11 Oct 2026',
    dateUr: '11 اکتوبر 2026',
    quote: 'Arrived on time, found the fault in minutes and left the room spotless. Highly recommended.',
    quoteUr: 'وقت پر پہنچے، منٹوں میں خرابی ڈھونڈی اور کمرہ بالکل صاف چھوڑا۔ بہت قابلِ سفارش ہیں۔',
  },
  {
    id: 'RV-502',
    name: 'Ayesha Khan',
    nameUr: 'عائشہ خان',
    initials: 'AK',
    stars: 5,
    service: 'Main DB Breaker Replacement',
    serviceUr: 'مین ڈی بی بریکر کی تبدیلی',
    date: '09 Oct 2026',
    dateUr: '9 اکتوبر 2026',
    quote: 'Explained the problem clearly and charged exactly the quoted price. Very professional work.',
    quoteUr: 'مسئلہ صاف الفاظ میں سمجھایا اور بالکل بتائی گئی قیمت لی۔ انتہائی پیشہ ورانہ کام۔',
  },
  {
    id: 'RV-503',
    name: 'Bilal Sheikh',
    nameUr: 'بلال شیخ',
    initials: 'BS',
    stars: 4,
    service: 'Water Motor Repair',
    serviceUr: 'واٹر موٹر مرمت',
    date: '05 Oct 2026',
    dateUr: '5 اکتوبر 2026',
    quote: 'Good repair and the motor runs quietly now. Took a little longer than promised.',
    quoteUr: 'اچھی مرمت کی اور موٹر اب خاموش چلتی ہے۔ وعدے سے تھوڑا زیادہ وقت لگا۔',
  },
  {
    id: 'RV-504',
    name: 'Fatima Noor',
    nameUr: 'فاطمہ نور',
    initials: 'FN',
    stars: 5,
    service: 'Kitchen Sink Leak Repair',
    serviceUr: 'کچن سنک لیک کی مرمت',
    date: '02 Oct 2026',
    dateUr: '2 اکتوبر 2026',
    quote: 'Very polite and answered every question. The leak has not returned since.',
    quoteUr: 'بہت خوش اخلاق اور ہر سوال کا جواب دیا۔ اب تک لیک دوبارہ نہیں ہوئی۔',
  },
];

const TOTAL = BREAKDOWN.reduce((sum, row) => sum + row.count, 0);

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={index < value ? 'h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]' : 'h-3.5 w-3.5 text-ink-300'}
        />
      ))}
    </span>
  );
}

/**
 * Reputation in one screen. Phase 1: sample reviews until the review
 * endpoints land.
 */
export default function ProReviewsPage() {
  const t = useT();

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Reputation"
        eyebrowUr="ساکھ"
        title="Reviews"
        titleUr="جائزے"
        description="What customers say about your work, and how you reply."
        descriptionUr="گاہک آپ کے کام کے بارے میں کیا کہتے ہیں، اور آپ کیسے جواب دیتے ہیں۔"
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardBody className="space-y-5 p-6">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-4xl font-extrabold text-foreground">4.92</p>
                <Stars value={5} />
                <p className="mt-1 text-xs text-ink-500">{t('142 reviews', '142 جائزے')}</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {BREAKDOWN.map((row) => (
                  <div key={row.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-3 font-bold text-ink-500">{row.stars}</span>
                    <Star className="h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-[#00824A]"
                        style={{ width: `${TOTAL > 0 ? (row.count / TOTAL) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-ink-500">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-4">
              <StatTile
                icon={<Star className="h-4 w-4" />}
                label="Rating"
                labelUr="ریٹنگ"
                value="4.92"
                tone="warn"
              />
              <StatTile
                icon={<ThumbsUp className="h-4 w-4" />}
                label="Reviews"
                labelUr="جائزے"
                value="142"
                tone="brand"
              />
              <StatTile
                icon={<ShieldCheck className="h-4 w-4" />}
                label="Acceptance"
                labelUr="قبولیت"
                value="98%"
                tone="info"
              />
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4 lg:col-span-7">
          <SectionTitle urdu="تازہ ترین جائزے">Latest reviews</SectionTitle>

          {REVIEWS.map((review) => (
            <Card key={review.id}>
              <CardBody className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#00824A] to-[#2563EB] text-xs font-bold text-white">
                      {review.initials}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">{t(review.name, review.nameUr)}</p>
                      <p className="text-xs text-ink-500">{t(review.service, review.serviceUr)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Stars value={review.stars} />
                    <p className="mt-0.5 text-[11px] text-ink-400">{t(review.date, review.dateUr)}</p>
                  </div>
                </div>

                <p className="text-sm italic text-ink-700">{t(`“${review.quote}”`, `”${review.quoteUr}“`)}</p>

                <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                  <Badge tone="brand">{t('Completed job', 'مکمل کام')}</Badge>
                  <Button variant="ghost" size="sm" className="text-[#00824A]">
                    <MessageSquare className="h-4 w-4" />
                    {t('Reply', 'جواب دیں')}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </Container>
  );
}
