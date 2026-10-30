import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Shield,
  FileCheck,
  Building2,
  Calendar,
  AlertTriangle,
  Download,
  Eye,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { api } from '../services/api.js';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';

export const SharedPackViewPage = () => {
  const { token } = useParams();
  const [packData, setPackData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedPack = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/share/view/${token}`);
        setPackData(res.data);
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Invalid, revoked, or expired share link.');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedPack();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
        <div className="p-8 max-w-md w-full bg-surface-light dark:bg-surface-dark border border-red-300 dark:border-red-800 rounded-2xl shadow-elevated text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-navy dark:text-white">
            Access Restricted
          </h2>
          <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark">
            {errorMsg}
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Return to ReadySupply Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const profile = packData?.profile;
  const buyer = packData?.buyer;
  const template = packData?.template;
  const mapping = packData?.mapping;
  const documents = packData?.documents || [];
  const shareLink = packData?.shareLink;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark p-4 sm:p-8">
      {/* Top Header */}
      <div className="max-w-5xl mx-auto flex items-center justify-between pb-6 border-b border-border-light dark:border-border-dark mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-navy text-white flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <h1 className="font-bold text-base text-navy dark:text-white">
              ReadySupply Verified Dossier
            </h1>
            <p className="text-xs text-muted-light dark:text-muted-dark">
              Authorized Read-Only View for: <span className="font-semibold text-primary">{shareLink?.recipientName}</span>
            </p>
          </div>
        </div>

        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Banner Notice */}
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Self-prepared readiness dossier shared under supplier consent. Valid until {new Date(shareLink?.expiresAt).toLocaleDateString()}.
            </span>
          </div>
          <span className="font-mono font-bold text-[11px] text-blue-700 dark:text-blue-300">
            View #{shareLink?.accessCount} of {shareLink?.maxAccessCount}
          </span>
        </div>

        {/* Company Profile Card */}
        <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-light dark:border-border-dark">
            <div>
              <h2 className="text-xl font-bold text-navy dark:text-white">
                {profile?.companyName}
              </h2>
              <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
                {profile?.manufacturingSector} • {profile?.location?.city}, {profile?.location?.state}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-light dark:text-muted-dark block">
                Overall Readiness
              </span>
              <span className="text-2xl font-bold font-mono text-primary">
                {mapping?.readinessScore || 0}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-light block">GSTIN:</span>
              <span className="font-mono font-semibold text-text-light dark:text-text-dark">{profile?.gstNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-light block">Udyam No:</span>
              <span className="font-mono font-semibold text-text-light dark:text-text-dark">{profile?.udyamNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-light block">Employees:</span>
              <span className="font-semibold text-text-light dark:text-text-dark">{profile?.employeeCount || 0}</span>
            </div>
            <div>
              <span className="text-muted-light block">Target Buyer:</span>
              <span className="font-semibold text-primary">{buyer?.name}</span>
            </div>
          </div>
        </div>

        {/* Mapped Requirements Table */}
        <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle space-y-4">
          <h3 className="font-bold text-sm text-navy dark:text-white">
            Requirements & Qualification Status ({mapping?.results?.length || 0})
          </h3>

          <div className="divide-y divide-border-light dark:divide-border-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden text-xs">
            {mapping?.results?.map((r) => (
              <div
                key={r.requirementCode}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">
                      {r.requirementCode}
                    </span>
                    <span className="font-semibold text-text-light dark:text-text-dark">
                      {r.requirementTitle}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-light dark:text-muted-dark mt-1">
                    {r.reason}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <StatusBadge status={r.status} size="xs" />
                  {r.matchedDocumentId && (
                    <a
                      href={`/api/share/view/${token}/document/${r.matchedDocumentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-primary hover:bg-primary-50 dark:hover:bg-primary-950 rounded"
                      title="Inspect Document"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Footer */}
        <div className="py-6 text-center text-xs text-muted-light dark:text-muted-dark italic border-t border-border-light dark:border-border-dark">
          "Preparation document generated by ReadySupply. Not a certification or supplier approval. Final approval rests with the buyer."
        </div>
      </div>
    </div>
  );
};

