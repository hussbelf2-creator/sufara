import { useTranslation } from 'react-i18next';
import type { Contract } from './types';

/* A formal, print-ready contract document. It carries the platform mark, both
   parties, the product and technical specs, the delivery terms, the clauses,
   the product images and both signature blocks. It is rendered inside the
   dedicated print overlay and is the only thing the browser prints. */
export default function ContractPrint({ contract }: { contract: Contract }) {
  const { t } = useTranslation();
  const c = contract;

  const signBlock = (label: string, name: string, signed: boolean) => (
    <div className="ct-doc-sign">
      <div className="role">{label}</div>
      <div className="name">{name || '—'}</div>
      <div className="line">
        {signed && <span className="sig">{name || '—'}</span>}
      </div>
      <div className="status" style={{ color: signed ? 'var(--accent-strong)' : '#8a5a12' }}>
        <i className={signed ? 'ri-checkbox-circle-line' : 'ri-time-line'} />{' '}
        {signed ? t('dashboard.contracts.docSigned') : t('dashboard.contracts.docNotSigned')}
      </div>
    </div>
  );

  return (
    <div className="ct-print-root" dir="rtl">
      <div className="ct-doc-head">
        <div className="ct-doc-brand">
          <div className="ct-doc-mark">STA</div>
          <div>
            <div className="bt">{t('dashboard.contracts.printBrand')}</div>
            <div className="bs">{t('dashboard.contracts.printBrandSub')}</div>
          </div>
        </div>
        <div className="ct-doc-title">
          <h2>{t('dashboard.contracts.printTitle')}</h2>
          <div className="ref">{t('dashboard.contracts.docRef')}: {c.id}</div>
          <div className="ref">{t('dashboard.contracts.docIssued')}: {c.updatedAt || c.createdAt}</div>
          <div className="ref">{t('dashboard.contracts.docStatus')}: {t(`dashboard.contracts.status.${c.status}`)}</div>
        </div>
      </div>

      <div className="ct-doc-sec">
        <h4>{t('dashboard.contracts.docParties')}</h4>
        <div className="ct-doc-parties">
          <div className="ct-doc-box">
            <div className="lbl">{t('dashboard.contracts.docBuyer')}</div>
            <div className="nm">{c.buyerCompany || c.buyer || '—'}</div>
            <div className="mt">{c.buyerCountry || '—'}</div>
          </div>
          <div className="ct-doc-box">
            <div className="lbl">{t('dashboard.contracts.docFactory')}</div>
            <div className="nm">{c.factory || '—'}</div>
            <div className="mt">{c.factoryCity || '—'}</div>
          </div>
        </div>
      </div>

      <div className="ct-doc-sec">
        <h4>{t('dashboard.contracts.docProduct')}</h4>
        <table className="ct-doc-table">
          <tbody>
            <tr>
              <th>{t('dashboard.contracts.productLabel')}</th>
              <td>{c.product || '—'}</td>
              <th>{t('dashboard.contracts.quantityLabel')}</th>
              <td>{c.quantity || '—'}</td>
            </tr>
            <tr>
              <th>{t('dashboard.contracts.unitPriceLabel')}</th>
              <td>{c.unitPrice || '—'}</td>
              <th>{t('dashboard.contracts.totalLabel')}</th>
              <td>{c.total || '—'}</td>
            </tr>
            <tr>
              <th>{t('dashboard.contracts.currencyLabel')}</th>
              <td>{c.currency || '—'}</td>
              <th>{t('dashboard.contracts.paymentLabel')}</th>
              <td>{c.payment || '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {!!c.specs.length && (
        <div className="ct-doc-sec">
          <h4>{t('dashboard.contracts.docSpecs')}</h4>
          <table className="ct-doc-table">
            <thead>
              <tr>
                <th>{t('dashboard.contracts.specLabel')}</th>
                <th>{t('dashboard.contracts.specValue')}</th>
              </tr>
            </thead>
            <tbody>
              {c.specs.map((s, i) => (
                <tr key={`${s.label}-${i}`}>
                  <td>{s.label || '—'}</td>
                  <td>{s.value || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="ct-doc-sec">
        <h4>{t('dashboard.contracts.docDelivery')}</h4>
        <table className="ct-doc-table">
          <tbody>
            <tr>
              <th>{t('dashboard.contracts.incotermLabel')}</th>
              <td>{c.incoterm || '—'}</td>
              <th>{t('dashboard.contracts.portLabel')}</th>
              <td>{c.port || '—'}</td>
            </tr>
            <tr>
              <th>{t('dashboard.contracts.leadLabel')}</th>
              <td>{c.leadDays || '—'}</td>
              <th>{t('dashboard.contracts.deliveryDateLabel')}</th>
              <td>{c.deliveryDate || '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {!!c.clauses.length && (
        <div className="ct-doc-sec">
          <h4>{t('dashboard.contracts.docClauses')}</h4>
          <ol className="ct-doc-clauses">
            {c.clauses.map((cl, i) => (
              <li key={i}>{cl}</li>
            ))}
          </ol>
        </div>
      )}

      {!!c.images.length && (
        <div className="ct-doc-sec">
          <h4>{t('dashboard.contracts.docImages')}</h4>
          <div className="ct-doc-imgs">
            {c.images.map((img, i) => (
              <img key={i} src={img} alt={`${c.product} ${i + 1}`} />
            ))}
          </div>
        </div>
      )}

      <div className="ct-doc-sec">
        <h4>{t('dashboard.contracts.docSignatures')}</h4>
        <div className="ct-doc-signs">
          {signBlock(t('dashboard.contracts.docSignBuyer'), c.buyerCompany || c.buyer, c.signBuyer)}
          {signBlock(t('dashboard.contracts.docSignFactory'), c.factory, c.signFactory)}
        </div>
      </div>

      <div className="ct-doc-foot">{t('dashboard.contracts.docFooter')}</div>
    </div>
  );
}