import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/* Keeps <html lang> and <html dir> in sync with the active language so the whole
   document flows RTL for Arabic and LTR for English. */
export function useDirection() {
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || 'ar').split('-')[0];

  useEffect(() => {
    const root = document.documentElement;
    const isEn = lang === 'en';
    root.setAttribute('lang', isEn ? 'en' : 'ar');
    root.setAttribute('dir', isEn ? 'ltr' : 'rtl');
  }, [lang]);
}