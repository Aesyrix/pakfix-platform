'use client';

import { Star, MapPin, Bookmark } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/DashboardPage';
import { Badge, VerifiedBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

interface SavedPro {
  initials: string;
  name: string;
  nameUr: string;
  trade: string;
  tradeUr: string;
  city: string;
  cityUr: string;
  rating: string;
  jobs: number;
  verified: boolean;
}

const SAVED_PROFESSIONALS: SavedPro[] = [
  {
    initials: 'MU',
    name: 'Muhammad Usman',
    nameUr: 'محمد عثمان',
    trade: 'AC & Refrigeration Technician',
    tradeUr: 'اے سی اور ریفریجریشن ٹیکنیشن',
    city: 'Lahore',
    cityUr: 'لاہور',
    rating: '4.9',
    jobs: 142,
    verified: true,
  },
  {
    initials: 'TM',
    name: 'Tariq Mahmood',
    nameUr: 'طارق محمود',
    trade: 'Master Electrician',
    tradeUr: 'ماسٹر الیکٹریشن',
    city: 'Lahore',
    cityUr: 'لاہور',
    rating: '4.95',
    jobs: 210,
    verified: true,
  },
  {
    initials: 'AF',
    name: 'Ayesha Farooq',
    nameUr: 'عائشہ فاروق',
    trade: 'Deep Cleaning Specialist',
    tradeUr: 'گہری صفائی کی ماہر',
    city: 'Karachi',
    cityUr: 'کراچی',
    rating: '4.8',
    jobs: 96,
    verified: true,
  },
  {
    initials: 'BA',
    name: 'Bilal Ahmed',
    nameUr: 'بلال احمد',
    trade: 'Plumber & Leakage Expert',
    tradeUr: 'پلمبر اور لیکیج ماہر',
    city: 'Islamabad',
    cityUr: 'اسلام آباد',
    rating: '4.7',
    jobs: 78,
    verified: false,
  },
  {
    initials: 'SK',
    name: 'Sana Khalid',
    nameUr: 'ثقنا خالد',
    trade: 'Painter & Wall Finisher',
    tradeUr: 'پینٹر اور وال فنشر',
    city: 'Karachi',
    cityUr: 'کراچی',
    rating: '4.85',
    jobs: 64,
    verified: true,
  },
  {
    initials: 'HR',
    name: 'Hamza Raza',
    nameUr: 'حمزہ رضا',
    trade: 'Carpenter & Furniture Repair',
    tradeUr: 'بڑھئی اور فرنیچر مرمت',
    city: 'Islamabad',
    cityUr: 'اسلام آباد',
    rating: '4.6',
    jobs: 51,
    verified: false,
  },
];

export default function SavedProfessionalsPage() {
  const t = useT();

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Bookmarks"
        eyebrowUr="بک مارکس"
        title="Saved professionals"
        titleUr="محفوظ پروفیشنلز"
        description="Your trusted pros, ready to book again in a tap."
        descriptionUr="آپ کے قابلِ اعتماد پروفیشنلز، ایک ٹیپ میں دوبارہ بکنگ کے لیے تیار۔"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAVED_PROFESSIONALS.map((pro) => (
          <Card key={pro.name} interactive>
            <CardBody className="flex h-full flex-col gap-4 p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#00824A] to-[#2563EB] text-base font-bold text-white shadow-xs">
                  {pro.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-bold text-foreground">{t(pro.name, pro.nameUr)}</h3>
                    {pro.verified ? <VerifiedBadge showText={false} /> : null}
                  </div>
                  <p className="truncate text-xs text-ink-500">{t(pro.trade, pro.tradeUr)}</p>
                </div>
                <Bookmark className="h-4 w-4 shrink-0 text-[#00824A]" />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-ink-400" />
                  {t(pro.city, pro.cityUr)}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  {pro.rating}
                </span>
                <Badge tone="safe">{t(`${pro.jobs} jobs`, `${pro.jobs} جابز`)}</Badge>
              </div>

              <div className="mt-auto pt-2">
                <Button variant="outline" size="sm" block type="button">
                  {t('Book again', 'دوبارہ بک کریں')}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </Container>
  );
}
