import { useTranslation } from 'react-i18next';

/* Compact AR / EN toggle. It inherits the surrounding colour so it reads well
   both on the dark hero and on the light store header. */
export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || 'ar').split('-')[0];

  const set = (next: 'ar' | 'en') => {
    if (next !== lang) i18n.changeLanguage(next);
  };

  return (
    <div className={`lang-switch ${className}`.trim()} role="group" aria-label={t('common.nav.switchLang')}>
      <i className="ri-translate-2" aria-hidden="true" />
      <button
        type="button"
        className={lang === 'ar' ? 'is-on' : ''}
        onClick={() => set('ar')}
        aria-pressed={lang === 'ar'}
      >
        عربي
      </button>
      <span className="sep" aria-hidden="true">/</span>
      <button
        type="button"
        className={lang === 'en' ? 'is-on' : ''}
        onClick={() => set('en')}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
    </div>
  );
}