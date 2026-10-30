export const ROLES = {
  SUPPLIER: 'supplier',
  ADMIN: 'admin',
  BUYER: 'buyer',
  REVIEWER: 'reviewer',
};

export const DOCUMENT_CATEGORIES = [
  'business_registration',
  'gst',
  'udyam',
  'quality_certification',
  'environmental_certification',
  'product_testing_report',
  'inspection_report',
  'calibration_record',
  'machine_capability_evidence',
  'safety_audit_record',
  'other',
];

export const REVIEW_STATUSES = {
  PENDING_REVIEW: 'pending_review',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

export const EXPIRY_STATES = {
  VALID: 'valid',
  EXPIRING_SOON: 'expiring_soon',
  EXPIRED: 'expired',
};

export const ACTION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const ACTION_STATUSES = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
};

export const MATCH_STATUSES = {
  FULFILLED_BY_EVIDENCE: 'fulfilled_by_evidence',
  AWAITING_REVIEW: 'awaiting_review',
  EVIDENCE_EXPIRED: 'evidence_expired',
  EXPIRING_SOON: 'expiring_soon',
  MISSING: 'missing',
  NEEDS_MANUAL_ASSESSMENT: 'needs_manual_assessment',
  NOT_APPLICABLE: 'not_applicable',
  REJECTED_EVIDENCE: 'rejected_evidence',
};

export const CHECK_TYPES = {
  DOCUMENT: 'document',
  DOCUMENT_WITH_VALIDITY: 'document_with_validity',
  CAPABILITY: 'capability',
  MANUAL_ASSESSMENT: 'manual_assessment',
};

