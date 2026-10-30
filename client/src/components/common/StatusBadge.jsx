import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  ShieldCheck,
  Handshake,
  Clock,
  Hourglass,
  AlertTriangle,
  XCircle,
  ClipboardCheck,
  Minus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Tooltip } from './Tooltip.jsx';

export const StatusBadge = ({ status, customLabel, showTooltip = true, size = 'sm' }) => {
  const { t } = useTranslation();

  const configs = {
    // Document Upload / Review / Acceptance Statuses
    uploaded: {
      label: t('status.uploaded', 'Uploaded'),
      tooltip: t('tooltips.uploaded', 'File stored in vault; pending internal or admin check.'),
      icon: FileText,
      className: 'bg-transparent border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300',
    },
    verified: {
      label: t('status.verified', 'Verified'),
      tooltip: t('tooltips.verified', 'Admin reviewer confirmed document matches specified criteria.'),
      icon: ShieldCheck,
      className: 'bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold',
    },
    accepted: {
      label: t('status.accepted', 'Accepted by Buyer'),
      tooltip: t('tooltips.accepted', 'Recorded by supplier as formally accepted by the buyer.'),
      icon: Handshake,
      className: 'bg-blue-100 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-semibold',
    },
    pending_review: {
      label: t('status.pending_review', 'Pending Review'),
      tooltip: t('tooltips.pending_review', 'Awaiting verification by admin reviewer.'),
      icon: Clock,
      className: 'bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300',
    },
    expiring_soon: {
      label: t('status.expiring_soon', 'Expiring Soon'),
      tooltip: t('tooltips.expiring_soon', 'Expires within 30 days. Renewal recommended.'),
      icon: Hourglass,
      className: 'bg-amber-100 dark:bg-amber-950/80 border border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-medium',
    },
    expired: {
      label: t('status.expired', 'Expired'),
      tooltip: t('tooltips.expired', 'Expired document. Will cause gap in buyer mapping.'),
      icon: AlertTriangle,
      className: 'bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 font-semibold',
    },
    rejected: {
      label: t('status.rejected', 'Rejected'),
      tooltip: t('tooltips.rejected', 'Document was rejected during reviewer check.'),
      icon: XCircle,
      className: 'bg-red-100 dark:bg-red-950/70 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300',
    },
    // Matching Engine Statuses
    fulfilled_by_evidence: {
      label: t('status.verified', 'Fulfilled (Verified)'),
      tooltip: t('tooltips.verified', 'Matching document is verified and valid.'),
      icon: ShieldCheck,
      className: 'bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold',
    },
    awaiting_review: {
      label: t('status.pending_review', 'Awaiting Review'),
      tooltip: t('tooltips.pending_review', 'Evidence uploaded; pending reviewer verification.'),
      icon: Clock,
      className: 'bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300',
    },
    evidence_expired: {
      label: t('status.expired', 'Evidence Expired'),
      tooltip: t('tooltips.expired', 'Matching document has expired.'),
      icon: AlertTriangle,
      className: 'bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 font-semibold',
    },
    missing: {
      label: t('status.missing', 'Missing'),
      tooltip: t('tooltips.missing', 'No matching document or capability on file.'),
      icon: AlertCircle,
      className: 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-medium',
    },
    needs_manual_assessment: {
      label: t('status.needs_manual_assessment', 'Technical Check Required'),
      tooltip: t('tooltips.needs_manual_assessment', 'Technical capability or audit required by buyer. Documents alone never prove capability.'),
      icon: ClipboardCheck,
      className: 'bg-blue-50 dark:bg-blue-950/50 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-medium',
    },
    not_applicable: {
      label: t('status.not_applicable', 'Not Applicable'),
      tooltip: t('tooltips.not_applicable', 'Requirement does not apply to your profile.'),
      icon: Minus,
      className: 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400',
    },
    rejected_evidence: {
      label: t('status.rejected', 'Rejected Evidence'),
      tooltip: t('tooltips.rejected', 'Available document was rejected during review.'),
      icon: XCircle,
      className: 'bg-red-100 dark:bg-red-950/70 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300',
    },
    // Corrective Action Tracker Statuses
    open: {
      label: t('status.open', 'Open'),
      tooltip: 'Action waiting to be started',
      icon: Clock,
      className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
    },
    in_progress: {
      label: t('status.in_progress', 'In Progress'),
      tooltip: 'Work currently underway',
      icon: Clock,
      className: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700',
    },
    completed: {
      label: t('status.completed', 'Completed'),
      tooltip: 'Corrective action finished',
      icon: CheckCircle2,
      className: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
    },
    overdue: {
      label: t('status.overdue', 'Overdue'),
      tooltip: 'Due date has passed without completion',
      icon: AlertTriangle,
      className: 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700 font-bold',
    },
  };

  const key = (status || '').toLowerCase();
  const config = configs[key] || {
    label: customLabel || status,
    tooltip: status,
    icon: FileText,
    className: 'bg-gray-100 text-gray-700 border border-gray-300',
  };

  const Icon = config.icon;
  const labelText = customLabel || config.label;

  const sizeClasses = {
    xs: 'text-[11px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
  };

  const badgeContent = (
    <span
      className={`inline-flex items-center rounded-full transition-colors whitespace-nowrap select-none ${sizeClasses[size]} ${config.className}`}
      aria-label={labelText}
    >
      <Icon className={size === 'xs' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span>{labelText}</span>
    </span>
  );

  if (showTooltip && config.tooltip) {
    return <Tooltip content={config.tooltip}>{badgeContent}</Tooltip>;
  }

  return badgeContent;
};

