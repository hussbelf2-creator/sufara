import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboard } from '@/hooks/useDashboard';
import { Toast } from '@/pages/dashboard/components/ui';
import ContractsList from './ContractsList';
import ContractDetail from './ContractDetail';
import ContractEditor from './ContractEditor';
import { takeContractIntent } from './intent';
import { makeBlankContract } from './editorData';
import { cloneContract } from './types';
import type { Contract, ContractRole } from './types';

type Screen = 'list' | 'detail' | 'editor';

/* One self-contained workspace reused by the buyer, factory and admin views.
   It owns its internal list state and swaps between the list, a read-only
   detail and the full editor — so each dashboard role gets the whole contract
   flow from a single navigation entry. */
export default function ContractsWorkspace({ role }: { role: ContractRole }) {
  const { t } = useTranslation();
  const d = useDashboard();
  const [list, setList] = useState<Contract[]>(() => (d.contracts as Contract[]).map(cloneContract));
  const [screen, setScreen] = useState<Screen>('list');
  const [active, setActive] = useState<Contract | null>(null);
  const [toast, setToast] = useState('');

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2600);
  };

  /* Consume a "create contract" intent fired from a wholesale deal. */
  useEffect(() => {
    const intent = takeContractIntent(role);
    if (intent) {
      setActive(makeBlankContract({ factory: intent.factory, buyer: intent.buyer, product: intent.product }));
      setScreen('editor');
      flash(t('dashboard.contracts.dealNote', { name: intent.factory || intent.buyer || '' }));
    }
  }, [role, t]);

  const persist = (c: Contract) => {
    setList((prev) => (prev.some((x) => x.id === c.id) ? prev.map((x) => (x.id === c.id ? c : x)) : [c, ...prev]));
  };

  const startNew = () => {
    setActive(makeBlankContract());
    setScreen('editor');
  };

  const startEdit = (c: Contract) => {
    setActive(cloneContract(c));
    setScreen('editor');
  };

  const openDetail = (c: Contract) => {
    setActive(c);
    setScreen('detail');
  };

  const handleSave = (c: Contract, action: 'saved' | 'submitted' | 'signed') => {
    persist(c);
    setActive(c);
    setScreen('detail');
    if (action === 'saved') flash(t('dashboard.contracts.savedToast'));
    else if (action === 'submitted') flash(t('dashboard.contracts.submittedToast'));
    else flash(t('dashboard.contracts.signToast'));
  };

  const handleUpdate = (c: Contract) => {
    persist(c);
    setActive(c);
  };

  return (
    <>
      {screen === 'list' && (
        <ContractsList
          role={role}
          contracts={list}
          onSelect={openDetail}
          onEdit={startEdit}
          onNew={startNew}
        />
      )}

      {screen === 'detail' && active && (
        <ContractDetail
          role={role}
          contract={active}
          onBack={() => setScreen('list')}
          onEdit={() => startEdit(active)}
          onUpdate={handleUpdate}
        />
      )}

      {screen === 'editor' && active && (
        <ContractEditor
          role={role}
          initial={active}
          onSave={handleSave}
          onCancel={() => setScreen('list')}
        />
      )}

      <Toast message={toast} />
    </>
  );
}