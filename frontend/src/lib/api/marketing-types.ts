/**
 * Types for the Phase 2 public and admin content endpoints.
 * Kept beside types.ts and re-exported from it, so callers import from one place.
 */
import type {
  Area,
  ConfidenceLevel,
  SafetyLevel,
  Service,
  ServiceCategory,
} from './types';

// ---------------------------------------------------------------------------
// Professionals
// ---------------------------------------------------------------------------

export interface Money {
  minor: number;
  display: string;
}

/** A professional in a public listing. Never carries contact details. */
export interface TechnicianCard {
  id: string;
  slug: string;
  name: string;
  business_name: string | null;
  avatar_url: string | null;
  headline: string;
  city: { name: string; slug: string } | null;
  is_verified: boolean;
  years_experience: number;
  rating_average: number;
  rating_count: number;
  completed_jobs_count: number;
  offers_emergency_service: boolean;
  visit_fee: Money | null;
  languages: string[];
  categories: Array<{ name: string; slug: string }>;
}

export interface TechnicianProfile extends TechnicianCard {
  bio: string | null;
  skills: string[];
  service_radius_km: number;
  hourly_rate: Money | null;
  verified_at: string | null;
  member_since: string | null;
  service_areas: Array<{ city: string | null; city_slug: string | null; area: string | null }>;
  working_days: string[];
  portfolio: Array<{
    title: string | null;
    description: string | null;
    before_url: string | null;
    after_url: string | null;
  }>;
}

export interface PublicReview {
  id: string;
  rating: number;
  ratings: Record<'quality' | 'professionalism' | 'communication' | 'value' | 'timeliness', number | null>;
  comment: string | null;
  author: string;
  is_verified: boolean;
  response: string | null;
  created_at: string | null;
}

export interface TechnicianPagePayload {
  professional: TechnicianProfile;
  reviews: PublicReview[];
  rating_breakdown: Array<{ stars: number; count: number }>;
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export interface BlogPostCard {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  reading_minutes: number | null;
  is_featured: boolean;
  published_at: string | null;
  category: { name: string; slug: string } | null;
}

export interface BlogPost extends BlogPostCard {
  body_html: string;
  author: { name: string } | null;
  tags: Array<{ name: string; slug: string }>;
  service_category: { name: string; slug: string } | null;
  cta: { label: string; url: string } | null;
  seo: { title: string; description: string; canonical_url: string | null };
  schema_markup: Record<string, unknown> | null;
  updated_at: string | null;
}

export interface BlogPostPayload {
  post: BlogPost;
  related_posts: BlogPostCard[];
}

export interface BlogCategory {
  name: string;
  slug: string;
  description: string | null;
  post_count: number;
}

// ---------------------------------------------------------------------------
// Service, city and local SEO pages
// ---------------------------------------------------------------------------

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface ServicePagePayload {
  category: ServiceCategory;
  breadcrumb: string;
  parent: { name: string; slug: string } | null;
  trade: { slug: string; name: string } | null;
  common_problems: string[];
  faqs: QuestionAnswer[];
  cities: Array<{ name: string; slug: string; professional_count: number; local_path: string | null }>;
  professionals: TechnicianCard[];
  related_posts: BlogPostCard[];
}

export interface LocalPageSummary {
  trade_slug: string;
  trade_name: string;
  category_slug: string;
  category_name: string;
  city_slug: string;
  city_name: string;
  professional_count: number;
  path: string;
}

export interface LocalPagePayload {
  trade: { slug: string; name: string };
  category: ServiceCategory;
  city: { name: string; slug: string; province: string | null };
  professional_count: number;
  average_rating: number;
  common_problems: string[];
  areas: Area[];
  professionals: TechnicianCard[];
  reviews: PublicReview[];
  faqs: QuestionAnswer[];
  same_trade_other_cities: Array<{ name: string; path: string }>;
  other_trades_in_city: Array<{ name: string; path: string }>;
  related_posts: BlogPostCard[];
}

export interface CityPagePayload {
  city: { name: string; slug: string; province: string | null };
  professional_count: number;
  categories: Array<{
    name: string;
    slug: string;
    icon: string | null;
    professional_count: number;
    local_path: string | null;
  }>;
  popular_categories: ServiceCategory[];
  areas: Area[];
  professionals: TechnicianCard[];
  guides: BlogPostCard[];
  faqs: QuestionAnswer[];
}

// ---------------------------------------------------------------------------
// Search, triage and contact
// ---------------------------------------------------------------------------

export interface SearchResults {
  query: string;
  categories: ServiceCategory[];
  services: Service[];
  professionals: TechnicianCard[];
  posts: BlogPostCard[];
  faqs: QuestionAnswer[];
}

export interface TriageResult {
  kind: 'triage';
  is_emergency: boolean;
  emergency: {
    type: string;
    title: string;
    headline: string;
    steps: string[];
    emergency_numbers: Array<{ label: string; number: string }>;
  } | null;
  safety_level: SafetyLevel;
  matches: Array<{
    category: ServiceCategory;
    confidence: ConfidenceLevel;
    matched_terms: string[];
  }>;
  disclaimer: string;
}

export const CONTACT_TOPICS = ['general', 'booking', 'professional', 'partnership', 'press', 'other'] as const;
export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  topic: ContactTopic;
  subject: string;
  message: string;
  /** Honeypot. The real form always sends it empty. */
  website?: string;
}

// ---------------------------------------------------------------------------
// Admin — content management
// ---------------------------------------------------------------------------

export interface AdminOverview {
  content: {
    published_posts: number;
    draft_posts: number;
    pages: number;
    faqs: number;
    testimonials: number;
    active_categories: number;
    local_pages: number;
  };
  marketplace: {
    customers: number;
    verified_professionals: number;
    pending_professionals: number;
    active_bookings?: number;
  };
  inbox: { unhandled_contact_messages: number; open_reports?: number; open_disputes?: number };
  recent_activity: Array<{ action: string; description: string | null; actor: string | null; created_at: string | null }>;
  permissions: {
    content: boolean;
    blog: boolean;
    services: boolean;
    settings: boolean;
    inbox: boolean;
    /** Can review professionals' CNIC submissions. */
    verifications?: boolean;
    /** Can handle reports from customers and professionals. */
    reports?: boolean;
    /** Can see and decide disputes on booked jobs. */
    disputes?: boolean;
    /** Can find customers and professionals. */
    users?: boolean;
    /** Can suspend and restore accounts. */
    manage_users?: boolean;
    /** Can see every booked job. */
    bookings?: boolean;
    /** Can cancel a booked job. */
    cancel_bookings?: boolean;
    /** Can clear a professional's strikes. */
    clear_strikes?: boolean;
  };
}

/** A customer or professional on the admin Users page (`/admin/users`). */
export interface AdminUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  status: string;
  is_suspended: boolean;
  city: string | null;
  joined_at: string | null;
  last_login_at: string | null;
  customer_bookings: number;
  reports_against: number;
  professional: {
    business_name: string;
    verification: string | null;
    strikes: number;
    max_strikes: number;
    completed_jobs: number;
    cancelled_jobs: number;
    rating_average: number;
    rating_count: number;
  } | null;
}

/** A booked job in an admin list. */
export interface AdminBookingRow {
  id: string;
  reference: string;
  status: string;
  status_label: string;
  is_finished: boolean;
  category: string | null;
  customer: { id: string; name: string } | null;
  professional: { id: string | null; name: string } | null;
  total: string;
  created_at: string | null;
}

/** One person with their recent jobs and reports. */
export interface AdminUserDetail extends AdminUser {
  status_reason: string | null;
  bookings: AdminBookingRow[];
  active_bookings: number;
  reports: Array<{ reason: string; details: string | null; status: string; by: string | null; created_at: string }>;
  disputes_lost: number;
}

/** One booked job, as the admin sees it. */
export interface AdminBookingDetail extends AdminBookingRow {
  problem_description: string;
  urgency: string | null;
  address_line: string;
  city: string | null;
  visit_fee: string;
  labour: string;
  materials: string;
  payment_status: string | null;
  completed_via: string | null;
  arrived_distance_m: number | null;
  arrived_far: boolean;
  completed_distance_m: number | null;
  completed_far: boolean;
  cancellation_reason: string | null;
  deadlines: { auto_complete_at: string | null; auto_confirm_at: string | null; dispute_until: string | null; no_show_from: string | null };
  can_cancel: boolean;
  dispute: { id: string; reference: string; kind: string; status: string; outcome: string | null } | null;
  review: { rating: number; comment: string | null } | null;
  timeline: Array<{ status: string; actor_role: string | null; note: string | null; at: string | null }>;
}

export type ContentListItem = { title: string; body: string };
export type ContentValue = string | string[] | ContentListItem[] | Record<string, string>;

export interface AdminContentBlock {
  key: string;
  type: string;
  page: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, ContentValue>;
  cta_label: string | null;
  cta_url: string | null;
  sort_order: number;
  is_active: boolean;
  updated_at: string | null;
}

export interface AdminFaq {
  id: number;
  question: string;
  answer: string;
  group: string;
  service_category: { name: string; slug: string } | null;
  city: { name: string; slug: string } | null;
  sort_order: number;
  is_active: boolean;
}

export interface AdminTestimonial {
  id: number;
  author_name: string;
  author_location: string | null;
  rating: number;
  quote: string;
  is_published: boolean;
  sort_order: number;
}

export interface AdminPage {
  id: string;
  title: string;
  slug: string;
  body?: string;
  body_html?: string;
  seo_title: string | null;
  seo_description: string | null;
  is_system: boolean;
  is_published: boolean;
  updated_at: string | null;
}

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  status: 'draft' | 'scheduled' | 'published';
  published_at: string | null;
  is_featured: boolean;
  reading_minutes: number | null;
  blog_category_slug: string | null;
  blog_category_name: string | null;
  service_category_slug: string | null;
  author: string | null;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  featured_image_alt: string | null;
  updated_at: string | null;
}

export interface AdminServiceCategory {
  id: string;
  name: string;
  slug: string;
  section: string;
  parent: { name: string; slug: string } | null;
  trade_slug: string | null;
  trade_name: string | null;
  description: string | null;
  common_problems: string[];
  icon: string | null;
  is_emergency: boolean;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  typical_min_rupees: number | null;
  typical_max_rupees: number | null;
  seo_title: string | null;
  seo_description: string | null;
}

export interface AdminSetting {
  key: string;
  group: 'general' | 'social' | 'seo';
  label: string | null;
  type: string;
  value: string | boolean | number | null;
}

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  topic: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'handled';
  internal_note: string | null;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string | null;
}

export interface MarketplaceBooking {
  id: string;
  reference: string;
  status: string;
  status_label: string;
  is_active: boolean;
  category?: { name: string };
  problem_description: string;
  address_line: string | null;
  city?: { name: string };
  total: { minor: number; display: string };
  created_at: string | null;
}

export interface MarketplaceRequest {
  id: string;
  reference: string;
  state: string;
  category?: { name: string };
  description: string;
  city?: { name: string };
  area?: { name: string } | null;
  quotes_count: number;
  distance_km?: number | null;
  customer_offer: { minor: number; display: string } | null;
  created_at: string | null;
}

export interface ProProfileSummary {
  business_name: string | null;
  bio: string | null;
  years_experience: number;
  city: { name: string } | null;
  service_radius_km: number;
  categories: Array<{ id: string; name: string }>;
  onboarding_percent: number;
  verification: { status: string; rejection_reason: string | null };
  checklist: { profile_complete: boolean; documents: string[]; missing_documents: string[]; can_submit: boolean };
}

export interface AdminReportPerson {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
}

/** A report in the moderation queue (`/admin/reports`). */
export interface AdminReport {
  id: string;
  reason: 'harassment' | 'inappropriate' | 'spam' | 'fraud' | 'safety' | 'off_platform' | 'other';
  details: string | null;
  /** The reported message, copied when the report was made. */
  snapshot: string | null;
  status: 'open' | 'reviewing' | 'actioned' | 'dismissed';
  resolution: string | null;
  reporter: AdminReportPerson | null;
  reported: AdminReportPerson | null;
  booking: { id: string; reference: string; status: string } | null;
  reports_against_user: number;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string;
}

export interface AdminDisputePerson {
  name: string;
  email: string | null;
}

/** A dispute on a booked job (`/admin/disputes`). */
export interface AdminDispute {
  id: string;
  reference: string;
  kind: 'problem' | 'no_show' | 'not_paid' | 'not_done';
  raised_by_role: 'customer' | 'technician' | null;
  raised_by: AdminDisputePerson | null;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  outcome: 'complete' | 'cancel' | null;
  strike_given: boolean;
  resolution_note: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  booking: {
    id: string;
    reference: string;
    status: string;
    category: string | null;
    problem_description: string;
    address_line: string;
    total: string;
    completed_via: string | null;
    arrived_distance_m: number | null;
    arrived_far: boolean;
    completed_distance_m: number | null;
    completed_far: boolean;
    customer: AdminDisputePerson | null;
    professional: { name: string; email: string | null; strikes: number; completed_jobs: number; cancelled_jobs: number } | null;
    timeline: Array<{ status: string; actor_role: string | null; note: string | null; at: string | null }>;
  } | null;
}

/** A professional in the verification queue (`/admin/verifications`). */
export interface AdminVerification {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  city: string | null;
  years_experience: number;
  trades: string[];
  status: 'not_submitted' | 'pending' | 'more_info_requested' | 'verified' | 'rejected' | 'suspended';
  /** Last four digits only, to compare with the card in the photo. */
  cnic_masked: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  is_verified: boolean;
}

export interface AdminVerificationDocument {
  id: number;
  type: 'cnic_front' | 'cnic_back' | 'photo' | 'certificate' | string;
  mime_type: string | null;
  uploaded_at: string | null;
  /** Streamed by the API to signed-in reviewers only; never cached. */
  url: string;
}

export interface AdminVerificationDetail extends AdminVerification {
  bio: string | null;
  base_address: string | null;
  service_radius_km: number;
  reviewer_notes: string | null;
  documents: AdminVerificationDocument[];
}
