'use client';

import { CreditCard, Clock, ReceiptText, Download, Info } from 'lucide-react';
import { PageHeader, StatTile } from '@/components/dashboard/DashboardPage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardDescription } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

interface Invoice {
  id: string;
  service: string;
  serviceUr: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'refunded';
}

const INVOICES: Invoice[] = [
  {
    id: 'INV-2041',
    service: 'AC Inverter Jet Servicing',
    serviceUr: 'اے سی انورٹر جیٹ سروسنگ',
    date: '12 Oct 2026',
    amount: '2,800',
    status: 'pending',
  },
  {
    id: 'INV-2038',
    service: 'Main DB Breaker Box Repair',
    serviceUr: 'مین ڈی بی بریکر باکس مرمت',
    date: '09 Oct 2026',
    amount: '3,500',
    status: 'paid',
  },
  {
    id: 'INV-2031',
    service: 'Deep House Cleaning (3 Bed)',
    serviceUr: 'گہری گھریلو صفائی (تین بیڈ)',
    date: '02 Oct 2026',
    amount: '6,500',
    status: 'paid',
  },
  {
    id: 'INV-2025',
    service: 'Bathroom Leakage & Plumbing',
    serviceUr: 'باتھ روم لیکیج اور پلمبنگ',
    date: '27 Sep 2026',
    amount: '1,800',
    status: 'refunded',
  },
  {
    id: 'INV-2019',
    service: 'Ceiling Fan Installation x3',
    serviceUr: 'چھت کے پنکھے کی تنصیب x3',
    date: '21 Sep 2026',
    amount: '1,200',
    status: 'paid',
  },
];

const STATUS_TONE = {
  paid: 'safe',
  pending: 'warn',
  refunded: 'neutral',
} as const;

const STATUS_LABEL = {
  paid: { en: 'Paid', ur: 'ادا شدہ' },
  pending: { en: 'Pending', ur: 'زیرِ التوا' },
  refunded: { en: 'Refunded', ur: 'واپس شدہ' },
} as const;

export default function PaymentsPage() {
  const t = useT();

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Billing"
        eyebrowUr="بلنگ"
        title="Payments"
        titleUr="ادائیگیاں"
        description="Your invoices, receipts and payment history in one place."
        descriptionUr="آپ کے انوائس، رسیدیں اور ادائیگی کی تاریخ ایک جگہ۔"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={<CreditCard className="h-4 w-4" />}
          label="Spent this year"
          labelUr="اس سال خرچ"
          value="PKR 86,500"
          hint="Across 24 bookings"
          hintUr="24 بکنگ میں"
          tone="brand"
        />
        <StatTile
          icon={<Clock className="h-4 w-4" />}
          label="Pending"
          labelUr="باقی"
          value="PKR 2,800"
          hint="1 invoice awaiting payment"
          hintUr="1 انوائس ادائیگی کا منتظر"
          tone="warn"
        />
        <StatTile
          icon={<ReceiptText className="h-4 w-4" />}
          label="Paid invoices"
          labelUr="ادا شدہ انوائس"
          value="12"
          hint="All time"
          hintUr="اب تک"
          tone="info"
        />
      </div>

      <Card className="mt-6">
        <CardHeader className="pb-4">
          <h2 className="text-base font-semibold tracking-tight">{t('Invoice history', 'انوائس کی تاریخ')}</h2>
          <CardDescription>{t('Download a receipt for any completed job.', 'کسی بھی مکمل کام کی رسید ڈاؤن لوڈ کریں۔')}</CardDescription>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[11px] font-bold uppercase tracking-wide text-ink-500">
                  <th className="px-5 py-3">{t('Invoice', 'انوائس')}</th>
                  <th className="px-5 py-3">{t('Service', 'سروس')}</th>
                  <th className="px-5 py-3">{t('Date', 'تاریخ')}</th>
                  <th className="px-5 py-3">{t('Amount', 'رقم')}</th>
                  <th className="px-5 py-3">{t('Status', 'حالت')}</th>
                  <th className="px-5 py-3 text-right">{t('Receipt', 'رسید')}</th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-[var(--border)] last:border-0 hover:bg-surface-muted/60">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-ink-600">{invoice.id}</td>
                    <td className="px-5 py-4 font-medium text-foreground">{t(invoice.service, invoice.serviceUr)}</td>
                    <td className="px-5 py-4 text-ink-500">{invoice.date}</td>
                    <td className="px-5 py-4 font-bold text-[#00824A]">PKR {invoice.amount}</td>
                    <td className="px-5 py-4">
                      <Badge tone={STATUS_TONE[invoice.status]}>
                        {t(STATUS_LABEL[invoice.status].en, STATUS_LABEL[invoice.status].ur)}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button variant="ghost" size="sm" type="button">
                        <Download className="h-4 w-4" />
                        {t('Download receipt', 'رسید ڈاؤن لوڈ کریں')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-[#2563EB]/30 bg-[#DBEAFE]/40 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
        <p className="text-sm text-ink-600">
          {t(
            'Online card and wallet payments are coming soon. For now, pay your professional directly and keep the receipt here.',
            'آن لائن کارڈ اور والٹ کی ادائیگیاں جلد دستیاب ہوں گی۔ فی الحال اپنے پروفیشنل کو براہِ راست ادائیگی کریں اور رسید یہاں محفوظ رکھیں۔'
          )}
        </p>
      </div>
    </Container>
  );
}
