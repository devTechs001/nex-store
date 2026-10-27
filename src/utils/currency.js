export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', rate: 1, label: 'USD ($)' },
  KES: { code: 'KES', symbol: 'KSh ', rate: 129.5, label: 'KES (KSh)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78, label: 'GBP (£)' }
};

export function formatPrice(usdAmount, currencyCode = 'USD') {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const val = Number(usdAmount || 0) * curr.rate;
  if (currencyCode === 'KES') {
    return `${curr.symbol}${Math.round(val).toLocaleString()}`;
  }
  return `${curr.symbol}${val.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatRelativeTime(isoString) {
  if (!isoString) return 'Just now';
  const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diffSec < 15) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}
