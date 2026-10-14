'use client';

import { MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { PageHeader, SectionTitle } from '@/components/dashboard/DashboardPage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Input } from '@/components/ui/Input';
import { useT } from '@/components/i18n/LocaleProvider';
import { cn } from '@/lib/utils/cn';

interface Message {
  id: string;
  from: 'me' | 'them';
  text: string;
  textUr: string;
  time: string;
}

interface Thread {
  id: string;
  name: string;
  nameUr: string;
  initials: string;
  service: string;
  serviceUr: string;
  preview: string;
  previewUr: string;
  time: string;
  unread: number;
  messages: Message[];
}

const SAMPLE_THREADS: Thread[] = [
  {
    id: 'T-1',
    name: 'Hamza Ahmed',
    nameUr: 'حمزہ احمد',
    initials: 'HA',
    service: 'AC Inverter Cooling Repair',
    serviceUr: 'اے سی اِنورٹر کولنگ مرمت',
    preview: 'I am 10 minutes away, please keep the gate open.',
    previewUr: 'میں 10 منٹ کی دوری پر ہوں، گیٹ کھلا رکھیں۔',
    time: '2:18 PM',
    unread: 2,
    messages: [
      {
        id: 'M-1',
        from: 'them',
        text: 'Assalam-o-Alaikum, are you coming today?',
        textUr: 'السلام علیکم، آپ آج آ رہے ہیں؟',
        time: '2:10 PM',
      },
      {
        id: 'M-2',
        from: 'me',
        text: 'Walaikum Assalam, yes. I am leaving now.',
        textUr: 'وعلیکم السلام، جی ہاں۔ میں ابھی نکل رہا ہوں۔',
        time: '2:14 PM',
      },
      {
        id: 'M-3',
        from: 'them',
        text: 'I am 10 minutes away, please keep the gate open.',
        textUr: 'میں 10 منٹ کی دوری پر ہوں، گیٹ کھلا رکھیں۔',
        time: '2:18 PM',
      },
    ],
  },
  {
    id: 'T-2',
    name: 'Ayesha Khan',
    nameUr: 'عائشہ خان',
    initials: 'AK',
    service: 'Main DB Breaker Replacement',
    serviceUr: 'مین ڈی بی بریکر کی تبدیلی',
    preview: 'Please bring an original 30A breaker.',
    previewUr: 'براہِ کرم اصل 30A بریکر لے کر آئیں۔',
    time: '11:40 AM',
    unread: 1,
    messages: [
      {
        id: 'M-1',
        from: 'them',
        text: 'Please bring an original 30A breaker.',
        textUr: 'براہِ کرم اصل 30A بریکر لے کر آئیں۔',
        time: '11:40 AM',
      },
    ],
  },
  {
    id: 'T-3',
    name: 'Bilal Sheikh',
    nameUr: 'بلال شیخ',
    initials: 'BS',
    service: 'Water Motor Repair',
    serviceUr: 'واٹر موٹر مرمت',
    preview: 'Thanks for the quick fix, it is running well.',
    previewUr: 'فوری مرمت کا شکریہ، یہ ٹھیک چل رہی ہے۔',
    time: 'Yesterday',
    unread: 0,
    messages: [
      {
        id: 'M-1',
        from: 'them',
        text: 'Thanks for the quick fix, it is running well.',
        textUr: 'فوری مرمت کا شکریہ، یہ ٹھیک چل رہی ہے۔',
        time: 'Yesterday',
      },
    ],
  },
];

/**
 * Conversations with customers. Phase 1: sample threads until the messaging
 * endpoints land.
 */
export default function ProMessagesPage() {
  const t = useT();
  const [activeId, setActiveId] = useState(SAMPLE_THREADS[0].id);
  const [threads, setThreads] = useState<Message[][]>(() =>
    SAMPLE_THREADS.map((thread) => thread.messages)
  );
  const [draft, setDraft] = useState('');

  const activeIndex = SAMPLE_THREADS.findIndex((thread) => thread.id === activeId);
  const active = SAMPLE_THREADS[activeIndex];
  const messages = threads[activeIndex] ?? [];

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setThreads((current) =>
      current.map((list, index) =>
        index === activeIndex
          ? [...list, { id: `new-${list.length}`, from: 'me' as const, text, textUr: text, time: 'Now' }]
          : list
      )
    );
    setDraft('');
  };

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        eyebrow="Inbox"
        eyebrowUr="ان باکس"
        title="Messages"
        titleUr="پیغامات"
        description="Talk to customers about an active or upcoming job."
        descriptionUr="جاری یا آنے والے کام کے بارے میں گاہکوں سے بات کریں۔"
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-5">
          <SectionTitle urdu="بات چیت">Conversations</SectionTitle>
          {SAMPLE_THREADS.map((thread) => {
            const isActive = activeId === thread.id;
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => setActiveId(thread.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[var(--radius-card)] border p-3 text-left transition-colors',
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
                    <span className="truncate text-sm font-bold text-foreground">
                      {t(thread.name, thread.nameUr)}
                    </span>
                    <span className="shrink-0 text-[11px] text-ink-400">{thread.time}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-ink-500">
                    {t(thread.preview, thread.previewUr)}
                  </span>
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
                  <p className="truncate text-sm font-bold text-foreground">{t(active.name, active.nameUr)}</p>
                  <p className="truncate text-xs text-ink-500">{t(active.service, active.serviceUr)}</p>
                </div>
                <Badge tone="brand">{t('Active job', 'جاری کام')}</Badge>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((message) =>
                  message.from === 'me' ? (
                    <div
                      key={message.id}
                      className="ms-auto max-w-[80%] rounded-2xl bg-[#00824A] p-3 text-sm text-white"
                    >
                      {t(message.text, message.textUr)}
                    </div>
                  ) : (
                    <div
                      key={message.id}
                      className="max-w-[80%] rounded-2xl bg-surface-muted p-3 text-sm text-ink-700"
                    >
                      {t(message.text, message.textUr)}
                    </div>
                  )
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-[var(--border)] p-3">
                <Input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') send();
                  }}
                  placeholder={t('Type a message…', 'پیغام لکھیں…')}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  aria-label={t('Send', 'بھیجیں')}
                  onClick={send}
                  disabled={draft.trim().length === 0}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardBody>
          </Card>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-400">
            <MessageCircle className="h-3.5 w-3.5" />
            {t(
              'Messages are kept for 90 days after a job closes.',
              'کام بند ہونے کے بعد پیغامات 90 دن تک محفوظ رہتے ہیں۔'
            )}
          </p>
        </div>
      </div>
    </Container>
  );
}
