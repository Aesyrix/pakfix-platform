'use client';

import { Banknote, CalendarClock, TrendingUp, Wallet } from 'lucide-react';
import { PageHeader, SectionTitle, StatTile } from '@/components/dashboard/DashboardPage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

type PayoutStatus = 'paid' | 'processing' | 'pending';

interface PayoutRow {
  date: string;
  dateUr: string;
  jobId: string;
  customer: string;
  customerUr: string;
  gross: string;
  grossUr: string;
  fee: string;
  feeUr: string;
  net: string;
  netUr: string;
  status: PayoutStatus;
  statusLabel: string;
  statusUr: string;
}

const PAYOUTS: PayoutRow[] = [
  {
    date: '11 Oct 2026',
    dateUr: '11 اکتوبر 2026',
    jobId: 'JB-0987',
    customer: 'Hamza Ahmed',
    customerUr: 'حمزہ احمد',
    gross: 'PKR 2,800',
    grossUr: '2,800 روپے',
    fee: 'PKR 280',
    feeUr: '280 روپے',
    net: 'PKR 2,520',
    netUr: '2,520 روپے',
    status: 'paid',
    statusLabel: 'Paid',
    statusUr: 'ادا شدہ',
  },
  {
    date: '11 Oct 2026',
    dateUr: '11 اکتوبر 2026',
    jobId: 'JB-0988',
    customer: 'Ayesha Khan',
    customerUr: 'عائشہ خان',
    gross: 'PKR 3,500',
    grossUr: '3,500 روپے',
    fee: 'PKR 350',
    feeUr: '350 روپے',
    net: 'PKR 3,150',
    netUr: '3,150 روپے',
    status: 'paid',
    statusLabel: 'Paid',
    statusUr: 'ادا شدہ',
  },
  {
    date: '10 Oct 2026',
    dateUr: '10 اکتوبر 2026',
    jobId: 'JB-0984',
    customer: 'Bilal Sheikh',
    customerUr: 'بلال شیخ',
    gross: 'PKR 4,200',
    grossUr: '4,200 روپے',
    fee: 'PKR 420',
    feeUr: '420 روپے',
    net: 'PKR 3,780',
    netUr: '3,780 روپے',
    status: 'processing',
    statusLabel: 'Processing',
    statusUr: 'زیرِ کار',
  },
  {
    date: '09 Oct 2026',
    dateUr: '9 اکتوبر 2026',
    jobId: 'JB-0981',
    customer: 'Fatima Noor',
    customerUr: 'فاطمہ نور',
    gross: 'PKR 1,900',
    grossUr: '1,900 روپے',
    fee: 'PKR 190',
    feeUr: '190 روپے',
    net: 'PKR 1,710',
    netUr: '1,710 روپے',
    status: 'paid',
    statusLabel: 'Paid',
    statusUr: 'ادا شدہ',
  },
  {
    date: '08 Oct 2026',
    dateUr: '8 اکتوبر 2026',
    jobId: 'JB-0977',
    customer: 'Usman Malik',
    customerUr: 'عثمان ملک',
    gross: 'PKR 2,400',
    grossUr: '2,400 روپے',
    fee: 'PKR 240',
    feeUr: '240 روپے',
    net: 'PKR 2,160',
    netUr: '2,160 روپے',
    status: 'pending',
    statusLabel: 'Pending',
    statusUr: 'زیرِ التوا',
  },
];

const STATUS_TONE: Record<PayoutStatus, 'safe' | 'info' | 'warn'> = {
  paid: 'safe',
  processing: 'info',
  pending: 'warn',
};

/**
 * Money earned and on its way. Phase 1: sample payouts until the wallet
 * endpoints land.
 */
export default function ProEarningsPage() {
  const t = useT();

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Money"
        eyebrowUr="رقم"
        title="Earnings"
        titleUr="کمائی"
        description="Track what you earned, what PakFix keeps, and what is on the way."
        descriptionUr="دیکھیں آپ نے کیا کمایا، پاک فکس کا حصہ کتنا ہے، اور کیا راستے میں ہے۔"
        action={
          <Button variant="secondary" size="sm">
            <Banknote className="h-4 w-4" />
            {t('Withdraw', 'رقم نکالیں')}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          icon={<Wallet className="h-4 w-4" />}
          label="Today"
          labelUr="آج"
          value="PKR 8,500"
          hint="3 jobs completed"
          hintUr="3 کام مکمل"
          tone="brand"
        />
        <StatTile
          icon={<TrendingUp className="h-4 w-4" />}
          label="This week"
          labelUr="اس ہفتے"
          value="PKR 42,000"
          hint="14 jobs completed"
          hintUr="14 کام مکمل"
        />
        <StatTile
          icon={<CalendarClock className="h-4 w-4" />}
          label="This month"
          labelUr="اس مہینے"
          value="PKR 168,000"
          hint="Best month so far"
          hintUr="اب تک کا بہترین مہینہ"
          tone="info"
        />
        <StatTile
          icon={<Banknote className="h-4 w-4" />}
          label="Pending payout"
          labelUr="زیرِ التوا ادائیگی"
          value="PKR 6,200"
          hint="Releases Monday"
          hintUr="پیر کو جاری ہوگی"
          tone="warn"
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <SectionTitle urdu="حالیہ ادائیگیاں">Recent payouts</SectionTitle>
        <span className="text-xs font-medium text-ink-500">
          {t('Payouts run every Monday', 'ادائیگیاں ہر پیر ہوتی ہیں')}
        </span>
      </div>

      <Card className="mt-4">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[11px] font-bold uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-3">{t('Date', 'تاریخ')}</th>
                  <th className="px-5 py-3">{t('Job ID', 'کام کی آئی ڈی')}</th>
                  <th className="px-5 py-3">{t('Customer', 'گاہک')}</th>
                  <th className="px-5 py-3 text-right">{t('Gross', 'مجموعی')}</th>
                  <th className="px-5 py-3 text-right">{t('Platform fee', 'پلیٹ فارم فیس')}</th>
                  <th className="px-5 py-3 text-right">{t('Net', 'خالص')}</th>
                  <th className="px-5 py-3">{t('Status', 'حالت')}</th>
                </tr>
              </thead>
              <tbody>
                {PAYOUTS.map((row) => (
                  <tr key={row.jobId} className="border-b border-[var(--border)] last:border-0 hover:bg-surface-muted/50">
                    <td className="px-5 py-3 text-ink-600">{t(row.date, row.dateUr)}</td>
                    <td className="px-5 py-3 font-mono text-xs font-bold text-ink-600">{row.jobId}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{t(row.customer, row.customerUr)}</td>
                    <td className="px-5 py-3 text-right text-ink-600">{t(row.gross, row.grossUr)}</td>
                    <td className="px-5 py-3 text-right text-ink-500">- {t(row.fee, row.feeUr)}</td>
                    <td className="px-5 py-3 text-right font-extrabold text-[#00824A]">{t(row.net, row.netUr)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[row.status]}>{t(row.statusLabel, row.statusUr)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <p className="mt-3 text-xs text-ink-500">
        {t(
          'A 10% platform fee applies to every completed job. Payouts are released to your bank account every Monday.',
          'ہر مکمل کام پر 10% پلیٹ فارم فیس لاگو ہوتی ہے۔ ادائیگیاں ہر پیر آپ کے بینک اکاؤنٹ میں جاری کی جاتی ہیں۔'
        )}
      </p>
    </Container>
  );
}
