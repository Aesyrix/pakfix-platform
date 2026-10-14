'use client';

import { CalendarCheck, Clock, MapPin, MessageSquare, Phone, UserCheck, Wrench, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Badge, VerifiedBadge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

interface TrackingStep {
  title: string;
  timestamp: string;
  completed: boolean;
  active: boolean;
  description: string;
}

const SAMPLE_BOOKINGS = [
  {
    id: 'BK-9842',
    service: 'AC Inverter Jet Servicing & Gas Check',
    category: 'HVAC & Cooling',
    city: 'Lahore (Gulberg III)',
    date: 'Today, 2:30 PM',
    status: 'on_the_way',
    statusLabel: 'Technician On The Way',
    technician: {
      name: 'Muhammad Usman',
      phone: '+92 300 9876543',
      rating: '4.9',
      jobs: '142',
      eta: '18 mins',
      avatar: 'MU',
    },
    totalPkr: '2,800',
    timeline: [
      { title: 'Booking Submitted', timestamp: '10:15 AM', completed: true, active: false, description: 'Customer requested AC service with photo diagnosis.' },
      { title: 'Quote Approved', timestamp: '10:30 AM', completed: true, active: false, description: 'Fixed price PKR 2,800 accepted by customer.' },
      { title: 'Technician Assigned', timestamp: '11:00 AM', completed: true, active: false, description: 'Usman (Verified Master Electrician) accepted job.' },
      { title: 'En Route to Location', timestamp: '02:10 PM', completed: true, active: true, description: 'Technician left Gulberg hub. ETA ~18 minutes.' },
      { title: 'Service In Progress', timestamp: 'Pending', completed: false, active: false, description: 'Physical diagnosis, pressure check & jet wash.' },
      { title: 'Job Completion & Warranty', timestamp: 'Pending', completed: false, active: false, description: '7-day PakFix repair guarantee activated.' },
    ],
  },
  {
    id: 'BK-8721',
    service: 'Main DB Breaker Box Repair',
    category: 'Electrical Work',
    city: 'Lahore (DHA Phase 5)',
    date: 'Yesterday, 4:00 PM',
    status: 'completed',
    statusLabel: 'Completed & Verified',
    technician: {
      name: 'Tariq Mahmood',
      phone: '+92 321 4567890',
      rating: '4.95',
      jobs: '210',
      eta: 'Completed',
      avatar: 'TM',
    },
    totalPkr: '3,500',
    timeline: [
      { title: 'Booking Submitted', timestamp: 'Yesterday 02:00 PM', completed: true, active: false, description: 'Breaker tripping issue reported.' },
      { title: 'Job Completed', timestamp: 'Yesterday 05:15 PM', completed: true, active: false, description: '30A Breaker replaced with Schneider original.' },
    ],
  },
];

/** Urdu for the sample booking copy; person and city names stay as written. */
const BOOKING_UR: Record<string, string> = {
  'AC Inverter Jet Servicing & Gas Check': 'اے سی انورٹر جیٹ سروسنگ اور گیس چیک',
  'HVAC & Cooling': 'HVAC اور کولنگ',
  'Technician On The Way': 'ٹیکنیشن راستے میں ہے',
  'Today, 2:30 PM': 'آج، 2:30 PM',
  'Booking Submitted': 'بکنگ جمع کرائی گئی',
  'Quote Approved': 'کوٹ منظور ہو گیا',
  'Technician Assigned': 'ٹیکنیشن مقرر ہوا',
  'En Route to Location': 'مقام کی طرف روانہ',
  'Service In Progress': 'سروس جاری ہے',
  'Job Completion & Warranty': 'کام کی تکمیل اور وارنٹی',
  'Customer requested AC service with photo diagnosis.': 'کسٹمر نے تصویری تشخیص کے ساتھ اے سی سروس کی درخواست کی۔',
  'Fixed price PKR 2,800 accepted by customer.': 'کسٹمر نے مقررہ قیمت PKR 2,800 قبول کی۔',
  'Usman (Verified Master Electrician) accepted job.': 'عثمان (تصدیق شدہ ماسٹر الیکٹریشن) نے کام قبول کیا۔',
  'Technician left Gulberg hub. ETA ~18 minutes.': 'ٹیکنیشن گلبرگ ہب سے روانہ ہو گیا۔ تخمینہ تقریباً 18 منٹ۔',
  'Physical diagnosis, pressure check & jet wash.': 'بنیادی تشخیص، پریشر چیک اور جیٹ واش۔',
  '7-day PakFix repair guarantee activated.': '7 دن کی پاک فکس مرمت گارنٹی فعال ہو گئی۔',
  'Pending': 'زیرِ التوا',
  'Main DB Breaker Box Repair': 'مین ڈی بی بریکر باکس کی مرمت',
  'Electrical Work': 'بجلی کا کام',
  'Completed & Verified': 'مکمل اور تصدیق شدہ',
  'Completed': 'مکمل',
  'Yesterday, 4:00 PM': 'کل، 4:00 PM',
  'Yesterday 02:00 PM': 'کل 02:00 PM',
  'Breaker tripping issue reported.': 'بریکر ٹرپ ہونے کا مسئلہ رپورٹ کیا گیا۔',
  'Job Completed': 'کام مکمل ہوا',
  'Yesterday 05:15 PM': 'کل 05:15 PM',
  '30A Breaker replaced with Schneider original.': '30A بریکر شنائیڈر اوریجنل سے تبدیل کیا گیا۔',
};

export default function BookingsDashboardPage() {
  const t = useT();
  const [selectedBooking, setSelectedBooking] = useState(SAMPLE_BOOKINGS[0]);

  return (
    <Container className="py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#00824A]">{t('My Service Portal', 'میرا سروس پورٹل')}</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            {t('Bookings & Live Tracking', 'بکنگ اور لائیو ٹریکنگ')}
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            {t('Track technician dispatch, view job history, and communicate in real time.', 'ٹیکنیشن کی روانگی ٹریک کریں، کام کی تاریخ دیکھیں اور حقیقی وقت میں رابطہ کریں۔')}
          </p>
        </div>

        <ButtonLink href="/ai" variant="primary" size="md">
          {t('+ Book New Repair', '+ نئی مرمت بک کریں')}
        </ButtonLink>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Booking List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-500">{t('Active & Recent Bookings', 'فعال اور حالیہ بکنگ')}</h2>

          {SAMPLE_BOOKINGS.map((booking) => {
            const isSelected = selectedBooking.id === booking.id;
            return (
              <Card
                key={booking.id}
                interactive
                onClick={() => setSelectedBooking(booking)}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'border-[#00824A] ring-2 ring-[#00824A]/20 bg-[#DCFCE7]/10' : ''
                }`}
              >
                <CardBody className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-ink-500">{booking.id}</span>
                    <Badge tone={booking.status === 'on_the_way' ? 'brand' : 'safe'}>
                      {t(booking.statusLabel, BOOKING_UR[booking.statusLabel])}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground text-sm">{t(booking.service, BOOKING_UR[booking.service])}</h3>
                    <p className="text-xs text-ink-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-ink-400" />
                      {booking.city}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
                    <span className="text-ink-600 font-medium">{t(booking.date, BOOKING_UR[booking.date])}</span>
                    <span className="font-extrabold text-[#00824A]">PKR {booking.totalPkr}</span>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Right Column: Live Tracking Timeline Detail */}
        <div className="lg:col-span-7">
          <Card className="shadow-lg">
            <CardHeader className="border-b border-[var(--border)] pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-mono text-ink-400">{t(`Order ID: ${selectedBooking.id}`, `آرڈر آئی ڈی: ${selectedBooking.id}`)}</span>
                  <CardTitle className="text-lg font-extrabold">{t(selectedBooking.service, BOOKING_UR[selectedBooking.service])}</CardTitle>
                </div>
                <Badge tone={selectedBooking.status === 'on_the_way' ? 'brand' : 'safe'}>
                  {t(selectedBooking.statusLabel, BOOKING_UR[selectedBooking.statusLabel])}
                </Badge>
              </div>
            </CardHeader>

            <CardBody className="p-6 space-y-6">
              {/* Technician Info Card */}
              <div className="rounded-2xl border border-[var(--border)] bg-surface-muted/60 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#00824A] to-[#2563EB] flex items-center justify-center text-white font-bold text-base shadow-xs">
                    {selectedBooking.technician.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground text-sm">{selectedBooking.technician.name}</p>
                      <VerifiedBadge showText={false} />
                    </div>
                    <p className="text-xs text-ink-500">
                      {t(
                        `★ ${selectedBooking.technician.rating} rating • ${selectedBooking.technician.jobs} jobs completed`,
                        `★ ${selectedBooking.technician.rating} ریٹنگ • ${selectedBooking.technician.jobs} جابز مکمل`
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedBooking.technician.phone}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#DCFCE7] px-3 text-xs font-bold text-[#15803D] hover:bg-[#BBF7D0]"
                  >
                    <Phone className="h-3.5 w-3.5" /> {t('Call', 'کال کریں')}
                  </a>
                  <Button variant="accent" size="sm" className="h-9 px-3 text-xs">
                    <MessageSquare className="h-3.5 w-3.5 mr-1" /> {t('Chat', 'چیٹ کریں')}
                  </Button>
                </div>
              </div>

              {/* Vertical Tracking Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-4">
                  {t('Job Execution Timeline', 'کام کی تکمیل کا ٹائم لائن')}
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-ink-200">
                  {selectedBooking.timeline.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      {/* Timeline Dot */}
                      <span
                        className={`absolute -left-6 top-1 h-5 w-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                          step.active
                            ? 'border-[#00824A] bg-[#00824A] text-white ring-4 ring-[#00824A]/20 animate-pulse'
                            : step.completed
                            ? 'border-[#00824A] bg-[#00824A] text-white'
                            : 'border-ink-300 bg-surface text-ink-400'
                        }`}
                      >
                        {step.completed ? '✓' : idx + 1}
                      </span>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-bold ${step.active ? 'text-[#00824A]' : 'text-foreground'}`}>
                            {t(step.title, BOOKING_UR[step.title])}
                          </p>
                          <span className="text-xs font-mono text-ink-400">{t(step.timestamp, BOOKING_UR[step.timestamp])}</span>
                        </div>
                        <p className="text-xs text-ink-500 mt-0.5">{t(step.description, BOOKING_UR[step.description])}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Guarantee Notice */}
              <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#15803D] font-semibold bg-[#DCFCE7] px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="h-4 w-4" /> {t('7-Day PakFix Quality Warranty Included', '7 دن کی پاک فکس معیاری وارنٹی شامل')}
                </div>
                <div className="text-right">
                  <span className="text-ink-500">{t('Agreed Price: ', 'طے شدہ قیمت: ')}</span>
                  <span className="font-extrabold text-[#00824A] text-sm">PKR {selectedBooking.totalPkr}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </Container>
  );
}
