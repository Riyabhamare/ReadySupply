import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Lock, Mail, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { Button } from '../components/common/Button.jsx';
import { LanguageToggle } from '../components/common/LanguageToggle.jsx';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';

export const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toastError('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await login(email, password);
      toastSuccess(`Welcome back, ${res.user.name}!`);
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col justify-between p-4 sm:p-6">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-md w-full mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-400" />
          </div>
          <span className="font-bold text-base tracking-tight text-navy dark:text-white">
            ReadySupply
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8 p-6 sm:p-8 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-elevated">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-navy dark:text-white">
            Sign In to ReadySupply
          </h1>
          <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark mt-1">
            Access your Evidence Vault and Buyer Checklists
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-light dark:text-muted-dark absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@precision.in"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-light dark:text-muted-dark absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
            icon={ArrowRight}
            iconPosition="right"
          >
            Sign In
          </Button>
        </form>

        {/* Demo Fast-Login Helpers */}
        <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-light dark:text-muted-dark text-center mb-3">
            Quick Fill Demo Accounts:
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fillDemo('shree@precision.in', 'Supplier@123456')}
              className="w-full p-2.5 rounded-xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-left flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-semibold text-text-light dark:text-text-dark">Shree Precision Components</p>
                  <p className="text-[10px] text-muted-light dark:text-muted-dark">Nashik • CNC / Machining</p>
                </div>
              </div>
              <span className="text-[10px] text-primary font-semibold">Load</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('kaveri@fabrication.in', 'Supplier@123456')}
              className="w-full p-2.5 rounded-xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-left flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="font-semibold text-text-light dark:text-text-dark">Kaveri Fabrication Works</p>
                  <p className="text-[10px] text-muted-light dark:text-muted-dark">Pune • Welding / Heavy Fab</p>
                </div>
              </div>
              <span className="text-[10px] text-primary font-semibold">Load</span>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('admin@readysupply.in', 'Admin@ReadySupply2026!')}
              className="w-full p-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-100/50 text-left flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200">Platform Reviewer / Admin</p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">admin@readysupply.in</p>
                </div>
              </div>
              <span className="text-[10px] text-amber-700 font-semibold">Load</span>
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-light dark:text-muted-dark">
          Don't have an MSME account yet?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Register factory
          </Link>
        </p>
      </div>

      <div className="text-center text-xs text-muted-light dark:text-muted-dark">
        {t('app.disclaimer')}
      </div>
    </div>
  );
};

