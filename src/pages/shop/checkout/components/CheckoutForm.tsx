import { useMemo, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { rfqIncoterms } from '@/mocks/shop';
import { useCatalog } from '@/hooks/useCatalog';
import { useAmbassadorPages } from '@/hooks/useAmbassadorPages';
import type { Order, OrderLineSnapshot } from '@/pages/shop/types';
import { useCart, type CartItem } from '@/pages/shop/components/CartProvider';
import { estimateShipping, parseWeightKg } from '@/pages/shop/lib/shipping';
import { createOrderId, createTracking, saveOrder } from '@/pages/shop/lib/ordersStore';
import OrderReview from './OrderReview';

/* Order submission endpoint (STA forms). */
const CHECKOUT_SUBMIT = 'https://readdy.ai/api/form/db79k3n799gd4v2feddg';

/* ── Payment plug-in point ───────────────────────────────────────────────
   Flip PAYMENT_READY to true once a payment provider (Stripe / PayPal /
   Toss / Square) is connected, then create the checkout session inside
   onSubmit() instead of posting the order as a request. */
const PAYMENT_READY = false;

const shippingMethods = [
  { id: 'sea', labelKey: 'shipSea', etaKey: 'shipSeaEta', noteKey: 'shipSeaNote' },
  { id: 'air', labelKey: 'shipAir', etaKey: 'shipAirEta', noteKey: 'shipAirNote' },
] as const;

const paymentMethods = [
  { id: 'card', labelKey: 'payCard', icon: 'ri-bank-card-line' },
  { id: 'applepay', labelKey: 'payApple', icon: 'ri-apple-fill' },
  { id: 'transfer', labelKey: 'payTransfer', icon: 'ri-bank-line' },
];

interface Props {
  items: CartItem[];
  count: number;
  subtotal: number;
  savings: number;
  onDone: (order: Order) => void;
}

/* Shipping details + order review, with a clearly marked payment step that is
   ready to be wired to a real provider. */
export default function CheckoutForm({ items, count, subtotal, savings, onDone }: Props) {
  const { t } = useTranslation();
  const { rfqCountries, factories } = useCatalog();
  const { clear, discount, promo, freeShipping } = useCart();
  const { ambRegistry } = useAmbassadorPages();
  const ambassadorName = promo?.ambassadorSlug
    ? ambRegistry.find((a) => a.slug === promo.ambassadorSlug)?.name
    : undefined;
  const [country, setCountry] = useState('');
  const [shipping, setShipping] = useState<'sea' | 'air'>('sea');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  const ports = rfqCountries.find((c) => c.name === country)?.ports ?? [];

  /* Live cost estimate — recomputed whenever country, method or the cart change. */
  const weightKg = useMemo(
    () => items.reduce((sum, i) => sum + parseWeightKg(i.product.weight) * i.qty, 0),
    [items],
  );
  const countryCode = rfqCountries.find((c) => c.name === country)?.code ?? '';
  const netSubtotal = Math.max(0, subtotal - discount);
  const estimate = useMemo(
    () => estimateShipping({ countryCode, method: shipping, netSubtotal, weightKg, freeShipping }),
    [countryCode, shipping, netSubtotal, weightKg, freeShipping],
  );

  const buildOrder = (name: string): Order => {
    const lines: OrderLineSnapshot[] = items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      image: item.product.image,
      factoryName: factories.find((f) => f.id === item.product.factoryId)?.name ?? '',
      qty: item.qty,
      unit: item.unit,
      total: item.total,
    }));
    const method = shippingMethods.find((m) => m.id === shipping);
    return {
      id: createOrderId(),
      createdAt: Date.now(),
      status: 'processing',
      tracking: createTracking(),
      eta: method ? t(`shop.checkout.${method.etaKey}`) : '',
      lines,
      count,
      subtotal,
      savings,
      discount,
      shippingCost: estimate.shipping,
      customs: estimate.customs,
      total: netSubtotal + estimate.shipping + estimate.customs,
      weightKg: estimate.weightKg,
      customerName: name || 'STA',
      country: country || '—',
      city: (document.querySelector('#co-city') as HTMLInputElement | null)?.value || '—',
      port: (document.querySelector('#co-port') as HTMLSelectElement | null)?.value || '—',
      shippingMethod: method ? t(`shop.checkout.${method.labelKey}`) : t('shop.checkout.shipSea'),
      incoterm: (document.querySelector('#co-incoterm') as HTMLSelectElement | null)?.value || 'CIF',
      promoCode: promo?.code,
      ambassadorName,
    };
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    const honeypot = (form.querySelector('[name="website_alt"]') as HTMLInputElement | null)?.value?.trim() ?? '';
    const recipient = (form.querySelector('[name="full_name"]') as HTMLInputElement | null)?.value?.trim() ?? '';

    if (honeypot) {
      const order = buildOrder(recipient);
      await saveOrder(order);
      clear();
      onDone(order);
      return;
    }

    const data = new FormData(form);
    data.delete('website_alt');
    data.set('order_shipping', String(estimate.shipping));
    data.set('order_customs', String(estimate.customs));
    data.set('order_discount', String(discount));
    data.set('order_total', String(netSubtotal + estimate.shipping + estimate.customs));
    if (ambassadorName) data.set('order_ambassador', ambassadorName);
    const body = new URLSearchParams();
    data.forEach((value, key) => {
      if (typeof value === 'string' && value.trim() !== '') body.append(key, value);
    });

    setStatus('sending');
    setFormError('');
    try {
      const response = await fetch(CHECKOUT_SUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const responseText = await response.text();
      let parsed: { code?: string; message?: string; meta?: { message?: string; detail?: string } } | null = null;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = null;
      }
      const serverMsg = parsed?.meta?.message || parsed?.message || parsed?.meta?.detail || responseText;
      const isSpam = typeof serverMsg === 'string' && serverMsg.toLowerCase().includes('spam');

      if (response.ok && parsed?.code === 'OK' && !isSpam) {
        const order = buildOrder(recipient);
        await saveOrder(order);
        clear();
        onDone(order);
      } else {
        setStatus('error');
        setFormError(typeof serverMsg === 'string' && serverMsg ? serverMsg : t('shop.checkout.errorDefault'));
      }
    } catch {
      setStatus('error');
      setFormError(t('shop.checkout.errorNetwork'));
    }
  };

  return (
    <form id="checkout-order-form" data-readdy-form onSubmit={onSubmit} className="st-co-grid">
      <input type="hidden" name="form_type" value="Order" />
      <input type="hidden" name="order_items" value={items.map((i) => `${i.product.name} x ${i.qty}`).join(' | ')} />
      <input type="hidden" name="order_count" value={String(count)} />
      <input type="hidden" name="order_subtotal" value={String(subtotal)} />
      <input type="hidden" name="order_savings" value={String(savings)} />
      <input type="hidden" name="order_currency" value="SAR" />

      <div className="st-co-form">
        <section className="st-co-card">
          <div className="st-co-step">
            <span className="n">1</span>
            <h3>{t('shop.checkout.step1')}</h3>
            <span className="hint">{t('shop.checkout.step1Hint')}</span>
          </div>

          <div className="st-form-grid">
            <div className="st-field">
              <label htmlFor="co-name">{t('shop.checkout.fName')} <span className="req">*</span></label>
              <input id="co-name" name="full_name" type="text" placeholder={t('shop.checkout.fNamePh')} required />
            </div>

            <div className="st-field">
              <label htmlFor="co-company">{t('shop.checkout.fCompany')} <span className="req">*</span></label>
              <input id="co-company" name="company" type="text" placeholder={t('shop.checkout.fCompanyPh')} required />
            </div>

            <div className="st-field">
              <label htmlFor="co-email">{t('shop.checkout.fEmail')} <span className="req">*</span></label>
              <input id="co-email" name="email" type="email" placeholder="name@company.com" required />
            </div>

            <div className="st-field">
              <label htmlFor="co-phone">{t('shop.checkout.fPhone')} <span className="req">*</span></label>
              <input id="co-phone" name="phone" type="tel" placeholder="+966 5X XXX XXXX" required />
            </div>

            <div className="st-field">
              <label htmlFor="co-country">{t('shop.checkout.fCountry')} <span className="req">*</span></label>
              <select
                id="co-country"
                name="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              >
                <option value="">{t('shop.checkout.chooseCountry')}</option>
                {rfqCountries.map((c) => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="st-field">
              <label htmlFor="co-city">{t('shop.checkout.fCity')} <span className="req">*</span></label>
              <input id="co-city" name="city" type="text" placeholder={t('shop.checkout.fCityPh')} required />
            </div>

            <div className="st-field">
              <label htmlFor="co-port">{t('shop.checkout.fPort')} <span className="req">*</span></label>
              <select id="co-port" name="port" required disabled={!country} defaultValue="">
                <option value="">{country ? t('shop.checkout.choosePort') : t('shop.checkout.chooseCountryFirst')}</option>
                {ports.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="st-field">
              <label htmlFor="co-incoterm">{t('shop.checkout.fIncoterm')}</label>
              <select id="co-incoterm" name="incoterm" defaultValue="CIF">
                {rfqIncoterms.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            <div className="st-field full">
              <label htmlFor="co-address">{t('shop.checkout.fAddress')} <span className="req">*</span></label>
              <input
                id="co-address"
                name="address"
                type="text"
                placeholder={t('shop.checkout.fAddressPh')}
                required
              />
            </div>

            <div className="st-field full">
              <label htmlFor="co-notes">{t('shop.checkout.fNotes')}</label>
              <textarea
                id="co-notes"
                name="notes"
                maxLength={500}
                placeholder={t('shop.checkout.fNotesPh')}
              />
              <span className="hint">{t('shop.checkout.fNotesHint')}</span>
            </div>
          </div>
        </section>

        <section className="st-co-card">
          <div className="st-co-step">
            <span className="n">2</span>
            <h3>{t('shop.checkout.step2')}</h3>
            <span className="hint">{t('shop.checkout.step2Hint', { weight: weightKg.toLocaleString('en-US') })}</span>
          </div>

          <div className="st-co-methods">
            {shippingMethods.map((m) => (
              <label key={m.id} className={`st-co-method ${shipping === m.id ? 'is-on' : ''}`}>
                <input
                  type="radio"
                  name="shipping_method"
                  value={t(`shop.checkout.${m.labelKey}`)}
                  checked={shipping === m.id}
                  onChange={() => setShipping(m.id)}
                />
                <span className="dot"><i className="ri-check-line" /></span>
                <span className="body">
                  <span className="t">{t(`shop.checkout.${m.labelKey}`)}</span>
                  <span className="e">{t(`shop.checkout.${m.etaKey}`)} · {t(`shop.checkout.${m.noteKey}`)}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="st-co-estimate">
            <div className="erow">
              <span className="k"><i className="ri-scales-3-line" /> {t('shop.checkout.estWeightRow')}</span>
              <span className="v">{t('shop.checkout.estWeightValue', { weight: weightKg.toLocaleString('en-US') })}</span>
            </div>
            <div className="erow">
              <span className="k"><i className="ri-ship-2-line" /> {t('shop.checkout.estShippingRow')}</span>
              <span className="v">{freeShipping ? t('shop.checkout.estFree') : t('shop.checkout.estApprox', { value: estimate.shipping.toLocaleString('en-US') })}</span>
            </div>
            <div className="erow">
              <span className="k"><i className="ri-bank-line" /> {t('shop.checkout.estCustomsRow')}</span>
              <span className="v">{t('shop.checkout.estApprox', { value: estimate.customs.toLocaleString('en-US') })}</span>
            </div>
          </div>
        </section>

        <section className="st-co-card">
          <div className="st-co-step">
            <span className="n">
              <i className="ri-bank-card-line" />
            </span>
            <h3>{t('shop.checkout.step3')}</h3>
            <span className="hint">{t('shop.checkout.step3Hint')}</span>
          </div>

          <div className="st-co-paylist">
            {paymentMethods.map((p) => (
              <div className="st-co-pay" key={p.id}>
                <span className="ic"><i className={p.icon} /></span>
                <span className="t">{t(`shop.checkout.${p.labelKey}`)}</span>
                <span className="soon">{PAYMENT_READY ? t('shop.checkout.payEnabled') : t('shop.checkout.paySoon')}</span>
              </div>
            ))}
          </div>

          <div className="st-co-note">
            <i className="ri-information-line" />
            <span>{t('shop.checkout.payNote')}</span>
          </div>
        </section>
      </div>

      <aside className="st-co-aside">
        <div className="st-co-card">
          <OrderReview
            items={items}
            count={count}
            subtotal={subtotal}
            savings={savings}
            discount={discount}
            shipping={estimate.shipping}
            customs={estimate.customs}
            weightKg={estimate.weightKg}
            freeShipping={freeShipping}
          />

          {status === 'error' && (
            <div className="st-form-status err" role="alert">
              <i className="ri-error-warning-line" />
              <span>{formError}</span>
            </div>
          )}

          <button type="submit" className="st-btn primary block" disabled={status === 'sending'}>
            {status === 'sending' ? (
              <>
                <i className="ri-loader-4-line" /> {t('shop.checkout.confirming')}
              </>
            ) : (
              <>
                <i className="ri-lock-2-line" /> {t('shop.checkout.confirm')}
              </>
            )}
          </button>

          <p className="hint" style={{ textAlign: 'center' }}>
            {t('shop.checkout.confirmHint')}
          </p>

          <ul className="trust">
            <li><i className="ri-truck-line" /> {t('shop.checkout.trustUnified')}</li>
            <li><i className="ri-shield-check-line" /> {t('shop.checkout.trustEscrow')}</li>
            <li><i className="ri-refund-2-line" /> {t('shop.checkout.trustReplace')}</li>
          </ul>
        </div>
      </aside>

      <input
        className="st-extra-field"
        type="text"
        name="website_alt"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        readOnly
      />
    </form>
  );
}