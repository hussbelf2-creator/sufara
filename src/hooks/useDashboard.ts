import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as ar from '@/mocks/dashboard';
import * as en from '@/mocks/dashboard.en';
import * as arFactory from '@/mocks/factory';
import * as enFactory from '@/mocks/factory.en';
import * as arContracts from '@/mocks/contracts';
import * as enContracts from '@/mocks/contracts.en';

/* Returns the dashboard data resolved in the active language. Arabic is the
   base set in src/mocks/dashboard.ts; English lives in src/mocks/dashboard.en.ts
   and mirrors the exact same shape, so every view reads identical fields.
   The factory-owner role data lives in its own mocks and is merged in. */
export function useDashboard() {
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || 'ar').toLowerCase();
  const isEn = lang.startsWith('en');

  return useMemo(
    () => (isEn ? { ...en, ...enFactory, ...enContracts } : { ...ar, ...arFactory, ...arContracts }),
    [isEn],
  );
}