import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Order } from '@/pages/shop/types';
import { formatDate, formatSAR } from '@/pages/shop/lib/format';
import { cartonCount, isAir, laneOf } from '@/pages/shop/lib/tracking';

type PrintMode = 'invoice' | 'docs' | 'all';

/* Printable commercial invoice + shipping documents for a single order.
   The `.st-print-root` block is hidden on screen and revealed only when the
   browser prints, so the on-screen page stays clean. */
export default function OrderDocuments({ order }: { order: Order }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<PrintMode | null>(null);
  const air = isAir(order.shippingMethod);
  const lane = laneOf(order);
  const cartons = cartonCount(order);

  const printNow = (m: PrintMode) => {
    setMode(m);
    window.setTimeout(() => window.print(), 80);
  };

  const showInvoice = mode === 'invoice' || mode === 'all';
  const showDocs = mode === 'docs' || mode === 'all';

  return (
    <section className="st-docscard">
      <header className="st-docscard-head">
        <div>
          <h3>{t('orders.docs.title')}</h3>
          <p className="sub">{t('orders.docs.sub')}</p>
        </div>
      </header>

      <div className="st-docscard-list">
        <div className="st-docrow">
          <span className="ic"><i className="ri-file-text-line" /></span>
          <div className="tx">
            <b>{t('orders.docs.invoiceTitle')}</b>
            <span>{t('orders.docs.invoiceSub', { id: order.id })}</span>
          </div>
          <button type="button" className="st-btn ghost sm" onClick={() => printNow('invoice')}>
            <i className="ri-printer-line" /> {t('orders.docs.print')}
          </button>
        </div>

        <div className="st-docrow">
          <span className="ic"><i className="ri-file-shield-2-line" /></span>
          <div className="tx">
            <b>{t('orders.docs.shippingTitle')}</b>
            <span>{t('orders.docs.shippingSub')}</span>
          </div>
          <button type="button" className="st-btn ghost sm" onClick={() => printNow('docs')}>
            <i className="ri-printer-line" /> {t('orders.docs.print')}
          </button>
        </div>
      </div>

      <button type="button" className="st-btn primary block" onClick={() => printNow('all')}>
        <i className="ri-printer-line" /> {t('orders.docs.printAll')}
      </button>

      <div className="st-print-root" aria-hidden="true">
        {showInvoice && <InvoiceSheet order={order} lane={lane} air={air} />}
        {showDocs && <ShippingSheets order={order} lane={lane} air={air} cartons={cartons} />}
      </div>
    </section>
  );
}

function InvoiceSheet({
  order, lane, air,
}: { order: Order; lane: ReturnType<typeof laneOf>; air: boolean }) {
  const { t } = useTranslation();
  return (
    <article className="st-doc-sheet">
      <header className="st-doc-sheet-head">
        <div className="brand">
          <span className="mark">STA</span>
          <div>
            <b>{t('orders.invoice.brand')}</b>
            <span>{t('orders.invoice.brandSub')}</span>
          </div>
        </div>
        <div className="doc-title">
          <b>{t('orders.invoice.docTitle')}</b>
          <span>{t('orders.invoice.docTitleSub')}</span>
        </div>
      </header>

      <div className="st-doc-meta">
        <div><span>{t('orders.invoice.invoiceNo')}</span><b>{order.id}</b></div>
        <div><span>{t('orders.invoice.issueDate')}</span><b>{formatDate(order.createdAt)}</b></div>
        <div><span>{t('orders.invoice.trackingNo')}</span><b>{order.tracking}</b></div>
        <div><span>{t('orders.invoice.incoterm')}</span><b>{order.incoterm}</b></div>
      </div>

      <div className="st-doc-parties">
        <div className="party">
          <span className="lbl">{t('orders.invoice.exporter')}</span>
          <b>{t('orders.invoice.exporterName')}</b>
          <span>{t('orders.invoice.exporterLoc')}</span>
          <span>{t('orders.invoice.exporterOrigin')}</span>
        </div>
        <div className="party">
          <span className="lbl">{t('orders.invoice.consignee')}</span>
          <b>{order.customerName}</b>
          <span>{order.city}، {order.country}</span>
          <span>{t('orders.invoice.consigneePort', { hub: lane.destHub })}</span>
        </div>
      </div>

      <table className="st-doc-table">
        <thead>
          <tr>
            <th>{t('orders.invoice.colNo')}</th>
            <th>{t('orders.invoice.colDesc')}</th>
            <th>{t('orders.invoice.colFactory')}</th>
            <th>{t('orders.invoice.colQty')}</th>
            <th>{t('orders.invoice.colUnit')}</th>
            <th>{t('orders.invoice.colTotal')}</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((l, i) => (
            <tr key={l.id}>
              <td>{i + 1}</td>
              <td>{l.name}</td>
              <td>{l.factoryName}</td>
              <td>{l.qty.toLocaleString('en-US')}</td>
              <td>{formatSAR(l.unit)}</td>
              <td>{formatSAR(l.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="st-doc-totals">
        <div className="row"><span>{t('orders.invoice.subtotal')}</span><b>{formatSAR(order.subtotal)}</b></div>
        {order.discount > 0 && (
          <div className="row"><span>{t('orders.invoice.discount')}{order.promoCode ? ` (${order.promoCode})` : ''}</span><b>- {formatSAR(order.discount)}</b></div>
        )}
        <div className="row"><span>{t('orders.invoice.freight')}</span><b>{order.shippingCost === 0 ? t('orders.card.free') : formatSAR(order.shippingCost)}</b></div>
        <div className="row"><span>{t('orders.invoice.customs')}</span><b>{formatSAR(order.customs)}</b></div>
        <div className="row grand"><span>{t('orders.invoice.grand')}</span><b>{formatSAR(order.total)}</b></div>
      </div>

      <div className="st-doc-notes">
        <p>{t('orders.invoice.method', { method: air ? t('orders.shipDocs.methodAir') : t('orders.shipDocs.methodSea'), weight: order.weightKg.toLocaleString('en-US') })}</p>
        <p>{t('orders.invoice.note')}</p>
      </div>

      <footer className="st-doc-foot">
        <div className="sign">
          <span>{t('orders.invoice.sign')}</span>
          <i />
        </div>
        <div className="stamp">{t('orders.invoice.stamp')}</div>
      </footer>
    </article>
  );
}

function ShippingSheets({
  order, lane, air, cartons,
}: { order: Order; lane: ReturnType<typeof laneOf>; air: boolean; cartons: number }) {
  const { t } = useTranslation();
  const docChecks = [
    { icon: 'ri-file-text-line', label: t('orders.shipDocs.docInvoice') },
    { icon: 'ri-list-check-2', label: t('orders.shipDocs.docPacking') },
    air
      ? { icon: 'ri-plane-line', label: t('orders.shipDocs.docAwb') }
      : { icon: 'ri-ship-2-line', label: t('orders.shipDocs.docBl') },
    { icon: 'ri-award-line', label: t('orders.shipDocs.docOrigin') },
  ];

  return (
    <article className="st-doc-sheet">
      <header className="st-doc-sheet-head">
        <div className="brand">
          <span className="mark">STA</span>
          <div>
            <b>{t('orders.invoice.brand')}</b>
            <span>{t('orders.shipDocs.brandSub')}</span>
          </div>
        </div>
        <div className="doc-title">
          <b>{t('orders.shipDocs.docTitle')}</b>
          <span>{t('orders.shipDocs.docTitleSub')}</span>
        </div>
      </header>

      <div className="st-doc-meta">
        <div><span>{t('orders.shipDocs.orderNo')}</span><b>{order.id}</b></div>
        <div><span>{t('orders.shipDocs.trackingNo')}</span><b>{order.tracking}</b></div>
        <div><span>{t('orders.shipDocs.method')}</span><b>{air ? t('orders.shipDocs.methodAir') : t('orders.shipDocs.methodSea')}</b></div>
        <div><span>{t('orders.shipDocs.cartons')}</span><b>{t('orders.shipDocs.cartonsValue', { count: cartons })}</b></div>
      </div>

      <div className="st-doc-parties">
        <div className="party">
          <span className="lbl">{t('orders.shipDocs.shipFrom')}</span>
          <b>{lane.originHub}</b>
          <span>{lane.originName}</span>
        </div>
        <div className="party">
          <span className="lbl">{t('orders.shipDocs.shipTo')}</span>
          <b>{lane.destHub}</b>
          <span>{order.city}، {order.country}</span>
        </div>
      </div>

      <h4 className="st-doc-h4">{t('orders.shipDocs.packingList')}</h4>
      <table className="st-doc-table">
        <thead>
          <tr>
            <th>{t('orders.shipDocs.colNo')}</th>
            <th>{t('orders.shipDocs.colItem')}</th>
            <th>{t('orders.shipDocs.colFactory')}</th>
            <th>{t('orders.shipDocs.colQty')}</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((l, i) => (
            <tr key={l.id}>
              <td>{i + 1}</td>
              <td>{l.name}</td>
              <td>{l.factoryName}</td>
              <td>{l.qty.toLocaleString('en-US')}</td>
            </tr>
          ))}
          <tr className="sum">
            <td colSpan={3}>{t('orders.shipDocs.totalPieces')}</td>
            <td>{order.count.toLocaleString('en-US')}</td>
          </tr>
        </tbody>
      </table>

      <h4 className="st-doc-h4">{t('orders.shipDocs.accDocs')}</h4>
      <div className="st-doc-checks">
        {docChecks.map((d) => (
          <div className="chk" key={d.label}>
            <i className="ri-checkbox-circle-fill" />
            <div><b>{d.label}</b></div>
          </div>
        ))}
      </div>

      <div className="st-doc-barcode">
        <i className="ri-barcode-line" />
        <b>{order.tracking}</b>
      </div>

      <footer className="st-doc-foot">
        <p className="fine">{t('orders.shipDocs.fine')}</p>
        <div className="stamp">{t('orders.invoice.stamp')}</div>
      </footer>
    </article>
  );
}