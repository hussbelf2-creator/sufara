import { useEffect, useMemo, useState } from 'react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import type { Mode } from './components/TopBar';
import { useDashboard } from '@/hooks/useDashboard';
import { initPanels } from '@/pages/home/lib/panels';
import { buyerCoreViews } from './views/buyer/BuyerCore';
import { buyerMoreViews } from './views/buyer/BuyerMore';
import { buyerContractsViews } from './views/buyer/BuyerContracts';
import { ambCoreViews } from './views/ambassador/AmbCore';
import { ambMoreViews } from './views/ambassador/AmbMore';
import { ambPageViews } from './views/ambassador/AmbPages';
import { adminCoreViews } from './views/admin/AdminCore';
import { adminMoreViews } from './views/admin/AdminMore';
import { adminAmbViews } from './views/admin/AdminAmbPages';
import { adminContractsViews } from './views/admin/AdminContracts';
import { factoryCoreViews } from './views/factory/FactoryCore';
import { factoryMoreViews } from './views/factory/FactoryMore';
import { factoryCustomViews } from './views/factory/FactoryCustom';
import { factoryAmbViews } from './views/factory/FactoryAmbassadors';
import { factoryContractsViews } from './views/factory/FactoryContracts';
import { DashboardNavContext } from './components/DashboardNav';
import './dash.css';

const buyerViews: Record<string, FunctionComponent> = { ...buyerCoreViews, ...buyerMoreViews, ...buyerContractsViews };
const ambViews: Record<string, FunctionComponent> = { ...ambCoreViews, ...ambMoreViews, ...ambPageViews };
const adminViews: Record<string, FunctionComponent> = { ...adminCoreViews, ...adminMoreViews, ...adminAmbViews, ...adminContractsViews };
const factoryViews: Record<string, FunctionComponent> = { ...factoryCoreViews, ...factoryMoreViews, ...factoryCustomViews, ...factoryAmbViews, ...factoryContractsViews };

export default function Dashboard() {
  const { t } = useTranslation();
  const dash = useDashboard();
  const [mode, setMode] = useState<Mode>('buyer');
  const [view, setView] = useState<string>(dash.buyerNav[0].key);
  const [menu, setMenu] = useState(false);

  useEffect(() => initPanels(), []);

  const nav = useMemo(() => {
    if (mode === 'buyer') return dash.buyerNav;
    if (mode === 'ambassador') return dash.ambassadorNav;
    if (mode === 'factory') return dash.factoryNav;
    return dash.adminNav;
  }, [mode, dash]);

  const switchMode = (m: Mode) => {
    setMode(m);
    const first = m === 'buyer'
      ? dash.buyerNav[0]
      : m === 'ambassador'
        ? dash.ambassadorNav[0]
        : m === 'factory'
          ? dash.factoryNav[0]
          : dash.adminNav[0];
    setView(first.key);
    setMenu(false);
  };

  const pick = (key: string) => {
    setView(key);
    setMenu(false);
  };

  const views = mode === 'buyer'
    ? buyerViews
    : mode === 'ambassador'
      ? ambViews
      : mode === 'factory'
        ? factoryViews
        : adminViews;
  const View = views[view] ?? views[nav[0].key];

  const profile = useMemo(() => {
    if (mode === 'buyer') {
      return {
        name: dash.buyerUser.name,
        initials: dash.buyerUser.initials,
        sub: `${dash.buyerUser.country} · ${dash.buyerUser.level}`,
      };
    }
    if (mode === 'ambassador') {
      return {
        name: dash.ambassadorUser.name,
        initials: dash.ambassadorUser.initials,
        sub: `${dash.ambassadorUser.country} · ${dash.ambassadorUser.level}`,
      };
    }
    if (mode === 'factory') {
      return {
        name: dash.factoryUser.name,
        initials: dash.factoryUser.initials,
        sub: `${dash.factoryUser.factory} · ${dash.factoryUser.role}`,
      };
    }
    return {
      name: dash.adminUser.name,
      initials: dash.adminUser.initials,
      sub: `${dash.adminUser.country} · ${dash.adminUser.role}`,
    };
  }, [mode, dash]);

  const groupLabel = mode === 'buyer'
    ? t('dashboard.group.buyer')
    : mode === 'ambassador'
      ? t('dashboard.group.ambassador')
      : mode === 'factory'
        ? t('dashboard.group.factory')
        : t('dashboard.group.admin');

  const title = mode === 'buyer'
    ? t('dashboard.buyerTitle')
    : mode === 'ambassador'
      ? dash.ambassadorUser.level
      : mode === 'factory'
        ? dash.factoryUser.factory
        : t('dashboard.adminTitle');

  return (
    <div className="dash-scope">
      <div className="dash">
        <Sidebar
          nav={nav}
          active={view}
          onPick={pick}
          open={menu}
          onClose={() => setMenu(false)}
          name={profile.name}
          initials={profile.initials}
          sub={profile.sub}
          groupLabel={groupLabel}
        />

        <div className="dash-main">
          <TopBar
            mode={mode}
            onMode={switchMode}
            onMenu={() => setMenu(true)}
            title={title}
          />
          <main className="dash-body">
            <DashboardNavContext.Provider value={{ go: pick }}>
              <View key={`${mode}-${view}`} />
            </DashboardNavContext.Provider>
          </main>
        </div>
      </div>
    </div>
  );
}