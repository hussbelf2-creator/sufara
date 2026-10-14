export interface PriceTier {
  min: number;
  max: number;
  price: number;
}

export interface Wholesale {
  moq: number;
  tiers: PriceTier[];
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  factoryId: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  image: string;
  tags: string[];
  shortDesc: string;
  description: string;
  weight: string;
  hs: string;
  origin: string;
  stock: number;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
  wholesale?: Wholesale;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  blurb: string;
  count: number;
  image: string;
}

export interface Factory {
  id: string;
  name: string;
  city: string;
  since: number;
  rating: number;
  products: number;
  verified: boolean;
  blurb: string;
}

export interface CountryPort {
  code: string;
  name: string;
  ports: string[];
}

export interface FactoryExtra {
  cover: string;
  workshop: string;
  certifications: string[];
  markets: string[];
  responseTime: string;
  employees: string;
  area: string;
  address: string;
}

export type PromoKind = 'percent' | 'fixed' | 'shipping';

export interface Promo {
  code: string;
  label: string;
  description: string;
  kind: PromoKind;
  value: number;
  minSubtotal: number;
  /** Set when the code belongs to an ambassador marketing page. */
  ambassadorSlug?: string;
  factoryId?: string;
}

export interface OrderLineSnapshot {
  id: string;
  name: string;
  image: string;
  factoryName: string;
  qty: number;
  unit: number;
  total: number;
}

export interface Order {
  id: string;
  createdAt: number;
  status: string;
  tracking: string;
  eta: string;
  lines: OrderLineSnapshot[];
  count: number;
  subtotal: number;
  savings: number;
  discount: number;
  shippingCost: number;
  customs: number;
  total: number;
  weightKg: number;
  customerName: string;
  country: string;
  city: string;
  port: string;
  shippingMethod: string;
  incoterm: string;
  promoCode?: string;
  ambassadorName?: string;
}

export interface ShippingEstimate {
  weightKg: number;
  shipping: number;
  customs: number;
  total: number;
}