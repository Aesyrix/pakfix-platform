/**
 * Server-side fetch helpers that degrade instead of crashing.
 *
 * The marketing site is server-rendered and must keep working even when the
 * API is briefly unreachable: a visitor should get a page with fewer sections,
 * not a 500. Anything behind a login has no business degrading quietly, so
 * these are only for public content.
 */
export async function safeFetch<T>(
  loader: () => Promise<T>,
  fallback: T,
  label: string
): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    // Logged server-side so an outage is visible in the logs rather than
    // only as a thinner-looking homepage.
    console.error(`[pakfix] Failed to load ${label}:`, error);
    return fallback;
  }
}
