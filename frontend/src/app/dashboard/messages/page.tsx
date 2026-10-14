'use client';

import { MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { PageHeader, SectionTitle } from '@/components/dashboard/DashboardPage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { useT } from '@/components/i18n/LocaleProvider';
import { cn } from '@/lib/utils/cn';

interface Thread {
  id: string;
  name: string;
  initials: string;
  service: string;
  preview: string;
  previewUr: string;
  time: string;
  unread: number;
}

const SAMPLE_THREADS: Thread[] = [
  {
    id: 'T-1',
    name: 'Muhammad Usman',
    initials: 'MU',
    service: 'AC Inverter Servicing',
    preview: 'I am 10 minutes away, please keep the gate open.',
    previewUr: 'میں 10 منٹ کی دوری پر ہوں، گیٹ کھلا رکھیں۔',
    time: '2:18 PM',
    unread: 2,
  },
  {
    id: 'T-2',
    name: 'PakFix Support',
    initials: 'PF',
    service: 'Booking BK-9842',
    preview: 'Your warranty certificate is ready to download.',
    previewUr: 'آپ کا وارنٹی سرٹیفکیٹ ڈاؤن لوڈ کے لیے تیار ہے۔',
    time: '11:40 AM',
    unread: 0,
  },
  {
    id: 'T-3',
    name: 'Tariq Mahmood',
    initials: 'TM',
    service: 'Main DB Breaker Repair',
    preview: 'Thanks for the rating! Feel free to reach out again.',
    previewUr: 'ریٹنگ کا شکریہ! دوبارہ رابطہ ضرور کریں۔',
    time: 'Yesterday',
    unread: 0,
  },
];

export default function MessagesPage() {
  const t = useT();
  const [active, setActive] = useState(SAMPLE_THREADS[0]);
  const [draft, setDraft] = useState('');

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Inbox"
        eyebrowUr="ان باکس"
        title="Messages"
        titleUr="پیغامات"
        description="Talk to your professional and PakFix support about an active job."
        descriptionUr="جاری کام کے بارے میں اپنے پروفیشنل اور پاک فکس سپورٹ سے بات کریں۔"
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-5">
          <SectionTitle urdu="بات چیت">Conversations</SectionTitle>
          {SAMPLE_THREADS.map((thread) => {
            const isActive = active.id === thread.id;
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => setActive(thread)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[var(--radius-card)] border p-3 text-start transition-colors',
                  isActive
                    ? 'border-[#00824A] bg-[#DCFCE7]/30'
                    : 'border-[var(--border)] bg-surface hover:bg-surface-muted'
                )}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#00824A] to-[#2563EB] text-sm font-bold text-white">
                  {thread.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-foreground">{thread.name}</span>
                    <span className="shrink-0 text-[11px] text-ink-400">{thread.time}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-ink-500">{t(thread.preview, thread.previewUr)}</span>
                </span>
                {thread.unread > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DC2626] px-1.5 text-[10px] font-bold text-white">
                    {thread.unread}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-7">
          <Card className="flex h-full flex-col">
            <CardBody className="flex flex-1 flex-col p-0">
              <div className="flex items-center gap-3 border-b border-[var(--border)] p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#00824A] to-[#2563EB] text-xs font-bold text-white">
                  {active.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{active.name}</p>
                  <p className="truncate text-xs text-ink-500">{active.service}</p>
                </div>
                <Badge tone="brand">{t('Active job', 'جاری کام')}</Badge>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                <div className="max-w-[80%] rounded-2xl bg-surface-muted p-3 text-sm text-ink-700">
                  {t('Assalam-o-Alaikum, when will you reach the address?', 'السلام علیکم، آپ کب پتے پر پہنچیں گے؟')}
                </div>
                <div className="ms-auto max-w-[80%] rounded-2xl bg-[#00824A] p-3 text-sm text-white">
                  {t('Reaching in about 10 minutes, InshaAllah.', 'تقریباً 10 منٹ میں پہنچ رہا ہوں، ان شاء اللہ۔')}
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-[var(--border)] p-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t('Type a message…', 'پیغام لکھیں…')}
                  className="h-11 flex-1 rounded-[var(--radius-control)] border border-[var(--border)] bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-[#00824A]"
                />
                <Button size="icon" aria-label={t('Send', 'بھیجیں')} onClick={() => setDraft('')}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardBody>
          </Card>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-400">
            <MessageCircle className="h-3.5 w-3.5" />
            {t('Messages are kept for 90 days after a job closes.', 'کام بند ہونے کے بعد پیغامات 90 دن تک محفوظ رہتے ہیں۔')}
          </p>
        </div>
      </div>
    </Container>
  );
}
