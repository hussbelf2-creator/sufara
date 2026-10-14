import { useTranslation } from 'react-i18next';

interface FooterLink { label: string; href: string; }
interface FooterCol { title: string; links: FooterLink[]; }

export default function Footer() {
  const { t } = useTranslation();
  const footerCols = t('common.homeFooter.cols', { returnObjects: true }) as unknown as FooterCol[];

  return (
    <footer className="site-footer">
      <div className="cols">
        <div data-reveal>
          <h4 className="brandline">{t('common.brandFull')}</h4>
          <p className="muted">{t('common.homeFooter.about')}</p>
          <p className="muted" style={{ marginTop: 14 }}>{t('common.homeFooter.address')}</p>
        </div>

        {footerCols.map((col) => (
          <div key={col.title} data-reveal>
            <h4>{col.title}</h4>
            {col.links.map((l) => (
              <a key={`${col.title}-${l.label}`} href={l.href}>{l.label}</a>
            ))}
          </div>
        ))}
      </div>

      <div className="bottom">
        <span>{t('common.homeFooter.rights')}</span>
        <div className="socials">
          <a href="#top" aria-label={t('common.homeFooter.instagram')}><i className="ri-instagram-line" /></a>
          <a href="#top" aria-label={t('common.homeFooter.tiktok')}><i className="ri-tiktok-line" /></a>
          <a href="#top" aria-label={t('common.homeFooter.whatsapp')}><i className="ri-whatsapp-line" /></a>
          <a href="#top" aria-label={t('common.homeFooter.linkedin')}><i className="ri-linkedin-line" /></a>
        </div>
      </div>
    </footer>
  );
}