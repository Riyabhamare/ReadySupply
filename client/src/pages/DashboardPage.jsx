import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FolderLock,
  Clock,
  AlertTriangle,
  Hourglass,
  ListTodo,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatCard } from '../components/common/StatCard.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { Button } from '../components/common/Button.jsx';
import { CardSkeleton } from '../components/common/Skeleton.jsx';

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [buyers, setBuyers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [mapping, setMapping] = useState(null);
  const [stats, setStats] = useState({
    totalDocs: 0,
    expiringSoon: 0,
    expired: 0,
    awaitingReview: 0,
    missing: 0,
    openActions: 0,
  });
  const [attentionItems, setAttentionItems] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [buyersRes, templatesRes, docsRes, actionsRes, activityRes] = await Promise.all([
        api.get('/buyers'),
        api.get('/templates'),
        api.get('/documents'),
        api.get('/actions'),
        api.get('/activity'),
      ]);

      setBuyers(buyersRes.data || []);
      setTemplates(templatesRes.data || []);
      setRecentActivities((activityRes.data || []).slice(0, 6));

      const docs = docsRes.data || [];
      const actions = actionsRes.data || [];

      const expiringSoonDocs = docs.filter((d) => d.expiryInfo?.isExpiringSoon);
      const expiredDocs = docs.filter((d) => d.expiryInfo?.isExpired);
      const pendingDocs = docs.filter((d) => d.reviewStatus === 'pending_review');
      const openActs = actions.filter((a) => a.status !== 'completed');

      // Select default template if available
      const defaultTpl = templatesRes.data?.[0];
      const tplId = selectedTemplateId || defaultTpl?._id;
      let mapData = null;

      if (tplId) {
        setSelectedTemplateId(tplId);
        try {
          const mapRes = await api.get(`/matching/${tplId}/snapshot`);
          mapData = mapRes.data;
          setMapping(mapData);
        } catch (e) {
          // If no snapshot yet, run match now
          const runRes = await api.post(`/matching/${tplId}/run`);
          mapData = runRes.data;
          setMapping(mapData);
        }
      }

      setStats({
        totalDocs: docs.length,
        expiringSoon: expiringSoonDocs.length,
        expired: expiredDocs.length,
        awaitingReview: pendingDocs.length,
        missing: mapData?.summary?.missing || 0,
        openActions: openActs.length,
      });

      // Build Needs Attention list (Max 5 most urgent items)
      const urgent = [];

      // Overdue actions first
      actions
        .filter((a) => a.computedStatus === 'overdue')
        .forEach((a) => {
          urgent.push({
            id: `action-${a._id}`,
            type: 'ACTION_OVERDUE',
            title: `Overdue Action: ${a.title}`,
            subtitle: `Due ${new Date(a.dueDate).toLocaleDateString()}`,
            badgeStatus: 'overdue',
            link: '/actions',
            fixAction: () => navigate('/actions'),
          });
        });

      // Expired docs
      expiredDocs.forEach((d) => {
        urgent.push({
          id: `doc-${d._id}`,
          type: 'DOC_EXPIRED',
          title: `Expired Evidence: ${d.name}`,
          subtitle: `Expired on ${new Date(d.expiryDate).toLocaleDateString()}`,
          badgeStatus: 'expired',
          link: '/vault',
          fixAction: () => navigate('/vault'),
        });
      });

      // Expiring soon docs
      expiringSoonDocs.forEach((d) => {
        urgent.push({
          id: `doc-${d._id}`,
          type: 'DOC_EXPIRING',
          title: `Expiring Soon: ${d.name}`,
          subtitle: `Expires in ${d.expiryInfo?.daysRemaining} days`,
          badgeStatus: 'expiring_soon',
          link: '/vault',
          fixAction: () => navigate('/vault'),
        });
      });

      setAttentionItems(urgent.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTemplateId]);

  const handleTemplateChange = (e) => {
    setSelectedTemplateId(e.target.value);
  };

  const selectedTemplate = templates.find((t) => t._id === selectedTemplateId) || templates[0];
  const templateName = selectedTemplate?.name || 'Selected Buyer Checklist';

  // Readiness Donut Data (Reconciled with stat cards and requirement results)
  const readinessScore = mapping?.readinessScore || 0;
  const summary = mapping?.summary || {
    fulfilled: 0,
    expiringSoon: 0,
    awaitingReview: 0,
    needsManualAssessment: 0,
    missing: 0,
    expired: 0,
  };

  const chartData = [
    { name: 'Fulfilled / Valid', value: summary.fulfilled || 0, color: '#16A34A' },
    { name: 'Expiring Soon', value: summary.expiringSoon || 0, color: '#F59E0B' },
    { name: 'Awaiting Review', value: summary.awaitingReview || 0, color: '#FCD34D' },
    { name: 'Needs Technical Check', value: summary.needsManualAssessment || 0, color: '#2563EB' },
    { name: 'Missing Requirements', value: summary.missing || 0, color: '#DC2626' },
    { name: 'Expired Requirements', value: summary.expired || 0, color: '#991B1B' },
  ].filter((item) => item.value > 0);

  const renderChartData = chartData.length > 0 ? chartData : [{ name: 'No requirements', value: 1, color: '#CBD5E1' }];

  if (loading && !mapping) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const isProfileComplete = (profile?.profileCompleteness || 0) >= 80;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dashboard Top Header & Buyer Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-light dark:border-border-dark">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-navy dark:text-white">
              {profile?.companyName || 'Supplier Readiness Dashboard'}
            </h1>
            {user?.isDemo && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Demo
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {profile?.location?.city ? `${profile.location.city}, Maharashtra • ` : ''}
            {profile?.manufacturingSector || 'Precision Job Shop'}
          </p>
        </div>

        {/* Buyer Switcher Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs font-semibold text-muted-light dark:text-muted-dark shrink-0">
            {t('dashboard.selectBuyer')}:
          </label>
          <select
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-subtle max-w-xs truncate"
          >
            {templates.map((tpl) => (
              <option key={tpl._id} value={tpl._id}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Onboarding Guidance Banner */}
      {!isProfileComplete && (
        <div className="p-5 rounded-2xl bg-primary-50/60 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-navy dark:text-white">
                {t('dashboard.onboardingTitle')}
              </h2>
            </div>
            <p className="text-xs text-muted-light dark:text-muted-dark max-w-xl">
              Complete your company profile, machinery roster, and upload initial certificates to unlock accurate multi-buyer readiness scores.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/profile')}
          >
            Complete Profile ({profile?.profileCompleteness || 0}%)
          </Button>
        </div>
      )}

      {/* Reconciled Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title={t('dashboard.totalDocs')}
          value={stats.totalDocs}
          icon={FolderLock}
          onClick={() => navigate('/vault')}
          subtitle="All files in Vault"
          tooltip="Total number of documents stored in your Evidence Vault across all categories."
        />
        <StatCard
          title={t('dashboard.expiringSoon')}
          value={stats.expiringSoon}
          icon={Hourglass}
          variant={stats.expiringSoon > 0 ? 'warning' : 'default'}
          onClick={() => navigate('/vault?expiryState=expiring_soon')}
          subtitle="Within 30 days"
          tooltip="Documents across your vault that expire within 30 days. Renewal is recommended."
        />
        <StatCard
          title={t('dashboard.expiredDocs')}
          value={stats.expired}
          icon={AlertTriangle}
          variant={stats.expired > 0 ? 'danger' : 'default'}
          onClick={() => navigate('/vault?expiryState=expired')}
          subtitle={`${summary.expired || 0} in active checklist`}
          tooltip={`Total expired documents in your vault (${stats.expired}); ${summary.expired || 0} currently affect requirements in ${templateName}.`}
        />
        <StatCard
          title={t('dashboard.awaitingReview')}
          value={stats.awaitingReview}
          icon={Clock}
          onClick={() => navigate('/vault?reviewStatus=pending_review')}
          subtitle="Pending admin check"
          tooltip="Uploaded files awaiting administrator review and verification."
        />
        <StatCard
          title={t('dashboard.missingReqs')}
          value={summary.missing}
          icon={AlertCircle}
          variant={summary.missing > 0 ? 'danger' : 'default'}
          onClick={() => navigate('/gap-matrix')}
          subtitle="In active checklist"
          tooltip={`Requirements in ${templateName} that have no matching document or capability on file.`}
        />
        <StatCard
          title={t('dashboard.openActions')}
          value={stats.openActions}
          icon={ListTodo}
          variant={stats.openActions > 0 ? 'info' : 'default'}
          onClick={() => navigate('/actions')}
          subtitle="Tasks to complete"
          tooltip="Total open, in-progress, and overdue corrective action items."
        />
      </div>

      {/* Main Grid: Readiness Donut & Needs Attention Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Overview Donut */}
        <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-navy dark:text-white">
                {t('dashboard.readinessScore')}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                {templateName}
              </span>
            </div>

            {/* Recharts Donut */}
            <div className="h-52 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={renderChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={84}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {renderChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold font-mono text-text-light dark:text-text-dark">
                  {readinessScore}%
                </span>
                <span className="text-[11px] font-medium text-muted-light dark:text-muted-dark">
                  Ready
                </span>
              </div>
            </div>

            {/* MANDATORY PROMPT REQUIREMENT: Visible text DIRECTLY under the donut */}
            <p className="text-xs text-center font-medium text-muted-light dark:text-muted-dark italic mt-2 mb-3 px-2 leading-snug">
              Internal readiness indicator - not a certification or buyer approval score.
            </p>

            {/* Reconciled Legend */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border-light/60 dark:border-border-dark/60 text-[11px]">
              <div className="flex items-center gap-1.5" title="Verified active evidence">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <span className="text-muted-light dark:text-muted-dark truncate">
                  Fulfilled: {summary.fulfilled || 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5" title="Expires within 30 days">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-muted-light dark:text-muted-dark truncate">
                  Expiring Soon: {summary.expiringSoon || 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5" title="Needs technical or on-site engineering check">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                <span className="text-muted-light dark:text-muted-dark truncate">
                  Tech Check: {summary.needsManualAssessment || 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5" title="Missing documents in this checklist">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                <span className="text-muted-light dark:text-muted-dark truncate">
                  Missing: {summary.missing || 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5" title="Expired documents required by this checklist">
                <span className="w-2.5 h-2.5 rounded-full bg-red-900 shrink-0" />
                <span className="text-muted-light dark:text-muted-dark truncate">
                  Expired Reqs: {summary.expired || 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5" title="Awaiting admin reviewer check">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shrink-0" />
                <span className="text-muted-light dark:text-muted-dark truncate">
                  Awaiting Review: {summary.awaitingReview || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-border-light dark:border-border-dark">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => navigate('/gap-matrix')}
            >
              Inspect Gap Matrix
            </Button>
          </div>
        </div>

        {/* Needs Attention Priority Panel */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
              <div>
                <h3 className="text-base font-bold text-navy dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{t('dashboard.attentionTitle')}</span>
                </h3>
                <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
                  {t('dashboard.attentionSubtitle')}
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                {attentionItems.length} urgent
              </span>
            </div>

            <div className="divide-y divide-border-light dark:divide-border-dark mt-3">
              {attentionItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-light dark:text-muted-dark">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  Great job! No expired documents or overdue actions at this time.
                </div>
              ) : (
                attentionItems.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg px-2 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={item.badgeStatus} size="xs" />
                        <span className="text-xs font-semibold text-text-light dark:text-text-dark truncate">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-light dark:text-muted-dark mt-1">
                        {item.subtitle}
                      </p>
                    </div>

                    <button
                      onClick={item.fixAction}
                      className="px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary-50 dark:hover:bg-primary-950 text-xs font-semibold shrink-0 transition-colors"
                    >
                      {t('dashboard.quickFix')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
            <span className="text-muted-light dark:text-muted-dark text-[11px]">
              Formula: (Fulfilled + Expiring Soon) / Total Applicable Mandatory
            </span>
            <Link to="/actions" className="text-primary hover:underline font-semibold">
              View All Actions →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle">
        <h3 className="text-base font-bold text-navy dark:text-white mb-4">
          {t('dashboard.recentActivity')}
        </h3>

        {recentActivities.length === 0 ? (
          <p className="text-xs text-muted-light dark:text-muted-dark">
            {t('dashboard.noActivity')}
          </p>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div
                key={act._id}
                className="flex items-start gap-3 text-xs pb-3 border-b border-border-light dark:border-border-dark last:border-0 last:pb-0"
              >
                <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                <div className="flex-1">
                  <p className="text-text-light dark:text-text-dark font-medium">
                    <span className="font-semibold text-primary">{act.action}</span>
                    {act.details?.title ? ` - ${act.details.title}` : ''}
                    {act.details?.name ? ` - ${act.details.name}` : ''}
                    {act.details?.templateName ? ` against ${act.details.templateName}` : ''}
                  </p>
                  <span className="text-[10px] text-muted-light dark:text-muted-dark">
                    {new Date(act.createdAt).toLocaleString()} • Performed by {act.performedBy?.name || 'User'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
