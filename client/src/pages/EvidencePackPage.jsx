import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileCheck,
  Download,
  Share2,
  Lock,
  Building2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Copy,
  Trash2,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../components/common/Toast.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { Button } from '../components/common/Button.jsx';
import { Modal } from '../components/common/Modal.jsx';

export const EvidencePackPage = () => {
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [packPreview, setPackPreview] = useState(null);
  const [shareLinks, setShareLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Share Link Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareForm, setShareForm] = useState({
    recipientName: '',
    recipientEmail: '',
    purpose: 'Buyer Qualification Review',
    expiryDays: 7,
    maxAccessCount: 10,
    consentGranted: false,
  });
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const [tplRes, linksRes] = await Promise.all([
        api.get('/templates'),
        api.get('/share/list'),
      ]);
      setTemplates(tplRes.data || []);
      setShareLinks(linksRes.data || []);

      const initialTplId = tplRes.data?.[0]?._id;
      if (initialTplId) {
        setSelectedTemplateId(initialTplId);
        loadPackPreview(initialTplId);
      }
    } catch (err) {
      toastError('Failed to load templates or preview');
    } finally {
      setLoading(false);
    }
  };

  const loadPackPreview = async (tplId) => {
    try {
      const res = await api.get(`/packs/${tplId}/preview`);
      setPackPreview(res.data);
    } catch (err) {
      toastError('Failed to load dossier preview');
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  const handleTemplateChange = (e) => {
    const tplId = e.target.value;
    setSelectedTemplateId(tplId);
    loadPackPreview(tplId);
  };

  const handleCreateShareLink = async (e) => {
    e.preventDefault();
    if (!shareForm.consentGranted) {
      toastError('You must grant consent to share your documents.');
      return;
    }

    try {
      setIsCreatingLink(true);
      const res = await api.post('/share', {
        templateId: selectedTemplateId,
        recipientName: shareForm.recipientName,
        recipientEmail: shareForm.recipientEmail,
        purpose: shareForm.purpose,
        expiryDays: shareForm.expiryDays,
        maxAccessCount: shareForm.maxAccessCount,
        consentGranted: true,
      });

      success('Controlled share link generated!');
      setIsShareModalOpen(false);
      setShareForm({
        recipientName: '',
        recipientEmail: '',
        purpose: 'Buyer Qualification Review',
        expiryDays: 7,
        maxAccessCount: 10,
        consentGranted: false,
      });

      // Refresh share links list
      const linksRes = await api.get('/share/list');
      setShareLinks(linksRes.data || []);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create share link');
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleRevoke = async (linkId) => {
    try {
      await api.post(`/share/${linkId}/revoke`);
      success('Share link revoked');
      const linksRes = await api.get('/share/list');
      setShareLinks(linksRes.data || []);
    } catch (err) {
      toastError('Failed to revoke share link');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    success('Share link URL copied to clipboard!');
  };

  const profile = packPreview?.profile;
  const buyer = packPreview?.buyer;
  const mapping = packPreview?.mapping;
  const documents = packPreview?.documents || [];
  const actions = packPreview?.actions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-light dark:border-border-dark">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy dark:text-white">
            {t('pack.title')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {t('pack.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedTemplateId}
            onChange={handleTemplateChange}
            className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark font-medium focus:ring-2 focus:ring-primary shadow-subtle max-w-xs"
          >
            {templates.map((tpl) => (
              <option key={tpl._id} value={tpl._id}>
                {tpl.name}
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            size="md"
            icon={Share2}
            onClick={() => setIsShareModalOpen(true)}
          >
            {t('pack.shareLink')}
          </Button>

          <a
            href={`/api/packs/${selectedTemplateId}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy hover:bg-navy-light text-white font-semibold text-xs sm:text-sm transition-colors shadow-subtle"
          >
            <Download className="w-4 h-4" />
            <span>{t('pack.exportPdf')}</span>
          </a>
        </div>
      </div>

      {/* Readiness Warning / Notice Banner */}
      <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
        <Shield className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold">Dossier Preparation Notice: </span>
          <span>{t('pack.disclaimerNotice')}</span>
        </div>
      </div>

      {/* Split Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dossier Checklist & Summary */}
        <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle space-y-5">
          <div className="border-b border-border-light dark:border-border-dark pb-3">
            <h3 className="font-bold text-sm text-navy dark:text-white">
              Dossier Content Index
            </h3>
            <p className="text-xs text-muted-light dark:text-muted-dark">
              Items compiled in the PDF export
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2 text-text-light dark:text-text-dark font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>1. MSME Factory Profile & Machinery Roster</span>
            </div>

            <div className="flex items-center gap-2 text-text-light dark:text-text-dark font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>2. Buyer Checklist Matrix ({mapping?.results?.length || 0} items)</span>
            </div>

            <div className="flex items-center gap-2 text-text-light dark:text-text-dark font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>3. Document Evidence Table ({documents.length} files)</span>
            </div>

            <div className="flex items-center gap-2 text-text-light dark:text-text-dark font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>4. Action Plan for Open Gaps ({actions.length} items)</span>
            </div>

            <div className="flex items-center gap-2 text-text-light dark:text-text-dark font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>5. Standardized Mandatory Footer on Every Page</span>
            </div>
          </div>

          {/* Active Share Links Manager */}
          <div className="pt-4 border-t border-border-light dark:border-border-dark">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-light dark:text-muted-dark mb-3">
              Active Controlled Share Links ({shareLinks.length})
            </h4>

            {shareLinks.length === 0 ? (
              <p className="text-xs text-muted-light dark:text-muted-dark italic">
                No active share links. Generate one above to grant read-only buyer access.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {shareLinks.map((link) => (
                  <div
                    key={link._id}
                    className="p-2.5 rounded-lg border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-light dark:text-text-dark truncate max-w-[140px]">
                        {link.recipientName || 'Buyer Reviewer'}
                      </span>
                      {link.isRevoked ? (
                        <span className="text-[10px] text-red-600 font-bold">Revoked</span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-light dark:text-muted-dark font-mono">
                      <span>Views: {link.accessCount} / {link.maxAccessCount}</span>
                      <span>Expires: {new Date(link.expiresAt).toLocaleDateString()}</span>
                    </div>

                    {!link.isRevoked && (
                      <div className="flex items-center justify-between pt-1 border-t border-border-light dark:border-border-dark">
                        <button
                          onClick={() => copyToClipboard(`${window.location.origin}/shared/${link.token}`)}
                          className="text-primary hover:underline text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Link</span>
                        </button>

                        <button
                          onClick={() => handleRevoke(link._id)}
                          className="text-red-600 hover:underline text-[11px] font-semibold"
                        >
                          Revoke
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Dossier PDF Layout Preview */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle space-y-6">
          {/* Cover Header Preview */}
          <div className="p-6 rounded-xl bg-navy text-white space-y-2">
            <span className="text-xs uppercase tracking-wider text-primary-300 font-bold">
              ReadySupply Supplier Dossier
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {profile?.companyName || 'Supplier Name'}
            </h2>
            <p className="text-xs text-slate-300">
              Prepared for prospective buyer: <span className="font-bold text-white">{buyer?.name || 'Target Buyer'}</span>
            </p>
          </div>

          {/* Supplier Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/20 text-xs">
            <div>
              <span className="text-muted-light block">GSTIN:</span>
              <span className="font-mono font-bold text-text-light dark:text-text-dark truncate block">
                {profile?.gstNumber || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-muted-light block">Udyam No:</span>
              <span className="font-mono font-bold text-text-light dark:text-text-dark truncate block">
                {profile?.udyamNumber || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-muted-light block">Location:</span>
              <span className="font-bold text-text-light dark:text-text-dark truncate block">
                {profile?.location?.city || 'Nashik'}, Maharashtra
              </span>
            </div>
            <div>
              <span className="text-muted-light block">Readiness:</span>
              <span className="font-mono font-bold text-primary block">
                {mapping?.readinessScore || 0}%
              </span>
            </div>
          </div>

          {/* Checklist Preview Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-light dark:text-muted-dark">
              Mapped Checklist Requirements ({mapping?.results?.length || 0})
            </h4>

            <div className="divide-y divide-border-light dark:divide-border-dark border border-border-light dark:border-border-dark rounded-xl overflow-hidden text-xs">
              {mapping?.results?.map((r) => (
                <div
                  key={r.requirementCode}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/50"
                >
                  <div className="min-w-0">
                    <span className="font-mono font-bold text-primary mr-2">
                      {r.requirementCode}
                    </span>
                    <span className="font-semibold text-text-light dark:text-text-dark">
                      {r.requirementTitle}
                    </span>
                  </div>
                  <StatusBadge status={r.status} size="xs" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer Preview on Report */}
          <div className="pt-4 border-t border-border-light dark:border-border-dark text-center text-[10px] text-muted-light dark:text-muted-dark italic">
            "Preparation document generated by ReadySupply. Not a certification or supplier approval. Final approval rests with the buyer."
          </div>
        </div>
      </div>

      {/* Share Link Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Generate Controlled Share Link"
        subtitle="Grant time-limited, revocable read-only access to this submission package"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsShareModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateShareLink}
              isLoading={isCreatingLink}
            >
              {t('pack.createLinkBtn')}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateShareLink} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Recipient Name / Buyer Contact
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Vendor Development Team"
              value={shareForm.recipientName}
              onChange={(e) => setShareForm({ ...shareForm, recipientName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Link Expiry (1 - 30 Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={shareForm.expiryDays}
                onChange={(e) => setShareForm({ ...shareForm, expiryDays: parseInt(e.target.value, 10) || 7 })}
                className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Max Allowed Views
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={shareForm.maxAccessCount}
                onChange={(e) => setShareForm({ ...shareForm, maxAccessCount: parseInt(e.target.value, 10) || 10 })}
                className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Explicit Consent Checkbox (Mandatory) */}
          <div className="p-3.5 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50/40 dark:bg-primary-950/20">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={shareForm.consentGranted}
                onChange={(e) => setShareForm({ ...shareForm, consentGranted: e.target.checked })}
                className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4"
              />
              <span className="text-xs text-text-light dark:text-text-dark font-medium leading-relaxed">
                {t('pack.consentCheckbox')}
              </span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

