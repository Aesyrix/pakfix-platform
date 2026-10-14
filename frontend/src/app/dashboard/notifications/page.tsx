'use client';

import { useState } from 'react';
import {
  CalendarCheck,
  Truck,
  FileText,
  Wrench,
  Star,
  Bell,
} from 'lucide-react';
import { PageHeader, SectionTitle } from '@/components/dashboard/DashboardPage';
import { Card, CardBody, CardHeader, CardDescription } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Checkbox } from '@/components/ui/Input';
import { useT } from '@/components/i18n/LocaleProvider';

interface AppNotification {
  id: string;
  icon: 'booking' | 'on_way' | 'quote' | 'maintenance' | 'review';
  title: string;
  titleUr: string;
  description: string;
  descriptionUr: string;
  time: string;
  timeUr: string;
  unread: boolean;
}

const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NT-9001',
    icon: 'on_way',
    title: 'Technician on the way',
    titleUr: 'ٹیکنیشن راستے میں ہے',
    description: 'Muhammad Usman is heading to Gulberg III. ETA about 18 minutes.',
    descriptionUr: 'محمد عثمان گلبرگ III کی طرف آ رہے ہیں۔ تخمینہ تقریباً 18 منٹ۔',
    time: '2 min ago',
    timeUr: '2 منٹ پہلے',
    unread: true,
  },
  {
    id: 'NT-8998',
    icon: 'booking',
    title: 'Booking confirmed',
    titleUr: 'بکنگ کی تصدیق ہو گئی',
    description: 'Your AC servicing for today at 2:30 PM has been confirmed.',
    descriptionUr: 'آج 2:30 بجے اے سی سروسنگ کی تصدیق ہو گئی ہے۔',
    time: '1 hour ago',
    timeUr: '1 گھنٹہ پہلے',
    unread: true,
  },
  {
    id: 'NT-8990',
    icon: 'quote',
    title: 'New quote received',
    titleUr: 'نیا کوٹ موصول ہوا',
    description: 'Tariq Mahmood sent a quote of PKR 3,500 for the breaker repair.',
    descriptionUr: 'طارق محمود نے بریکر مرمت کے لیے PKR 3,500 کا کوٹ بھیجا۔',
    time: 'Yesterday',
    timeUr: 'کل',
    unread: false,
  },
  {
    id: 'NT-8981',
    icon: 'maintenance',
    title: 'Maintenance due',
    titleUr: 'دیکھ بھال واجب',
    description: 'Your water purifier filter is due for replacement this week.',
    descriptionUr: 'آپ کے واٹر پیوریفائر فلٹر کی تبدیلی اس ہفتے واجب ہے۔',
    time: '2 days ago',
    timeUr: '2 دن پہلے',
    unread: false,
  },
  {
    id: 'NT-8974',
    icon: 'review',
    title: 'How did we do?',
    titleUr: 'ہم نے کیسا کام کیا؟',
    description: 'Rate your recent deep cleaning job in Karachi.',
    descriptionUr: 'کراچی میں گہری صفائی کے حالیہ کام کا جائزہ دیں۔',
    time: '3 days ago',
    timeUr: '3 دن پہلے',
    unread: false,
  },
];

const ICONS = {
  booking: CalendarCheck,
  on_way: Truck,
  quote: FileText,
  maintenance: Wrench,
  review: Star,
} as const;

const ICON_TONE = {
  booking: 'bg-[#DCFCE7] text-[#15803D]',
  on_way: 'bg-[#DBEAFE] text-[#1E40AF]',
  quote: 'bg-[#E0F2FE] text-[#0369A1]',
  maintenance: 'bg-[#FEF3C7] text-[#B45309]',
  review: 'bg-[#F3E8FF] text-[#7E22CE]',
} as const;

export default function NotificationsPage() {
  const t = useT();
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [maintenanceReminders, setMaintenanceReminders] = useState(true);

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Activity"
        eyebrowUr="سرگرمی"
        title="Notifications"
        titleUr="اطلاعات"
        description="Booking updates, quotes and reminders, all in one feed."
        descriptionUr="بکنگ اپ ڈیٹس، کوٹس اور یاد دہانیاں، سب ایک جگہ۔"
      />

      <Card>
        <CardBody className="p-0">
          <ul>
            {NOTIFICATIONS.map((item) => {
              const Icon = ICONS[item.icon];
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-4 border-b border-[var(--border)] p-5 last:border-0"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${ICON_TONE[item.icon]}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">{t(item.title, item.titleUr)}</h3>
                      {item.unread ? (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#2563EB]" aria-label={t('Unread', 'غیر پڑھا')} />
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-sm text-ink-600">{t(item.description, item.descriptionUr)}</p>
                    <p className="mt-1 text-xs text-ink-400">{t(item.time, item.timeUr)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>

      <div className="mt-8">
        <SectionTitle urdu="اطلاعات کی ترجیحات" className="mb-4">
          Notification preferences
        </SectionTitle>

        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[#00824A]" />
              <h3 className="text-base font-semibold tracking-tight">{t('Choose what you get', 'منتخب کریں کہ آپ کو کیا ملے')}</h3>
            </div>
            <CardDescription>{t('You can change these at any time.', 'آپ انہیں کسی بھی وقت تبدیل کر سکتے ہیں۔')}</CardDescription>
          </CardHeader>
          <CardBody className="space-y-4">
            <Checkbox
              label={t('Booking updates', 'بکنگ اپ ڈیٹس')}
              checked={bookingUpdates}
              onChange={(event) => setBookingUpdates(event.target.checked)}
            />
            <Checkbox
              label={t('Promotions and discounts', 'پروموشنز اور رعایتیں')}
              checked={promotions}
              onChange={(event) => setPromotions(event.target.checked)}
            />
            <Checkbox
              label={t('Maintenance reminders', 'دیکھ بھال کی یاد دہانیاں')}
              checked={maintenanceReminders}
              onChange={(event) => setMaintenanceReminders(event.target.checked)}
            />
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}
