'use client';

import { useQuery } from '@tanstack/react-query';
import { chatApi, notificationsApi } from '@/lib/api/marketplace';

export type NavCountKey = 'messages' | 'notifications';

/** Unread chat messages and notifications for the menu badges, refreshed every 30 s. */
export function useNavCounts(): Record<NavCountKey, number> {
  const messages = useQuery({ queryKey: ['nav-unread-messages'], queryFn: chatApi.unread, refetchInterval: 30_000, retry: false });
  const notifications = useQuery({ queryKey: ['nav-unread-notifications'], queryFn: notificationsApi.unread, refetchInterval: 30_000, retry: false });
  return { messages: messages.data ?? 0, notifications: notifications.data ?? 0 };
}

/** "9+" past nine, like the app's badges. */
export function badgeText(count: number): string {
  return count > 9 ? '9+' : String(count);
}
