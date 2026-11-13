/**
 * The marketplace as the website uses it: customers post jobs and choose
 * offers, professionals send offers and run their jobs, both sides chat, and
 * everyone has a notifications inbox. Every call and payload here matches the
 * mobile app's repositories (lib/features/*_repository.dart) and the Laravel
 * resources (JobRequestResource, QuoteResource, BookingResource), so the two
 * clients can never drift apart.
 */
import { api, apiRequest, getToken, apiBaseUrl } from './client';

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

export interface Money {
  minor: number;
  display: string;
}

export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface ProfessionalCard {
  id: string;
  slug?: string;
  name: string;
  avatar_url: string | null;
  is_verified: boolean;
  rating_average: number;
  rating_count: number;
  completed_jobs_count: number;
  years_experience?: number | null;
  city?: string | null;
}

/** sent · accepted · rejected · withdrawn · expired */
export type OfferStatus = 'sent' | 'accepted' | 'rejected' | 'withdrawn' | 'expired' | string;

export interface Offer {
  id: string;
  reference: string;
  status: OfferStatus;
  is_actionable: boolean;
  visit_fee: Money;
  labour: Money;
  materials: Money;
  total: Money;
  arrival_minutes: number | null;
  estimated_minutes: number | null;
  notes: string | null;
  sent_at: string | null;
  responded_at: string | null;
  booking_id?: string | null;
  booking_status?: string | null;
  request?: JobRequest;
  professional?: ProfessionalCard | null;
}

export type RequestState = 'accepting_bids' | 'choosing' | 'booked' | 'cancelled' | 'expired';

export interface JobRequest {
  id: string;
  reference: string;
  state: RequestState | string;
  accepting_bids: boolean;
  category?: CategoryRef;
  description: string;
  urgency: 'flexible' | 'standard' | 'urgent' | 'emergency' | string;
  city?: { id: number; name: string };
  area?: { id: number; name: string } | null;
  customer_offer: Money | null;
  preferred_date: string | null;
  preferred_time_slot: string | null;
  quotes_count: number;
  expires_at: string | null;
  accept_until: string | null;
  created_at: string | null;
  // The customer's own request only:
  address_line?: string;
  landmark?: string | null;
  latitude?: number;
  longitude?: number;
  booking?: { id: string; reference: string; status: string } | null;
  quotes?: Offer[];
  // A professional looking at it:
  distance_km?: number | null;
  customer_first_name?: string | null;
  my_quote?: Offer | null;
}

/** What the server says this person may do with a booking right now. */
export type BookingAction =
  | 'on_way'
  | 'arrived'
  | 'inspecting'
  | 'working'
  | 'completed'
  | 'revised_quote'
  | 'cancel'
  | 'confirm_done'
  | 'dispute'
  | 'review'
  | 'confirm'
  | 'accept_quote'
  | 'reject_quote'
  | 'mark_done'
  | 'no_show';

export interface Booking {
  id: string;
  reference: string;
  status: string;
  status_label: string;
  is_active: boolean;
  actions: BookingAction[];
  category?: CategoryRef;
  problem_description: string;
  urgency: string | null;
  preferred_date: string | null;
  preferred_time_slot: string | null;
  address_line: string | null;
  landmark: string | null;
  city?: { id: number; name: string };
  latitude: number | null;
  longitude: number | null;
  visit_fee: Money;
  labour: Money;
  materials: Money;
  total: Money;
  payment_method: string | null;
  payment_status: string | null;
  cancellation_reason: string | null;
  times: {
    accepted_at: string | null;
    on_way_at: string | null;
    arrived_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    confirmed_at: string | null;
    cancelled_at: string | null;
  };
  created_at: string | null;
  /** The customer's code for the professional; null for the professional and once finished. */
  completion_code: string | null;
  completed_via: 'code' | 'customer' | 'professional' | 'auto' | string | null;
  deadlines: {
    auto_complete_at: string | null;
    auto_confirm_at: string | null;
    dispute_until: string | null;
    no_show_from: string | null;
  };
  dispute?: {
    id: string;
    reference: string;
    kind: string;
    raised_by_role: string;
    status: string;
    outcome: string | null;
    resolution_note: string | null;
    created_at: string | null;
    resolved_at: string | null;
  } | null;
  pending_quote?: {
    id: string;
    reference: string;
    visit_fee: Money;
    labour: Money;
    materials: Money;
    total: Money;
    notes: string | null;
    sent_at: string | null;
  } | null;
  review?: {
    id: string;
    rating: number;
    comment: string | null;
    would_recommend: boolean | null;
    response: string | null;
    created_at: string | null;
  } | null;
  professional?: ProfessionalCard | null;
  customer_first_name?: string | null;
  /** Each status change: who made it and when (loaded on the detail page). */
  timeline?: Array<{ status: string; actor_role: string | null; note: string | null; at: string | null }>;
}

export interface Conversation {
  booking_id: string;
  reference: string;
  status: string;
  category: string | null;
  role: 'customer' | 'technician';
  with: { name: string | null; avatar_url: string | null };
  last_message: { preview: string | null; has_photo: boolean; mine: boolean; created_at: string } | null;
  unread_count: number;
  blocked: 'by_me' | 'by_them' | null;
  can_send: boolean;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  body: string | null;
  mine: boolean;
  from: 'customer' | 'technician';
  photo: { path: string; mime: string | null } | null;
  /** For my own messages: whether the other person has read it. */
  read: boolean | null;
  created_at: string;
}

export interface ChatMeta {
  booking_id: string;
  reference: string;
  status: string;
  category: string | null;
  role: 'customer' | 'technician';
  with: { name: string | null; avatar_url: string | null };
  can_send: boolean;
  closes_at: string | null;
  blocked: 'by_me' | 'by_them' | null;
}

export interface InboxNotification {
  id: string;
  type: 'new_job' | 'new_offer' | 'offer_accepted' | 'job_update' | 'verification' | 'review' | string;
  title: { en: string; ur: string };
  body: { en: string | null; ur: string | null };
  route: string | null;
  /** The same thing on the website, or null when it has no page here. */
  web_path: string | null;
  read: boolean;
  created_at: string | null;
}

export interface NewJobRequest {
  service_category_id: string;
  description: string;
  city_id: number;
  address_line: string;
  landmark: string | null;
  latitude: number;
  longitude: number;
  urgency: 'standard' | 'urgent' | 'emergency';
  customer_offer_minor: number | null;
  preferred_time_slot: string | null;
}

export interface NewOffer {
  /** Take the customer's own price as it is. */
  accept_offer?: boolean;
  visit_fee_minor?: number | null;
  labour_minor?: number | null;
  materials_minor?: number | null;
  arrival_minutes?: number | null;
  notes?: string | null;
}

/** Why someone is reported (UserReport::REASONS). */
export const REPORT_REASONS = ['harassment', 'inappropriate', 'spam', 'fraud', 'safety', 'off_platform', 'other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

const PAGE = { per_page: 50 };

/** Customer: requests, offers and bookings (also a professional in Customer mode). */
export const customerApi = {
  requests: () => api.get<JobRequest[]>('requests', { query: PAGE }),
  request: (id: string) => api.get<JobRequest>(`requests/${id}`),
  postRequest: (input: NewJobRequest) => api.post<JobRequest>('requests', input),
  cancelRequest: (id: string) => api.post<null>(`requests/${id}/cancel`),
  acceptOffer: (offerId: string) =>
    api.post<{ booking: { id: string; reference: string; status: string; total: Money } }>(`quotes/${offerId}/accept`),
  declineOffer: (offerId: string) => api.post<null>(`quotes/${offerId}/reject`),

  bookings: () => api.get<Booking[]>('bookings', { query: PAGE }),
  booking: (id: string) => api.get<Booking>(`bookings/${id}`),
  cancelBooking: (id: string, reason: string | null) => api.post<Booking>(`bookings/${id}/cancel`, { reason }),
  confirm: (id: string) => api.post<Booking>(`bookings/${id}/confirm`),
  markDone: (id: string) => api.post<Booking>(`bookings/${id}/done`),
  dispute: (id: string, kind: 'problem' | 'no_show', description: string) =>
    api.post<Booking>(`bookings/${id}/dispute`, { kind, description }),
  acceptRevisedPrice: (id: string) => api.post<Booking>(`bookings/${id}/revised-quote/accept`),
  rejectRevisedPrice: (id: string) => api.post<Booking>(`bookings/${id}/revised-quote/reject`),
  review: (id: string, rating: number, comment: string | null, wouldRecommend: boolean | null) =>
    api.post<Booking>(`bookings/${id}/review`, { rating, comment, would_recommend: wouldRecommend }),
};

/** Professional: jobs near them, their offers and their booked jobs. */
export const proApi = {
  /** Jobs this professional can offer on, and the radius they are matched within. */
  nearby: () =>
    apiRequest<JobRequest[]>('pro/requests').then((r) => ({ items: r.data, radiusKm: Number(r.meta?.radius_km ?? 20) })),
  job: (id: string) => api.get<JobRequest>(`pro/requests/${id}`),
  sendOffer: (requestId: string, offer: NewOffer) => api.post<Offer>(`pro/requests/${requestId}/quotes`, offer),
  offers: () => api.get<Offer[]>('pro/quotes', { query: PAGE }),
  withdrawOffer: (offerId: string) => api.post<null>(`pro/quotes/${offerId}/withdraw`),

  bookings: () => api.get<Booking[]>('pro/bookings', { query: PAGE }),
  booking: (id: string) => api.get<Booking>(`pro/bookings/${id}`),
  /** on_way · arrived · inspecting · working · completed (with the customer's code, and where they are). */
  advance: (id: string, step: string, extra: { code?: string; latitude?: number; longitude?: number } = {}) =>
    api.post<Booking>(`pro/bookings/${id}/status`, {
      step,
      ...(extra.code ? { code: extra.code } : {}),
      ...(extra.latitude !== undefined && extra.longitude !== undefined
        ? { latitude: extra.latitude, longitude: extra.longitude }
        : {}),
    }),
  revisedPrice: (id: string, labourMinor: number, materialsMinor: number, notes: string | null) =>
    api.post<Booking>(`pro/bookings/${id}/revised-quote`, { labour_minor: labourMinor, materials_minor: materialsMinor, notes }),
  confirm: (id: string) => api.post<Booking>(`pro/bookings/${id}/confirm`),
  cancel: (id: string, reason: string) => api.post<Booking>(`pro/bookings/${id}/cancel`, { reason }),
  dispute: (id: string, kind: 'not_paid' | 'not_done' | 'problem', description: string) =>
    api.post<Booking>(`pro/bookings/${id}/dispute`, { kind, description }),
  respondToReview: (id: string, response: string) => api.post<Booking>(`pro/bookings/${id}/review-response`, { response }),
};

/** Chat between the two people on a booking. */
export const chatApi = {
  conversations: () =>
    apiRequest<Conversation[]>('conversations').then((r) => ({
      items: r.data,
      unreadTotal: Number(r.meta?.unread_total ?? 0),
    })),
  unread: () => api.get<{ unread_total: number }>('conversations/unread').then((d) => d.unread_total),
  messages: (bookingId: string, after?: string) =>
    apiRequest<ChatMessage[]>(`bookings/${bookingId}/messages`, { query: { after } }).then((r) => ({
      items: r.data,
      chat: (r.meta?.chat ?? null) as ChatMeta | null,
    })),
  send: (bookingId: string, body: string | null, photo: File | null) => {
    const form = new FormData();
    if (body) form.append('body', body);
    if (photo) form.append('photo', photo);
    return api.post<ChatMessage>(`bookings/${bookingId}/messages`, form);
  },
  /** A chat photo needs the sign-in token, so it is fetched and shown as a local URL. */
  photoUrl: async (path: string): Promise<string> => {
    const token = getToken();
    const response = await fetch(`${apiBaseUrl()}/${path}`, {
      headers: { Accept: 'image/*', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('photo');
    return URL.createObjectURL(await response.blob());
  },
};

/** Reporting or blocking the other person on a booking. */
export interface BlockedPerson {
  user_id: string;
  name: string;
  blocked_at: string;
}

export const safetyApi = {
  blocked: () => api.get<BlockedPerson[]>('blocks'),
  unblockPerson: (userId: string) => apiRequest<null>(`blocks/${userId}`, { method: 'DELETE' }),
  report: (bookingId: string, reason: ReportReason, details: string | null, messageId?: string) =>
    api.post<null>(`bookings/${bookingId}/report`, { reason, details, ...(messageId ? { message_id: messageId } : {}) }),
  block: (bookingId: string) => api.post<null>(`bookings/${bookingId}/block`),
  unblock: (bookingId: string) => apiRequest<null>(`bookings/${bookingId}/block`, { method: 'DELETE' }),
};

/** The notifications inbox (same list as the app). */
export const notificationsApi = {
  list: (page = 1) =>
    apiRequest<InboxNotification[]>('notifications', { query: { page, per_page: 30 } }).then((r) => ({
      items: r.data,
      unread: Number(r.meta?.unread ?? 0),
      hasMore: r.pagination?.has_more ?? false,
    })),
  unread: () => api.get<{ unread: number }>('notifications/unread').then((d) => d.unread),
  read: (id: string) => api.post<InboxNotification>(`notifications/${id}/read`),
  readAll: () => api.post<{ unread: number }>('notifications/read-all'),
};
