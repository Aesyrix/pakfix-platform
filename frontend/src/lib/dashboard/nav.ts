import {
  Bell,
  Briefcase,
  CalendarCheck,
  Clock,
  FileText,
  HandCoins,
  LayoutDashboard,
  MessageCircle,
  PlusCircle,
  Repeat,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/lib/api/types';
import type { NavCountKey } from '@/lib/dashboard/useNavCounts';

/**
 * Navigation shared by the account dashboards.
 *
 * One place describes what each kind of user sees, so the sidebar and the
 * mobile bottom bar cannot drift apart. Every link here must resolve to a real
 * page; a nav item pointing at a 404 is worse than no item at all.
 */
export interface NavItem {
  href: string;
  label: string;
  labelUr: string;
  icon: LucideIcon;
  /** Match the path exactly instead of by prefix. */
  exact?: boolean;
  /** Shows an unread badge from useNavCounts. */
  count?: NavCountKey;
}

export interface NavSection {
  heading: string | null;
  headingUr: string | null;
  items: NavItem[];
}

/**
 * Customer sidebar: the app's tabs (Home, Requests, Messages, Account) plus
 * the pages the app reaches from them. Pages the website does not offer yet
 * stay out of the menu. A professional in Customer mode sees the same menu.
 */
export const CUSTOMER_NAV: NavSection[] = [
  {
    heading: null,
    headingUr: null,
    items: [
      { href: '/dashboard', label: 'Home', labelUr: 'ہوم', icon: LayoutDashboard, exact: true },
      { href: '/dashboard/requests/new', label: 'Post a request', labelUr: 'درخواست دیں', icon: PlusCircle, exact: true },
      { href: '/dashboard/requests', label: 'Requests', labelUr: 'درخواستیں', icon: FileText },
      { href: '/dashboard/bookings', label: 'Bookings', labelUr: 'بکنگ', icon: CalendarCheck },
      { href: '/dashboard/messages', label: 'Messages', labelUr: 'پیغامات', icon: MessageCircle, count: 'messages' },
      { href: '/dashboard/notifications', label: 'Notifications', labelUr: 'اطلاعات', icon: Bell, count: 'notifications' },
      { href: '/ai', label: 'Ask PakFix AI', labelUr: 'پاک فکس اے آئی سے پوچھیں', icon: Sparkles },
    ],
  },
  {
    heading: 'Account',
    headingUr: 'اکاؤنٹ',
    items: [
      { href: '/dashboard/profile', label: 'Profile', labelUr: 'پروفائل', icon: User },
      { href: '/dashboard/settings', label: 'Settings', labelUr: 'ترتیبات', icon: Settings },
    ],
  },
];

export const CUSTOMER_BOTTOM_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Home', labelUr: 'ہوم', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/requests', label: 'Requests', labelUr: 'درخواستیں', icon: FileText },
  { href: '/dashboard/messages', label: 'Messages', labelUr: 'پیغامات', icon: MessageCircle, count: 'messages' },
  { href: '/dashboard/notifications', label: 'Notifications', labelUr: 'اطلاعات', icon: Bell, count: 'notifications' },
  { href: '/dashboard/profile', label: 'Account', labelUr: 'اکاؤنٹ', icon: User },
];

/**
 * Professional sidebar: the app's Pro tabs (Jobs, Offers, My jobs, Account)
 * and their pages, plus a way into Customer mode.
 */
export const PRO_NAV: NavSection[] = [
  {
    heading: null,
    headingUr: null,
    items: [
      { href: '/pro', label: 'Home', labelUr: 'ہوم', icon: LayoutDashboard, exact: true },
      { href: '/pro/jobs', label: 'Jobs', labelUr: 'کام', icon: Briefcase },
      { href: '/pro/offers', label: 'My offers', labelUr: 'میری آفرز', icon: HandCoins },
      { href: '/pro/bookings', label: 'My jobs', labelUr: 'میرے کام', icon: CalendarCheck },
      { href: '/pro/messages', label: 'Messages', labelUr: 'پیغامات', icon: MessageCircle, count: 'messages' },
      { href: '/pro/notifications', label: 'Notifications', labelUr: 'اطلاعات', icon: Bell, count: 'notifications' },
    ],
  },
  {
    heading: 'Work',
    headingUr: 'کام',
    items: [
      { href: '/pro/schedule', label: 'Availability', labelUr: 'دستیابی', icon: Clock },
      { href: '/pro/verification', label: 'Verification', labelUr: 'تصدیق', icon: ShieldCheck },
    ],
  },
  {
    heading: 'Account',
    headingUr: 'اکاؤنٹ',
    items: [
      { href: '/pro/profile', label: 'Profile', labelUr: 'پروفائل', icon: User },
      { href: '/pro/settings', label: 'Settings', labelUr: 'ترتیبات', icon: Settings },
      { href: '/dashboard', label: 'Switch to customer mode', labelUr: 'کسٹمر موڈ پر جائیں', icon: Repeat, exact: true },
    ],
  },
];

export const PRO_BOTTOM_NAV: NavItem[] = [
  { href: '/pro/jobs', label: 'Jobs', labelUr: 'کام', icon: Briefcase },
  { href: '/pro/offers', label: 'Offers', labelUr: 'آفرز', icon: HandCoins },
  { href: '/pro/bookings', label: 'My jobs', labelUr: 'میرے کام', icon: CalendarCheck },
  { href: '/pro/messages', label: 'Messages', labelUr: 'پیغامات', icon: MessageCircle, count: 'messages' },
  { href: '/pro/profile', label: 'Account', labelUr: 'اکاؤنٹ', icon: User },
];

/** True when the user belongs to the customer-style dashboard. */
export function isCustomerRole(role: UserRole | null | undefined): boolean {
  return role === 'customer' || role === 'property_manager' || role == null;
}

/** True when the user belongs to the professional dashboard. */
export function isProRole(role: UserRole | null | undefined): boolean {
  return role === 'technician' || role === 'company';
}

/** Which sidebar a role gets, resolved from its primary role then its roles. */
export function navForUser(primary: UserRole | null | undefined, roles: UserRole[] = []): NavSection[] {
  if (isProRole(primary) || (!primary && roles.some(isProRole))) return PRO_NAV;
  return CUSTOMER_NAV;
}
