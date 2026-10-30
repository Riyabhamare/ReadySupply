import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Building2, User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { Button } from '../components/common/Button.jsx';
import { LanguageToggle } from '../components/common/LanguageToggle.jsx';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.companyName || !formData.email || !formData.password) {
      toastError('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      toastError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsLoading(true);
      await register(formData);
      toastSuccess('Factory profile created successfully! Welcome to ReadySupply.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col justify-between p-4 sm:p-6">
      <div className="flex items-center justify-between max-w-lg w-full mx-auto">
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

      <div className="max-w-lg w-full mx-auto my-8 p-6 sm:p-8 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-elevated">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-navy dark:text-white">
            Register Your MSME Factory
          </h1>
          <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark mt-1">
            Build your reusable readiness dossier and connect with buyers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Company / Enterprise Legal Name *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-muted-light dark:text-muted-dark absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g., Shree Precision Components"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Your Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-muted-light dark:text-muted-dark absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Rameshwar Patil"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-light dark:text-muted-dark absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.in"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Phone Number (WhatsApp)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-muted-light dark:text-muted-dark absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98200 00000"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Password (Min 6 Characters) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-light dark:text-muted-dark absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-4"
            isLoading={isLoading}
            icon={ArrowRight}
            iconPosition="right"
          >
            Create Supplier Account
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-light dark:text-muted-dark">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign In here
          </Link>
        </p>
      </div>

      <div className="text-center text-xs text-muted-light dark:text-muted-dark">
        {t('app.disclaimer')}
      </div>
    </div>
  );
};

