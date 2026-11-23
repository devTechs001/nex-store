/**
 * NEX Store client — integer-cent money math (mirrors server/money.js).
 * All cart/checkout arithmetic runs on whole cents; dollars are display-only.
 */

export function toCents(dollars) {
  const n = Number(dollars);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function fromCents(cents) {
  return cents / 100;
}

export function lineCents(unitDollars, qty) {
  return toCents(unitDollars) * Math.max(0, Math.trunc(qty));
}

export function percentOfCents(cents, percent) {
  return Math.round((cents * Math.round(percent * 100)) / 10000);
}

export function fixedDiscountCents(subtotalCents, discountDollars) {
  return Math.max(0, Math.min(subtotalCents, toCents(discountDollars)));
}

export function taxOfCents(cents, rate) {
  return Math.round((cents * Math.round(rate * 10000)) / 10000);
}
