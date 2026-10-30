import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GitCompare,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  HelpCircle,
  Plus,
  Link as LinkIcon,
  Handshake,
  ArrowUpDown,
  FileText,
  Upload,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../components/common/Toast.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { Button } from '../components/common/Button.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { TableSkeleton } from '../components/common/Skeleton.jsx';

export const GapMatrixPage = () => {
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [mapping, setMapping] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  // Filter & Ordering State
  const [statusFilter, setStatusFilter] = useState('all');
  const [fixFirst, setFixFirst] = useState(true); // "Fix this first" sorts critical gaps to top
  const [expandedRows, setExpandedRows] = useState({});

  // Action & Link Modals
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionForm, setActionForm] = useState({
    title: '',
    description: '',
    assignedToName: '',
    priority: 'high',
    dueDate: '',
  });

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkTarget, setLinkTarget] = useState(null);
  const [selectedDocToLink, setSelectedDocToLink] = useState('');

  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [acceptTarget, setAcceptTarget] = useState(null);
  const [buyerAcceptNotes, setBuyerAcceptNotes] = useState('');

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [tplRes, docsRes] = await Promise.all([
        api.get('/templates'),
        api.get('/documents'),
      ]);
      setTemplates(tplRes.data || []);
      setDocuments(docsRes.data || []);

      const initialTplId = tplRes.data?.[0]?._id;
      if (initialTplId) {
        setSelectedTemplateId(initialTplId);
        loadMapping(initialTplId);
      }
    } catch (err) {
      toastError('Failed to load templates or documents');
    } finally {
      setLoading(false);
    }
  };

  const loadMapping = async (tplId) => {
    try {
      setEvaluating(true);
      let res;
      try {
        res = await api.get(`/matching/${tplId}/snapshot`);
      } catch (e) {
        // Run match if snapshot missing
        res = await api.post(`/matching/${tplId}/run`);
      }
      setMapping(res.data);
    } catch (err) {
      toastError('Failed to calculate requirement mapping');
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleTemplateChange = (e) => {
    const tplId = e.target.value;
    setSelectedTemplateId(tplId);
    loadMapping(tplId);
  };

  const handleRunEvaluation = async () => {
    if (!selectedTemplateId) return;
    try {
      setEvaluating(true);
      const res = await api.post(`/matching/${selectedTemplateId}/run`);
      setMapping(res.data);
      success('Qualification mapping re-calculated successfully!');
    } catch (err) {
      toastError('Evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  const toggleRow = (code) => {
    setExpandedRows((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  // Pre-fill One-Click Action Modal
  const openCreateAction = (resultItem) => {
    setActionTarget(resultItem);
    const suggestedTitle = `Fix Gap: ${resultItem.requirementTitle}`;
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);

    setActionForm({
      title: suggestedTitle,
      description: `Requirement: ${resultItem.requirementCode} (${resultItem.category})\nReason: ${resultItem.reason}\nSuggested Evidence: Upload valid ${resultItem.category} record.`,
      assignedToName: 'Quality Head',
      priority: resultItem.isMandatory ? 'high' : 'medium',
      dueDate: defaultDue.toISOString().split('T')[0],
    });
    setActionModalOpen(true);
  };

  const handleCreateActionSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/actions', {
        title: actionForm.title,
        description: actionForm.description,
        relatedRequirementCode: actionTarget.requirementCode,
        relatedRequirementTitle: actionTarget.requirementTitle,
        relatedTemplate: selectedTemplateId,
        assignedTo: { name: actionForm.assignedToName, role: 'Quality Lead' },
        priority: actionForm.priority,
        dueDate: actionForm.dueDate,
      });

      success('Corrective action created and assigned!');
      setActionModalOpen(false);
    } catch (err) {
      toastError('Failed to create action');
    }
  };

  // Open Link Document Modal
  const openLinkModal = (resultItem) => {
    setLinkTarget(resultItem);
    setSelectedDocToLink(resultItem.manualLinkedDocumentId?._id || '');
    setLinkModalOpen(true);
  };

  const handleLinkSubmit = async () => {
    try {
      const res = await api.post(`/matching/${selectedTemplateId}/link-document`, {
        requirementCode: linkTarget.requirementCode,
        documentId: selectedDocToLink || null,
      });
      setMapping(res.data.mapping);
      success('Linked document updated');
      setLinkModalOpen(false);
    } catch (err) {
      toastError('Failed to link document');
    }
  };

  // Buyer Acceptance Modal
  const openAcceptModal = (resultItem) => {
    setAcceptTarget(resultItem);
    setBuyerAcceptNotes(resultItem.buyerAcceptance?.notes || '');
    setAcceptModalOpen(true);
  };

  const handleAcceptSubmit = async (isAccepted) => {
    try {
      const res = await api.post(`/matching/${selectedTemplateId}/buyer-acceptance`, {
        requirementCode: acceptTarget.requirementCode,
        isAccepted,
        notes: buyerAcceptNotes,
      });
      setMapping(res.data.mapping);
      success(isAccepted ? 'Recorded buyer acceptance note' : 'Cleared acceptance note');
      setAcceptModalOpen(false);
    } catch (err) {
      toastError('Failed to record buyer acceptance');
    }
  };

  // Filter and Sort results
  const rawResults = mapping?.results || [];

  let filteredResults = rawResults.filter((r) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'fulfilled') return r.status === 'fulfilled_by_evidence' || r.status === 'expiring_soon';
    if (statusFilter === 'gaps') return r.status === 'missing' || r.status === 'evidence_expired' || r.status === 'rejected_evidence';
    if (statusFilter === 'manual') return r.status === 'needs_manual_assessment';
    return r.status === statusFilter;
  });

  if (fixFirst) {
    // Priority weights: Missing/Expired Mandatory = 1, Awaiting = 2, Needs Manual = 3, Fulfilled = 4, N/A = 5
    const getWeight = (r) => {
      if (r.status === 'missing' || r.status === 'evidence_expired' || r.status === 'rejected_evidence') {
        return r.isMandatory ? 1 : 2;
      }
      if (r.status === 'awaiting_review' || r.status === 'expiring_soon') return 3;
      if (r.status === 'needs_manual_assessment') return 4;
      if (r.status === 'fulfilled_by_evidence') return 5;
      return 6;
    };
    filteredResults = [...filteredResults].sort((a, b) => getWeight(a) - getWeight(b));
  }

  const summary = mapping?.summary || {
    totalApplicableMandatory: 0,
    fulfilled: 0,
    expiringSoon: 0,
    awaitingReview: 0,
    expired: 0,
    missing: 0,
    needsManualAssessment: 0,
    rejected: 0,
    notApplicable: 0,
  };

  const score = mapping?.readinessScore || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-light dark:border-border-dark">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy dark:text-white">
            {t('matrix.title')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {t('matrix.subtitle')}
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
            variant="primary"
            size="md"
            icon={RotateCw}
            onClick={handleRunEvaluation}
            isLoading={evaluating}
          >
            {t('matrix.runMatch')}
          </Button>
        </div>
      </div>

      {/* Segmented Progress Bar Summary Header */}
      <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-muted-light dark:text-muted-dark uppercase tracking-wider">
              Overall Readiness Status
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold font-mono text-primary">
                {score}%
              </span>
              <span className="text-xs text-muted-light dark:text-muted-dark">
                ({summary.fulfilled + summary.expiringSoon} of {summary.totalApplicableMandatory} applicable mandatory requirements fulfilled)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-muted-light dark:text-muted-dark italic block">
              "Internal readiness indicator - not a certification or buyer approval score."
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Formula: (Fulfilled + Expiring Soon) / Applicable Mandatory * 100%
            </span>
          </div>
        </div>

        {/* Multi-segmented Colored Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          {summary.fulfilled > 0 && (
            <div
              style={{ width: `${(summary.fulfilled / rawResults.length) * 100}%` }}
              className="bg-emerald-500 h-full transition-all"
              title={`Fulfilled: ${summary.fulfilled}`}
            />
          )}
          {summary.expiringSoon > 0 && (
            <div
              style={{ width: `${(summary.expiringSoon / rawResults.length) * 100}%` }}
              className="bg-amber-400 h-full transition-all"
              title={`Expiring Soon: ${summary.expiringSoon}`}
            />
          )}
          {summary.awaitingReview > 0 && (
            <div
              style={{ width: `${(summary.awaitingReview / rawResults.length) * 100}%` }}
              className="bg-amber-300 h-full transition-all"
              title={`Awaiting Review: ${summary.awaitingReview}`}
            />
          )}
          {summary.needsManualAssessment > 0 && (
            <div
              style={{ width: `${(summary.needsManualAssessment / rawResults.length) * 100}%` }}
              className="bg-blue-500 h-full transition-all"
              title={`Needs Technical Check: ${summary.needsManualAssessment}`}
            />
          )}
          {(summary.missing + summary.expired + summary.rejected) > 0 && (
            <div
              style={{ width: `${((summary.missing + summary.expired + summary.rejected) / rawResults.length) * 100}%` }}
              className="bg-red-500 h-full transition-all"
              title={`Missing / Expired: ${summary.missing + summary.expired}`}
            />
          )}
        </div>

        {/* Clickable Filter Chips for Counts */}
        <div className="flex flex-wrap gap-2 text-xs pt-1 select-none">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-navy dark:bg-navy-light text-white border-navy'
                : 'bg-transparent border-border-light text-muted-light hover:text-text-light'
            }`}
          >
            All ({rawResults.length})
          </button>

          <button
            onClick={() => setStatusFilter('fulfilled')}
            className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
              statusFilter === 'fulfilled'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Fulfilled / Valid ({summary.fulfilled + summary.expiringSoon})</span>
          </button>

          <button
            onClick={() => setStatusFilter('gaps')}
            className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
              statusFilter === 'gaps'
                ? 'bg-red-600 text-white border-red-600'
                : 'border-red-300 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>Gaps (Missing/Expired) ({summary.missing + summary.expired})</span>
          </button>

          <button
            onClick={() => setStatusFilter('manual')}
            className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
              statusFilter === 'manual'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Technical Check ({summary.needsManualAssessment})</span>
          </button>

          {/* "Fix This First" Toggle */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setFixFirst(!fixFirst)}
              className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                fixFirst
                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                  : 'bg-transparent border-border-light text-muted-light'
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Fix This First ({fixFirst ? 'Active' : 'Off'})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flagship Matrix Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : filteredResults.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-light dark:text-muted-dark bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light">
          No requirements match the selected filter.
        </div>
      ) : (
        <div className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark font-semibold">
                  <th className="py-3.5 px-4 w-28">{t('matrix.code')}</th>
                  <th className="py-3.5 px-4">{t('matrix.requirement')}</th>
                  <th className="py-3.5 px-4 w-44">{t('matrix.status')}</th>
                  <th className="py-3.5 px-4">{t('matrix.evidence')}</th>
                  <th className="py-3.5 px-4 text-right w-44">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {filteredResults.map((r) => {
                  const isExpanded = expandedRows[r.requirementCode];
                  const hasBuyerAcceptance = r.buyerAcceptance?.isAccepted;

                  return (
                    <React.Fragment key={r.requirementCode}>
                      <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-text-light dark:text-text-dark">
                          <button
                            onClick={() => toggleRow(r.requirementCode)}
                            className="flex items-center gap-1 hover:text-primary transition-colors text-left"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-muted-light" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-muted-light" />
                            )}
                            <span>{r.requirementCode}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="max-w-md">
                            <span className="font-semibold text-text-light dark:text-text-dark block">
                              {r.requirementTitle}
                            </span>
                            <span className="text-[11px] text-muted-light dark:text-muted-dark line-clamp-1 mt-0.5">
                              {r.plainLanguageExplanation}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge status={r.status} size="sm" />
                          {hasBuyerAcceptance && (
                            <div className="mt-1">
                              <StatusBadge status="accepted" size="xs" />
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {r.matchedDocumentName ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-text-light dark:text-text-dark truncate max-w-[200px]">
                                {r.matchedDocumentName}
                              </span>
                              <span className="text-[10px] text-muted-light dark:text-muted-dark">
                                Category: {r.category}
                              </span>
                            </div>
                          ) : r.status === 'needs_manual_assessment' ? (
                            <span className="text-blue-700 dark:text-blue-400 text-xs italic">
                              On-site engineering inspection
                            </span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400 text-xs font-medium">
                              None uploaded
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openCreateAction(r)}
                              className="px-2.5 py-1 rounded-lg border border-primary text-primary hover:bg-primary-50 dark:hover:bg-primary-950 text-xs font-semibold"
                              title="Create corrective action from this gap"
                            >
                              Action
                            </button>

                            <button
                              onClick={() => openLinkModal(r)}
                              className="p-1 rounded-lg text-muted-light hover:text-text-light hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Link existing document"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => openAcceptModal(r)}
                              className={`p-1 rounded-lg transition-colors ${
                                hasBuyerAcceptance
                                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/50'
                                  : 'text-muted-light hover:text-blue-600'
                              }`}
                              title="Record Buyer Acceptance Note"
                            >
                              <Handshake className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Explanation & Reason Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50 dark:bg-slate-800/40">
                          <td colSpan={5} className="py-3 px-6 border-b border-border-light dark:border-border-dark">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="p-3 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark space-y-1">
                                <span className="font-bold text-navy dark:text-white block">
                                  Plain-Language Requirement Explanation:
                                </span>
                                <p className="text-muted-light dark:text-muted-dark leading-relaxed">
                                  {r.plainLanguageExplanation}
                                </p>
                              </div>

                              <div className="p-3 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark space-y-1">
                                <span className="font-bold text-navy dark:text-white block">
                                  Evaluation Engine Reason:
                                </span>
                                <p className="text-text-light dark:text-text-dark font-medium leading-relaxed">
                                  {r.reason}
                                </p>
                                {r.buyerAcceptance?.isAccepted && (
                                  <p className="text-[11px] text-blue-700 dark:text-blue-400 pt-1 border-t border-border-light dark:border-border-dark">
                                    Buyer Acceptance Note: "{r.buyerAcceptance.notes || 'Accepted'}" (Recorded on {new Date(r.buyerAcceptance.acceptedAt).toLocaleDateString()})
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* One-Click Create Corrective Action Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title="Create Action from Gap"
        subtitle={`Pre-filled for ${actionTarget?.requirementCode}: ${actionTarget?.requirementTitle}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setActionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateActionSubmit}>
              Create Action Item
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateActionSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Action Title *
            </label>
            <input
              type="text"
              required
              value={actionForm.title}
              onChange={(e) => setActionForm({ ...actionForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Assigned Person
              </label>
              <input
                type="text"
                value={actionForm.assignedToName}
                onChange={(e) => setActionForm({ ...actionForm, assignedToName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Priority
              </label>
              <select
                value={actionForm.priority}
                onChange={(e) => setActionForm({ ...actionForm, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Due Date *
            </label>
            <input
              type="date"
              required
              value={actionForm.dueDate}
              onChange={(e) => setActionForm({ ...actionForm, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Task Details & Evidence Needed
            </label>
            <textarea
              rows={3}
              value={actionForm.description}
              onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* Manual Link Document Modal */}
      <Modal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title={`Link Evidence Document to ${linkTarget?.requirementCode}`}
        subtitle="Manually attach an existing vault file to this specific requirement"
        footer={
          <>
            <Button variant="secondary" onClick={() => setLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleLinkSubmit}>
              Save Link
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Select Document from Evidence Vault:
            </label>
            <select
              value={selectedDocToLink}
              onChange={(e) => setSelectedDocToLink(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">-- Remove manual link --</option>
              {documents.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.category} - v{d.version})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Record Buyer Acceptance Modal */}
      <Modal
        isOpen={acceptModalOpen}
        onClose={() => setAcceptModalOpen(false)}
        title="Record Formal Buyer Acceptance"
        subtitle={`Supplier self-record for ${acceptTarget?.requirementCode}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAcceptModalOpen(false)}>
              Cancel
            </Button>
            {acceptTarget?.buyerAcceptance?.isAccepted && (
              <Button variant="danger" onClick={() => handleAcceptSubmit(false)}>
                Clear Acceptance
              </Button>
            )}
            <Button variant="primary" onClick={() => handleAcceptSubmit(true)}>
              Save Buyer Acceptance
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-muted-light dark:text-muted-dark leading-relaxed">
            Record if the buyer's procurement team or auditor has formally signed off or accepted this requirement in past audits or email exchanges.
          </p>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Buyer Audit / Acceptance Reference Notes:
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Approved during on-site supplier evaluation on 12-Feb-2026 by Mr. Sharma."
              value={buyerAcceptNotes}
              onChange={(e) => setBuyerAcceptNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

