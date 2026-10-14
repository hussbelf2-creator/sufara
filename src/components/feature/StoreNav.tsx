import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/pages/shop/components/CartProvider';
import { useFavorites } from '@/pages/shop/components/FavoritesProvider';
import LanguageSwitcher from './LanguageSwitcher';

const navItems = [
  { key: 'common.nav.home', to: '/' },
  { key: 'common.nav.shop', to: '/products' },
  { key: 'common.nav.factories', to: '/factories' },
  { key: 'common.nav.compare', to: '/compare' },
  { key: 'common.nav.ambassadors', to: '/#ambassadors' },
  { key: 'common.nav.how', to: '/#story' },
];

export default function StoreNav() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const { count } = useCart();
  const { count: favCount } = useFavorites();
  const { t } = useTranslation();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className={`site-nav ${solid ? 'is-solid' : ''}`}>
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="mark">{t('common.brandMark')}</span>
          <span>{t('common.brand')}</span>
        </Link>

        <div className="links">
          {navItems.map((l) => (
            <Link key={l.to} to={l.to}>{t(l.key)}</Link>
          ))}
        </div>

        <div className="nav-actions">
          <LanguageSwitcher />

          <Link className="nav-cart" to="/orders" aria-label={t('common.nav.orders')} onClick={() => setOpen(false)}>
            <i className="ri-file-list-3-line" />
          </Link>

          <Link className="nav-cart" to="/favorites" aria-label={t('common.nav.favorites')} onClick={() => setOpen(false)}>
            <i className="ri-heart-3-line" />
            {favCount > 0 && <span className="nav-cart-count">{favCount > 99 ? '99+' : favCount}</span>}
          </Link>

          <Link className="nav-cart" to="/cart" aria-label={t('common.nav.cart')} onClick={() => setOpen(false)}>
            <i className="ri-shopping-bag-3-line" />
            {count > 0 && <span className="nav-cart-count">{count > 99 ? '99+' : count}</span>}
          </Link>

          <Link className="nav-cta" to="/dashboard" onClick={() => setOpen(false)}>{t('common.nav.account')}</Link>

          <button
            type="button"
            className="burger"
            aria-label={t('common.nav.menu')}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <i className={open ? 'ri-close-line' : 'ri-menu-line'} />
          </button>
        </div>
      </nav>

      {open && (
        <div className="mobile-menu">
          {navItems.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>{t(l.key)}</Link>
          ))}
          <Link to="/orders" onClick={() => setOpen(false)}>{t('common.nav.orders')}</Link>
          <Link to="/favorites" onClick={() => setOpen(false)}>
            {t('common.nav.favorites')}{favCount > 0 ? ` (${favCount})` : ''}
          </Link>
          <Link to="/cart" onClick={() => setOpen(false)}>
            {t('common.nav.cart')}{count > 0 ? ` (${count})` : ''}
          </Link>
          <Link to="/dashboard" onClick={() => setOpen(false)}>{t('common.nav.account')}</Link>
          <LanguageSwitcher className="in-menu" />
        </div>
      )}
    </>
  );
}