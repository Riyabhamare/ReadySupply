import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { LanguageToggle } from '../common/LanguageToggle.jsx';
import { ThemeToggle } from '../common/ThemeToggle.jsx';
import { NotificationBell } from '../notifications/NotificationBell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export const Topbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();

  const getBreadcrumbTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return t('nav.dashboard', 'Dashboard');
      case '/profile':
        return t('nav.profile', 'Company Profile');
      case '/vault':
        return t('nav.vault', 'Evidence Vault');
      case '/gap-matrix':
        return t('nav.gapMatrix', 'Buyer Gap Matrix');
      case '/actions':
        return t('nav.actions', 'Action Tracker');
      case '/pack':
        return t('nav.evidencePack', 'Submission Pack');
      case '/admin':
        return t('nav.admin', 'Admin Review Queue');
      case '/design-system':
        return t('nav.designSystem', 'Design System');
      default:
        return 'ReadySupply';
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-sm border-b border-border-light dark:border-border-dark select-none">
      {/* Mobile Brand / Breadcrumb */}
      <div className="flex items-center gap-2.5">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-navy dark:bg-navy-light text-white flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-400" />
          </div>
          <span className="font-bold text-sm tracking-tight text-navy dark:text-white">
            ReadySupply
          </span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-muted-light dark:text-muted-dark">Platform</span>
          <span className="text-muted-light dark:text-muted-dark">/</span>
          <span className="font-semibold text-text-light dark:text-text-dark">
            {getBreadcrumbTitle(location.pathname)}
          </span>
        </div>
      </div>

      {/* Right Actions Header */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {user?.isDemo && (
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            Demo Mode Active
          </span>
        )}

        <LanguageToggle />
        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  );
};

