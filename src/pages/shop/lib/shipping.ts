/* Shipping + customs estimation for the export checkout.
   The real freight is confirmed later by the export desk, so everything here
   is a transparent, deterministic estimate driven by destination zone,
   shipment weight and the chosen shipping method. */

import type { ShippingEstimate } from '@/pages/shop/types';

interface Zone {
  sea: number; // SAR per chargeable kg, sea freight
  air: number; // SAR per chargeable kg, air freight
  customs: number; // customs + duties, share of the net goods value
}

const zones: Record<string, Zone> = {
  gulf: { sea: 5, air: 16, customs: 0.05 },
  mena: { sea: 7.5, air: 24, customs: 0.09 },
  asia: { sea: 9, air: 28, customs: 0.12 },
  africa: { sea: 11, air: 34, customs: 0.15 },
  europe: { sea: 10, air: 30, customs: 0.13 },
  americas: { sea: 13, air: 42, customs: 0.11 },
};

const countryZone: Record<string, string> = {
  ae: 'gulf',
  jo: 'gulf',
  eg: 'mena',
  ma: 'mena',
  tr: 'mena',
  pk: 'asia',
  id: 'asia',
  my: 'asia',
  bd: 'asia',
  ng: 'africa',
  ke: 'africa',
  za: 'africa',
  gb: 'europe',
  fr: 'europe',
  de: 'europe',
  us: 'americas',
};

/* Consolidation, QC inspection and export documents — charged once per order. */
const HANDLING = 120;
const MIN_CHARGEABLE_KG = 1;
/* Small sea shipments still pay for a pallet slot, so floor them. */
const SEA_MIN = 260;

/* Parses a product's free-text weight ("1 كجم", "500 جم", "3 × 120 جم",
   "18 كجم/م²") into kilograms so the whole cart can be summed. */
export function parseWeightKg(weight: string): number {
  if (!weight) return 0.5;
  const s = weight.replace(/\s+/g, ' ').trim();

  const unitToKg = (unit: string): number => {
    if (/كجم|كيلو|كج|kg/i.test(unit)) return 1;
    // grams (جم / غرام / جرام / g) and millilitres (مل / ml) both ≈ 1 g.
    return 0.001;
  };

  // Multi-pack: "3 × 120 جم"
  const multi = s.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*([^\d\s]+)/);
  if (multi) {
    return Number(multi[1]) * Number(multi[2]) * unitToKg(multi[3]);
  }

  const single = s.match(/(\d+(?:\.\d+)?)\s*([^\d\s]+)/);
  if (!single) return 0.5;
  return Number(single[1]) * unitToKg(single[2]);
}

function zoneOf(countryCode: string): Zone {
  return zones[countryZone[countryCode] ?? 'asia'] ?? zones.asia;
}

export interface EstimateInput {
  countryCode: string;
  method: 'sea' | 'air';
  netSubtotal: number; // goods value after discounts
  weightKg: number;
  freeShipping?: boolean;
}

/* Full shipping + customs estimate in SAR. */
export function estimateShipping(input: EstimateInput): ShippingEstimate {
  const { countryCode, method, netSubtotal, weightKg, freeShipping } = input;
  const zone = zoneOf(countryCode);
  const chargeable = Math.max(weightKg, MIN_CHARGEABLE_KG);

  let shipping: number;
  if (freeShipping) {
    shipping = 0;
  } else {
    const rate = method === 'air' ? zone.air : zone.sea;
    shipping = HANDLING + chargeable * rate;
    if (method === 'sea') shipping = Math.max(shipping, SEA_MIN);
    shipping = Math.round(shipping);
  }

  const customs = Math.round(Math.max(netSubtotal, 0) * zone.customs);
  return { weightKg: chargeable, shipping, customs, total: shipping + customs };
}