/**
 * What customers and professionals see for a job's and a request's state.
 * Copied word for word from the mobile app (`bookingStatusLabel` and
 * `RequestStateBadge`, English and Urdu ARB files) so the website and the app
 * name every state the same way. Admin pages keep the server's own labels.
 */

export type StatusTone = 'neutral' | 'brand' | 'warn' | 'accent';

export interface StatusName {
  en: string;
  ur: string;
  tone: StatusTone;
}

const BOOKED: StatusName = { en: 'Booked', ur: 'بک ہو گیا', tone: 'brand' };
const CANCELLED: StatusName = { en: 'Cancelled', ur: 'منسوخ', tone: 'neutral' };

const BOOKING: Record<string, StatusName> = {
  technician_on_way: { en: 'On the way', ur: 'راستے میں', tone: 'accent' },
  arrived: { en: 'Arrived', ur: 'پہنچ گئے', tone: 'accent' },
  inspection_started: { en: 'Inspecting', ur: 'معائنہ جاری', tone: 'accent' },
  quote_created: { en: 'New price to approve', ur: 'نئی قیمت منظوری کے لیے', tone: 'warn' },
  quote_accepted: { en: 'New price approved', ur: 'نئی قیمت منظور', tone: 'accent' },
  repair_started: { en: 'Work in progress', ur: 'کام جاری ہے', tone: 'accent' },
  completed: { en: 'Work completed', ur: 'کام مکمل', tone: 'warn' },
  customer_confirmed: { en: 'Done and paid', ur: 'مکمل اور ادائیگی ہو گئی', tone: 'brand' },
  disputed: { en: 'Under review', ur: 'زیرِ جائزہ', tone: 'warn' },
  cancelled: CANCELLED,
  refunded: CANCELLED,
};

/** A booking's state, as the app shows it. Early states all read "Booked". */
export function bookingStatusName(status: string): StatusName {
  return BOOKING[status] ?? BOOKED;
}

const REQUEST: Record<string, StatusName> = {
  accepting_bids: { en: 'Receiving offers', ur: 'آفرز آ رہی ہیں', tone: 'accent' },
  choosing: { en: 'Choose an offer', ur: 'آفر منتخب کریں', tone: 'warn' },
  booked: BOOKED,
  cancelled: CANCELLED,
  expired: { en: 'Expired', ur: 'ختم', tone: 'neutral' },
};

/** A request's state, as the app shows it. Unknown states read "Expired", as in the app. */
export function requestStateName(state: string): StatusName {
  return REQUEST[state] ?? REQUEST.expired;
}
