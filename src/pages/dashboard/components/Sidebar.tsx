import { useTranslation } from 'react-i18next';
import type { NavItem } from '@/mocks/dashboard';

type Props = {
  nav: NavItem[];
  active: string;
  onPick: (key: string) => void;
  open: boolean;
  onClose: () => void;
  name: string;
  initials: string;
  sub: string;
  groupLabel: string;
};

export default function Sidebar({
  nav, active, onPick, open, onClose, name, initials, sub, groupLabel,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
      {open && <div className="side-mask" onClick={onClose} role="presentation" />}
      <aside className={`dash-side ${open ? 'is-open' : ''}`}>
        <div className="dash-side-head">
          <a className="dash-brand" href="/">
            <span className="mark">STA</span>
            <span>
              {t('dashboard.sidebar.brand')}
              <small>{t('dashboard.sidebar.brandSub')}</small>
            </span>
          </a>
        </div>

        <div className="dash-profile">
          <div className="av">{initials}</div>
          <div>
            <div className="who-name">{name}</div>
            <div className="who-sub">{sub}</div>
          </div>
        </div>

        <nav className="dash-nav">
          <div className="group-label">{groupLabel}</div>
          {nav.map((n) => (
            <button
              key={n.key}
              type="button"
              className={active === n.key ? 'is-on' : ''}
              onClick={() => onPick(n.key)}
            >
              <i className={n.icon} />
              <span>{n.label}</span>
              {n.badge && <span className="nav-badge">{n.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="dash-side-foot">
          <a href="/"><i className="ri-arrow-right-line" /> {t('dashboard.sidebar.backToSite')}</a>
          <a href="#lo" onClick={(e) => e.preventDefault()}><i className="ri-logout-box-r-line" /> {t('dashboard.sidebar.logout')}</a>
        </div>
      </aside>
    </>
  );
}