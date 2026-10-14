import type { Product } from '@/pages/shop/types';
import i18n from '@/i18n';

const isArabic = () => (i18n.language || 'ar').toLowerCase().startsWith('ar');

export function formatSAR(value: number): string {
  const amount = value.toLocaleString('en-US');
  return isArabic() ? `${amount} ر.س` : `SAR ${amount}`;
}

export function discountPct(price: number, compareAt?: number): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round((1 - price / compareAt) * 100);
}

/* Human, locale-aware date + time used across order history. */
export function formatDateTime(ts: number): string {
  try {
    return new Intl.DateTimeFormat(isArabic() ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

export function formatDate(ts: number): string {
  try {
    return new Intl.DateTimeFormat(isArabic() ? 'ar' : 'en', { dateStyle: 'long' }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleDateString();
  }
}

/* Resolves the per-unit price for a given quantity, applying the best
   matching wholesale tier when one exists. Falls back to the list price. */
export function tierUnitPrice(product: Product, qty: number): number {
  const wholesale = product.wholesale;
  if (!wholesale || !wholesale.tiers?.length) return product.price;
  const tiers = [...wholesale.tiers].sort((a, b) => a.min - b.min);
  let unit = product.price;
  for (const tier of tiers) {
    if (qty >= tier.min) unit = tier.price;
  }
  return unit;
}