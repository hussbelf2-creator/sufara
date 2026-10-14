import { useTranslation } from 'react-i18next';
import { useCatalog } from '@/hooks/useCatalog';
import { useAmbassadorPages } from '@/hooks/useAmbassadorPages';
import { formatSAR } from '@/pages/shop/lib/format';
import { useCart, type CartItem } from '@/pages/shop/components/CartProvider';
import PromoBox from '@/pages/shop/components/PromoBox';

interface Props {
  items: CartItem[];
  count: number;
  subtotal: number;
  savings: number;
  discount: number;
  shipping: number;
  customs: number;
  weightKg: number;
  freeShipping: boolean;
}

/* A compact review of everything in the order — shown beside the shipping
   form so the merchant can confirm the lines and the live cost estimate
   before placing the order. */
export default function OrderReview({
  items, count, subtotal, savings, discount, shipping, customs, weightKg, freeShipping,
}: Props) {
  const { t } = useTranslation();
  const { factories } = useCatalog();
  const { promo } = useCart();
  const p = useAmbassadorPages();
  const ambName = promo?.ambassadorSlug
    ? p.ambRegistry.find((a) => a.slug === promo.ambassadorSlug)?.name
    : undefined;
  const net = Math.max(0, subtotal - discount);
  const total = net + shipping + customs;

  return (
    <>
      <div className="st-co-step">
        <span className="n"><i className="ri-file-list-3-line" /></span>
        <h3>{t('shop.checkout.reviewTitle')}</h3>
        <span className="hint">{t('shop.checkout.reviewPieces', { count: count.toLocaleString('en-US') })}</span>
      </div>

      <ul className="st-co-items">
        {items.map((item) => {
          const factory = factories.find((f) => f.id === item.product.factoryId);
          return (
            <li className="st-co-item" key={item.id}>
              <div className="pic">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  title={item.product.name}
                  width={56}
                  height={56}
                />
                <span className="q">{item.qty}</span>
              </div>
              <div className="body">
                <div className="nm">{item.product.name}</div>
                {factory && (
                  <div className="fac">
                    <i className="ri-store-2-line" /> {factory.name}
                  </div>
                )}
              </div>
              <div className="pr">{formatSAR(item.total)}</div>
            </li>
          );
        })}
      </ul>

      <PromoBox compact />

      <div className="st-co-totals">
        <div className="row">
          <span>{t('shop.checkout.rSubtotal')}</span>
          <b>{formatSAR(subtotal)}</b>
        </div>
        {savings > 0 && (
          <div className="row save">
            <span>{t('shop.checkout.rWholesaleSavings')}</span>
            <b>- {formatSAR(savings)}</b>
          </div>
        )}
        {discount > 0 && (
          <div className="row save">
            <span>{ambName ? t('shop.checkout.rAmbDiscount', { name: ambName }) : t('shop.checkout.rPromoDiscount')}</span>
            <b>- {formatSAR(discount)}</b>
          </div>
        )}
        <div className="row">
          <span>{t('shop.checkout.rShipping')} {weightKg > 0 && <small>{t('shop.checkout.rWeight', { weight: weightKg.toLocaleString('en-US') })}</small>}</span>
          <b>{freeShipping ? t('shop.checkout.rFree') : formatSAR(shipping)}</b>
        </div>
        <div className="row">
          <span>{t('shop.checkout.rCustoms')} <small>{t('shop.checkout.rCustomsSmall')}</small></span>
          <b>{formatSAR(customs)}</b>
        </div>
        <div className="row total">
          <span>{t('shop.checkout.rTotal')}</span>
          <b>{formatSAR(total)}</b>
        </div>
      </div>

      <p className="hint" style={{ marginTop: 10, textAlign: 'right' }}>
        <i className="ri-information-line" /> {t('shop.checkout.rHint')}
      </p>
    </>
  );
}