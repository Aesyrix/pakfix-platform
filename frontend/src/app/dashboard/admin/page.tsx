'use client';

import { Activity, AlertTriangle, CheckCircle2, DollarSign, Filter, Search, ShieldCheck, UserCheck, Users, Wrench } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

interface BookingRow {
  id: string;
  customer: string;
  service: string;
  technician: string;
  city: string;
  amountPkr: number;
  status: 'completed' | 'in_progress' | 'disputed' | 'cancelled';
  date: string;
}

const SAMPLE_ADMIN_DATA: BookingRow[] = [
  { id: 'BK-9842', customer: 'Hamza Ahmed', service: 'AC Inverter Jet Servicing', technician: 'Muhammad Usman', city: 'Lahore', amountPkr: 2800, status: 'in_progress', date: '21 Sep 2026' },
  { id: 'BK-9841', customer: 'Zainab Bibi', service: 'Distribution Box Fuse Repair', technician: 'Tariq Mahmood', city: 'Lahore', amountPkr: 3500, status: 'completed', date: '21 Sep 2026' },
  { id: 'BK-9840', customer: 'Kashif Raza', service: 'Kitchen Pipe Leak Repair', technician: 'Shahid Plumbing', city: 'Islamabad', amountPkr: 1800, status: 'completed', date: '20 Sep 2026' },
  { id: 'BK-9839', customer: 'Bilal Farooq', service: 'UPS Inverter Repair', technician: 'Ali Electric', city: 'Karachi', amountPkr: 4200, status: 'disputed', date: '20 Sep 2026' },
];

/** Urdu for the sample service copy; customer, technician and city names stay as written. */
const ADMIN_SERVICE_UR: Record<string, string> = {
  'AC Inverter Jet Servicing': 'اے سی انورٹر جیٹ سروسنگ',
  'Distribution Box Fuse Repair': 'ڈسٹریبیوشن باکس فیوز کی مرمت',
  'Kitchen Pipe Leak Repair': 'باورچی خانے کے پائپ لیک کی مرمت',
  'UPS Inverter Repair': 'یو پی ایس انورٹر کی مرمت',
};

const ADMIN_STATUS_UR: Record<BookingRow['status'], { en: string; ur: string }> = {
  completed: { en: 'Completed', ur: 'مکمل' },
  in_progress: { en: 'In Progress', ur: 'جاری' },
  disputed: { en: 'Disputed', ur: 'متنازع' },
  cancelled: { en: 'Cancelled', ur: 'منسوخ' },
};

export default function AdminDashboardPage() {
  const t = useT();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = SAMPLE_ADMIN_DATA.filter((row) => {
    const matchesSearch = row.customer.toLowerCase().includes(search.toLowerCase()) || row.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || row.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container className="py-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B91C1C] bg-[#FEE2E2] px-2.5 py-0.5 rounded-full">
              {t('System Admin & Command Center', 'سسٹم ایڈمن اور کمانڈ سینٹر')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            {t('PakFix Platform Operational Dashboard', 'PakFix پلیٹ فارم آپریشنل ڈیش بورڈ')}
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            {t('Live marketplace metrics, technician verification queue, and safety emergency logs.', 'لائیو مارکیٹ پلیس میٹرکس، ٹیکنیشن تصدیق کی قطار اور حفاظتی ہنگامی لاگز۔')}
          </p>
        </div>
      </div>

      {/* Overview Stat Tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-[#DCFCE7]/60 to-surface">
          <CardBody className="p-4">
            <span className="text-[10px] font-bold uppercase text-ink-500">{t('Gross Marketplace Volume', 'کل مارکیٹ پلیس حجم')}</span>
            <p className="text-2xl font-extrabold text-[#15803D] mt-1">PKR 4.82 M</p>
            <span className="text-[11px] text-[#00824A] font-bold">{t('+18.4% this month', 'اس ماہ +18.4%')}</span>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <span className="text-[10px] font-bold uppercase text-ink-500">{t('Total Bookings', 'کل بکنگ')}</span>
            <p className="text-2xl font-extrabold text-foreground mt-1">1,428</p>
            <span className="text-[11px] text-ink-500">{t('96.2% completion rate', '96.2% تکمیل کی شرح')}</span>
          </CardBody>
        </Card>

        <Card className="border-[#F59E0B]/40 bg-[#FEF3C7]/20">
          <CardBody className="p-4">
            <span className="text-[10px] font-bold uppercase text-[#B45309]">{t('Pending Verifications', 'زیرِ التوا تصدیقات')}</span>
            <p className="text-2xl font-extrabold text-[#B45309] mt-1">{t('14 Pros', '14 پروفیشنلز')}</p>
            <span className="text-[11px] text-[#B45309] font-medium">{t('CNIC & Police check pending', 'شناختی کارڈ اور پولیس تصدیق زیرِ التوا')}</span>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <span className="text-[10px] font-bold uppercase text-ink-500">{t('Active Cities', 'فعال شہر')}</span>
            <p className="text-2xl font-extrabold text-[#2563EB] mt-1">{t('4 Cities', '4 شہر')}</p>
            <span className="text-[11px] text-ink-500">Lahore, KHI, ISB, RWP</span>
          </CardBody>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-[var(--border)] pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg font-bold">{t('Platform Transactions & Jobs', 'پلیٹ فارم ٹرانزیکشنز اور جابز')}</CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
                <input
                  type="text"
                  placeholder={t('Search ID or Customer...', 'ID یا کسٹمر تلاش کریں...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pl-9 pr-3 rounded-xl border border-[var(--border)] text-xs bg-surface outline-none focus:ring-2 focus:ring-[#00824A]"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 px-3 rounded-xl border border-[var(--border)] text-xs bg-surface outline-none"
              >
                <option value="all">{t('All Statuses', 'تمام اسٹیٹس')}</option>
                <option value="in_progress">{t('In Progress', 'جاری')}</option>
                <option value="completed">{t('Completed', 'مکمل')}</option>
                <option value="disputed">{t('Disputed', 'متنازع')}</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted/70 text-ink-500 font-bold uppercase tracking-wider border-b border-[var(--border)]">
              <tr>
                <th className="p-3.5 pl-6">{t('Order ID', 'آرڈر آئی ڈی')}</th>
                <th className="p-3.5">{t('Customer', 'کسٹمر')}</th>
                <th className="p-3.5">{t('Service Requested', 'درخواست کردہ سروس')}</th>
                <th className="p-3.5">{t('Technician', 'ٹیکنیشن')}</th>
                <th className="p-3.5">{t('City', 'شہر')}</th>
                <th className="p-3.5">{t('Amount (PKR)', 'رقم (PKR)')}</th>
                <th className="p-3.5">{t('Status', 'اسٹیٹس')}</th>
                <th className="p-3.5 pr-6">{t('Action', 'کارروائی')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((row) => (
                <tr key={row.id} className="hover:bg-surface-muted/40 transition-colors">
                  <td className="p-3.5 pl-6 font-mono font-bold text-foreground">{row.id}</td>
                  <td className="p-3.5 font-semibold text-foreground">{row.customer}</td>
                  <td className="p-3.5 text-ink-600">{t(row.service, ADMIN_SERVICE_UR[row.service])}</td>
                  <td className="p-3.5 font-medium text-foreground">{row.technician}</td>
                  <td className="p-3.5 text-ink-500">{row.city}</td>
                  <td className="p-3.5 font-extrabold text-[#00824A]">PKR {row.amountPkr.toLocaleString()}</td>
                  <td className="p-3.5">
                    <Badge
                      tone={
                        row.status === 'completed' ? 'safe' :
                        row.status === 'in_progress' ? 'brand' :
                        row.status === 'disputed' ? 'danger' : 'neutral'
                      }
                    >
                      {t(ADMIN_STATUS_UR[row.status].en, ADMIN_STATUS_UR[row.status].ur)}
                    </Badge>
                  </td>
                  <td className="p-3.5 pr-6">
                    <Button variant="ghost" size="sm" className="h-7 text-[11px]">
                      {t('Manage', 'انتظام کریں')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </Container>
  );
}
