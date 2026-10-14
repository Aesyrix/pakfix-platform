'use client';

import {
  Briefcase,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { PageHeader, SectionTitle, StatTile } from '@/components/dashboard/DashboardPage';
import { Badge, VerifiedBadge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';
import { useAuthStore } from '@/stores/auth';

/**
 * The professional's home screen. Phase 1: the working day in one glance —
 * availability, today's money, and the next job. Figures are sample data until
 * the job endpoints land.
 */
export default function ProOverviewPage() {
  const t = useT();
  const user = useAuthStore((state) => state.user);
  const [online, setOnline] = useState(true);
  const [accepted, setAccepted] = useState(false);

  const firstName = user?.profile?.first_name ?? user?.name?.split(' ')[0] ?? '';

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Professional portal"
        eyebrowUr="پروفیشنل پورٹل"
        title={firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
        description="Your availability, earnings and next job — all in one place."
        descriptionUr="آپ کی دستیابی، کمائی اور اگلا کام — سب ایک جگہ۔"
        action={
          <button
            type="button"
            onClick={() => setOnline(!online)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold shadow-sm transition-all ${
              online
                ? 'border border-[#86EFAC] bg-[#DCFCE7] text-[#15803D]'
                : 'border border-[var(--border)] bg-surface-muted text-ink-600'
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${online ? 'animate-pulse bg-[#00824A]' : 'bg-ink-400'}`} />
            {online ? t('ONLINE — ACCEPTING JOBS', 'آن لائن — کام قبول کر رہے ہیں') : t('OFFLINE — PAUSED', 'آف لائن — رکا ہوا')}
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          icon={<Wallet className="h-4 w-4" />}
          label="Today's earnings"
          labelUr="آج کی کمائی"
          value="PKR 8,500"
          hint="3 jobs completed"
          hintUr="3 کام مکمل"
          tone="brand"
        />
        <StatTile
          icon={<TrendingUp className="h-4 w-4" />}
          label="Weekly earnings"
          labelUr="ہفتہ وار کمائی"
          value="PKR 42,000"
          hint="Payout every Monday"
          hintUr="ادائیگی ہر پیر"
        />
        <StatTile
          icon={<Star className="h-4 w-4" />}
          label="Pro rating"
          labelUr="پرو ریٹنگ"
          value="4.92"
          hint="142 reviews"
          hintUr="142 جائزے"
          tone="warn"
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
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <SectionTitle urdu="موجودہ کام">Current job</SectionTitle>
          </div>

          {accepted ? (
            <Card className="border-[#00824A] shadow-lg ring-2 ring-[#00824A]/20">
              <CardHeader className="border-b border-[var(--border)] pb-3">
                <div className="flex items-center justify-between">
                  <Badge tone="brand">{t('En route — ETA 12 mins', 'راستے میں — 12 منٹ')}</Badge>
                  <span className="font-mono text-xs font-bold text-[#00824A]">{t('Fixed PKR 2,800', 'مقررہ 2,800 روپے')}</span>
                </div>
                <CardTitle className="mt-2 text-lg font-extrabold">
                  {t('AC Inverter Jet Servicing & Gas Check', 'اے سی اِنورٹر جیٹ سروسنگ اور گیس چیک')}
                </CardTitle>
              </CardHeader>
              <CardBody className="space-y-4 p-5">
                <div className="space-y-2 rounded-2xl bg-surface-muted/60 p-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{t('Customer: Hamza Ahmed', 'گاہک: حمزہ احمد')}</span>
                    <a
                      href="tel:+923001234567"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#00824A] px-3 py-1 font-bold text-white"
                    >
                      <Phone className="h-3.5 w-3.5" /> {t('Call', 'کال کریں')}
                    </a>
                  </div>
                  <p className="flex items-center gap-1 text-ink-600">
                    <MapPin className="h-3.5 w-3.5 text-[#2563EB]" />
                    {t('House 42-C, Main Boulevard, Gulberg III, Lahore', 'مکان 42-C، مین بلیوارڈ، گلبرگ III، لاہور')}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
                  <Button variant="secondary" size="sm" onClick={() => setAccepted(false)}>
                    {t('Cancel job', 'کام منسوخ کریں')}
                  </Button>
                  <Button variant="primary" size="sm">
                    {t('Mark complete', 'مکمل نشان زد کریں')}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="bg-surface-muted/40 p-8 text-center">
              <p className="text-sm font-bold">{t('No job in progress right now.', 'اس وقت کوئی کام جاری نہیں۔')}</p>
              <p className="mt-1 text-xs text-ink-500">
                {t('Accept a request from the queue to begin.', 'شروع کرنے کے لیے قطار سے درخواست قبول کریں۔')}
              </p>
            </Card>
          )}
        </div>

        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between">
            <SectionTitle>{'Nearby jobs'}</SectionTitle>
            <ButtonLink href="/pro/jobs" variant="ghost" size="sm" className="h-8 text-xs font-bold text-[#00824A]">
              {t('View board', 'بورڈ دیکھیں')}
            </ButtonLink>
          </div>

          <Card className="shadow-md">
            <CardBody className="space-y-3 p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1">
                  <Badge tone="accent">
                    <Navigation className="h-3 w-3" /> {t('1.2 km away', '1.2 کلومیٹر دور')}
                  </Badge>
                </span>
                <span className="text-sm font-extrabold text-[#00824A]">{t('Est. PKR 2,800', 'تخمینہ 2,800 روپے')}</span>
              </div>
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-bold">
                  <Briefcase className="h-4 w-4 text-ink-400" />
                  {t('AC Inverter Cooling Repair', 'اے سی اِنورٹر کولنگ مرمت')}
                </h3>
                <p className="mt-1 italic text-ink-600">
                  {t('“AC runs but the air is not cold. Need an inspection.”', '”اے سی چل رہا ہے مگر ہوا ٹھنڈی نہیں۔ معائنہ چاہیے۔“')}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-2">
                <VerifiedBadge showText={false} />
                <Button variant="primary" size="sm" onClick={() => setAccepted(true)}>
                  {t('Accept job', 'کام قبول کریں')}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </Container>
  );
}
