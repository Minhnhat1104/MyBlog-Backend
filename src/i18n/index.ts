import i18n from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';
import { langEn } from './locales/en';
import { langVi } from './locales/vi';

i18n
  .init({
    fallbackLng: 'en',
    preload: ['vi', 'en'],
    resources: {
      en: {
        common: langEn,
      },
      vi: {
        common: langVi,
      },
    },
    ns: ['common', 'error'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
