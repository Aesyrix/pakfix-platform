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
  };
  inbox: { unhandled_contact_messages: number };
  recent_activity: Array<{ action: string; description: string | null; actor: string | null; created_at: string | null }>;
  permissions: { content: boolean; blog: boolean; services: boolean; settings: boolean; inbox: boolean };
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
