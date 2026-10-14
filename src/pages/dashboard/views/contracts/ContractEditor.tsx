import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Pill, PageHead, Toast } from '@/pages/dashboard/components/ui';
import { statusTone } from './types';
import type { Contract, ContractRole } from './types';

type Props = {
  role: ContractRole;
  initial: Contract;
  onSave: (c: Contract, action: 'saved' | 'submitted' | 'signed') => void;
  onCancel: () => void;
};

const INCOTERMS = ['CIF', 'FOB', 'EXW', 'DDP', 'DAP'];

export default function ContractEditor({
  role, initial, onSave, onCancel,
}: Props) {
  const { t } = useTranslation();
  const [c, setC] = useState<Contract>(initial);
  const [clauseKey, setClauseKey] = useState('');
  const [clauseDraft, setClauseDraft] = useState('');
  const [toast, setToast] = useState('');

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2400);
  };

  const set = <K extends keyof Contract>(key: K, value: Contract[K]) => {
    setC((p) => ({ ...p, [key]: value }));
  };

  const valid = () => {
    const hasParty = role === 'factory' ? c.buyer.trim() : c.factory.trim();
    if (!hasParty || !c.product.trim()) {
      flash(t('dashboard.contracts.requiredNote'));
      return false;
    }
    return true;
  };

  const save = (action: 'saved' | 'submitted' | 'signed') => {
    if (!valid()) return;
    const next: Contract = { ...c, updatedAt: t('dashboard.common.now') };
    if (action === 'saved') next.status = 'draft';
    if (action === 'submitted') next.status = 'pending';
    if (action === 'signed') {
      if (role === 'buyer') next.signBuyer = true;
      if (role === 'factory') next.signFactory = true;
      next.status = next.signBuyer && next.signFactory ? 'active' : 'pending';
    }
    onSave(next, action);
  };

  const setSpec = (i: number, patch: Partial<{ label: string; value: string }>) => {
    setC((p) => ({ ...p, specs: p.specs.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) }));
  };

  const addImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setC((p) => ({ ...p, images: [...p.images, String(reader.result ?? '')] }));
      flash(t('dashboard.contracts.imageUploadToast'));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const addAttachment = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setC((p) => ({
      ...p,
      attachments: [...p.attachments, { name: file.name, size: `${Math.max(1, Math.round(file.size / 1024))}KB` }],
    }));
    flash(t('dashboard.contracts.attachUploadToast'));
    e.target.value = '';
  };

  const addClauseFromLibrary = () => {
    if (!clauseKey) return;
    const text = t(`dashboard.contracts.clauseLibrary.${clauseKey}`);
    setC((p) => (p.clauses.includes(text) ? p : { ...p, clauses: [...p.clauses, text] }));
    setClauseKey('');
  };

  const addClauseText = () => {
    if (!clauseDraft.trim()) return;
    setC((p) => ({ ...p, clauses: [...p.clauses, clauseDraft.trim()] }));
    setClauseDraft('');
  };

  const clauseKeys = ['quality', 'packing', 'delivery', 'payment', 'inspection', 'arbitration'];

  return (
    <>
      <PageHead
        eyebrow={t('dashboard.contracts.eyebrow')}
        title={initial.product ? t('dashboard.contracts.editorEdit') : t('dashboard.contracts.editorNew')}
        sub={t('dashboard.contracts.editorSub')}
        actions={(
          <>
            <button type="button" className="btn ghost" onClick={onCancel}>
              <i className="ri-arrow-right-line" /> {t('dashboard.contracts.backToList')}
            </button>
            <button type="button" className="btn ghost" onClick={() => save('saved')}>
              <i className="ri-draft-line" /> {t('dashboard.contracts.saveDraft')}
            </button>
            {role === 'factory' ? (
              <button type="button" className="btn primary" onClick={() => save('signed')}>
                <i className="ri-quill-pen-line" /> {t('dashboard.contracts.signAndSend')}
              </button>
            ) : (
              <button type="button" className="btn primary" onClick={() => save('submitted')}>
                <i className="ri-send-plane-line" /> {t('dashboard.contracts.submitForSign')}
              </button>
            )}
          </>
        )}
      />

      <div className="row-between wrap mb" style={{ gap: 10 }}>
        <Pill tone={statusTone(c.status)}>{t(`dashboard.contracts.status.${c.status}`)}</Pill>
        <div className="row-between wrap" style={{ gap: 8 }}>
          <span className="small muted">{t('dashboard.contracts.signedByBuyer')}</span>
          <Pill tone={c.signBuyer ? 'ok' : 'mute'}>{c.signBuyer ? t('dashboard.contracts.signed') : t('dashboard.contracts.notSigned')}</Pill>
          <span className="small muted">{t('dashboard.contracts.signedByFactory')}</span>
          <Pill tone={c.signFactory ? 'ok' : 'mute'}>{c.signFactory ? t('dashboard.contracts.signed') : t('dashboard.contracts.notSigned')}</Pill>
        </div>
      </div>

      <div className="split wide mb">
        <div className="stack">
          <Card title={t('dashboard.contracts.sectionParties')}>
            <div className="grid c2">
              <div className="field">
                <label htmlFor="ct-buyer">{t('dashboard.contracts.buyerCompany')}</label>
                <input id="ct-buyer" value={c.buyerCompany} onChange={(e) => set('buyerCompany', e.target.value)} placeholder={t('dashboard.contracts.buyerCompany')} />
              </div>
              <div className="field">
                <label htmlFor="ct-country">{t('dashboard.contracts.buyerCountry')}</label>
                <input id="ct-country" value={c.buyerCountry} onChange={(e) => set('buyerCountry', e.target.value)} placeholder={t('dashboard.contracts.buyerCountry')} />
              </div>
              <div className="field">
                <label htmlFor="ct-factory">{t('dashboard.contracts.factoryLabel')}</label>
                <input id="ct-factory" value={c.factory} onChange={(e) => set('factory', e.target.value)} placeholder={t('dashboard.contracts.factoryPlaceholder')} />
              </div>
              <div className="field">
                <label htmlFor="ct-city">{t('dashboard.contracts.factoryCity')}</label>
                <input id="ct-city" value={c.factoryCity} onChange={(e) => set('factoryCity', e.target.value)} placeholder={t('dashboard.contracts.factoryCity')} />
              </div>
            </div>
          </Card>

          <Card title={t('dashboard.contracts.sectionProduct')}>
            <div className="field">
              <label htmlFor="ct-product">{t('dashboard.contracts.productLabel')}</label>
              <input id="ct-product" value={c.product} onChange={(e) => set('product', e.target.value)} placeholder={t('dashboard.contracts.productPlaceholder')} />
            </div>
            <div className="grid c2">
              <div className="field">
                <label htmlFor="ct-qty">{t('dashboard.contracts.quantityLabel')}</label>
                <input id="ct-qty" value={c.quantity} onChange={(e) => set('quantity', e.target.value)} placeholder={t('dashboard.contracts.quantityLabel')} />
              </div>
              <div className="field">
                <label htmlFor="ct-price">{t('dashboard.contracts.unitPriceLabel')}</label>
                <input id="ct-price" value={c.unitPrice} onChange={(e) => set('unitPrice', e.target.value)} placeholder={t('dashboard.contracts.unitPriceLabel')} />
              </div>
              <div className="field">
                <label htmlFor="ct-total">{t('dashboard.contracts.totalLabel')}</label>
                <input id="ct-total" value={c.total} onChange={(e) => set('total', e.target.value)} placeholder={t('dashboard.contracts.totalLabel')} />
              </div>
              <div className="field">
                <label htmlFor="ct-cur">{t('dashboard.contracts.currencyLabel')}</label>
                <input id="ct-cur" value={c.currency} onChange={(e) => set('currency', e.target.value)} placeholder="SAR" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="ct-payment">{t('dashboard.contracts.paymentLabel')}</label>
              <input id="ct-payment" value={c.payment} onChange={(e) => set('payment', e.target.value)} placeholder={t('dashboard.contracts.paymentLabel')} />
            </div>
          </Card>

          <Card
            title={t('dashboard.contracts.sectionSpecs')}
            action={(
              <button type="button" className="btn sm ghost" onClick={() => setC((p) => ({ ...p, specs: [...p.specs, { label: '', value: '' }] }))}>
                <i className="ri-add-line" /> {t('dashboard.contracts.addSpec')}
              </button>
            )}
          >
            <div className="stack" style={{ gap: 8 }}>
              {c.specs.map((s, i) => (
                <div className="ct-spec-row" key={i}>
                  <input className="ct-spec-label" value={s.label} onChange={(e) => setSpec(i, { label: e.target.value })} placeholder={t('dashboard.contracts.specPlaceholder')} aria-label={t('dashboard.contracts.specLabel')} />
                  <input className="ct-spec-value" value={s.value} onChange={(e) => setSpec(i, { value: e.target.value })} placeholder={t('dashboard.contracts.specValuePlaceholder')} aria-label={t('dashboard.contracts.specValue')} />
                  <button type="button" className="btn sm ghost" aria-label={t('dashboard.contracts.removeSpec')} onClick={() => setC((p) => ({ ...p, specs: p.specs.filter((_, idx) => idx !== i) }))}>
                    <i className="ri-delete-bin-6-line" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="stack">
          <Card title={t('dashboard.contracts.sectionDelivery')}>
            <div className="grid c2">
              <div className="field">
                <label htmlFor="ct-incoterm">{t('dashboard.contracts.incotermLabel')}</label>
                <select id="ct-incoterm" value={c.incoterm} onChange={(e) => set('incoterm', e.target.value)}>
                  {INCOTERMS.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="ct-port">{t('dashboard.contracts.portLabel')}</label>
                <input id="ct-port" value={c.port} onChange={(e) => set('port', e.target.value)} placeholder={t('dashboard.contracts.portPlaceholder')} />
              </div>
              <div className="field">
                <label htmlFor="ct-lead">{t('dashboard.contracts.leadLabel')}</label>
                <input id="ct-lead" value={c.leadDays} onChange={(e) => set('leadDays', e.target.value)} placeholder={t('dashboard.contracts.leadPlaceholder')} />
              </div>
              <div className="field">
                <label htmlFor="ct-date">{t('dashboard.contracts.deliveryDateLabel')}</label>
                <input id="ct-date" value={c.deliveryDate} onChange={(e) => set('deliveryDate', e.target.value)} placeholder={t('dashboard.contracts.deliveryDatePlaceholder')} />
              </div>
            </div>
          </Card>

          <Card title={t('dashboard.contracts.sectionClauses')} sub={t('dashboard.contracts.clausesHint')}>
            <div className="row-between wrap mb" style={{ gap: 8 }}>
              <select value={clauseKey} onChange={(e) => setClauseKey(e.target.value)} aria-label={t('dashboard.contracts.clauseLibraryLabel')} style={{ flex: 1 }}>
                <option value="">{t('dashboard.contracts.chooseClause')}</option>
                {clauseKeys.map((k) => <option key={k} value={k}>{t(`dashboard.contracts.clauseLibrary.${k}`)}</option>)}
              </select>
              <button type="button" className="btn sm ghost" onClick={addClauseFromLibrary}>
                <i className="ri-add-line" /> {t('dashboard.contracts.addClause')}
              </button>
            </div>
            {c.clauses.length > 0 && (
              <ul className="ct-clauses mb">
                {c.clauses.map((cl, i) => (
                  <li key={i}>
                    <i className="ri-checkbox-circle-line" />
                    <span>{cl}</span>
                    <button type="button" className="ct-x" aria-label={t('dashboard.contracts.removeClause')} onClick={() => setC((p) => ({ ...p, clauses: p.clauses.filter((_, idx) => idx !== i) }))}>
                      <i className="ri-close-line" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="row-between" style={{ gap: 8 }}>
              <div className="field" style={{ margin: 0, flex: 1 }}>
                <input value={clauseDraft} onChange={(e) => setClauseDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addClauseText(); }} placeholder={t('dashboard.contracts.clausePlaceholder')} aria-label={t('dashboard.contracts.clausePlaceholder')} />
              </div>
              <button type="button" className="btn sm ghost" onClick={addClauseText}><i className="ri-add-line" /></button>
            </div>
          </Card>

          <Card title={t('dashboard.contracts.sectionMedia')}>
            {c.images.length > 0 && (
              <div className="media mb">
                {c.images.map((img, i) => (
                  <div className="tile" key={i}>
                    <img className="thumb" src={img} alt={`${c.product || 'contract'} ${i + 1}`} />
                    <button type="button" className="ct-tile-x" aria-label={t('dashboard.contracts.removeSpec')} onClick={() => setC((p) => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}>
                      <i className="ri-close-line" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="drop-zone mb" htmlFor="ct-image">
              <i className="ri-image-add-line" />
              <span>{t('dashboard.contracts.addImage')}</span>
            </label>
            <input id="ct-image" className="file-input-hidden" type="file" accept="image/*" onChange={addImage} />

            {c.attachments.length > 0 && (
              <div className="list mb">
                {c.attachments.map((a, i) => (
                  <div className="list-row" key={`${a.name}-${i}`}>
                    <div className="ic"><i className="ri-file-text-line" /></div>
                    <div className="body"><div className="t small">{a.name}</div><div className="s">{a.size}</div></div>
                    <div className="end">
                      <button type="button" className="btn sm ghost" aria-label={t('dashboard.contracts.removeClause')} onClick={() => setC((p) => ({ ...p, attachments: p.attachments.filter((_, idx) => idx !== i) }))}>
                        <i className="ri-delete-bin-6-line" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <label className="drop-zone" htmlFor="ct-attach">
              <i className="ri-attachment-2" />
              <span>{t('dashboard.contracts.addAttachment')}</span>
              <span className="small muted">{t('dashboard.contracts.attachHint')}</span>
            </label>
            <input id="ct-attach" className="file-input-hidden" type="file" accept=".pdf,image/*" onChange={addAttachment} />
          </Card>
        </div>
      </div>

      <Toast message={toast} />
    </>
  );
}