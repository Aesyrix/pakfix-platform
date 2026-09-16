import { api, apiRequest } from './client';
import type {
  AuthPayload,
  Bootstrap,
  City,
  CmsPage,
  ContentBlocks,
  Faq,
  Province,
  Service,
  ServiceCategory,
  Testimonial,
  User,
} from './types';

/**
 * Every API call the app can make, in one place.
 *
 * Components never build a URL. When an endpoint changes, it changes here and
 * TypeScript finds every caller.
 */

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
      Array<{
        id: number;
        name: string;
        last_used_at: string | null;
        created_at: string | null;
        is_current: boolean;
      }>
    >('auth/devices'),

  revokeDevice: (tokenId: number) => api.delete<null>(`auth/devices/${tokenId}`),

  /** Always succeeds, so the response cannot confirm whether an account exists. */
  forgotPassword: (email: string) =>
    apiRequest<null>('auth/forgot-password', {
      method: 'POST',
      body: { email },
    }).then((r) => r.message),

  resetPassword: (input: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => apiRequest<null>('auth/reset-password', { method: 'POST', body: input }).then((r) => r.message),

  resendVerification: () => api.post<null>('auth/verify-email/resend'),

  verificationStatus: () =>
    api.get<{ email_verified: boolean; phone_verified: boolean }>('auth/verification-status'),
};

export const contentApi = {
  /** Public: no token needed, cached at the edge. */
  bootstrap: () => api.get<Bootstrap>('bootstrap', { token: null, next: { revalidate: 300 } }),

  blocks: (page = 'home') =>
    api.get<ContentBlocks>('content/blocks', {
      query: { page },
      token: null,
      next: { revalidate: 300, tags: [`content:${page}`] },
    }),

  faqs: (group?: string) =>
    api.get<Faq[]>('content/faqs', {
      query: { group },
      token: null,
      next: { revalidate: 300 },
    }),

  testimonials: () =>
    api.get<Testimonial[]>('content/testimonials', { token: null, next: { revalidate: 300 } }),

  page: (slug: string) =>
    api.get<CmsPage>(`content/pages/${slug}`, { token: null, next: { revalidate: 600 } }),
};

export const catalogueApi = {
  categories: (options: { flat?: boolean; popular?: boolean } = {}) =>
    api.get<ServiceCategory[]>('services/categories', {
      query: { flat: options.flat ? 1 : undefined, popular: options.popular ? 1 : undefined },
      token: null,
      next: { revalidate: 600, tags: ['catalogue'] },
    }),

  category: (slug: string) =>
    api.get<{
      category: ServiceCategory;
      breadcrumb: string;
      faqs: Array<{ question: string; answer: string }>;
    }>(`services/categories/${slug}`, { token: null, next: { revalidate: 600 } }),

  services: (categorySlug?: string) =>
    api.get<Service[]>('services', {
      query: { category: categorySlug },
      token: null,
      next: { revalidate: 600 },
    }),
};

export const locationApi = {
  provinces: () => api.get<Province[]>('locations/provinces', { token: null, next: { revalidate: 86400 } }),

  /** `served` limits the list to cities PakFix has actually launched in. */
  cities: (served = false) =>
    api.get<City[]>('locations/cities', {
      query: { served: served ? 1 : undefined },
      token: null,
      next: { revalidate: 86400 },
    }),

  city: (slug: string) => api.get<City>(`locations/cities/${slug}`, { token: null, next: { revalidate: 86400 } }),

  areas: (citySlug: string, search?: string) =>
    api.get<City['areas']>(`locations/cities/${citySlug}/areas`, {
      query: { q: search },
      token: null,
    }),
};
