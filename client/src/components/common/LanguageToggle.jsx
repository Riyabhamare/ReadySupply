import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'mr' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-xs font-semibold text-text-light dark:text-text-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary select-none"
      title="Switch Language / भाषा बदला"
      aria-label="Toggle language between English and Marathi"
    >
      <Languages className="w-3.5 h-3.5 text-primary" />
      <span>{currentLang === 'en' ? 'मराठी' : 'English'}</span>
    </button>
  );
};

