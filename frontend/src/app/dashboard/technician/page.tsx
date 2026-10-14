'use client';

import { Briefcase, CheckCircle2, Clock, DollarSign, MapPin, Navigation, Phone, ShieldCheck, Star, ToggleLeft, ToggleRight, User } from 'lucide-react';
import { useState } from 'react';
import { Badge, VerifiedBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

export default function TechnicianDashboardPage() {
  const t = useT();
  const [online, setOnline] = useState(true);
  const [acceptedJob, setAcceptedJob] = useState(false);

  return (
    <Container className="py-8 sm:py-10">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">{t('Technician Portal', 'ٹیکنیشن پورٹل')}</span>
            <VerifiedBadge showText={true} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
            Usman Electrical & AC Services
          </h1>
          <p className="text-sm text-ink-600 mt-1">
            {t('Gulberg & DHA Service Area • Verified Master Technician', 'گلبرگ اور ڈی ایچ اے سروس ایریا • تصدیق شدہ ماسٹر ٹیکنیشن')}
          </p>
        </div>

        {/* Online / Offline Status Toggle Button */}
        <button
          onClick={() => setOnline(!online)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs shadow-sm transition-all ${
            online ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]' : 'bg-surface-muted text-ink-600 border border-[var(--border)]'
          }`}
        >
          <span className={`h-2.5 w-2.5 rounded-full ${online ? 'bg-[#00824A] animate-pulse' : 'bg-ink-400'}`} />
          {online ? t('ONLINE (ACCEPTING JOBS)', 'آن لائن (جابز قبول کر رہے ہیں)') : t('OFFLINE (PAUSED)', 'آف لائن (روکا گیا)')}
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-[#DCFCE7]/50 to-surface">
          <CardBody className="p-4">
            <span className="text-[10px] font-bold uppercase text-ink-500">{t("Today's Earnings", 'آج کی کمائی')}</span>
            <p className="text-2xl font-extrabold text-[#15803D] mt-1">PKR 8,500</p>
            <span className="text-[11px] text-[#00824A] font-semibold">{t('3 jobs completed', '3 جابز مکمل')}</span>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <span className="text-[10px] font-bold uppercase text-ink-500">{t('Weekly Earnings', 'ہفتہ وار کمائی')}</span>
            <p className="text-2xl font-extrabold text-foreground mt-1">PKR 42,000</p>
            <span className="text-[11px] text-ink-500">{t('Payout: Every Monday', 'ادائیگی: ہر پیر')}</span>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <span className="text-[10px] font-bold uppercase text-ink-500">{t('Pro Rating', 'پرو ریٹنگ')}</span>
            <p className="text-2xl font-extrabold text-[#F59E0B] mt-1 flex items-center gap-1">
              <Star className="h-5 w-5 fill-[#F59E0B] text-[#F59E0B]" /> 4.92
            </p>
            <span className="text-[11px] text-ink-500">{t('Based on 142 reviews', '142 ریویوز کی بنیاد پر')}</span>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <span className="text-[10px] font-bold uppercase text-ink-500">{t('Acceptance Rate', 'قبولیت کی شرح')}</span>
            <p className="text-2xl font-extrabold text-[#2563EB] mt-1">98%</p>
            <span className="text-[11px] text-[#2563EB] font-semibold">{t('Top tier dispatch', 'اعلیٰ درجے کی ڈسپیچ')}</span>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Active Dispatched Job Column */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">{t('Current Active Job', 'موجودہ فعال کام')}</h2>

          {acceptedJob ? (
            <Card className="border-[#00824A] ring-2 ring-[#00824A]/20 shadow-xl">
              <CardHeader className="border-b border-[var(--border)] pb-3">
                <div className="flex items-center justify-between">
                  <Badge tone="brand">{t('En Route • ETA 12 mins', 'راستے میں • تخمینہ 12 منٹ')}</Badge>
                  <span className="text-xs font-mono font-bold text-[#00824A]">{t('Fixed PKR 2,800', 'مقررہ PKR 2,800')}</span>
                </div>
                <CardTitle className="text-lg font-extrabold text-foreground mt-2">
                  {t('AC Inverter Jet Servicing & Gas Leak Check', 'اے سی انورٹر جیٹ سروسنگ اور گیس لیک چیک')}
                </CardTitle>
              </CardHeader>

              <CardBody className="p-5 space-y-4">
                {/* Customer Details */}
                <div className="rounded-2xl bg-surface-muted/60 p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">{t('Customer: Hamza Ahmed', 'کسٹمر: حمزہ احمد')}</span>
                    <a
                      href="tel:+923001234567"
                      className="inline-flex items-center gap-1 bg-[#00824A] text-white px-3 py-1 rounded-lg font-bold"
                    >
                      <Phone className="h-3.5 w-3.5" /> {t('Call Customer', 'کسٹمر کو کال کریں')}
                    </a>
                  </div>
                  <p className="text-ink-600 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#2563EB]" /> House 42-C, Main Boulevard, Gulberg III, Lahore
                  </p>
                </div>

                {/* Job Checklist */}
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-foreground">{t('Service Checklist:', 'سروس چیک لسٹ:')}</p>
                  <div className="space-y-1.5 text-ink-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#00824A]" />
                      <span>{t('Inspect outdoor unit fan & capacitor', 'آؤٹ ڈور یونٹ کا پنکھا اور کیپیسیٹر معائنہ کریں')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#00824A]" />
                      <span>{t('High pressure indoor jet wash', 'ہائی پریشر انڈور جیٹ واش')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="h-4 w-4 accent-[#00824A]" />
                      <span>{t('R410a Gas pressure test (PSI output)', 'R410a گیس پریشر ٹیسٹ (PSI آؤٹ پٹ)')}</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={() => setAcceptedJob(false)}>
                    {t('Cancel Job', 'کام منسوخ کریں')}
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => alert(t('Completion photo saved!', 'تکمیل کی تصویر محفوظ ہو گئی!'))}>
                    {t('Mark Job Complete & Collect Payment', 'کام مکمل کریں اور ادائیگی وصول کریں')}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="p-8 text-center bg-surface-muted/40">
              <p className="text-sm font-bold text-foreground">{t('No active job in progress right now.', 'اس وقت کوئی فعال کام جاری نہیں ہے۔')}</p>
              <p className="text-xs text-ink-500 mt-1">{t('Accept a incoming request from the right queue panel to begin.', 'شروع کرنے کے لیے دائیں قطار پینل سے آنے والی درخواست قبول کریں۔')}</p>
            </Card>
          )}
        </div>

        {/* Nearby Job Requests Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-foreground">{t('Nearby Available Bids', 'قریبی دستیاب بولیاں')}</h2>
            <span className="text-xs text-[#00824A] font-bold">{t('2 Jobs Nearby', '2 قریبی جابز')}</span>
          </div>

          <Card className="shadow-md hover:border-[#00824A] transition-all">
            <CardBody className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded-full">
                  {t('1.2 km away • Gulberg II', '1.2 کلومیٹر دور • گلبرگ II')}
                </span>
                <span className="font-extrabold text-[#00824A] text-sm">{t('Est. PKR 2,800', 'تخمینی PKR 2,800')}</span>
              </div>

              <div>
                <h3 className="font-bold text-foreground text-sm">{t('AC Inverter Cooling Repair', 'اے سی انورٹر کولنگ ریپئر')}</h3>
                <p className="text-ink-600 mt-1 italic">&ldquo;{t('AC runs but air is not cold. Need immediate inspection.', 'اے سی چل رہا ہے مگر ہوا ٹھنڈی نہیں۔ فوری معائنہ درکار ہے۔')}&rdquo;</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <span className="text-ink-400">{t('Customer rating: ★ 5.0', 'کسٹمر ریٹنگ: ★ 5.0')}</span>
                <Button variant="primary" size="sm" onClick={() => setAcceptedJob(true)}>
                  {t('Accept Job & Dispatch', 'کام قبول کریں اور روانہ کریں')}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </Container>
  );
}
