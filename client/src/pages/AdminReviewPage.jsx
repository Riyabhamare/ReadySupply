import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ExternalLink,
  Eye,
  AlertTriangle,
  History,
  Activity,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../components/common/Toast.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { Button } from '../components/common/Button.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { TableSkeleton } from '../components/common/Skeleton.jsx';

export const AdminReviewPage = () => {
  const { t } = useTranslation();
  const { success, error: toastError } = useToast();

  const [queue, setQueue] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'activity'

  // Review Modals
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const [queueRes, actRes] = await Promise.all([
        api.get('/admin/queue'),
        api.get('/admin/activity'),
      ]);
      setQueue(queueRes.data || []);
      setActivityLogs(actRes.data || []);
    } catch (err) {
      toastError('Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const openVerify = (doc) => {
    setSelectedDoc(doc);
    setNotes('Document verified: matches stated category and statutory standards.');
    setIsVerifyModalOpen(true);
  };

  const openReject = (doc) => {
    setSelectedDoc(doc);
    setNotes('');
    setIsRejectModalOpen(true);
  };

  const handleVerifySubmit = async () => {
    try {
      setIsSubmitting(true);
      await api.post(`/admin/verify/${selectedDoc._id}`, { notes });
      success(`Verified "${selectedDoc.name}"`);
      setIsVerifyModalOpen(false);
      fetchQueue();
    } catch (err) {
      toastError('Failed to verify document');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!notes.trim() || notes.trim().length < 5) {
      toastError('Please enter a rejection reason (minimum 5 characters).');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/admin/reject/${selectedDoc._id}`, { notes });
      success(`Rejected "${selectedDoc.name}"`);
      setIsRejectModalOpen(false);
      fetchQueue();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to reject document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-light dark:border-border-dark">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            <span>{t('admin.title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {t('admin.subtitle')}
          </p>
        </div>

        <div className="flex rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-0.5 text-xs font-semibold select-none">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'queue' ? 'bg-navy text-white' : 'text-muted-light hover:text-text-light'
            }`}
          >
            Review Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'activity' ? 'bg-navy text-white' : 'text-muted-light hover:text-text-light'
            }`}
          >
            Platform Audit Trail
          </button>
        </div>
      </div>

      {activeTab === 'queue' ? (
        loading ? (
          <TableSkeleton rows={5} />
        ) : queue.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={t('admin.queueEmpty')}
            description="All submitted documents across all MSMEs have been reviewed and processed."
          />
        ) : (
          <div className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark font-semibold">
                    <th className="py-3.5 px-4">Supplier Enterprise</th>
                    <th className="py-3.5 px-4">Document Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Uploaded Date</th>
                    <th className="py-3.5 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {queue.map((doc) => (
                    <tr key={doc._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-text-light dark:text-text-dark">
                        <div>
                          <span>{doc.supplier?.name}</span>
                          <span className="text-[10px] text-muted-light dark:text-muted-dark block">
                            {doc.supplier?.email}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <div>
                            <span className="font-semibold text-text-light dark:text-text-dark block">
                              {doc.name}
                            </span>
                            <span className="text-[10px] text-muted-light font-mono">
                              v{doc.version} • {doc.fileRef?.originalName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 capitalize text-muted-light dark:text-muted-dark font-medium">
                        {doc.category.replace(/_/g, ' ')}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-muted-light dark:text-muted-dark">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/api/documents/${doc._id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-primary hover:bg-primary-50 dark:hover:bg-primary-950/60 border border-primary/20"
                            title="Inspect File"
                          >
                            <Eye className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => openVerify(doc)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('admin.verifyBtn')}</span>
                          </button>

                          <button
                            onClick={() => openReject(doc)}
                            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1 shadow-xs"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{t('admin.rejectBtn')}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Activity Log Tab */
        <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle space-y-3">
          <h3 className="font-bold text-sm text-navy dark:text-white flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <span>Platform-Wide Audit Logs ({activityLogs.length})</span>
          </h3>

          <div className="divide-y divide-border-light dark:divide-border-dark text-xs">
            {activityLogs.map((log) => (
              <div key={log._id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-text-light dark:text-text-dark">
                    <span className="text-primary font-mono mr-2">{log.action}</span>
                    {log.details?.name ? `(${log.details.name})` : ''}
                    {log.details?.title ? `(${log.details.title})` : ''}
                  </p>
                  <p className="text-[11px] text-muted-light dark:text-muted-dark mt-0.5">
                    User: {log.performedBy?.name || 'Unknown'} ({log.performedBy?.role}) • Target Supplier: {log.supplier?.name || 'Platform'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verify Confirmation Modal */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title={`Verify "${selectedDoc?.name}"`}
        subtitle="Verification confirms this document meets stated criteria (does not guarantee authenticity)."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleVerifySubmit}
              isLoading={isSubmitting}
            >
              Confirm Verification
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Reviewer Notes / Verification Basis:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title={`Reject "${selectedDoc?.name}"`}
        subtitle="Specify why this document is rejected so the supplier can take corrective action."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectSubmit}
              isLoading={isSubmitting}
            >
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              {t('admin.rejectReasonRequired')} *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Scan is illegible; calibration date has expired; mismatch in GSTIN."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

