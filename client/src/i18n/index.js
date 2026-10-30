import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import mr from './mr.json';

const savedLanguage = localStorage.getItem('readysupply_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      mr: { translation: mr },
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Handle updating lang attribute on document.documentElement
document.documentElement.lang = savedLanguage;

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('readysupply_lang', lng);
  document.documentElement.lang = lng;
});

export default i18n;

