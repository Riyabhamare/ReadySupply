import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Building2,
  FolderLock,
  GitCompare,
  ListTodo,
  FileCheck,
  ShieldAlert,
  Palette,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const Sidebar = () => {
  const { t } = useTranslation();
  const { user, profile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('readysupply_sidebar_collapsed') === 'true';
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('readysupply_sidebar_collapsed', String(next));
      return next;
    });
  };

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
    { to: '/profile', label: t('nav.profile', 'Company Profile'), icon: Building2 },
    { to: '/vault', label: t('nav.vault', 'Evidence Vault'), icon: FolderLock },
    { to: '/gap-matrix', label: t('nav.gapMatrix', 'Buyer Gap Matrix'), icon: GitCompare },
    { to: '/actions', label: t('nav.actions', 'Action Tracker'), icon: ListTodo },
    { to: '/pack', label: t('nav.evidencePack', 'Evidence Pack'), icon: FileCheck },
  ];

  if (isAdmin) {
    navItems.push({
      to: '/admin',
      label: t('nav.admin', 'Admin Review Queue'),
      icon: ShieldAlert,
    });
  }

  // Only show Design Tokens showcase in development mode or with ?dev=true
  const isDev = import.meta.env.DEV || (typeof window !== 'undefined' && window.location.search.includes('dev'));
  if (isDev) {
    navItems.push({
      to: '/design-system',
      label: t('nav.designSystem', 'Design System'),
      icon: Palette,
    });
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark transition-all duration-200 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border-light dark:border-border-dark">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-navy dark:bg-navy-light text-white flex items-center justify-center shrink-0 shadow-subtle">
            <Shield className="w-5 h-5 text-primary-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-base tracking-tight text-navy dark:text-white leading-tight">
                ReadySupply
              </span>
              <span className="text-[10px] text-muted-light dark:text-muted-dark truncate">
                MSME Supplier Readiness
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={toggleCollapsed}
          className="p-1.5 rounded-lg text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors duration-150 group ${
                  isActive
                    ? 'bg-primary text-white shadow-subtle'
                    : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout Footer */}
      <div className="p-3 border-t border-border-light dark:border-border-dark bg-slate-50/60 dark:bg-slate-800/30">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary-200 dark:border-primary-800">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-light dark:text-text-dark truncate">
                {profile?.companyName || user?.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-muted-light dark:text-muted-dark uppercase tracking-wide">
                  {user?.role}
                </span>
                {user?.isDemo && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                    Demo
                  </span>
                )}
              </div>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-muted-light dark:text-muted-dark hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
