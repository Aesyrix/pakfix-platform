'use client';

import { AlertTriangle, Bell, Power, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/dashboard/DashboardPage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Checkbox, Select } from '@/components/ui/Input';
import { useT } from '@/components/i18n/LocaleProvider';
import { cn } from '@/lib/utils/cn';

const MAX_JOBS = ['1', '2', '3', '4', '5'];

/**
 * Professional preferences. Phase 1: local state so the controls feel real
 * before the settings endpoints land.
 */
export default function ProSettingsPage() {
  const t = useT();
  const [online, setOnline] = useState(true);
  const [maxJobs, setMaxJobs] = useState('3');
  const [notifyNewJobs, setNotifyNewJobs] = useState(true);
  const [notifyPayouts, setNotifyPayouts] = useState(true);
  const [notifyPromotions, setNotifyPromotions] = useState(false);

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Preferences"
        eyebrowUr="ترجیحات"
        title="Settings"
        titleUr="ترتیبات"
        description="Control when you work, how we reach you, and your account."
        descriptionUr="یہ طے کریں کہ آپ کب کام کرتے ہیں، ہم آپ تک کیسے پہنچیں، اور آپ کا اکاؤنٹ۔"
      />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="flex-row items-center gap-2 p-5 pb-0">
            <SlidersHorizontal className="h-4 w-4 text-[#00824A]" />
            <CardTitle>{t('Availability', 'دستیابی')}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--border)] p-4">
              <div>
                <p className="text-sm font-bold text-foreground">{t('Online status', 'آن لائن حیثیت')}</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {online
                    ? t('You are accepting new jobs.', 'آپ نئے کام قبول کر رہے ہیں۔')
                    : t('You are paused and will not receive jobs.', 'آپ رکے ہوئے ہیں اور آپ کو کام نہیں ملیں گے۔')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOnline(!online)}
                aria-pressed={online}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold shadow-sm transition-all',
                  online
                    ? 'border-[#86EFAC] bg-[#DCFCE7] text-[#15803D]'
                    : 'border-[var(--border)] bg-surface-muted text-ink-600'
                )}
              >
                <span className={cn('h-2.5 w-2.5 rounded-full', online ? 'animate-pulse bg-[#00824A]' : 'bg-ink-400')} />
                {online ? t('ONLINE', 'آن لائن') : t('OFFLINE', 'آف لائن')}
              </button>
            </div>

            <Select
              label={t('Max jobs per day', 'روزانہ زیادہ سے زیادہ کام')}
              value={maxJobs}
              onChange={(event) => setMaxJobs(event.target.value)}
              hint={t('Extra jobs beyond this are offered to other pros.', 'اس سے زیادہ کام دیگر پروفیشنلز کو پیش کیے جاتے ہیں۔')}
            >
              {MAX_JOBS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center gap-2 p-5 pb-0">
            <Bell className="h-4 w-4 text-[#2563EB]" />
            <CardTitle>{t('Notifications', 'اطلاعات')}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <Checkbox
              label={t('New job requests near me', 'میرے قریب نئی کام کی درخواستیں')}
              checked={notifyNewJobs}
              onChange={(event) => setNotifyNewJobs(event.target.checked)}
            />
            <Checkbox
              label={t('Payout and earnings updates', 'ادائیگی اور کمائی کی اطلاعات')}
              checked={notifyPayouts}
              onChange={(event) => setNotifyPayouts(event.target.checked)}
            />
            <Checkbox
              label={t('Tips and promotions from PakFix', 'پاک فکس کی تجاویز اور پروموشنز')}
              checked={notifyPromotions}
              onChange={(event) => setNotifyPromotions(event.target.checked)}
            />
          </CardBody>
        </Card>

        <Card className="border-[#DC2626]/30">
          <CardHeader className="flex-row items-center gap-2 p-5 pb-0">
            <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
            <CardTitle>{t('Account', 'اکاؤنٹ')}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
                  {t('Pause my account', 'میرا اکاؤنٹ روکیں')}
                  <Badge tone="danger">{t('Temporary', 'عارضی')}</Badge>
                </p>
                <p className="mt-0.5 max-w-md text-xs text-ink-500">
                  {t(
                    'Pausing hides your listing and stops all new job requests. You can come back any time.',
                    'روکنے سے آپ کی لِسٹنگ چھپ جاتی ہے اور تمام نئی درخواستیں بند ہو جاتی ہیں۔ آپ کسی بھی وقت واپس آ سکتے ہیں۔'
                  )}
                </p>
              </div>
              <Button variant="danger" size="sm">
                <Power className="h-4 w-4" />
                {t('Pause my account', 'میرا اکاؤنٹ روکیں')}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </Container>
  );
}
