import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Pill, PageHead, Toast } from '@/pages/dashboard/components/ui';
import { cloneContract, statusTone, CONTRACT_STAGES, stageIndex } from './types';
import type { Contract, ContractRole } from './types';
import ContractPrint from './ContractPrint';

type Props = {
  role: ContractRole;
  contract: Contract;
  onBack: () => void;
  onEdit: () => void;
  onUpdate: (c: Contract) => void;
};

export default function ContractDetail({
  role, contract, onBack, onEdit, onUpdate,
}: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState('');
  const [printPreview, setPrintPreview] = useState(false);
  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2400);
  };

  const canSign = (role === 'buyer' && !contract.signBuyer)
    || (role === 'factory' && !contract.signFactory);

  const sign = () => {
    const next = cloneContract(contract);
    if (role === 'buyer') next.signBuyer = true;
    if (role === 'factory') next.signFactory = true;
    next.status = next.signBuyer && next.signFactory ? 'active' : 'pending';
    if (next.status === 'active' && stageIndex(next.stage) < stageIndex('supply')) {
      next.stage = 'supply';
    }
    onUpdate(next);
    flash(t('dashboard.contracts.signToast'));
  };

  const setStatus = (s: Contract['status'], msg: string) => {
    const next = cloneContract(contract);
    next.status = s;
    onUpdate(next);
    flash(msg);
  };

  const current = stageIndex(contract.stage);
  const canAdvance = (role === 'admin' || role === 'factory')
    && current < CONTRACT_STAGES.length - 1;

  const advanceStage = () => {
    const next = cloneContract(contract);
    next.stage = CONTRACT_STAGES[Math.min(current + 1, CONTRACT_STAGES.length - 1)];
    onUpdate(next);
    flash(t('dashboard.contracts.advanceToast'));
  };

  const addComment = () => {
    if (!draft.trim()) return;
    const next = cloneContract(contract);
    next.comments.push({
      by: role,
      name: role === 'buyer' ? t('dashboard.contracts.roleBuyer') : role === 'factory' ? t('dashboard.contracts.roleFactory') : t('dashboard.contracts.roleAdmin'),
      text: draft.trim(),
      time: t('dashboard.common.now'),
    });
    onUpdate(next);
    setDraft('');
    flash(t('dashboard.contracts.commentToast'));
  };

  const sigPill = (signed: boolean) => (
    <Pill tone={signed ? 'ok' : 'mute'}>
      <i className={signed ? 'ri-checkbox-circle-line' : 'ri-checkbox-blank-circle-line'} />
      {signed ? t('dashboard.contracts.signed') : t('dashboard.contracts.notSigned')}
    </Pill>
  );

  return (
    <>
      <PageHead
        eyebrow={t('dashboard.contracts.eyebrow')}
        title={`${t('dashboard.contracts.detailTitle')} · ${contract.id}`}
        sub={contract.product}
        actions={(
          <>
            <button type="button" className="btn ghost" onClick={onBack}>
              <i className="ri-arrow-right-line" /> {t('dashboard.contracts.backToList')}
            </button>
            <button type="button" className="btn ghost" onClick={onEdit}>
              <i className="ri-edit-line" /> {t('dashboard.contracts.edit')}
            </button>
          </>
        )}
      />

      <div className="row-between wrap mb" style={{ gap: 10 }}>
        <div className="row-between wrap" style={{ gap: 8 }}>
          <Pill tone={statusTone(contract.status)}>{t(`dashboard.contracts.status.${contract.status}`)}</Pill>
          <span className="small muted">{t('dashboard.contracts.thUpdated')}: {contract.updatedAt}</span>
        </div>
        <div className="row-between wrap" style={{ gap: 8 }}>
          <span className="small muted">{t('dashboard.contracts.signedByBuyer')}</span>
          {sigPill(contract.signBuyer)}
          <span className="small muted">{t('dashboard.contracts.signedByFactory')}</span>
          {sigPill(contract.signFactory)}
        </div>
      </div>

      <Card
        title={t('dashboard.contracts.timelineTitle')}
        sub={t('dashboard.contracts.timelineSub')}
        className="mb"
        action={canAdvance ? (
          <button type="button" className="btn sm ghost" onClick={advanceStage}>
            <i className="ri-arrow-down-double-line" /> {t('dashboard.contracts.advance')}
          </button>
        ) : undefined}
      >
        <div className="ct-timeline">
          {CONTRACT_STAGES.map((s, i) => {
            const done = i <= current;
            return (
              <div key={s} className={`ct-step ${done ? 'is-done' : ''} ${i === current ? 'is-now' : ''}`}>
                <div className="ct-dot">{done ? <i className="ri-check-line" /> : <span>{i + 1}</span>}</div>
                <div className="ct-step-label">{t(`dashboard.contracts.stage.${s}`)}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="split wide mb">
        <div className="stack">
          <Card title={t('dashboard.contracts.sectionParties')}>
            <div className="list">
              <div className="list-row">
                <div className="ic"><i className="ri-user-3-line" /></div>
                <div className="body">
                  <div className="t">{contract.buyerCompany || contract.buyer}</div>
                  <div className="s">{contract.buyerCountry}</div>
                </div>
                <div className="end"><Pill tone="info">{t('dashboard.contracts.roleBuyer')}</Pill></div>
              </div>
              <div className="list-row">
                <div className="ic"><i className="ri-building-2-line" /></div>
                <div className="body">
                  <div className="t">{contract.factory}</div>
                  <div className="s">{contract.factoryCity}</div>
                </div>
                <div className="end"><Pill tone="info">{t('dashboard.contracts.roleFactory')}</Pill></div>
              </div>
            </div>
          </Card>

          <Card title={t('dashboard.contracts.sectionProduct')}>
            <div className="grid c2" style={{ gap: 12 }}>
              <div><div className="small muted">{t('dashboard.contracts.productLabel')}</div><div className="strong">{contract.product}</div></div>
              <div><div className="small muted">{t('dashboard.contracts.quantityLabel')}</div><div className="strong">{contract.quantity}</div></div>
              <div><div className="small muted">{t('dashboard.contracts.unitPriceLabel')}</div><div className="strong">{contract.unitPrice}</div></div>
              <div><div className="small muted">{t('dashboard.contracts.totalLabel')}</div><div className="strong accent">{contract.total}</div></div>
              <div style={{ gridColumn: '1 / -1' }}><div className="small muted">{t('dashboard.contracts.paymentLabel')}</div><div className="strong">{contract.payment}</div></div>
            </div>
          </Card>

          <Card title={t('dashboard.contracts.sectionSpecs')}>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr><th>{t('dashboard.contracts.specLabel')}</th><th>{t('dashboard.contracts.specValue')}</th></tr>
                </thead>
                <tbody>
                  {contract.specs.map((s, i) => (
                    <tr key={`${s.label}-${i}`}>
                      <td className="strong">{s.label}</td>
                      <td>{s.value}</td>
                    </tr>
                  ))}
                  {!contract.specs.length && (
                    <tr><td colSpan={2} className="muted" style={{ textAlign: 'center', padding: 18 }}>—</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="stack">
          <Card title={t('dashboard.contracts.sectionDelivery')}>
            <div className="grid c2" style={{ gap: 12 }}>
              <div><div className="small muted">{t('dashboard.contracts.incotermLabel')}</div><div className="strong">{contract.incoterm}</div></div>
              <div><div className="small muted">{t('dashboard.contracts.portLabel')}</div><div className="strong">{contract.port || '—'}</div></div>
              <div><div className="small muted">{t('dashboard.contracts.leadLabel')}</div><div className="strong">{contract.leadDays || '—'}</div></div>
              <div><div className="small muted">{t('dashboard.contracts.deliveryDateLabel')}</div><div className="strong">{contract.deliveryDate || '—'}</div></div>
            </div>
          </Card>

          <Card title={t('dashboard.contracts.sectionClauses')}>
            {contract.clauses.length ? (
              <ul className="ct-clauses">
                {contract.clauses.map((c, i) => (
                  <li key={i}><i className="ri-checkbox-circle-line" /> <span>{c}</span></li>
                ))}
              </ul>
            ) : <p className="small muted">—</p>}
          </Card>

          <Card title={t('dashboard.contracts.sectionMedia')}>
            {contract.images.length ? (
              <div className="media mb">
                {contract.images.map((img, i) => (
                  <div className="tile" key={i}><img className="thumb" src={img} alt={`${contract.product} ${i + 1}`} /></div>
                ))}
              </div>
            ) : <p className="small muted mb">{t('dashboard.contracts.noImages')}</p>}
            {contract.attachments.length ? (
              <div className="list">
                {contract.attachments.map((a) => (
                  <div className="list-row" key={a.name}>
                    <div className="ic"><i className="ri-file-text-line" /></div>
                    <div className="body"><div className="t small">{a.name}</div><div className="s">{a.size}</div></div>
                    <div className="end">
                      <button type="button" className="btn sm ghost" aria-label={t('dashboard.contracts.download')} onClick={() => flash(t('dashboard.contracts.downloadToast'))}>
                        <i className="ri-download-2-line" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="small muted">{t('dashboard.contracts.noAttachments')}</p>}
          </Card>
        </div>
      </div>

      <Card title={t('dashboard.contracts.commentsTitle')} sub={t('dashboard.contracts.commentsSub', { count: contract.comments.length })} className="mb">
        {contract.comments.length ? (
          <div className="stack" style={{ gap: 10, marginBottom: 14 }}>
            {contract.comments.map((m, i) => (
              <div className="note" key={i} style={{ justifyContent: m.by === role ? 'flex-start' : 'flex-end' }}>
                <i className="ri-chat-3-line" />
                <span>
                  <span className="strong">{m.name}</span> — {m.text}
                  <span className="muted small"> · {m.time}</span>
                </span>
              </div>
            ))}
          </div>
        ) : <p className="small muted mb">—</p>}
        <div className="row-between" style={{ gap: 8 }}>
          <div className="field" style={{ margin: 0, flex: 1 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addComment(); }}
              placeholder={t('dashboard.contracts.commentPlaceholder')}
              aria-label={t('dashboard.contracts.commentPlaceholder')}
            />
          </div>
          <button type="button" className="btn primary" onClick={addComment}>
            <i className="ri-send-plane-2-line" /> {t('dashboard.contracts.sendComment')}
          </button>
        </div>
      </Card>

      <Card title={t('dashboard.contracts.sectionSign')}>
        <div className="row-between wrap" style={{ gap: 10 }}>
          <div className="row-between wrap" style={{ gap: 8 }}>
            <button type="button" className="btn ghost" onClick={() => setPrintPreview(true)}>
              <i className="ri-file-pdf-2-line" /> {t('dashboard.contracts.download')}
            </button>
            <button type="button" className="btn ghost" onClick={() => flash(t('dashboard.contracts.shareToast'))}>
              <i className="ri-share-line" /> {t('dashboard.contracts.shareLink')}
            </button>
            <button type="button" className="btn ghost" onClick={() => setPrintPreview(true)}>
              <i className="ri-printer-line" /> {t('dashboard.contracts.print')}
            </button>
          </div>
          <div className="row-between wrap" style={{ gap: 8 }}>
            {canSign && (
              <button type="button" className="btn primary" onClick={sign}>
                <i className="ri-quill-pen-line" /> {t('dashboard.contracts.signNow')}
              </button>
            )}
            {role === 'admin' && (
              <>
                <button type="button" className="btn primary" onClick={() => setStatus('active', t('dashboard.contracts.approveToast'))}>
                  <i className="ri-check-double-line" /> {t('dashboard.contracts.approve')}
                </button>
                <button type="button" className="btn ghost" onClick={() => setStatus('pending', t('dashboard.contracts.requestChangesToast'))}>
                  <i className="ri-edit-2-line" /> {t('dashboard.contracts.requestChanges')}
                </button>
                <button type="button" className="btn ghost" onClick={() => setStatus('rejected', t('dashboard.contracts.rejectToast'))}>
                  <i className="ri-close-line" /> {t('dashboard.contracts.reject')}
                </button>
              </>
            )}
          </div>
        </div>
      </Card>

      {printPreview && (
        <div className="ct-print-overlay">
          <div className="ct-print-toolbar">
            <button type="button" className="btn ghost" onClick={() => setPrintPreview(false)}>
              <i className="ri-arrow-right-line" /> {t('dashboard.contracts.printClose')}
            </button>
            <button type="button" className="btn primary" onClick={() => window.print()}>
              <i className="ri-printer-line" /> {t('dashboard.contracts.printSave')}
            </button>
          </div>
          <div className="ct-print-hint no-print">{t('dashboard.contracts.printHint')}</div>
          <ContractPrint contract={contract} />
        </div>
      )}

      <Toast message={toast} />
    </>
  );
}