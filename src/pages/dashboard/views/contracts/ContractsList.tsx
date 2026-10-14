import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Stat, Pill, PageHead, Toast } from '@/pages/dashboard/components/ui';
import { statusTone } from './types';
import type { Contract, ContractRole, ContractStatus } from './types';

type Props = {
  role: ContractRole;
  contracts: Contract[];
  onSelect: (c: Contract) => void;
  onEdit: (c: Contract) => void;
  onNew: () => void;
};

const STATUSES: ContractStatus[] = ['draft', 'pending', 'active', 'rejected', 'closed'];

export default function ContractsList({
  role, contracts, onSelect, onEdit, onNew,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ContractStatus>('all');
  const [toast, setToast] = useState('');

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2400);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contracts.filter((c) => {
      if (status !== 'all' && c.status !== status) return false;
      if (!q) return true;
      return [c.id, c.product, c.factory, c.buyer, c.buyerCompany]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [contracts, query, status]);

  const sub = role === 'buyer'
    ? t('dashboard.contracts.buyerSub')
    : role === 'factory'
      ? t('dashboard.contracts.factorySub')
      : t('dashboard.contracts.adminSub');

  const counterparty = (c: Contract) => {
    if (role === 'buyer') return `${c.factory} · ${c.factoryCity}`;
    if (role === 'factory') return `${c.buyerCompany || c.buyer} · ${c.buyerCountry}`;
    return `${c.buyerCompany || c.buyer} ↔ ${c.factory}`;
  };

  const totalCount = contracts.length;
  const pendingCount = contracts.filter((c) => c.status === 'pending').length;
  const activeCount = contracts.filter((c) => c.status === 'active').length;

  /* Contracts that have been waiting for a signature for more than 48 hours —
     the platform governance needs to see these first. */
  const overdue = contracts.filter((c) => c.status === 'pending' && (c.awaitingHours ?? 0) > 48);

  return (
    <>
      <PageHead
        eyebrow={t('dashboard.contracts.eyebrow')}
        title={t('dashboard.contracts.title')}
        sub={sub}
        actions={(
          <button type="button" className="btn primary" onClick={onNew}>
            <i className="ri-file-add-line" /> {t('dashboard.contracts.newContract')}
          </button>
        )}
      />

      {role === 'admin' && overdue.length > 0 && (
        <div className="ct-alert mb">
          <div className="ct-alert-ic"><i className="ri-alarm-warning-line" /></div>
          <div className="ct-alert-body">
            <div className="t">{t('dashboard.contracts.pendingAlertTitle')}</div>
            <div className="s">
              {t('dashboard.contracts.pendingAlertCount', { count: overdue.length })}
              {' · '}
              {t('dashboard.contracts.pendingAlertNote')}
            </div>
            <ul className="ct-alert-list">
              {overdue.map((c) => (
                <li key={c.id}>
                  <button type="button" className="ct-alert-btn" onClick={() => onSelect(c)}>
                    <i className="ri-time-line" />
                    <span>
                      {t('dashboard.contracts.pendingAlertItem', {
                        id: c.id,
                        party: c.buyerCompany || c.buyer || c.factory,
                        hours: c.awaitingHours,
                      })}
                    </span>
                    <span className="go">{t('dashboard.contracts.openContract')}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid c4 mb">
        <Stat icon="ri-file-paper-2-line" num={String(totalCount)} lbl={t('dashboard.contracts.statTotal')} />
        <Stat icon="ri-time-line" num={String(pendingCount)} lbl={t('dashboard.contracts.statPending')} />
        <Stat icon="ri-verified-badge-line" num={String(activeCount)} lbl={t('dashboard.contracts.statActive')} />
        <Stat icon="ri-money-dollar-circle-line" num={contracts[0]?.currency ?? 'SAR'} lbl={t('dashboard.contracts.statValue')} />
      </div>

      <Card
        title={t('dashboard.contracts.listTitle')}
        sub={t('dashboard.contracts.listSub', { count: filtered.length })}
        action={(
          <div className="field" style={{ margin: 0, minWidth: 240 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('dashboard.contracts.searchPlaceholder')}
              aria-label={t('dashboard.contracts.searchPlaceholder')}
            />
          </div>
        )}
      >
        <div className="row-between wrap mb" style={{ gap: 8 }}>
          <button
            type="button"
            className={`chip ${status === 'all' ? 'is-on' : ''}`}
            onClick={() => setStatus('all')}
          >
            {t('dashboard.contracts.filterAll')}
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${status === s ? 'is-on' : ''}`}
              onClick={() => setStatus(s)}
            >
              {t(`dashboard.contracts.status.${s}`)}
            </button>
          ))}
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('dashboard.contracts.thRef')}</th>
                <th>{t('dashboard.contracts.thCounterparty')}</th>
                <th>{t('dashboard.contracts.thProduct')}</th>
                <th>{t('dashboard.contracts.thValue')}</th>
                <th>{t('dashboard.contracts.thStatus')}</th>
                <th>{t('dashboard.contracts.thUpdated')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="strong">{c.id}</td>
                  <td>{counterparty(c)}</td>
                  <td className="muted small">{c.product}</td>
                  <td className="strong accent">{c.total}</td>
                  <td><Pill tone={statusTone(c.status)}>{t(`dashboard.contracts.status.${c.status}`)}</Pill></td>
                  <td className="muted small">{c.updatedAt}</td>
                  <td>
                    <div className="row-between" style={{ gap: 6 }}>
                      {role === 'factory' ? (
                        <button type="button" className="btn sm primary" onClick={() => onEdit(c)}>
                          <i className="ri-edit-2-line" /> {t('dashboard.contracts.respond')}
                        </button>
                      ) : role === 'buyer' ? (
                        <button type="button" className="btn sm primary" onClick={() => onEdit(c)}>
                          <i className="ri-edit-line" /> {t('dashboard.contracts.edit')}
                        </button>
                      ) : (
                        <button type="button" className="btn sm primary" onClick={() => { onSelect(c); }}>
                          <i className="ri-eye-line" /> {t('dashboard.contracts.view')}
                        </button>
                      )}
                      {role !== 'admin' && (
                        <button type="button" className="btn sm ghost" onClick={() => onSelect(c)} aria-label={t('dashboard.contracts.view')}>
                          <i className="ri-eye-line" />
                        </button>
                      )}
                      {role === 'admin' && (
                        <button type="button" className="btn sm ghost" onClick={() => flash(t('dashboard.contracts.adminArbitrateToast'))}>
                          <i className="ri-scales-3-line" /> {t('dashboard.contracts.adminArbitrate')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} className="muted" style={{ textAlign: 'center', padding: '26px' }}>
                    {t('dashboard.contracts.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Toast message={toast} />
    </>
  );
}