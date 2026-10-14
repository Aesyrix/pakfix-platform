/**
 * Local, free-to-use (Unsplash) imagery bundled with the static export.
 *
 * Photos live in `public/images/` and are served at `/images/<file>`. The API
 * does not ship imagery for every record (seeded blogs and technicians have no
 * uploaded media), so these maps give the marketing site a real, topical image
 * while still preferring an API-provided image whenever one exists.
 */

const SERVICE_IMAGES: Record<string, string> = {
  plumbing: '/images/service-plumbing.jpg',
  electrical: '/images/service-electrical.jpg',
  'ac-repair': '/images/service-ac-repair.jpg',
  'ac-hvac': '/images/service-ac-repair.jpg',
  'kitchen-appliances': '/images/service-kitchen-appliances.jpg',
  cleaning: '/images/service-cleaning.jpg',
  carpentry: '/images/service-carpentry.jpg',
  painting: '/images/service-painting.jpg',
  'solar-installation': '/images/service-solar-installation.jpg',
  'solar-system': '/images/service-solar-installation.jpg',
  'pest-control': '/images/service-pest-control.jpg',
  'home-renovation': '/images/service-home-renovation.jpg',
};

const BLOG_IMAGES: Record<string, string> = {
  'why-your-ac-is-running-but-not-cooling': '/images/blog-why-your-ac-is-running-but-not-cooling.jpg',
  'water-tank-cleaning-how-often-and-why-it-matters': '/images/blog-water-tank-cleaning-how-often-and-why-it-matters.jpg',
  'gas-smell-at-home-what-to-do-in-the-first-five-minutes': '/images/blog-gas-smell-at-home-what-to-do-in-the-first-five-minutes.jpg',
  'getting-more-backup-time-from-your-ups': '/images/blog-getting-more-backup-time-from-your-ups.jpg',
  'preparing-your-home-for-monsoon-season': '/images/blog-preparing-your-home-for-monsoon-season.jpg',
};

const PROFESSIONAL_IMAGES: Record<string, string> = {
  'ahmed-raza-lahore': '/images/pro-ahmed-raza-lahore.jpg',
  'imran-khalid-lahore': '/images/pro-imran-khalid-lahore.jpg',
  'usman-tariq-karachi': '/images/pro-usman-tariq-karachi.jpg',
  'fahad-sheikh-islamabad': '/images/pro-fahad-sheikh-islamabad.jpg',
  'naveed-anwar-islamabad': '/images/pro-naveed-anwar-islamabad.jpg',
  'zeeshan-ali-karachi': '/images/pro-zeeshan-ali-karachi.jpg',
};

export const HERO_IMAGE = '/images/hero.jpg';

function lookup(map: Record<string, string>, key?: string | null): string | null {
  if (!key) return null;
  return map[key] ?? null;
}

/** Topical image for a service category slug, or the last segment of a service path. */
export function serviceImage(slug?: string | null): string | null {
  const key = slug?.split('/').filter(Boolean).pop();
  return lookup(SERVICE_IMAGES, key);
}

/** Topical image for a blog post slug. */
export function blogImage(slug?: string | null): string | null {
  return lookup(BLOG_IMAGES, slug);
}

/** Portrait for a technician profile slug. */
export function professionalImage(slug?: string | null): string | null {
  return lookup(PROFESSIONAL_IMAGES, slug);
}
