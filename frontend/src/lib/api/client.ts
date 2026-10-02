import type { ApiEnvelope, ApiFailure, Pagination } from './types';

/**
 * The single door to the Laravel API.
 *
 * Nothing in the app calls fetch directly. Everything comes through here so
 * that the envelope is unwrapped once, validation errors arrive in a usable
 * shape, and the auth token is attached in exactly one place.
 */

/**
 * Where the API lives.
 *
 * In the browser, NEXT_PUBLIC_API_URL is normally the relative "/api/v1": the
 * site and the API are served by the same PHP server, so the API is on
 * whatever origin the page came from. That keeps one build valid on
 * localhost, staging and pakfix.pk alike.
 *
 * During a build or on the Next.js server there is no page origin, so an
 * absolute URL is used instead (PAKFIX_BUILD_API_URL, set by
 * `php artisan pakfix:build`).
 */
export function apiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

  if (typeof window === 'undefined') {
    const serverUrl =
      process.env.PAKFIX_BUILD_API_URL ??
      (configured.startsWith('/') ? `http://127.0.0.1:8000${configured}` : configured);

    return serverUrl.replace(/\/$/, '');
  }

  const absolute = configured.startsWith('/') ? `${window.location.origin}${configured}` : configured;

  return absolute.replace(/\/$/, '');
}

/** The API's own origin, for endpoints outside /api/v1 such as the CSRF cookie. */
export function apiOrigin(): string {
  return new URL(apiBaseUrl()).origin;
}

/**
 * A failed request, carrying enough detail for a form to mark its own fields.
 * Callers catch this rather than inspecting raw responses.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errors: Record<string, string[]>;

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  /** Validation failure: the caller should show messages against fields. */
  get isValidationError(): boolean {
    return this.status === 422;
  }

  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** True for the failures that are worth retrying unchanged. */
  get isTransient(): boolean {
    return this.status === 0 || this.status === 429 || this.status >= 500;
  }

  /** The first message for a field, for inline form errors. */
  fieldError(field: string): string | undefined {
    return this.errors[field]?.[0];
  }
}

/* -------------------------------------------------------------------------- */
/* Token storage                                                              */
/* -------------------------------------------------------------------------- */

/**
 * How the browser authenticates
 * -----------------------------
 * The web app uses Sanctum's cookie session: the credential is an httpOnly
 * cookie the browser holds and JavaScript cannot read, which is what keeps an
 * XSS bug from turning into a stolen session. Those requests carry a CSRF
 * token instead (see `ensureCsrfCookie`).
 *
 * The bearer token below exists for non-browser clients -- the future Android
 * and iOS apps, and anything scripting the API. In the browser `getToken()`
 * normally returns null, and that is the healthy case.
 *
 * No other application state is kept client-side; everything meaningful is
 * read back from the API.
 */
const TOKEN_KEY = 'pakfix.token';

let inMemoryToken: string | null = null;

export function getToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window === 'undefined') return null;

  try {
    inMemoryToken = window.sessionStorage.getItem(TOKEN_KEY);
  } catch {
    // Private mode, or storage disabled. Memory-only is a fine fallback.
    inMemoryToken = null;
  }

  return inMemoryToken;
}

export function setToken(token: string | null): void {
  inMemoryToken = token;

  if (typeof window === 'undefined') return;

  try {
    if (token) {
      window.sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      window.sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore: the in-memory copy still works for this tab.
  }
}

/* -------------------------------------------------------------------------- */
/* CSRF                                                                        */
/* -------------------------------------------------------------------------- */

const CSRF_COOKIE = 'XSRF-TOKEN';

/** Reads a cookie the browser is willing to show JavaScript. */
function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

let csrfRequest: Promise<void> | null = null;

/**
 * Makes sure the XSRF-TOKEN cookie exists before a state-changing request.
 *
 * Laravel sets it on /sanctum/csrf-cookie. Concurrent callers share one
 * in-flight request rather than each firing their own.
 */
export async function ensureCsrfCookie(): Promise<void> {
  if (typeof document === 'undefined') return;
  if (readCookie(CSRF_COOKIE)) return;

  csrfRequest ??= fetch(`${apiOrigin()}/sanctum/csrf-cookie`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
    .then(() => undefined)
    .finally(() => {
      csrfRequest = null;
    });

  await csrfRequest;
}

/* -------------------------------------------------------------------------- */
/* Request                                                                     */
/* -------------------------------------------------------------------------- */

export interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Serialised as JSON, or sent as-is when it is already FormData. */
  body?: unknown;
  /** Appended as a query string, skipping null and undefined. */
  query?: Record<string, string | number | boolean | null | undefined>;
  /** Overrides the stored token, or sends none at all when null. */
  token?: string | null;
  /** Next.js fetch caching, for server components. */
  next?: { revalidate?: number; tags?: string[] };
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(
    `${apiBaseUrl()}/${path.replace(/^\//, '')}`.replace(/([^:]\/)\/+/g, '$1')
  );

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

/** Performs a request and unwraps the envelope, throwing ApiError on failure. */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; message: string; pagination?: Pagination }> {
  const { method = 'GET', body, query, token, next, headers, ...rest } = options;

  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const authToken = token === undefined ? getToken() : token;
  const mutating = method !== 'GET';

  // In the browser, anything that changes state needs the CSRF cookie first.
  if (mutating && typeof document !== 'undefined') {
    await ensureCsrfCookie();
  }

  const requestHeaders = new Headers(headers);
  requestHeaders.set('Accept', 'application/json');
  if (!isFormData && body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (authToken) {
    requestHeaders.set('Authorization', `Bearer ${authToken}`);
  }

  const csrfToken = mutating ? readCookie(CSRF_COOKIE) : null;
  if (csrfToken) {
    requestHeaders.set('X-XSRF-TOKEN', csrfToken);
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      ...rest,
      method,
      headers: requestHeaders,
      body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
      ...(next ? { next } : {}),
    });
  } catch {
    // The network never reached the API at all.
    throw new ApiError(
      'We could not reach PakFix. Check your connection and try again.',
      0
    );
  }

  // 204 carries no body by design.
  if (response.status === 204) {
    return { data: undefined as T, message: '' };
  }

  let envelope: ApiEnvelope<T> | null = null;

  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    envelope = null;
  }

  if (!response.ok || !envelope || envelope.success === false) {
    const failure = envelope as ApiFailure | null;

    throw new ApiError(
      failure?.message ?? 'Something went wrong. Please try again.',
      response.status,
      failure?.errors ?? {}
    );
  }

  return {
    data: envelope.data,
    message: envelope.message,
    pagination: envelope.meta?.pagination,
  };
}

/** Convenience wrappers. Each returns the payload directly. */
export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'GET' }).then((r) => r.data),

  /** Like get, but keeps the pagination meta the caller needs. */
  getPaged: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }).then((r) => r.data),

  /** For endpoints whose message is the point, such as "check your email". */
  postWithMessage: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PUT', body }).then((r) => r.data),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'PATCH', body }).then((r) => r.data),

  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'DELETE' }).then((r) => r.data),
};
