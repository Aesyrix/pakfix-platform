/**
 * PakFix does not set prices: professionals send offers and the customer
 * chooses (or names their own price). A category's typical range is only a
 * guide, always worded as "Usually ...". The app uses the same wording.
 */
export function priceGuide(
  t: (en: string, ur?: string) => string,
  range: { display: string } | undefined | null
): string | null {
  if (!range) return null;
  const shown = range.display.replace(' - ', ' – ');
  return t(`Usually ${shown}`, `عموماً ${shown}`);
}
