'use client';

import {
  ArrowRight,
  Building2,
  CalendarCheck,
  FileText,
  Plus,
  Sparkles,
  Wallet,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { useT } from '@/components/i18n/LocaleProvider';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils/cn';

/** Urdu for the quick actions and summary tile labels. */
const QUICK_ACTION_UR: Record<string, string> = {
  'Ask PakFix AI': 'پاک فکس اے آئی سے پوچھیں',
  'Describe or photograph a problem': 'مسئلہ بیان کریں یا اس کی تصویر لیں',
  'Book a professional': 'پروفیشنل بک کریں',
  'Find someone verified nearby': 'قریب ہی کوئی تصدیق شدہ پیشہ ور تلاش کریں',
  'Add a property': 'پراپرٹی شامل کریں',
  'Keep its repair history': 'اس کی مرمت کی تاریخ محفوظ رکھیں',
  'Request quotes': 'کوٹس کی درخواست کریں',
  'Compare prices before you commit': 'کام دینے سے پہلے قیمتوں کا موازنہ کریں',
};

const SUMMARY_LABEL_UR: Record<string, string> = {
  'Open bookings': 'کھلی بکنگ',
  'Pending quotes': 'زیرِ التوا کوٹس',
  'Maintenance due': 'مرمت درکار',
  'Spent this year': 'اس سال کے اخراجات',
};

/**
 * The customer's home screen.
 *
 * Phase 1 wires the shell and the quick actions. The counters and lists here
 * are placeholders *in the honest sense*: each one states plainly that the
 * feature arrives in a later phase rather than showing an invented number.
 * Nothing on this page pretends to be data it does not have.
 */
export default function DashboardPage() {
  const t = useT();
  const user = useAuthStore((state) => state.user);

  const firstName = user?.profile?.first_name ?? user?.name?.split(' ')[0] ?? 'there';

  return (
    <Container className="py-6 sm:py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t(`Hello, ${firstName}`, `السلام علیکم، ${firstName}`)}
          </h1>
          <p className="mt-1.5 text-ink-600">
            {t('Everything about your home, in one place.', 'آپ کے گھر کی ہر چیز، ایک ہی جگہ۔')}
          </p>
        </div>

        {user && !user.email_verified ? (
          <Badge tone="warn">
            {t('Verify your email to get booking updates', 'بکنگ اپ ڈیٹس حاصل کرنے کے لیے اپنی ای میل کی تصدیق کریں')}
          </Badge>
        ) : null}
      </header>

      {/* Quick actions — the four things a customer actually opens the app for. */}
      <section aria-labelledby="quick-actions" className="mt-7">
        <h2 id="quick-actions" className="sr-only">
          {t('Quick actions', 'فوری اقدامات')}
        </h2>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <QuickAction
            href="/ai"
            icon={<Sparkles className="h-5 w-5" />}
            label="Ask PakFix AI"
            description="Describe or photograph a problem"
            emphasis
          />
          <QuickAction
            href="/find-a-technician"
            icon={<Wrench className="h-5 w-5" />}
            label="Book a professional"
            description="Find someone verified nearby"
          />
          <QuickAction
            href="/dashboard/properties"
            icon={<Building2 className="h-5 w-5" />}
            label="Add a property"
            description="Keep its repair history"
          />
          <QuickAction
            href="/dashboard/quotes"
            icon={<FileText className="h-5 w-5" />}
            label="Request quotes"
            description="Compare prices before you commit"
          />
        </div>
      </section>

      {/* Summary tiles. */}
      <section aria-labelledby="summary" className="mt-8">
        <h2 id="summary" className="text-lg font-semibold tracking-tight">
          {t('Your summary', 'آپ کا خلاصہ')}
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryTile icon={<CalendarCheck className="h-5 w-5" />} label="Open bookings" />
          <SummaryTile icon={<FileText className="h-5 w-5" />} label="Pending quotes" />
          <SummaryTile icon={<Wrench className="h-5 w-5" />} label="Maintenance due" />
          <SummaryTile icon={<Wallet className="h-5 w-5" />} label="Spent this year" />
        </div>
      </section>

      {/* Activity. */}
      <section aria-labelledby="activity" className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="activity" className="text-lg font-semibold tracking-tight">
            {t('Recent activity', 'حالیہ سرگرمی')}
          </h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            {t('All bookings', 'تمام بکنگ')} &rarr;
          </Link>
        </div>

        <div className="mt-4">
          <EmptyState
            icon={<CalendarCheck className="h-5 w-5" />}
            title={t('No bookings yet', 'ابھی تک کوئی بکنگ نہیں')}
            description={t(
              'Once you book a professional, the job and its full history will appear here.',
              'جب آپ کوئی پروفیشنل بک کریں گے تو کام اور اس کی مکمل تاریخ یہاں نظر آئے گی۔'
            )}
            action={
              <ButtonLink href="/ai">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {t('Diagnose a problem', 'مسئلے کی تشخیص کریں')}
              </ButtonLink>
            }
          />
        </div>
      </section>

      {/* Properties. */}
      <section aria-labelledby="properties" className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 id="properties" className="text-lg font-semibold tracking-tight">
            {t('Your properties', 'آپ کی پراپرٹیز')}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            disabled
            title={t('Available in the next phase', 'اگلے مرحلے میں دستیاب')}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('Add property', 'پراپرٹی شامل کریں')}
          </Button>
        </div>

        <div className="mt-4">
          <EmptyState
            icon={<Building2 className="h-5 w-5" />}
            title={t('No properties added', 'کوئی پراپرٹی شامل نہیں کی گئی')}
            description={t(
              'Add your home to keep every repair, appliance and service date against it.',
              'ہر مرمت، آلات اور سروس کی تاریخ اس کے ساتھ محفوظ رکھنے کے لیے اپنا گھر شامل کریں۔'
            )}
          />
        </div>
      </section>
    </Container>
  );
}

function QuickAction({
  href,
  icon,
  label,
  description,
  emphasis = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  emphasis?: boolean;
}) {
  const t = useT();

  return (
    <Link href={href} className="block h-full">
      <Card
        interactive
        className={cn('h-full', emphasis && 'border-brand-600 bg-brand-600 text-white')}
      >
        <CardBody className="flex h-full flex-col gap-2 p-4">
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)]',
              emphasis ? 'bg-white/15 text-white' : 'bg-surface-muted text-ink-600'
            )}
          >
            {icon}
          </span>
          <span className="mt-1 block text-sm font-semibold">{t(label, QUICK_ACTION_UR[label])}</span>
          <span
            className={cn('block text-xs leading-snug', emphasis ? 'text-brand-50' : 'text-ink-500')}
          >
            {t(description, QUICK_ACTION_UR[description])}
          </span>
          <ArrowRight
            className={cn('mt-auto h-4 w-4', emphasis ? 'text-brand-100' : 'text-ink-400')}
            aria-hidden="true"
          />
        </CardBody>
      </Card>
    </Link>
  );
}

/**
 * A counter with no number yet. It says so, rather than rendering a zero that
 * would read as "you have none" when the truth is "this is not built yet".
 */
function SummaryTile({ icon, label }: { icon: React.ReactNode; label: string }) {
  const t = useT();

  return (
    <Card>
      <CardBody className="flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-surface-muted text-ink-500">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm leading-snug text-ink-500">{t(label, SUMMARY_LABEL_UR[label])}</p>
          <p className="mt-0.5 text-xs font-medium text-ink-400">
            {t('Coming in the next phase', 'اگلے مرحلے میں آ رہا ہے')}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
