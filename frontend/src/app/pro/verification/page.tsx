'use client';

import { BadgeCheck, Eye, FileCheck2, Landmark, ShieldCheck, Upload, UserCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHeader, SectionTitle } from '@/components/dashboard/DashboardPage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';

type StepStatus = 'verified' | 'pending' | 'not_submitted';

interface Step {
  id: string;
  icon: ReactNode;
  title: string;
  titleUr: string;
  description: string;
  descriptionUr: string;
  status: StepStatus;
  statusLabel: string;
  statusUr: string;
}

const STEPS: Step[] = [
  {
    id: 'cnic',
    icon: <UserCheck className="h-5 w-5" />,
    title: 'CNIC verification',
    titleUr: 'شناختی کارڈ کی تصدیق',
    description: 'Your national identity card matched against NADRA records.',
    descriptionUr: 'آپ کا قومی شناختی کارڈ نادرا ریکارڈ سے ملایا گیا۔',
    status: 'verified',
    statusLabel: 'Verified',
    statusUr: 'تصدیق شدہ',
  },
  {
    id: 'skills',
    icon: <FileCheck2 className="h-5 w-5" />,
    title: 'Skill certificates',
    titleUr: 'ہنر کے سرٹیفکیٹ',
    description: 'Trade certificates for HVAC and electrical work reviewed.',
    descriptionUr: 'ایچ وی اے سی اور بجلی کے کام کے سرٹیفکیٹ کا جائزہ لیا گیا۔',
    status: 'verified',
    statusLabel: 'Verified',
    statusUr: 'تصدیق شدہ',
  },
  {
    id: 'police',
    icon: <ShieldCheck className="h-5 w-5" />,
    title: 'Police character certificate',
    titleUr: 'پولیس کریکٹر سرٹیفکیٹ',
    description: 'Under review by our trust and safety team.',
    descriptionUr: 'ہماری ٹرسٹ اینڈ سیفٹی ٹیم زیرِ جائزہ ہے۔',
    status: 'pending',
    statusLabel: 'Pending',
    statusUr: 'زیرِ التوا',
  },
  {
    id: 'bank',
    icon: <Landmark className="h-5 w-5" />,
    title: 'Bank account',
    titleUr: 'بینک اکاؤنٹ',
    description: 'Add your bank details so payouts can reach you.',
    descriptionUr: 'اپنے بینک کی تفصیلات شامل کریں تاکہ ادائیگیاں آپ تک پہنچ سکیں۔',
    status: 'not_submitted',
    statusLabel: 'Not submitted',
    statusUr: 'جمع نہیں ہوا',
  },
];

const STATUS_TONE: Record<StepStatus, 'safe' | 'warn' | 'neutral'> = {
  verified: 'safe',
  pending: 'warn',
  not_submitted: 'neutral',
};

/**
 * Trust and safety checklist. Phase 1: sample state until the verification
 * endpoints land.
 */
export default function ProVerificationPage() {
  const t = useT();
  const progress = 75;

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Trust & safety"
        eyebrowUr="اعتماد اور تحفظ"
        title="Verification"
        titleUr="تصدیق"
        description="Complete each step to earn the Verified Pro badge and reach more customers."
        descriptionUr="ویرفائیڈ پرو بیج حاصل کرنے اور زیادہ گاہکوں تک پہنچنے کے لیے ہر مرحلہ مکمل کریں۔"
      />

      <Card className="border-[#00824A]/30 bg-gradient-to-br from-[#DCFCE7]/50 to-surface">
        <CardBody className="space-y-3 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]">
                <BadgeCheck className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-foreground">
                  {t('Verification progress', 'تصدیق کی پیش رفت')}
                </p>
                <p className="text-xs text-ink-500">
                  {t('3 of 4 steps complete', '4 میں سے 3 مراحل مکمل')}
                </p>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-[#00824A]">{progress}%</span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full rounded-full bg-[#00824A]" style={{ width: `${progress}%` }} />
          </div>
        </CardBody>
      </Card>

      <div className="mt-8">
        <SectionTitle urdu="تصدیق کے مراحل">Verification steps</SectionTitle>
      </div>

      <Card className="mt-4">
        <CardBody className="divide-y divide-[var(--border)] p-0">
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-surface-muted text-ink-500">
                  {step.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">{t(step.title, step.titleUr)}</p>
                  <p className="mt-0.5 max-w-md text-xs text-ink-500">
                    {t(step.description, step.descriptionUr)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge tone={STATUS_TONE[step.status]}>{t(step.statusLabel, step.statusUr)}</Badge>
                {step.status === 'verified' ? (
                  <Button variant="ghost" size="sm" className="text-[#00824A]">
                    <Eye className="h-4 w-4" />
                    {t('View', 'دیکھیں')}
                  </Button>
                ) : (
                  <Button variant={step.status === 'pending' ? 'secondary' : 'primary'} size="sm">
                    <Upload className="h-4 w-4" />
                    {t('Upload', 'اپلوڈ کریں')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </Container>
  );
}
