import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  FileCheck2,
  FolderLock,
  GitCompare,
  AlertTriangle,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Clock,
  Layers,
  Wrench,
  Check,
  XCircle,
} from 'lucide-react';
import { LanguageToggle } from '../components/common/LanguageToggle.jsx';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';

export const LandingPage = () => {
  const { t } = useTranslation();

  const failurePoints = [
    {
      problem: 'Fragmented Records',
      solution: 'Central Evidence Vault',
      description: 'Single secure place for all factory certificates, tax records, and calibration reports. No more chasing scattered WhatsApp PDFs.',
      icon: FolderLock,
    },
    {
      problem: 'Different Buyer Checklists',
      solution: 'Multi-Buyer Template Mapping',
      description: 'One reusable supplier profile mapped across automotive, industrial machinery, and electrical buyer checklists.',
      icon: GitCompare,
    },
    {
      problem: 'Expired & Outdated Evidence',
      solution: 'Automatic Expiry Recalculation',
      description: 'Dynamic 30/15/7 day advance alerts so ISO audits, calibration certificates, and CTOs never lapse unnoticed.',
      icon: Clock,
    },
    {
      problem: 'Unclear Buyer Requirements',
      solution: 'Plain-Language Guidance',
      description: 'Every technical buyer requirement explained in simple terms in English and Marathi, specifying exactly what proof satisfies it.',
      icon: HelpCircle,
    },
    {
      problem: 'Zero Visibility of Readiness',
      solution: 'Transparent Readiness Matrix',
      description: 'Live readiness overview with transparent formula breakdown and clear next steps before sending dossiers to buyers.',
      icon: BarChart3,
    },
    {
      problem: 'Confusion on Verification Trust',
      solution: 'Separated 3-Tier Lifecycle',
      description: 'Strict separation between Uploaded, Admin-Verified, and Buyer-Accepted statuses. Never auto-verified.',
      icon: ShieldCheck,
    },
    {
      problem: 'Technical Capability Gaps',
      solution: 'Manual Technical Assessment Flags',
      description: 'Documents alone never prove machining tolerance. Flagged transparently for on-site engineering evaluation.',
      icon: Wrench,
    },
  ];

  const howItWorksSteps = [
    { step: 1, title: 'Register MSME', desc: 'Create your job-shop account with factory location and capabilities.' },
    { step: 2, title: 'Upload Evidence', desc: 'Upload GST, Udyam, ISO, calibration records, and machine roster to Vault.' },
    { step: 3, title: 'Pick Buyer Checklist', desc: 'Choose prospective buyers like Apex Auto, Meridian, or Volt Electricals.' },
    { step: 4, title: 'Matching Engine Run', desc: 'Rules-based transparent evaluation with clear human-readable reasons.' },
    { step: 5, title: 'Gap Analysis Matrix', desc: 'Inspect fulfilled items, expired evidence, and technical checks needed.' },
    { step: 6, title: 'Take Corrective Actions', desc: 'Assign renewals, tests, or calibration tasks with trackable due dates.' },
    { step: 7, title: 'Export Evidence Pack', desc: 'Download standardized PDF dossier or create time-limited share links.' },
    { step: 8, title: 'Continuous Readiness', desc: 'Stay audit-ready 365 days a year with automatic expiry warnings.' },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
      {/* Landing Navbar */}
      <header className="sticky top-0 z-30 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center shadow-subtle">
              <Shield className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-navy dark:text-white">
                ReadySupply
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary dark:bg-primary-950 dark:text-primary-300">
                MSME Readiness
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm font-semibold text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark px-3 py-2 transition-colors"
            >
              {t('nav.login', 'Login')}
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-600 text-white font-medium text-sm transition-colors shadow-subtle"
            >
              <span>{t('nav.register', 'Get Started')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-primary text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4" />
          <span>Supplier-Side Readiness Assistant for Indian Job Shops</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-navy dark:text-white max-w-4xl mx-auto leading-tight">
          Become Buyer-Ready Before You Pitch.
        </h1>

        <p className="mt-5 text-base sm:text-xl text-muted-light dark:text-muted-dark max-w-2xl mx-auto leading-relaxed">
          Organize business evidence, map qualifications against multiple buyers’ checklists, identify missing items, and take concrete corrective actions.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold text-base transition-all shadow-elevated flex items-center gap-2"
          >
            <span>Start Free Readiness Check</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3.5 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-base transition-colors shadow-subtle"
          >
            Explore Demo Account
          </Link>
        </div>

        {/* Live Product Preview Mockup */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-elevated overflow-hidden text-left">
          <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border-b border-border-light dark:border-border-dark flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-xs text-muted-light dark:text-muted-dark ml-2 font-mono">
                readysupply.in/dashboard - Shree Precision Components
              </span>
            </div>
            <span className="text-xs font-semibold text-primary">Live Readiness View</span>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
                <div>
                  <h4 className="font-bold text-base text-navy dark:text-white">
                    Apex Auto Components Ltd (fictional)
                  </h4>
                  <p className="text-xs text-muted-light dark:text-muted-dark">
                    Automotive Tier-1 Qualification Checklist (8 Requirements)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-emerald-600">75%</span>
                  <p className="text-[10px] text-muted-light dark:text-muted-dark">Readiness Indicator</p>
                </div>
              </div>

              {/* Requirement Sample Rows */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-text-light dark:text-text-dark">APEX-REQ-01: Business Registration</p>
                      <p className="text-[11px] text-muted-light dark:text-muted-dark">Partnership Deed on file (Verified)</p>
                    </div>
                  </div>
                  <StatusBadge status="verified" size="xs" />
                </div>

                <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-text-light dark:text-text-dark">APEX-REQ-03: ISO 9001:2015 Certification</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">Expires in 14 days - Renewal In Progress</p>
                    </div>
                  </div>
                  <StatusBadge status="expiring_soon" size="xs" />
                </div>

                <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wrench className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-text-light dark:text-text-dark">APEX-REQ-07: PPAP Level 3 Capability</p>
                      <p className="text-[11px] text-muted-light dark:text-muted-dark">Requires on-site engineering audit</p>
                    </div>
                  </div>
                  <StatusBadge status="needs_manual_assessment" size="xs" />
                </div>
              </div>
            </div>

            {/* Quick Action Mockup Card */}
            <div className="rounded-xl border border-border-light dark:border-border-dark p-4 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-light dark:text-muted-dark">
                  Immediate Priority
                </span>
                <p className="text-sm font-semibold text-text-light dark:text-text-dark mt-2">
                  Renew ISO 9001 surveillance audit
                </p>
                <p className="text-xs text-muted-light dark:text-muted-dark mt-1">
                  Assigned to Kailash Sharma (Quality Head). Due in 3 days.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                <div className="text-[11px] text-slate-500 mb-2">
                  Internal readiness indicator - not a certification or buyer approval score.
                </div>
                <div className="w-full py-2 rounded-lg bg-navy text-white text-xs font-semibold text-center">
                  Export Submission Dossier (PDF)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 Failure Points Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border-light dark:border-border-dark">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
            Built for MSME Reality
          </h2>
          <p className="text-2xl sm:text-4xl font-extrabold text-navy dark:text-white mt-2">
            Why Small Factories Struggle with Buyer Qualification
          </p>
          <p className="mt-3 text-sm sm:text-base text-muted-light dark:text-muted-dark">
            Tier-2/3 job shops have great technical machinists but no compliance teams. Here is how ReadySupply addresses the 7 key failure points:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {failurePoints.map((fp, i) => {
            const Icon = fp.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle hover:border-primary-400 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Problem: {fp.problem}
                </span>
                <h3 className="text-base font-bold text-text-light dark:text-text-dark mt-1">
                  {fp.solution}
                </h3>
                <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark mt-2 leading-relaxed">
                  {fp.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8-Step Timeline */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl my-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
            How It Works
          </h2>
          <p className="text-2xl sm:text-4xl font-extrabold text-navy dark:text-white mt-2">
            The 8-Step Journey to Qualification
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorksSteps.map((s) => (
            <div
              key={s.step}
              className="p-5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark relative"
            >
              <div className="w-8 h-8 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center mb-3">
                {s.step}
              </div>
              <h4 className="text-sm font-bold text-text-light dark:text-text-dark">
                {s.title}
              </h4>
              <p className="text-xs text-muted-light dark:text-muted-dark mt-1.5 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Honest Limitations Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-8 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle">
          <div className="flex items-center gap-2.5 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-navy dark:text-white">
              What ReadySupply Is — and What We Are Not
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
              <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>What We Are:</span>
              </h4>
              <ul className="mt-2.5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li>• A supplier-side readiness assistant for MSMEs.</li>
                <li>• A reusable evidence profile mapped against multiple buyers.</li>
                <li>• An expiry tracker with advance renewal warnings.</li>
                <li>• A gap-to-action workflow tracker for quality managers.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
              <h4 className="text-sm font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>What We Are NOT:</span>
              </h4>
              <ul className="mt-2.5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li>• NOT a certification body (e.g. ISO, TUV, ZED).</li>
                <li>• NOT a buyer procurement portal or purchase order system.</li>
                <li>• NOT an ERP or inventory management tool.</li>
                <li>• We do not guarantee approval: buyers make the final decision.</li>
              </ul>
            </div>
          </div>

          <p className="mt-6 text-xs text-center text-muted-light dark:text-muted-dark italic">
            "Internal readiness indicator - not a certification or buyer approval score."
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-light dark:border-border-dark py-8 text-center text-xs text-muted-light dark:text-muted-dark">
        <p>{t('app.footer')}</p>
        <p className="mt-1 text-[11px] text-slate-400">
          ReadySupply MVP • Multi-Buyer Readiness Engine • Marathi & English Supported
        </p>
      </footer>
    </div>
  );
};

