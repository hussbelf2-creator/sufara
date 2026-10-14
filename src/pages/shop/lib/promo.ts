/* Promo / discount code logic shared by the cart and the checkout.
   Codes themselves live in the mock catalogue (src/mocks/shop.ts), and the
   ambassador discount codes resolve from the ambassador registry. */

import type { Promo } from '@/pages/shop/types';
import { promoCodes } from '@/mocks/shop';
import { ambRegistry } from '@/mocks/ambassadorPages';

/* ── Ambassador discount codes ──────────────────────────────────────────
   Every published ambassador marketing page carries a code that gives the
   customer a discount and attributes the order to its ambassador. The list
   is language-independent (only the display name differs per language, and
   that name is resolved in the UI from the registry by slug). */
export interface AmbPromo {
  code: string;
  slug: string;
  factoryId: string;
  discount: number;
}

export const ambPromoCodes: AmbPromo[] = [
  { code: 'AHMAD-TAMR10', slug: 'ahmad-jo-2481', factoryId: 'hasa', discount: 10 },
  { code: 'AHMAD-OUD10', slug: 'ahmad-jo-2481', factoryId: 'oud', discount: 10 },
  { code: 'REEM-TAMR10', slug: 'reem-eg-3012', factoryId: 'hasa', discount: 10 },
  { code: 'YOUSEF-TAMR10', slug: 'yousef-tr-2044', factoryId: 'hasa', discount: 10 },
  { code: 'KHALED-COF10', slug: 'khaled-jo-1190', factoryId: 'fifa', discount: 10 },
  { code: 'REEM-ROSE10', slug: 'reem-eg-3012', factoryId: 'taif', discount: 10 },
];

/* Resolves an ambassador code — first by an exact registered page, then by the
   ambassador's own prefix (so a freshly generated page code still attributes). */
export function findAmbPromo(code: string): AmbPromo | undefined {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return undefined;
  const exact = ambPromoCodes.find((p) => p.code === normalized);
  if (exact) return exact;
  const prefix = normalized.split('-')[0];
  const amb = ambRegistry.find((a) => a.code.split('-')[0] === prefix);
  if (!amb) return undefined;
  return { code: normalized, slug: amb.slug, factoryId: '', discount: 10 };
}

/* The canonical code shown on / shared from a given ambassador + factory page. */
export function findAmbPromoByPage(slug: string, factoryId: string): AmbPromo | undefined {
  return ambPromoCodes.find((p) => p.slug === slug && p.factoryId === factoryId);
}

/* ── Code remembered from a landing page ────────────────────────────────
   Visiting a marketing page remembers its code so the checkout can apply it
   automatically and keep the attribution airtight. */
export const AMB_CODE_KEY = 'sta_amb_pending_code';

export function rememberAmbCode(code: string): void {
  try {
    window.localStorage.setItem(AMB_CODE_KEY, code);
  } catch {
    /* storage unavailable */
  }
}

export function readRememberedAmbCode(): string {
  try {
    return window.localStorage.getItem(AMB_CODE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function clearRememberedAmbCode(): void {
  try {
    window.localStorage.removeItem(AMB_CODE_KEY);
  } catch {
    /* storage unavailable */
  }
}

function buildAmbPromo(code: string, amb: AmbPromo): Promo {
  return {
    code,
    label: '',
    description: '',
    kind: 'percent',
    value: amb.discount,
    minSubtotal: 0,
    ambassadorSlug: amb.slug,
    factoryId: amb.factoryId || undefined,
  };
}

export function findPromo(code: string): Promo | undefined {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return undefined;
  const standard = (promoCodes as Promo[]).find((p) => p.code === normalized);
  if (standard) return standard;
  const amb = findAmbPromo(normalized);
  return amb ? buildAmbPromo(normalized, amb) : undefined;
}

export interface PromoResult {
  ok: boolean;
  messageKey: string;
  messageParams?: Record<string, string | number>;
  promo?: Promo;
}

/* Validates a code against the current subtotal and returns a translatable
   message key so the UI can render it in the active language. */
export function validatePromo(code: string, subtotal: number): PromoResult {
  const promo = findPromo(code);
  if (!promo) {
    return { ok: false, messageKey: 'shop.promo.msgInvalid' };
  }
  if (subtotal < promo.minSubtotal) {
    return {
      ok: false,
      messageKey: 'shop.promo.msgMin',
      messageParams: { min: promo.minSubtotal.toLocaleString('en-US') },
    };
  }
  return {
    ok: true,
    messageKey: 'shop.promo.msgApplied',
    messageParams: { code: promo.code },
    promo,
  };
}

/* Discount in SAR. Shipping-type promos are resolved at checkout (they zero
   the freight), so they contribute 0 to the goods subtotal here. */
export function computeDiscount(promo: Promo | null, subtotal: number): number {
  if (!promo || subtotal < promo.minSubtotal) return 0;
  if (promo.kind === 'percent') return Math.round((subtotal * promo.value) / 100);
  if (promo.kind === 'fixed') return Math.min(promo.value, subtotal);
  return 0;
}

export function isFreeShippingPromo(promo: Promo | null, subtotal: number): boolean {
  return !!promo && promo.kind === 'shipping' && subtotal >= promo.minSubtotal;
}