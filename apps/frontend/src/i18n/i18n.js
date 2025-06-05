import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import npCommon from './locales/np/common.json'

const resources = {
  en: {
    common: enCommon
  },
  np: {
    common: npCommon
  },
 
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', 
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false 
    },
    
    defaultNS: 'common',
    ns: ['common']
  });

export default i18n;