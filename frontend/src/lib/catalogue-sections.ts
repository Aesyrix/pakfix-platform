import type { ServiceCategory } from '@/lib/api/types';

/**
 * How the catalogue is grouped, in display order. The app uses the same
 * sections and names (`CatalogueSection` in the Flutter app).
 */
export const CATALOGUE_SECTIONS = [
  { key: 'home', en: 'Home', ur: 'گھر', blurbEn: 'Repairs, appliances and upkeep for homes and offices.', blurbUr: 'گھروں اور دفاتر کی مرمت، آلات اور دیکھ بھال۔' },
  { key: 'vehicle', en: 'Car & Bike', ur: 'گاڑی اور بائیک', blurbEn: 'Roadside help and repairs, wherever your car or bike is.', blurbUr: 'سڑک پر مدد اور مرمت، جہاں بھی آپ کی گاڑی یا بائیک ہو۔' },
  { key: 'electronics', en: 'Electronics', ur: 'الیکٹرانکس', blurbEn: 'TVs, laptops, computers and phones.', blurbUr: 'ٹی وی، لیپ ٹاپ، کمپیوٹر اور فون۔' },
] as const;

export type CatalogueSectionKey = (typeof CATALOGUE_SECTIONS)[number]['key'];

/** A category's section; anything unknown (an older API) counts as Home. */
export function sectionOf(category: Pick<ServiceCategory, 'section'>): CatalogueSectionKey {
  return CATALOGUE_SECTIONS.some((s) => s.key === category.section) ? (category.section as CatalogueSectionKey) : 'home';
}

/** The sections that have categories, each with its categories in order. */
export function groupBySection(categories: ServiceCategory[]) {
  return CATALOGUE_SECTIONS.map((section) => ({
    ...section,
    categories: categories.filter((c) => sectionOf(c) === section.key),
  })).filter((group) => group.categories.length > 0);
}
