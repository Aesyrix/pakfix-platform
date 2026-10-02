/**
 * Types mirroring the Laravel API contract.
 *
 * These are hand-maintained against docs/api.md rather than generated, so
 * anything here is a promise the backend keeps. Money always arrives as
 * integer minor units; a `*_display` string comes with it when the backend
 * is better placed to format it than the client.
 */

/** The envelope every endpoint returns. */
export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    pagination?: Pagination;
    [key: string]: unknown;
  };
}

export interface ApiFailure {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number | null;
  last_page: number | null;
  has_more: boolean;
}

// ---------------------------------------------------------------------------
// Roles and users
// ---------------------------------------------------------------------------

export const USER_ROLES = [
  'customer',
  'technician',
  'company',
  'property_manager',
  'support_agent',
  'admin',
  'super_admin',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** The roles someone may choose at sign-up. Staff roles are granted, not claimed. */
export const SELF_REGISTERABLE_ROLES = [
  'customer',
  'technician',
  'company',
  'property_manager',
] as const satisfies readonly UserRole[];

export type SelfRegisterableRole = (typeof SELF_REGISTERABLE_ROLES)[number];

export type UserStatus = 'active' | 'pending' | 'suspended' | 'banned';

export interface User {
  /** A UUID. The database id is never exposed. */
  id: string;
  name: string;
  avatar_url: string | null;
  locale: string;
  roles: UserRole[];
  primary_role: UserRole | null;
  city: City | null;
  profile: {
    first_name: string | null;
    last_name: string | null;
    bio: string | null;
  } | null;
  created_at: string | null;

  /* Present only when the viewer is the user themselves, or staff. */
  email?: string;
  phone?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  status?: UserStatus;
  referral_code?: string;
  onboarding_completed?: boolean;
  permissions?: string[];
  home_path?: string;
}

export interface AuthPayload {
  user: User;
  /** Null for the browser, which uses the cookie session instead. */
  token: string | null;
}

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------

export interface Area {
  id: number;
  name: string;
  slug: string;
  city_id: number;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface City {
  id: number;
  name: string;
  slug: string;
  latitude: number | null;
  longitude: number | null;
  is_served: boolean;
  province: { id: number; name: string; slug: string } | null;
  areas: Area[];
}

export interface Province {
  id: number;
  name: string;
  slug: string;
  cities: City[];
}

// ---------------------------------------------------------------------------
// Service catalogue
// ---------------------------------------------------------------------------

export type PricingModel = 'fixed' | 'hourly' | 'quote_only' | 'visit_fee';

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  inclusions: string | null;
  exclusions: string | null;
  pricing_model: PricingModel;
  base_price_minor: number | null;
  visit_fee_minor: number | null;
  price_display: string;
  estimated_minutes: number | null;
  is_emergency: boolean;
  category: { id: string; name: string; slug: string } | null;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  image_url: string | null;
  is_emergency: boolean;
  is_popular: boolean;
  typical_price?: {
    min_minor: number;
    max_minor: number | null;
    display: string;
  };
  seo: { title: string | null; description: string | null };
  children: ServiceCategory[];
  services: Service[];
}

// ---------------------------------------------------------------------------
// Editable content
// ---------------------------------------------------------------------------

export interface ContentBlock {
  type: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
  image_url: string | null;
  cta: { label: string; url: string } | null;
}

export type ContentBlocks = Record<string, ContentBlock>;

export interface Faq {
  question: string;
  answer: string;
  group: string;
}

export interface Testimonial {
  author_name: string;
  author_location: string | null;
  rating: number;
  quote: string;
}

export interface CmsPage {
  title: string;
  slug: string;
  body: string | null;
  /** Rendered server-side from Markdown, with raw HTML stripped. Safe to insert. */
  body_html: string;
  seo: { title: string | null; description: string | null };
  updated_at: string | null;
}

/** The platform configuration the frontend loads once, before rendering. */
export interface Bootstrap {
  brand: {
    name: string;
    tagline: string;
    support_email: string;
    support_phone: string;
    whatsapp: string | null;
    address: string | null;
    support_hours: string | null;
  };
  /** Only networks with a link configured are present. */
  social: Partial<Record<'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok', string>>;
  currency: { code: string; symbol: string };
  features: { ai_enabled: boolean; maintenance_mode: boolean };
  payment_methods: string[];
  seo: { default_title: string | null; default_description: string | null };
}

// ---------------------------------------------------------------------------
// Domain vocabulary shared with the backend enums
// ---------------------------------------------------------------------------

export type SafetyLevel = 'low' | 'medium' | 'high' | 'emergency';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type UrgencyLevel = 'flexible' | 'standard' | 'urgent' | 'emergency';
export type VerificationStatus =
  | 'not_submitted'
  | 'pending'
  | 'more_info_requested'
  | 'verified'
  | 'rejected'
  | 'suspended';

export type BookingStatus =
  | 'pending'
  | 'searching_professional'
  | 'professional_assigned'
  | 'accepted'
  | 'scheduled'
  | 'technician_on_way'
  | 'arrived'
  | 'inspection_started'
  | 'quote_created'
  | 'quote_accepted'
  | 'repair_started'
  | 'completed'
  | 'customer_confirmed'
  | 'cancelled'
  | 'disputed'
  | 'refunded';

export * from './marketing-types';
