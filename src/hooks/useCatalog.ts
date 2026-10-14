import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category, Factory, FactoryExtra, Order, Product } from '@/pages/shop/types';
import {
  products as baseProducts,
  factories as baseFactories,
  categories as baseCategories,
  factoryExtra as baseFactoryExtra,
  rfqCountries as baseCountries,
  rfqIncoterms,
} from '@/mocks/shop';
import { sampleOrders } from '@/mocks/orders';
import { productText } from '@/mocks/catalog/en/products';
import { factoryText, factoryExtraText } from '@/mocks/catalog/en/factories';
import { categoryText } from '@/mocks/catalog/en/categories';
import { countryText } from '@/mocks/catalog/en/countries';
import { orderText } from '@/mocks/catalog/en/orders';

interface OrderOverride {
  customerName?: string;
  country?: string;
  city?: string;
  port?: string;
  shippingMethod?: string;
  eta?: string;
  lines?: { name?: string; factoryName?: string }[];
}

/* Returns the storefront catalogue with every human-readable field resolved in
   the shopper's current language. Arabic is the base data; English is layered
   on top from src/mocks/catalog/en/*. Structural data (prices, images, tiers,
   stock) never changes, so all consumers read the exact same shapes. */
export function useCatalog() {
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase();
  const en = lang.startsWith('en');

  return useMemo(() => {
    if (!en) {
      return {
        products: baseProducts as Product[],
        factories: baseFactories as Factory[],
        categories: baseCategories as Category[],
        factoryExtra: baseFactoryExtra as Record<string, FactoryExtra>,
        rfqCountries: baseCountries,
        rfqIncoterms,
        sampleOrders: sampleOrders as Order[],
      };
    }

    const pText = productText as Record<string, Record<string, unknown>>;
    const fText = factoryText as Record<string, Record<string, unknown>>;
    const cText = categoryText as Record<string, Record<string, unknown>>;
    const feText = factoryExtraText as Record<string, Record<string, unknown>>;
    const coText = countryText as Record<string, Record<string, unknown>>;
    const oText = orderText as Record<string, OrderOverride>;

    const products = (baseProducts as Product[]).map((p) => ({
      ...p,
      ...(pText[p.id] ?? {}),
    })) as Product[];

    const factories = (baseFactories as Factory[]).map((f) => ({
      ...f,
      ...(fText[f.id] ?? {}),
    })) as Factory[];

    const categories = (baseCategories as Category[]).map((c) => ({
      ...c,
      ...(cText[c.id] ?? {}),
    })) as Category[];

    const extra: Record<string, FactoryExtra> = {};
    Object.keys(baseFactoryExtra).forEach((id) => {
      extra[id] = { ...baseFactoryExtra[id], ...(feText[id] ?? {}) } as FactoryExtra;
    });

    const countries = baseCountries.map((c) => ({
      ...c,
      ...(coText[c.code] ?? {}),
    })) as typeof baseCountries;

    const orders = (sampleOrders as Order[]).map((o) => {
      const ov = oText[o.id];
      if (!ov) return o;
      return {
        ...o,
        customerName: ov.customerName ?? o.customerName,
        country: ov.country ?? o.country,
        city: ov.city ?? o.city,
        port: ov.port ?? o.port,
        shippingMethod: ov.shippingMethod ?? o.shippingMethod,
        eta: ov.eta ?? o.eta,
        lines: o.lines.map((l, i) => ({ ...l, ...(ov.lines?.[i] ?? {}) })),
      };
    });

    return {
      products,
      factories,
      categories,
      factoryExtra: extra,
      rfqCountries: countries,
      rfqIncoterms,
      sampleOrders: orders,
    };
  }, [en]);
}