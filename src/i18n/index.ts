import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import messages from './local/index';

/* Arabic is the default language; English is optional. The shopper's choice is
   remembered in localStorage so it survives reloads. */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'en'],
    nonExplicitSupportedLngs: true,
    debug: false,
    resources: messages,
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'sta-lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;