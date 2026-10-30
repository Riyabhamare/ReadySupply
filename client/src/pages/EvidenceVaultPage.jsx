import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FolderLock,
  Upload,
  Search,
  Filter,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Trash2,
  RefreshCw,
  Edit2,
  Download,
  Plus,
  History,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useToast } from '../components/common/Toast.jsx';
import { StatusBadge } from '../components/common/StatusBadge.jsx';
import { Button } from '../components/common/Button.jsx';
import { Drawer } from '../components/common/Drawer.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { TableSkeleton } from '../components/common/Skeleton.jsx';

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'business_registration', label: 'Business Reg' },
  { id: 'gst', label: 'GST' },
  { id: 'udyam', label: 'Udyam MSME' },
  { id: 'quality_certification', label: 'Quality (ISO/ZED)' },
  { id: 'calibration_record', label: 'Calibration' },
  { id: 'inspection_report', label: 'Inspection / FAIR' },
  { id: 'product_testing_report', label: 'Testing / Mill Test' },
  { id: 'environmental_certification', label: 'Environmental / CTO' },
  { id: 'safety_audit_record', label: 'Safety / Fire NOC' },
  { id: 'machine_capability_evidence', label: 'Machine Capability' },
  { id: 'other', label: 'Other' },
];

export const EvidenceVaultPage = () => {
  const { t } = useTranslation();
  const { success, error: toastError, showUndo } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('reviewStatus') || 'all');
  const [selectedExpiry, setSelectedExpiry] = useState(searchParams.get('expiryState') || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isReplaceOpen, setIsReplaceOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Upload Form State
  const [uploadData, setUploadData] = useState({
    name: '',
    category: 'quality_certification',
    issueDate: '',
    expiryDate: '',
    description: '',
    tags: '',
    file: null,
  });
  const [replaceData, setReplaceData] = useState({
    file: null,
    changeNote: '',
    expiryDate: '',
  });
  const [isUploading, setIsUploading] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStatus !== 'all') params.reviewStatus = selectedStatus;
      if (selectedExpiry !== 'all') params.expiryState = selectedExpiry;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/documents', { params });
      setDocuments(res.data || []);
    } catch (err) {
      toastError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory, selectedStatus, selectedExpiry, searchQuery]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      toastError('Please select a PDF or image file to upload.');
      return;
    }
    const ext = uploadData.file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      toastError('Invalid file type (.exe or unsupported file). Only PDF, JPG, and PNG documents are supported.');
      return;
    }
    if (!uploadData.name.trim()) {
      toastError('Please provide a document title.');
      return;
    }

    try {
      setIsUploading(true);
      const form = new FormData();
      form.append('name', uploadData.name);
      form.append('category', uploadData.category);
      if (uploadData.issueDate) form.append('issueDate', uploadData.issueDate);
      if (uploadData.expiryDate) form.append('expiryDate', uploadData.expiryDate);
      if (uploadData.description) form.append('description', uploadData.description);
      if (uploadData.tags) form.append('tags', uploadData.tags);
      form.append('file', uploadData.file);

      await api.post('/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      success('Document uploaded to Vault and queued for review.');
      setIsUploadOpen(false);
      setUploadData({
        name: '',
        category: 'quality_certification',
        issueDate: '',
        expiryDate: '',
        description: '',
        tags: '',
        file: null,
      });
      fetchDocuments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed';
      toastError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReplaceVersion = async (e) => {
    e.preventDefault();
    if (!replaceData.file) {
      toastError('Please select a file to upload as the new version.');
      return;
    }
    const ext = replaceData.file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) {
      toastError('Invalid file type (.exe or unsupported file). Only PDF, JPG, and PNG documents are supported.');
      return;
    }

    try {
      setIsUploading(true);
      const form = new FormData();
      form.append('file', replaceData.file);
      if (replaceData.changeNote) form.append('changeNote', replaceData.changeNote);
      if (replaceData.expiryDate) form.append('expiryDate', replaceData.expiryDate);

      const res = await api.post(`/documents/${selectedDoc._id}/version`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      success(res.data.message);
      setIsReplaceOpen(false);
      setSelectedDoc(res.data.document);
      fetchDocuments();
    } catch (err) {
      toastError(err.response?.data?.message || 'Version upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId, docName) => {
    try {
      await api.delete(`/documents/${docId}`);
      // Remove from view immediately
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      if (selectedDoc?._id === docId) {
        setIsDrawerOpen(false);
      }

      // Show Undo Toast for 8 seconds
      showUndo(`Deleted "${docName}".`, async () => {
        try {
          await api.post(`/documents/${docId}/restore`);
          success(`Restored "${docName}"`);
          fetchDocuments();
        } catch (err) {
          toastError('Could not restore document');
        }
      });
    } catch (err) {
      toastError('Failed to delete document');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-light dark:border-border-dark">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy dark:text-white">
            {t('vault.title')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark mt-0.5">
            {t('vault.subtitle')}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Upload}
          onClick={() => setIsUploadOpen(true)}
        >
          {t('vault.uploadBtn')}
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-light dark:text-muted-dark absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('vault.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none shadow-subtle"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark font-medium focus:ring-2 focus:ring-primary focus:outline-none shadow-subtle"
          >
            <option value="all">All Review States</option>
            <option value="verified">Verified</option>
            <option value="pending_review">Pending Review</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={selectedExpiry}
            onChange={(e) => setSelectedExpiry(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark font-medium focus:ring-2 focus:ring-primary focus:outline-none shadow-subtle"
          >
            <option value="all">All Expiries</option>
            <option value="valid">Valid Active</option>
            <option value="expiring_soon">Expiring Soon (&lt;=30d)</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 select-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-navy dark:bg-navy-light text-white'
                : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-text-light'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Documents Table / Card List */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FolderLock}
          title="No documents found"
          description="Upload your factory certificates, registrations, and calibration reports to begin matching against buyers."
          actionLabel="Upload First Document"
          actionIcon={Upload}
          onAction={() => setIsUploadOpen(true)}
        />
      ) : (
        <div className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark font-semibold">
                  <th className="py-3.5 px-4">{t('vault.docName')}</th>
                  <th className="py-3.5 px-4">{t('vault.category')}</th>
                  <th className="py-3.5 px-4">{t('vault.validity')}</th>
                  <th className="py-3.5 px-4">{t('vault.reviewStatus')}</th>
                  <th className="py-3.5 px-4 text-right">{t('vault.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light dark:divide-border-dark">
                {documents.map((doc) => {
                  const isExpiring = doc.expiryInfo?.isExpiringSoon;
                  const isExpired = doc.expiryInfo?.isExpired;

                  return (
                    <tr
                      key={doc._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <div className="min-w-0">
                            <button
                              onClick={() => {
                                setSelectedDoc(doc);
                                setIsDrawerOpen(true);
                              }}
                              className="font-semibold text-text-light dark:text-text-dark hover:text-primary transition-colors text-left truncate block max-w-xs sm:max-w-md"
                            >
                              {doc.name}
                            </button>
                            <span className="text-[10px] text-muted-light dark:text-muted-dark">
                              v{doc.version} • {doc.fileRef?.originalName}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-light dark:text-muted-dark font-medium capitalize">
                        {doc.category.replace(/_/g, ' ')}
                      </td>

                      <td className="py-3.5 px-4">
                        {doc.expiryDate ? (
                          <div className="flex flex-col">
                            <span className="text-text-light dark:text-text-dark font-mono text-xs">
                              {new Date(doc.expiryDate).toLocaleDateString()}
                            </span>
                            {isExpired && (
                              <span className="text-[10px] font-bold text-red-600 dark:text-red-400">
                                Expired {Math.abs(doc.expiryInfo?.daysRemaining)}d ago
                              </span>
                            )}
                            {isExpiring && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                Expires in {doc.expiryInfo?.daysRemaining}d
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-light dark:text-muted-dark text-xs">
                            Indefinite
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={doc.reviewStatus} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedDoc(doc);
                              setIsDrawerOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-muted-light hover:text-text-light hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Inspect Details"
                            aria-label="Inspect details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <a
                            href={`/api/documents/${doc._id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-muted-light hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Download/Preview Document"
                            aria-label="Download document"
                          >
                            <Download className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => {
                              setSelectedDoc(doc);
                              setIsReplaceOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-muted-light hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Upload New Version"
                            aria-label="Upload new version"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(doc._id, doc.name)}
                            className="p-1.5 rounded-lg text-muted-light hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Delete Document"
                            aria-label="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Document to Evidence Vault"
        subtitle="PDF, JPG, or PNG files up to 10MB"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsUploadOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUploadSubmit}
              isLoading={isUploading}
            >
              Upload Document
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Document Name / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ISO 9001:2015 Quality Certificate"
              value={uploadData.name}
              onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Category *
            </label>
            <select
              value={uploadData.category}
              onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={uploadData.issueDate}
                onChange={(e) => setUploadData({ ...uploadData, issueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Expiry Date (If applicable)
              </label>
              <input
                type="date"
                value={uploadData.expiryDate}
                onChange={(e) => setUploadData({ ...uploadData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              File Attachment (PDF / JPG / PNG) *
            </label>
            <input
              type="file"
              required
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setUploadData({ ...uploadData, file: e.target.files[0] })}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary hover:file:bg-primary-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. TUV Nord accredited certificate, annual surveillance done."
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* Replace Document Version Modal */}
      <Modal
        isOpen={isReplaceOpen}
        onClose={() => setIsReplaceOpen(false)}
        title={`Upload New Version for "${selectedDoc?.name}"`}
        subtitle={`Current version: v${selectedDoc?.version || 1}. Replaces file and queues for reviewer re-verification.`}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsReplaceOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleReplaceVersion}
              isLoading={isUploading}
            >
              Commit New Version
            </Button>
          </>
        }
      >
        <form onSubmit={handleReplaceVersion} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Replacement File Attachment *
            </label>
            <input
              type="file"
              required
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setReplaceData({ ...replaceData, file: e.target.files[0] })}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary hover:file:bg-primary-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              New Expiry Date (if updated)
            </label>
            <input
              type="date"
              value={replaceData.expiryDate}
              onChange={(e) => setReplaceData({ ...replaceData, expiryDate: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Version Change Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Uploaded 2026 renewal copy"
              value={replaceData.changeNote}
              onChange={(e) => setReplaceData({ ...replaceData, changeNote: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* Document Inspection Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedDoc?.name || 'Document Details'}
        subtitle={`Category: ${selectedDoc?.category?.replace(/_/g, ' ')}`}
      >
        {selectedDoc && (
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Status & Badges */}
            <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-light dark:text-muted-dark">Review Status:</span>
                <StatusBadge status={selectedDoc.reviewStatus} />
              </div>

              {selectedDoc.reviewDetails?.reviewNotes && (
                <div className="pt-2 border-t border-border-light dark:border-border-dark">
                  <span className="text-[11px] font-semibold text-muted-light dark:text-muted-dark block">
                    Reviewer Feedback:
                  </span>
                  <p className="text-xs text-text-light dark:text-text-dark mt-0.5 italic">
                    "{selectedDoc.reviewDetails.reviewNotes}"
                  </p>
                </div>
              )}
            </div>

            {/* Metadata Overview */}
            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-border-light dark:border-border-dark">
                <span className="text-muted-light dark:text-muted-dark">Current Version:</span>
                <span className="font-semibold text-text-light dark:text-text-dark font-mono">
                  v{selectedDoc.version}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-border-light dark:border-border-dark">
                <span className="text-muted-light dark:text-muted-dark">Issue Date:</span>
                <span className="font-semibold text-text-light dark:text-text-dark">
                  {selectedDoc.issueDate ? new Date(selectedDoc.issueDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-border-light dark:border-border-dark">
                <span className="text-muted-light dark:text-muted-dark">Expiry Date:</span>
                <span className="font-semibold text-text-light dark:text-text-dark">
                  {selectedDoc.expiryDate ? new Date(selectedDoc.expiryDate).toLocaleDateString() : 'Indefinite'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-border-light dark:border-border-dark">
                <span className="text-muted-light dark:text-muted-dark">File Name:</span>
                <span className="font-semibold text-text-light dark:text-text-dark truncate max-w-[200px]">
                  {selectedDoc.fileRef?.originalName}
                </span>
              </div>
            </div>

            {/* View & Download Link */}
            <div className="pt-2">
              <a
                href={`/api/documents/${selectedDoc._id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy text-white font-semibold text-xs shadow-subtle hover:bg-navy-light transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Open / Download Original File</span>
              </a>
            </div>

            {/* Version History Timeline */}
            <div className="pt-4 border-t border-border-light dark:border-border-dark">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-light dark:text-muted-dark flex items-center gap-1.5 mb-3">
                <History className="w-4 h-4 text-primary" />
                <span>Version History</span>
              </h4>

              {selectedDoc.versionHistory?.length === 0 ? (
                <p className="text-xs text-muted-light dark:text-muted-dark italic">
                  Initial version (v1). No previous revisions.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDoc.versionHistory?.map((vh, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/30 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>Version {vh.version}</span>
                        <span className="text-[10px] text-muted-light dark:text-muted-dark font-mono">
                          {new Date(vh.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-light dark:text-muted-dark mt-1">
                        Note: {vh.changeNote || 'Previous revision'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

