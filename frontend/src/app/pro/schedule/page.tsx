'use client';

import { CalendarDays, Clock, MapPin, Plus } from 'lucide-react';
import { PageHeader, SectionTitle } from '@/components/dashboard/DashboardPage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

interface Appointment {
  time: string;
  customer: string;
  customerUr: string;
  service: string;
  serviceUr: string;
  city: string;
  cityUr: string;
}

interface Day {
  key: string;
  label: string;
  labelUr: string;
  date: string;
  appointments: Appointment[];
}

const WEEK: Day[] = [
  {
    key: 'mon',
    label: 'Monday',
    labelUr: 'پیر',
    date: '12 Oct',
    appointments: [
      {
        time: '9:00 AM',
        customer: 'Ayesha Khan',
        customerUr: 'عائشہ خان',
        service: 'AC Servicing',
        serviceUr: 'اے سی سروسنگ',
        city: 'Lahore',
        cityUr: 'لاہور',
      },
      {
        time: '4:30 PM',
        customer: 'Tariq Mehmood',
        customerUr: 'طارق محمود',
        service: 'Electrical Wiring',
        serviceUr: 'بجلی کی وائرنگ',
        city: 'Lahore',
        cityUr: 'لاہور',
      },
    ],
  },
  {
    key: 'tue',
    label: 'Tuesday',
    labelUr: 'منگل',
    date: '13 Oct',
    appointments: [
      {
        time: '11:00 AM',
        customer: 'Bilal Sheikh',
        customerUr: 'بلال شیخ',
        service: 'Water Motor Repair',
        serviceUr: 'واٹر موٹر مرمت',
        city: 'Islamabad',
        cityUr: 'اسلام آباد',
      },
    ],
  },
  {
    key: 'wed',
    label: 'Wednesday',
    labelUr: 'بدھ',
    date: '14 Oct',
    appointments: [
      {
        time: '10:00 AM',
        customer: 'Fatima Noor',
        customerUr: 'فاطمہ نور',
        service: 'Sink Leak Repair',
        serviceUr: 'سنک لیک کی مرمت',
        city: 'Karachi',
        cityUr: 'کراچی',
      },
      {
        time: '2:00 PM',
        customer: 'Usman Malik',
        customerUr: 'عثمان ملک',
        service: 'Ceiling Fan Fitting',
        serviceUr: 'چھت کے پنکھے کی فٹنگ',
        city: 'Lahore',
        cityUr: 'لاہور',
      },
    ],
  },
  {
    key: 'thu',
    label: 'Thursday',
    labelUr: 'جمعرات',
    date: '15 Oct',
    appointments: [
      {
        time: '12:30 PM',
        customer: 'Sana Iqbal',
        customerUr: 'ثنا اقبال',
        service: 'Geyser Installation',
        serviceUr: 'گیزر کی تنصیب',
        city: 'Islamabad',
        cityUr: 'اسلام آباد',
      },
    ],
  },
  {
    key: 'fri',
    label: 'Friday',
    labelUr: 'جمعہ',
    date: '16 Oct',
    appointments: [
      {
        time: '9:30 AM',
        customer: 'Danish Raza',
        customerUr: 'دانش رضا',
        service: 'DB Box Upgrade',
        serviceUr: 'ڈی بی باکس اپ گریڈ',
        city: 'Karachi',
        cityUr: 'کراچی',
      },
    ],
  },
  {
    key: 'sat',
    label: 'Saturday',
    labelUr: 'ہفتہ',
    date: '17 Oct',
    appointments: [
      {
        time: '3:00 PM',
        customer: 'Hina Aslam',
        customerUr: 'حنا اسلم',
        service: 'AC Gas Refill',
        serviceUr: 'اے سی گیس ری فل',
        city: 'Lahore',
        cityUr: 'لاہور',
      },
    ],
  },
  {
    key: 'sun',
    label: 'Sunday',
    labelUr: 'اتوار',
    date: '18 Oct',
    appointments: [],
  },
];

/**
 * The working week at a glance. Phase 1: sample appointments until the
 * scheduling endpoints land.
 */
export default function ProSchedulePage() {
  const t = useT();

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Work"
        eyebrowUr="کام"
        title="Schedule"
        titleUr="شیڈول"
        description="Your appointments for the week, day by day."
        descriptionUr="ہفتے کے لیے آپ کے اپائنٹمنٹس، دن بہ دن۔"
        action={
          <Button variant="secondary" size="sm">
            <CalendarDays className="h-4 w-4" />
            {t('Set availability', 'دستیابی مقرر کریں')}
          </Button>
        }
      />

      <div className="mb-3 flex items-center justify-between">
        <SectionTitle urdu="اس ہفتے">This week</SectionTitle>
        <Button variant="ghost" size="sm" className="text-[#00824A]">
          <Plus className="h-4 w-4" />
          {t('Add job', 'کام شامل کریں')}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {WEEK.map((day) => (
          <div key={day.key} className="flex flex-col gap-2">
            <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-surface-muted/60 px-3 py-2">
              <p className="text-xs font-extrabold text-foreground">{t(day.label, day.labelUr)}</p>
              <p className="text-[11px] text-ink-500">{day.date}</p>
            </div>

            {day.appointments.length === 0 ? (
              <div className="flex min-h-24 items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--border)] px-3 py-4 text-center text-[11px] text-ink-400">
                {t('No appointments', 'کوئی اپائنٹمنٹ نہیں')}
              </div>
            ) : (
              day.appointments.map((appointment) => (
                <Card key={`${day.key}-${appointment.time}`} interactive>
                  <CardBody className="space-y-2 p-3">
                    <Badge tone="brand" className="text-[10px]">
                      <Clock className="h-3 w-3" />
                      {appointment.time}
                    </Badge>
                    <p className="text-xs font-bold text-foreground">
                      {t(appointment.service, appointment.serviceUr)}
                    </p>
                    <p className="text-[11px] text-ink-600">{t(appointment.customer, appointment.customerUr)}</p>
                    <p className="inline-flex items-center gap-1 text-[11px] text-ink-400">
                      <MapPin className="h-3 w-3" />
                      {t(appointment.city, appointment.cityUr)}
                    </p>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        ))}
      </div>
    </Container>
  );
}
