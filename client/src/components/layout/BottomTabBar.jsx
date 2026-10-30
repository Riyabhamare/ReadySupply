import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  FolderLock,
  GitCompare,
  ListTodo,
  Menu,
  Building2,
  FileCheck,
  ShieldAlert,
  LogOut,
  Palette,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const BottomTabBar = () => {
  const { t } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainTabs = [
    { to: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
    { to: '/vault', label: t('nav.vault', 'Vault'), icon: FolderLock },
    { to: '/gap-matrix', label: t('nav.gapMatrix', 'Match'), icon: GitCompare },
    { to: '/actions', label: t('nav.actions', 'Actions'), icon: ListTodo },
  ];

  const isDev = import.meta.env.DEV || (typeof window !== 'undefined' && window.location.search.includes('dev'));

  const handleLogout = async () => {
    setDrawerOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Fixed Bottom Bar on Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-light dark:bg-surface-dark border-t border-border-light dark:border-border-dark flex items-center justify-around h-16 px-1 safe-area-pb shadow-elevated">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-2 rounded-lg transition-colors select-none ${
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] mt-1 truncate">{tab.label}</span>
            </NavLink>
          );
        })}

        {/* 'More' Button to Open Slide-Over Drawer */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center min-w-[64px] min-h-[44px] py-1 px-2 rounded-lg text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors select-none"
          aria-label="Open more navigation options"
        >
          <Menu className="w-5 h-5 shrink-0" />
          <span className="text-[10px] mt-1">{t('nav.more', 'More')}</span>
        </button>
      </nav>

      {/* Slide-over Drawer for 'More' Destinations */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-surface-light dark:bg-surface-dark p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border-light dark:border-border-dark">
                <span className="font-bold text-base text-text-light dark:text-text-dark">
                  Menu & More
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg text-muted-light dark:text-muted-dark hover:text-text-light"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-2">
                <NavLink
                  to="/profile"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-text-light dark:text-text-dark hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Building2 className="w-5 h-5 text-primary" />
                  <span>{t('nav.profile', 'Company Profile')}</span>
                </NavLink>

                <NavLink
                  to="/pack"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-text-light dark:text-text-dark hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <FileCheck className="w-5 h-5 text-primary" />
                  <span>{t('nav.evidencePack', 'Evidence Pack')}</span>
                </NavLink>

                {isAdmin && (
                  <NavLink
                    to="/admin"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-text-light dark:text-text-dark hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ShieldAlert className="w-5 h-5 text-primary" />
                    <span>{t('nav.admin', 'Admin Review Queue')}</span>
                  </NavLink>
                )}

                {isDev && (
                  <NavLink
                    to="/design-system"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-text-light dark:text-text-dark hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Palette className="w-5 h-5 text-primary" />
                    <span>{t('nav.designSystem', 'Design System')}</span>
                  </NavLink>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('nav.logout', 'Logout')}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
