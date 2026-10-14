import {
  Bell,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  FileText,
  Heart,
  LayoutDashboard,
  MessageCircle,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  Wallet,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '@/lib/api/types';

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
}

export interface NavSection {
  heading: string | null;
  headingUr: string | null;
  items: NavItem[];
}

/** Customer and property-manager sidebar. */
export const CUSTOMER_NAV: NavSection[] = [
  {
    heading: null,
    headingUr: null,
    items: [
      { href: '/dashboard', label: 'Overview', labelUr: 'جائزہ', icon: LayoutDashboard, exact: true },
      { href: '/ai', label: 'Ask PakFix AI', labelUr: 'پاک فکس اے آئی سے پوچھیں', icon: Sparkles },
      { href: '/dashboard/bookings', label: 'Bookings', labelUr: 'بکنگ', icon: CalendarCheck },
    ],
  },
  {
    heading: 'My home',
    headingUr: 'میرا گھر',
    items: [
      { href: '/dashboard/properties', label: 'Properties', labelUr: 'پراپرٹیز', icon: Building2 },
      { href: '/dashboard/maintenance', label: 'Maintenance', labelUr: 'دیکھ بھال', icon: Wrench },
      { href: '/dashboard/quotes', label: 'Quotes', labelUr: 'کوٹیشن', icon: FileText },
    ],
  },
  {
    heading: 'Account',
    headingUr: 'اکاؤنٹ',
    items: [
      { href: '/dashboard/messages', label: 'Messages', labelUr: 'پیغامات', icon: MessageCircle },
      { href: '/dashboard/payments', label: 'Payments', labelUr: 'ادائیگیاں', icon: CreditCard },
      { href: '/dashboard/saved', label: 'Saved professionals', labelUr: 'محفوظ پروفیشنلز', icon: Heart },
      { href: '/dashboard/reviews', label: 'Reviews', labelUr: 'جائزے', icon: Star },
      { href: '/dashboard/notifications', label: 'Notifications', labelUr: 'اطلاعات', icon: Bell },
      { href: '/dashboard/profile', label: 'Profile', labelUr: 'پروفائل', icon: User },
      { href: '/dashboard/settings', label: 'Settings', labelUr: 'ترتیبات', icon: Settings },
    ],
  },
];

export const CUSTOMER_BOTTOM_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Home', labelUr: 'ہوم', icon: LayoutDashboard, exact: true },
  { href: '/ai', label: 'Ask AI', labelUr: 'اے آئی سے پوچھیں', icon: Sparkles },
  { href: '/dashboard/bookings', label: 'Bookings', labelUr: 'بکنگ', icon: CalendarCheck },
  { href: '/dashboard/messages', label: 'Messages', labelUr: 'پیغامات', icon: MessageCircle },
  { href: '/dashboard/profile', label: 'Profile', labelUr: 'پروفائل', icon: User },
];

/**
 * Technician and service-company sidebar. Their whole working day lives under
 * `/pro`, so those are the only links that appear.
 */
export const PRO_NAV: NavSection[] = [
  {
    heading: null,
    headingUr: null,
    items: [
      { href: '/pro', label: 'Overview', labelUr: 'جائزہ', icon: LayoutDashboard, exact: true },
      { href: '/pro/jobs', label: 'Job board', labelUr: 'جاب بورڈ', icon: Briefcase },
    ],
  },
  {
    heading: 'Work',
    headingUr: 'کام',
    items: [
      { href: '/pro/schedule', label: 'Schedule', labelUr: 'شیڈول', icon: CalendarDays },
      { href: '/pro/earnings', label: 'Earnings', labelUr: 'کمائی', icon: Wallet },
      { href: '/pro/reviews', label: 'Reviews', labelUr: 'جائزے', icon: Star },
    ],
  },
  {
    heading: 'Account',
    headingUr: 'اکاؤنٹ',
    items: [
      { href: '/pro/verification', label: 'Verification', labelUr: 'تصدیق', icon: ShieldCheck },
      { href: '/pro/messages', label: 'Messages', labelUr: 'پیغامات', icon: MessageCircle },
      { href: '/pro/profile', label: 'Public profile', labelUr: 'عوامی پروفائل', icon: User },
      { href: '/pro/settings', label: 'Settings', labelUr: 'ترتیبات', icon: Settings },
    ],
  },
];

export const PRO_BOTTOM_NAV: NavItem[] = [
  { href: '/pro', label: 'Home', labelUr: 'ہوم', icon: LayoutDashboard, exact: true },
  { href: '/pro/jobs', label: 'Jobs', labelUr: 'کام', icon: Briefcase },
  { href: '/pro/schedule', label: 'Schedule', labelUr: 'شیڈول', icon: CalendarDays },
  { href: '/pro/earnings', label: 'Earnings', labelUr: 'کمائی', icon: Wallet },
  { href: '/pro/profile', label: 'Profile', labelUr: 'پروفائل', icon: User },
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
