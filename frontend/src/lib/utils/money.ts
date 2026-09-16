/**
 * Money helpers.
 *
 * Every amount crossing the API is an integer number of minor units, so no
 * float ever represents money in this codebase. These helpers exist to turn
 * those integers into something a person reads, and nothing else -- totals,
 * commission and discounts are all calculated server-side.
 */

const MINOR_UNITS_PER_MAJOR = 100;

export function toMajorUnits(minor: number): number {
  return minor / MINOR_UNITS_PER_MAJOR;
}

/** "Rs 4,500". PKR has no circulating subunit, so decimals are dropped. */
export function formatMoney(
  minor: number | null | undefined,
  options: { currency?: string; withDecimals?: boolean } = {}
): string {
  if (minor === null || minor === undefined) return '—';

  const { currency = 'PKR', withDecimals = false } = options;
  const symbol = currency === 'PKR' ? 'Rs' : currency;

  const formatted = new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  }).format(toMajorUnits(minor));

  return `${symbol} ${formatted}`;
}

/** "Rs 2,000 - Rs 8,000", collapsing to one figure when both ends match. */
export function formatMoneyRange(
  minMinor: number | null | undefined,
  maxMinor: number | null | undefined,
  currency = 'PKR'
): string {
  if (minMinor === null || minMinor === undefined) return 'Price on inspection';
  if (maxMinor === null || maxMinor === undefined || maxMinor === minMinor) {
    return formatMoney(minMinor, { currency });
  }

  return `${formatMoney(minMinor, { currency })} - ${formatMoney(maxMinor, { currency })}`;
}

/** "45 minutes", "2 hours", "1 hour 30 minutes". */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} minutes`;

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  const hourLabel = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;

  return remainder === 0 ? hourLabel : `${hourLabel} ${remainder} minutes`;
}
