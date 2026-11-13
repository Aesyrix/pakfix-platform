'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, CheckCheck, Flag, ImagePlus, MessageCircle, Send, ShieldAlert, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocale, useT } from '@/components/i18n/LocaleProvider';
import { BlockDialog, ReportDialog, errorText } from '@/components/jobs/JobDialogs';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { chatApi, safetyApi, type ChatMessage, type ChatMeta, type Conversation } from '@/lib/api/marketplace';
import { useAppText } from '@/lib/i18n/app-text';
import { cn } from '@/lib/utils/cn';

export type ChatArea = 'dashboard' | 'pro';

const MAX_BODY = 2000;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Conversations list (the app's ConversationsScreen)
// ---------------------------------------------------------------------------

export function ConversationList({ area }: { area: ChatArea }) {
  const t = useAppText();
  const { locale } = useLocale();
  const query = useQuery({ queryKey: ['conversations'], queryFn: chatApi.conversations, refetchInterval: 10_000 });

  if (query.isPending) return <SkeletonCard />;
  if (query.isError) return <ErrorState description={t('errorGeneric')} onRetry={() => query.refetch()} />;
  // Each area lists its own side of the chats: a pro in Customer mode sees their bookings as a customer.
  const items = query.data.items.filter((c) => (area === 'pro' ? c.role === 'technician' : c.role === 'customer'));
  if (items.length === 0) {
    return <EmptyState icon={<MessageCircle className="h-5 w-5" />} title={t('messagesEmptyTitle')} description={t('messagesEmptyBody')} />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((c) => (
        <li key={c.booking_id}>
          <ConversationRow c={c} area={area} locale={locale} />
        </li>
      ))}
    </ul>
  );
}

function ConversationRow({ c, area, locale }: { c: Conversation; area: ChatArea; locale: string }) {
  const t = useAppText();
  const subtitle = c.role === 'customer' ? t('chatWithCustomer', { reference: c.reference }) : t('chatWithPro', { reference: c.reference });
  const text = c.last_message ? (c.last_message.preview ?? `📷 ${t('chatPhoto')}`) : null;
  const preview = text ? (c.last_message?.mine ? t('chatYou', { text }) : text) : null;
  return (
    <Link href={`/${area === 'pro' ? 'pro' : 'dashboard'}/messages/chat?id=${c.booking_id}`} className="block">
      <Card interactive>
        <CardBody className="flex items-center gap-3">
          <Avatar name={c.with.name} url={c.with.avatar_url} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-semibold">{c.with.name ?? '—'}</p>
              {c.last_message ? <span className="shrink-0 text-xs text-ink-500">{shortDay(t, c.last_message.created_at, locale)}</span> : null}
            </div>
            <p className="truncate text-xs text-ink-500">{[c.category, subtitle].filter(Boolean).join(' · ')}</p>
            {preview ? <p className={cn('truncate text-sm', c.unread_count > 0 ? 'font-semibold text-ink-900' : 'text-ink-600')}>{preview}</p> : null}
          </div>
          {c.unread_count > 0 ? (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent-solid px-1.5 text-xs font-bold text-white" aria-label={t('chatUnread', { count: c.unread_count })}>
              {c.unread_count}
            </span>
          ) : null}
        </CardBody>
      </Card>
    </Link>
  );
}

function Avatar({ name, url }: { name: string | null; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- avatars come from the API host
    return <img src={url} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 font-bold text-brand-700" aria-hidden="true">
      {(name ?? '?').charAt(0).toUpperCase()}
    </span>
  );
}

// ---------------------------------------------------------------------------
// One chat (the app's ChatScreen)
// ---------------------------------------------------------------------------

export function ChatThread({ bookingId, area }: { bookingId: string; area: ChatArea }) {
  const t = useAppText();
  const tSite = useT();
  const { locale } = useLocale();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chat, setChat] = useState<ChatMeta | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | 'report' | 'block'>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const lastId = useRef<string | undefined>(undefined);

  // First load, then every 4 s only what is new (like the app).
  useEffect(() => {
    let alive = true;
    lastId.current = undefined;
    async function load(initial: boolean) {
      try {
        const page = await chatApi.messages(bookingId, initial ? undefined : lastId.current);
        if (!alive) return;
        setChat(page.chat);
        if (page.items.length > 0) {
          setMessages((prev) => merge(initial ? [] : prev, page.items));
          lastId.current = page.items[page.items.length - 1].id;
        } else if (initial) {
          setMessages([]);
        }
        setState('ready');
        void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      } catch {
        if (alive && initial) setState('error');
      }
    }
    void load(true);
    const timer = window.setInterval(() => void load(false), 4000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [bookingId, queryClient]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const body = text.trim();
    if ((!body && !photo) || sending) return;
    setSending(true);
    try {
      const sent = await chatApi.send(bookingId, body || null, photo);
      setMessages((prev) => merge(prev, [sent]));
      lastId.current = sent.id;
      setText('');
      setPhoto(null);
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setSending(false);
    }
  }

  async function unblock() {
    try {
      await safetyApi.unblock(bookingId);
      toast.success(t('sfUnblocked'));
      setChat((c) => (c ? { ...c, blocked: null } : c));
    } catch (e) {
      toast.error(errorText(e));
    }
  }

  if (state === 'loading') return <SkeletonCard />;
  if (state === 'error' || !chat) return <ErrorState description={t('errorGeneric')} />;

  const name = chat.with.name ?? (chat.role === 'customer' ? t('bkYourPro') : t('bkCustomer'));
  const jobHref = area === 'pro' ? `/pro/bookings/view?id=${bookingId}` : `/dashboard/bookings/view?id=${bookingId}`;
  const subtitle = chat.role === 'customer' ? t('chatWithCustomer', { reference: chat.reference }) : t('chatWithPro', { reference: chat.reference });

  return (
    <div className="flex h-[calc(100dvh-10rem)] min-h-[28rem] flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Avatar name={chat.with.name} url={chat.with.avatar_url} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{name}</p>
          <Link href={jobHref} className="truncate text-xs text-brand-700 hover:underline">
            {[chat.category, subtitle].filter(Boolean).join(' · ')}
          </Link>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setDialog('report')} aria-label={t('sfReportPerson', { name })}>
          <Flag className="h-4 w-4" aria-hidden="true" />
        </Button>
        {chat.blocked === 'by_me' ? (
          <Button variant="ghost" size="sm" onClick={unblock}>
            {t('sfUnblock')}
          </Button>
        ) : chat.blocked === null ? (
          <Button variant="ghost" size="sm" onClick={() => setDialog('block')} className="text-danger-600">
            {t('sfBlock')}
          </Button>
        ) : null}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
        <div className="mx-auto mb-4 flex max-w-md items-start gap-2 rounded-xl bg-surface-muted p-3 text-xs text-ink-600">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
          {t('chatSafety')}
        </div>
        {messages.length === 0 ? <p className="text-center text-sm text-ink-500">{t('chatEmpty')}</p> : null}
        <ol className="flex flex-col gap-2">
          {messages.map((m, index) => {
            const day = dayLabel(t, m.created_at, locale);
            const showDay = index === 0 || dayLabel(t, messages[index - 1].created_at, locale) !== day;
            return (
              <li key={m.id}>
                {showDay ? <p className="my-2 text-center text-xs font-medium text-ink-500">{day}</p> : null}
                <Bubble message={m} locale={locale} onReport={() => setReportMessage(m.id)} />
              </li>
            );
          })}
        </ol>
        <div ref={bottom} />
      </div>

      {/* Composer, or why there is none */}
      {chat.blocked === 'by_me' ? (
        <p className="border-t border-line px-4 py-3 text-center text-sm text-ink-600">{t('sfYouBlocked', { name })}</p>
      ) : chat.blocked === 'by_them' ? (
        <p className="border-t border-line px-4 py-3 text-center text-sm text-ink-600">{t('sfCantMessage')}</p>
      ) : !chat.can_send ? (
        <p className="border-t border-line px-4 py-3 text-center text-sm text-ink-600">{t('chatClosed')}</p>
      ) : (
        <form onSubmit={send} className="border-t border-line p-3">
          {photo ? (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-brand-50 px-3 py-1.5 text-xs text-brand-800">
              <span className="truncate">📷 {photo.name}</span>
              <button type="button" onClick={() => setPhoto(null)} aria-label={t('actionCancel')}>
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}
          <div className="flex items-end gap-2">
            <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-line text-ink-600 hover:bg-surface-muted" title={t('chatGallery')}>
              <ImagePlus className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">{t('chatGallery')}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  e.target.value = '';
                  if (file && file.size > MAX_PHOTO_BYTES) {
                    toast.error(t('errorGeneric'));
                    return;
                  }
                  setPhoto(file);
                }}
              />
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_BODY))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              rows={1}
              placeholder={t('chatHint')}
              aria-label={t('chatHint')}
              className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand-600"
            />
            <Button type="submit" className="h-11 w-11 shrink-0 px-0" loading={sending} disabled={!text.trim() && !photo} aria-label={tSite('Send', 'بھیجیں')}>
              <Send className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </form>
      )}

      <ReportDialog open={dialog === 'report'} onClose={() => setDialog(null)} bookingId={bookingId} name={name} onBlocked={() => setChat((c) => (c ? { ...c, blocked: 'by_me' } : c))} />
      <ReportDialog open={reportMessage !== null} onClose={() => setReportMessage(null)} bookingId={bookingId} name={name} messageId={reportMessage ?? undefined} onBlocked={() => setChat((c) => (c ? { ...c, blocked: 'by_me' } : c))} />
      <BlockDialog open={dialog === 'block'} onClose={() => setDialog(null)} bookingId={bookingId} name={name} onBlocked={() => { setDialog(null); setChat((c) => (c ? { ...c, blocked: 'by_me' } : c)); }} />
    </div>
  );
}

function Bubble({ message: m, locale, onReport }: { message: ChatMessage; locale: string; onReport: () => void }) {
  const t = useAppText();
  const time = new Intl.DateTimeFormat(locale === 'ur' ? 'ur-PK' : 'en-PK', { hour: 'numeric', minute: '2-digit' }).format(new Date(m.created_at));
  return (
    <div className={cn('group flex items-end gap-1.5', m.mine ? 'justify-end' : 'justify-start')}>
      {!m.mine ? (
        <button type="button" onClick={onReport} className="order-last rounded p-1 text-ink-400 opacity-0 hover:text-danger-600 focus:opacity-100 group-hover:opacity-100" aria-label={t('sfReportMessage')}>
          <Flag className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : null}
      <div className={cn('max-w-[80%] rounded-2xl px-3.5 py-2 text-sm', m.mine ? 'rounded-ee-sm bg-brand-solid text-white' : 'rounded-es-sm bg-surface-muted text-ink-900')}>
        {m.photo ? <ChatPhoto path={m.photo.path} /> : null}
        {m.body ? <p className="whitespace-pre-wrap break-words">{m.body}</p> : null}
        <p className={cn('mt-0.5 flex items-center justify-end gap-1 text-[10px]', m.mine ? 'text-white/75' : 'text-ink-500')}>
          {time}
          {m.mine ? m.read ? <CheckCheck className="h-3 w-3" aria-hidden="true" /> : <Check className="h-3 w-3" aria-hidden="true" /> : null}
        </p>
      </div>
    </div>
  );
}

/** A chat photo needs the sign-in token, so it is fetched, then shown. */
function ChatPhoto({ path }: { path: string }) {
  const t = useAppText();
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    let objectUrl: string | null = null;
    chatApi
      .photoUrl(path)
      .then((u) => {
        objectUrl = u;
        if (alive) setUrl(u);
        else URL.revokeObjectURL(u);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);
  if (failed) return <p className="text-xs opacity-75">📷 {t('chatPhoto')}</p>;
  if (!url) return <div className="mb-1 h-40 w-56 max-w-full animate-pulse rounded-xl bg-black/10" />;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="mb-1 block">
      {/* eslint-disable-next-line @next/next/no-img-element -- a local object URL */}
      <img src={url} alt={t('chatPhoto')} className="max-h-72 w-auto max-w-full rounded-xl object-cover" />
    </a>
  );
}

/** Keeps messages in order with no duplicates. */
function merge(prev: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map(prev.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

function dayLabel(t: ReturnType<typeof useAppText>, iso: string, locale: string): string {
  const d = new Date(iso);
  const today = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(today) - startOf(d)) / 86_400_000);
  if (diff === 0) return t('chatToday');
  if (diff === 1) return t('chatYesterday');
  return new Intl.DateTimeFormat(locale === 'ur' ? 'ur-PK' : 'en-PK', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
}

function shortDay(t: ReturnType<typeof useAppText>, iso: string, locale: string): string {
  const d = new Date(iso);
  const label = dayLabel(t, iso, locale);
  if (label === t('chatToday')) {
    return new Intl.DateTimeFormat(locale === 'ur' ? 'ur-PK' : 'en-PK', { hour: 'numeric', minute: '2-digit' }).format(d);
  }
  return label;
}
