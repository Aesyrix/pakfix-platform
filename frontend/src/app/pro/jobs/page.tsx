'use client';

import { Briefcase, Clock, MapPin, Navigation, ShieldCheck, Zap } from 'lucide-react';
import { useState } from 'react';
import { PageHeader, SectionTitle, StatTile } from '@/components/dashboard/DashboardPage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';
import { cn } from '@/lib/utils/cn';

type Filter = 'all' | 'emergency' | 'nearby';
type Urgency = 'emergency' | 'urgent' | 'standard';

interface OpenJob {
  id: string;
  title: string;
  titleUr: string;
  customer: string;
  customerUr: string;
  area: string;
  areaUr: string;
  distanceKm: number;
  estimate: string;
  estimateUr: string;
  note: string;
  noteUr: string;
  urgency: Urgency;
  urgencyLabel: string;
  urgencyUr: string;
}

const OPEN_JOBS: OpenJob[] = [
  {
    id: 'JB-1042',
    title: 'AC Inverter Cooling Repair',
    titleUr: 'اے سی اِنورٹر کولنگ مرمت',
    customer: 'Hamza Ahmed',
    customerUr: 'حمزہ احمد',
    area: 'Gulberg III, Lahore',
    areaUr: 'گلبرگ III، لاہور',
    distanceKm: 1.2,
    estimate: 'PKR 2,800',
    estimateUr: '2,800 روپے',
    note: 'AC runs but the air is not cold. Needs an inspection.',
    noteUr: 'اے سی چل رہا ہے مگر ہوا ٹھنڈی نہیں۔ معائنہ درکار ہے۔',
    urgency: 'emergency',
    urgencyLabel: 'Emergency',
    urgencyUr: 'ہنگامی',
  },
  {
    id: 'JB-1043',
    title: 'Main DB Breaker Replacement',
    titleUr: 'مین ڈی بی بریکر کی تبدیلی',
    customer: 'Ayesha Khan',
    customerUr: 'عائشہ خان',
    area: 'DHA Phase 5, Lahore',
    areaUr: 'ڈی ایچ اے فیز 5، لاہور',
    distanceKm: 3.4,
    estimate: 'PKR 3,500',
    estimateUr: '3,500 روپے',
    note: 'Breaker trips whenever the water motor starts.',
    noteUr: 'واٹر موٹر شروع ہوتے ہی بریکر ٹرپ کر جاتا ہے۔',
    urgency: 'urgent',
    urgencyLabel: 'Urgent',
    urgencyUr: 'فوری',
  },
  {
    id: 'JB-1044',
    title: 'Water Motor and Tank Cleaning',
    titleUr: 'واٹر موٹر اور ٹینکی کی صفائی',
    customer: 'Bilal Sheikh',
    customerUr: 'بلال شیخ',
    area: 'F-11, Islamabad',
    areaUr: 'ایف 11، اسلام آباد',
    distanceKm: 5.1,
    estimate: 'PKR 4,200',
    estimateUr: '4,200 روپے',
    note: 'Tank has not been cleaned in a year. Motor is noisy.',
    noteUr: 'ٹینکی ایک سال سے صاف نہیں ہوئی۔ موٹر شور کر رہی ہے۔',
    urgency: 'standard',
    urgencyLabel: 'Standard',
    urgencyUr: 'معمول',
  },
  {
    id: 'JB-1045',
    title: 'Kitchen Sink Leak Repair',
    titleUr: 'کچن سنک لیک کی مرمت',
    customer: 'Fatima Noor',
    customerUr: 'فاطمہ نور',
    area: 'Clifton Block 2, Karachi',
    areaUr: 'کلفٹن بلاک 2، کراچی',
    distanceKm: 7.8,
    estimate: 'PKR 1,900',
    estimateUr: '1,900 روپے',
    note: 'Water is pooling under the sink since last night.',
    noteUr: 'گزشتہ رات سے سنک کے نیچے پانی جمع ہو رہا ہے۔',
    urgency: 'emergency',
    urgencyLabel: 'Emergency',
    urgencyUr: 'ہنگامی',
  },
  {
    id: 'JB-1046',
    title: 'Ceiling Fan Installation (3 units)',
    titleUr: 'چھت کے پنکھے کی تنصیب (3 عدد)',
    customer: 'Usman Malik',
    customerUr: 'عثمان ملک',
    area: 'Johar Town, Lahore',
    areaUr: 'جوہر ٹاؤن، لاہور',
    distanceKm: 2.6,
    estimate: 'PKR 2,400',
    estimateUr: '2,400 روپے',
    note: 'Three new fans delivered. Need wiring and mounting.',
    noteUr: 'تین نئے پنکھے آ گئے ہیں۔ وائرنگ اور فٹنگ درکار ہے۔',
    urgency: 'standard',
    urgencyLabel: 'Standard',
    urgencyUr: 'معمول',
  },
];

const FILTERS: { id: Filter; label: string; labelUr: string }[] = [
  { id: 'all', label: 'All', labelUr: 'سب' },
  { id: 'emergency', label: 'Emergency', labelUr: 'ہنگامی' },
  { id: 'nearby', label: 'Nearby', labelUr: 'قریب' },
];

const TONE: Record<Urgency, 'danger' | 'warn' | 'info'> = {
  emergency: 'danger',
  urgent: 'warn',
  standard: 'info',
};

/**
 * The dispatch board. Phase 1: sample jobs so a professional can see how the
 * queue reads before the job endpoints land.
 */
export default function ProJobsPage() {
  const t = useT();
  const [filter, setFilter] = useState<Filter>('all');

  const visible = OPEN_JOBS.filter((job) => {
    if (filter === 'emergency') return job.urgency === 'emergency';
    if (filter === 'nearby') return job.distanceKm <= 3;
    return true;
  });

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Work"
        eyebrowUr="کام"
        title="Job board"
        titleUr="جاب بورڈ"
        description="Open jobs near you. Accept one and the customer is notified instantly."
        descriptionUr="آپ کے قریب کھلے کام۔ ایک قبول کریں اور گاہک کو فوراً اطلاع مل جائے گی۔"
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile
          icon={<Briefcase className="h-4 w-4" />}
          label="Open jobs"
          labelUr="کھلے کام"
          value="5"
          hint="Within 8 km"
          hintUr="8 کلومیٹر کے اندر"
          tone="brand"
        />
        <StatTile
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Acceptance rate"
          labelUr="قبولیت کی شرح"
          value="98%"
          hint="Top-tier dispatch"
          hintUr="اعلی درجے کی ڈسپیچ"
          tone="info"
        />
        <StatTile
          icon={<Clock className="h-4 w-4" />}
          label="Avg response"
          labelUr="اوسط جواب"
          value="8 min"
          hint="Last 30 days"
          hintUr="گزشتہ 30 دن"
          tone="warn"
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <SectionTitle urdu="دستیاب کام">Available jobs</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                'rounded-full border px-4 py-2 text-xs font-bold transition-colors',
                filter === item.id
                  ? 'border-[#00824A] bg-[#DCFCE7] text-[#15803D]'
                  : 'border-[var(--border)] bg-surface text-ink-600 hover:bg-surface-muted'
              )}
            >
              {t(item.label, item.labelUr)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {visible.map((job) => (
          <Card key={job.id}>
            <CardBody className="space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge tone={TONE[job.urgency]}>
                    {job.urgency === 'emergency' ? <Zap className="h-3 w-3" /> : null}
                    {t(job.urgencyLabel, job.urgencyUr)}
                  </Badge>
                  <span className="font-mono text-xs font-bold text-ink-400">{job.id}</span>
                </div>
                <span className="text-sm font-extrabold text-[#00824A]">
                  {t(`Est. ${job.estimate}`, `تخمینہ ${job.estimateUr}`)}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">{t(job.title, job.titleUr)}</h3>
                <p className="mt-1 text-sm italic text-ink-600">{t(`“${job.note}”`, `”${job.noteUr}“`)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--border)] pt-3 text-xs text-ink-600">
                <span className="inline-flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-[#2563EB]" />
                  {t(`${job.distanceKm} km away`, `${job.distanceKm} کلومیٹر دور`)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-ink-400" />
                  {t(job.area, job.areaUr)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-ink-400" />
                  {t(job.customer, job.customerUr)}
                </span>
              </div>

              <div className="flex items-center justify-end">
                <Button variant="primary" size="sm">
                  {t('Accept job', 'کام قبول کریں')}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </Container>
  );
}
