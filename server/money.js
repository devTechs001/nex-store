/**
 * NEX Store — Integer-cent money math.
 *
 * Every monetary computation runs on integer cents (never floating-point
 * dollars), eliminating IEEE-754 drift like 0.1 + 0.2 = 0.30000000000000004.
 * DB columns stay in dollars for compatibility; convert at the boundaries.
 */

/** Dollars (number|string) → integer cents, rounded half-up. */
export function toCents(dollars) {
  const n = Number(dollars);
  if (!Number.isFinite(n)) return 0;
  // Convert via string to sidestep binary float artifacts (e.g. 1.005*100).
  return Math.round(n * 100);
}

/** Integer cents → dollars (Number), exact for display/serialization. */
export function fromCents(cents) {
  return cents / 100;
}

/** Integer cents → "$1,234.56" display string. */
export function formatCents(cents) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(Math.round(cents));
  const whole = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}$${whole}.${String(abs % 100).padStart(2, '0')}`;
}

/** unit price (dollars) × qty → integer cents. */
export function lineCents(unitDollars, qty) {
  return toCents(unitDollars) * Math.max(0, Math.trunc(qty));
}

/** Sum of integer cents. */
export function sumCents(...values) {
  return values.reduce((a, b) => a + b, 0);
}

/** Percentage discount over cents, rounded half-up to whole cents. */
export function percentOfCents(cents, percent) {
  return Math.round((cents * Math.round(percent * 100)) / 10000);
}

/** Fixed-dollar discount over a cents subtotal, clamped to [0, subtotal]. */
export function fixedDiscountCents(subtotalCents, discountDollars) {
  return Math.max(0, Math.min(subtotalCents, toCents(discountDollars)));
}

/** Tax over cents at rate (e.g. 0.08), rounded half-up. */
export function taxOfCents(cents, rate) {
  return Math.round(cents * Math.round(rate * 10000) / 10000);
}

/**
 * Canonical order money model — single source of truth used by the server
 * checkout and mirrored by the client cart drawer.
 */
export function computeOrderMoney({ unitPrices, quantities, coupon, subtotalFloorDollars = 0, shippingMethod = '', taxRate = 0.08 }) {
  let subtotalCents = 0;
  const lineTotalsCents = [];
  for (let i = 0; i < unitPrices.length; i++) {
    const lt = lineCents(unitPrices[i], quantities[i]);
    lineTotalsCents.push(lt);
    subtotalCents += lt;
  }

  let discountCents = 0;
  if (coupon && subtotalCents >= toCents(coupon.min_order_amount || subtotalFloorDollars)) {
    discountCents =
      coupon.discount_type === 'percentage'
        ? percentOfCents(subtotalCents, coupon.discount_value)
        : fixedDiscountCents(subtotalCents, coupon.discount_value);
  }

  const shippingCents = String(shippingMethod).toLowerCase().includes('same-day')
    ? 1500
    : subtotalCents >= 30000
    ? 0
    : 1200;

  const taxableCents = Math.max(0, subtotalCents - discountCents);
  const taxCents = taxOfCents(taxableCents, taxRate);
  const totalCents = taxableCents + shippingCents + taxCents;

  return {
    lineTotalsCents,
    subtotalCents,
    discountCents,
    shippingCents,
    taxableCents,
    taxCents,
    totalCents,
    // Dollar views for JSON/DB compatibility (exact by construction).
    subtotal: fromCents(subtotalCents),
    discountAmount: fromCents(discountCents),
    shippingCost: fromCents(shippingCents),
    taxAmount: fromCents(taxCents),
    total: fromCents(totalCents)
  };
}
