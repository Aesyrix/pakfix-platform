import { api, apiRequest } from './client';
import type {
  AdminBlogPost,
  AdminContactMessage,
  AdminContentBlock,
  AdminFaq,
  AdminOverview,
  AdminPage,
  AdminServiceCategory,
  AdminSetting,
  AdminTestimonial,
  AuthPayload,
  BlogCategory,
  BlogPostCard,
  BlogPostPayload,
  Bootstrap,
  City,
  CityPagePayload,
  CmsPage,
  ContactInput,
  ContentBlocks,
  Faq,
  LocalPagePayload,
  LocalPageSummary,
  Province,
  SearchResults,
  Service,
  ServiceCategory,
  ServicePagePayload,
  TechnicianCard,
  TechnicianPagePayload,
  Testimonial,
  TriageResult,
  User,
} from './types';

/**
 * Every API call the website can make, in one place.
 *
 * Components never build a URL. When an endpoint changes, it changes here and
 * TypeScript finds every caller.
 *
 * Public calls pass `token: null` so a build never leaks a stored credential
 * into a cached page, and `next.revalidate` so `npm run dev` does not hammer
 * the API. In the static build they are fetched once, at build time.
 */

const PUBLIC = { token: null, next: { revalidate: 300 } } as const;

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role: string;
  city_id?: number | null;
  referral_code?: string | null;
  accepts_terms: boolean;
}

export interface LoginInput {
  login: string;
  password: string;
  device_name?: string;
}

export const authApi = {
  register: (input: RegisterInput) => api.post<AuthPayload>('auth/register', input),
  login: (input: LoginInput) => api.post<AuthPayload>('auth/login', input),
  me: () => api.get<User>('auth/me'),
  logout: () => api.post<null>('auth/logout'),
  logoutEverywhere: () => api.post<{ revoked: number }>('auth/logout-all'),

  devices: () =>
    api.get<
      Array<{ id: number; name: string; last_used_at: string | null; created_at: string | null; is_current: boolean }>
    >('auth/devices'),

  revokeDevice: (tokenId: number) => api.delete<null>(`auth/devices/${tokenId}`),

  /** Always succeeds, so the response cannot confirm whether an account exists. */
  forgotPassword: (email: string) =>
    apiRequest<null>('auth/forgot-password', { method: 'POST', body: { email } }).then((r) => r.message),

  resetPassword: (input: { token: string; email: string; password: string; password_confirmation: string }) =>
    apiRequest<null>('auth/reset-password', { method: 'POST', body: input }).then((r) => r.message),

  resendVerification: () =>
    apiRequest<null>('auth/verify-email/resend', { method: 'POST' }).then((r) => r.message),

  verificationStatus: () =>
    api.get<{ email_verified: boolean; phone_verified: boolean }>('auth/verification-status'),
};

// ---------------------------------------------------------------------------
// Public content
// ---------------------------------------------------------------------------

export const contentApi = {
  bootstrap: () => api.get<Bootstrap>('bootstrap', PUBLIC),
  blocks: (page = 'home') => api.get<ContentBlocks>('content/blocks', { ...PUBLIC, query: { page } }),
  faqs: (group?: string) => api.get<Faq[]>('content/faqs', { ...PUBLIC, query: { group } }),
  testimonials: () => api.get<Testimonial[]>('content/testimonials', PUBLIC),
  page: (slug: string) => api.get<CmsPage>(`content/pages/${slug}`, PUBLIC),
};

export const catalogueApi = {
  categories: (options: { flat?: boolean; popular?: boolean } = {}) =>
    api.get<ServiceCategory[]>('services/categories', {
      ...PUBLIC,
      query: { flat: options.flat ? 1 : undefined, popular: options.popular ? 1 : undefined },
    }),

  category: (slug: string) => api.get<ServicePagePayload>(`services/categories/${slug}`, PUBLIC),

  services: (categorySlug?: string) =>
    api.get<Service[]>('services', { ...PUBLIC, query: { category: categorySlug, per_page: 100 } }),
};

export const locationApi = {
  provinces: () => api.get<Province[]>('locations/provinces', PUBLIC),
  cities: (served = false) =>
    api.get<City[]>('locations/cities', { ...PUBLIC, query: { served: served ? 1 : undefined } }),
  city: (slug: string) => api.get<City>(`locations/cities/${slug}`, PUBLIC),
  areas: (citySlug: string, search?: string) =>
    api.get<City['areas']>(`locations/cities/${citySlug}/areas`, { token: null, query: { q: search } }),
};

export interface TechnicianFilters {
  city?: string;
  category?: string;
  emergency?: boolean;
  sort?: 'rating' | 'jobs' | 'experience';
  page?: number;
  per_page?: number;
}

export const technicianApi = {
  list: (filters: TechnicianFilters = {}) =>
    api.getPaged<TechnicianCard[]>('technicians', {
      token: null,
      query: {
        city: filters.city,
        category: filters.category,
        emergency: filters.emergency ? 1 : undefined,
        sort: filters.sort,
        page: filters.page,
        per_page: filters.per_page,
      },
    }),

  show: (slug: string) => api.get<TechnicianPagePayload>(`technicians/${slug}`, PUBLIC),
};

export const localApi = {
  pages: () => api.get<LocalPageSummary[]>('local/pages', PUBLIC),
  page: (trade: string, city: string) => api.get<LocalPagePayload>(`local/${trade}/${city}`, PUBLIC),
  city: (slug: string) => api.get<CityPagePayload>(`local/cities/${slug}`, PUBLIC),
};

export const blogApi = {
  categories: () => api.get<BlogCategory[]>('blog/categories', PUBLIC),
  posts: (filters: { category?: string; tag?: string; page?: number; per_page?: number } = {}) =>
    api.getPaged<BlogPostCard[]>('blog/posts', { ...PUBLIC, query: { ...filters } }),
  post: (slug: string) => api.get<BlogPostPayload>(`blog/posts/${slug}`, PUBLIC),
};

export const searchApi = {
  search: (q: string) => api.get<SearchResults>('search', { token: null, query: { q } }),
};

export const triageApi = {
  triage: (description: string) => api.post<TriageResult>('ai/triage', { description }, { token: null }),
};

export const contactApi = {
  send: (input: ContactInput) =>
    apiRequest<{ reference: string }>('contact', { method: 'POST', body: { ...input, website: input.website ?? '' } }),
};

// ---------------------------------------------------------------------------
// Admin — content management
// ---------------------------------------------------------------------------

export const adminApi = {
  overview: () => api.get<AdminOverview>('admin/overview'),

  blocks: () => api.get<AdminContentBlock[]>('admin/content-blocks'),
  updateBlock: (key: string, input: Partial<AdminContentBlock>) =>
    apiRequest<AdminContentBlock>(`admin/content-blocks/${key}`, { method: 'PATCH', body: input }),

  faqs: () => api.get<AdminFaq[]>('admin/faqs'),
  createFaq: (input: Record<string, unknown>) => apiRequest<AdminFaq>('admin/faqs', { method: 'POST', body: input }),
  updateFaq: (id: number, input: Record<string, unknown>) =>
    apiRequest<AdminFaq>(`admin/faqs/${id}`, { method: 'PATCH', body: input }),
  deleteFaq: (id: number) => apiRequest<null>(`admin/faqs/${id}`, { method: 'DELETE' }),

  testimonials: () => api.get<AdminTestimonial[]>('admin/testimonials'),
  createTestimonial: (input: Record<string, unknown>) =>
    apiRequest<AdminTestimonial>('admin/testimonials', { method: 'POST', body: input }),
  updateTestimonial: (id: number, input: Record<string, unknown>) =>
    apiRequest<AdminTestimonial>(`admin/testimonials/${id}`, { method: 'PATCH', body: input }),
  deleteTestimonial: (id: number) => apiRequest<null>(`admin/testimonials/${id}`, { method: 'DELETE' }),

  pages: () => api.get<AdminPage[]>('admin/pages'),
  page: (id: string) => api.get<AdminPage>(`admin/pages/${id}`),
  createPage: (input: Record<string, unknown>) => apiRequest<AdminPage>('admin/pages', { method: 'POST', body: input }),
  updatePage: (id: string, input: Record<string, unknown>) =>
    apiRequest<AdminPage>(`admin/pages/${id}`, { method: 'PATCH', body: input }),
  deletePage: (id: string) => apiRequest<null>(`admin/pages/${id}`, { method: 'DELETE' }),

  blogOptions: () =>
    api.get<{
      categories: Array<{ name: string; slug: string }>;
      service_categories: Array<{ name: string; slug: string }>;
      tags: string[];
    }>('admin/blog/options'),
  posts: (filters: { status?: string; q?: string; page?: number } = {}) =>
    api.getPaged<AdminBlogPost[]>('admin/blog/posts', { query: { ...filters } }),
  post: (id: string) => api.get<AdminBlogPost>(`admin/blog/posts/${id}`),
  createPost: (input: Record<string, unknown>) =>
    apiRequest<AdminBlogPost>('admin/blog/posts', { method: 'POST', body: input }),
  updatePost: (id: string, input: Record<string, unknown>) =>
    apiRequest<AdminBlogPost>(`admin/blog/posts/${id}`, { method: 'PATCH', body: input }),
  deletePost: (id: string) => apiRequest<null>(`admin/blog/posts/${id}`, { method: 'DELETE' }),

  categories: () => api.get<AdminServiceCategory[]>('admin/service-categories'),
  createCategory: (input: Record<string, unknown>) =>
    apiRequest<AdminServiceCategory>('admin/service-categories', { method: 'POST', body: input }),
  updateCategory: (id: string, input: Record<string, unknown>) =>
    apiRequest<AdminServiceCategory>(`admin/service-categories/${id}`, { method: 'PATCH', body: input }),

  settings: () => api.get<AdminSetting[]>('admin/settings'),
  updateSettings: (values: Record<string, unknown>) =>
    apiRequest<null>('admin/settings', { method: 'PATCH', body: { values } }),

  contactMessages: (filters: { status?: string; page?: number } = {}) =>
    apiRequest<AdminContactMessage[]>('admin/contact-messages', { query: { ...filters } }),
  updateContactMessage: (id: string, input: Record<string, unknown>) =>
    apiRequest<AdminContactMessage>(`admin/contact-messages/${id}`, { method: 'PATCH', body: input }),
};
