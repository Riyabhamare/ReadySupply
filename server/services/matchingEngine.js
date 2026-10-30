import { MATCH_STATUSES, CHECK_TYPES, REVIEW_STATUSES } from '../config/constants.js';

/**
 * Interface definition for pluggable Matchers (Rules-based, OCR, AI)
 */
export class MatcherInterface {
  evaluateRequirement(requirement, supplierProfile, documents, options) {
    throw new Error('evaluateRequirement() must be implemented');
  }
}

/**
 * Standard Rules-Based Transparent Matcher
 */
export class RulesBasedMatcher extends MatcherInterface {
  constructor(warningDays = 30) {
    super();
    this.warningDays = warningDays;
  }

  /**
   * Evaluates a single requirement against a supplier's profile and documents.
   * Pure function: no database calls, easily unit tested.
   */
  evaluateRequirement(requirement, supplierProfile = {}, documents = [], options = {}) {
    const warningDays = options.warningDays || this.warningDays;
    const now = options.now ? new Date(options.now) : new Date();

    // 1. Check Applicability Conditions
    if (requirement.applicability) {
      const { sectors, capabilities } = requirement.applicability;

      // Sector check
      if (sectors && sectors.length > 0) {
        const supplierSector = (supplierProfile.manufacturingSector || '').toLowerCase();
        const matchesSector = sectors.some(s => supplierSector.includes(s.toLowerCase()));
        if (!matchesSector) {
          return {
            requirementCode: requirement.code,
            requirementTitle: requirement.title,
            plainLanguageExplanation: requirement.plainLanguageExplanation,
            category: requirement.category,
            isMandatory: requirement.isMandatory !== false,
            checkType: requirement.checkType,
            status: MATCH_STATUSES.NOT_APPLICABLE,
            reason: `Requirement does not apply: Supplier sector (${supplierProfile.manufacturingSector || 'None'}) is not in [${sectors.join(', ')}]`,
            matchedDocumentId: null,
            matchedDocumentName: '',
            matchedDocumentCategory: '',
            matchedDocumentExpiry: null,
          };
        }
      }

      // Capability check
      if (capabilities && capabilities.length > 0) {
        const supplierCaps = (supplierProfile.manufacturingCapabilities || []).map(c => c.toLowerCase());
        const hasCapability = capabilities.some(c => supplierCaps.some(sc => sc.includes(c.toLowerCase())));
        if (!hasCapability) {
          return {
            requirementCode: requirement.code,
            requirementTitle: requirement.title,
            plainLanguageExplanation: requirement.plainLanguageExplanation,
            category: requirement.category,
            isMandatory: requirement.isMandatory !== false,
            checkType: requirement.checkType,
            status: MATCH_STATUSES.NOT_APPLICABLE,
            reason: `Requirement does not apply: Supplier does not list required capabilities [${capabilities.join(', ')}]`,
            matchedDocumentId: null,
            matchedDocumentName: '',
            matchedDocumentCategory: '',
            matchedDocumentExpiry: null,
          };
        }
      }
    }

    // 2. Technical check: checkType = 'manual_assessment'
    if (requirement.checkType === CHECK_TYPES.MANUAL_ASSESSMENT) {
      return {
        requirementCode: requirement.code,
        requirementTitle: requirement.title,
        plainLanguageExplanation: requirement.plainLanguageExplanation,
        category: requirement.category,
        isMandatory: requirement.isMandatory !== false,
        checkType: requirement.checkType,
        status: MATCH_STATUSES.NEEDS_MANUAL_ASSESSMENT,
        reason: 'Needs manual technical assessment. Documents alone never prove technical capability; requires buyer engineering audit/PPAP signoff.',
        matchedDocumentId: null,
        matchedDocumentName: '',
        matchedDocumentCategory: '',
        matchedDocumentExpiry: null,
      };
    }

    // 3. Capability check: checkType = 'capability'
    if (requirement.checkType === CHECK_TYPES.CAPABILITY) {
      const requiredCap = (requirement.requiredCapability || requirement.category || '').toLowerCase();
      const declaredCaps = (supplierProfile.manufacturingCapabilities || []).map(c => c.toLowerCase());
      const declaredMachines = (supplierProfile.machineryRoster || []).map(m => (m.type || m.name || '').toLowerCase());

      const hasDeclared = declaredCaps.some(c => c.includes(requiredCap)) ||
        declaredMachines.some(m => m.includes(requiredCap));

      if (hasDeclared) {
        return {
          requirementCode: requirement.code,
          requirementTitle: requirement.title,
          plainLanguageExplanation: requirement.plainLanguageExplanation,
          category: requirement.category,
          isMandatory: requirement.isMandatory !== false,
          checkType: requirement.checkType,
          status: MATCH_STATUSES.NEEDS_MANUAL_ASSESSMENT,
          reason: `Machinery/capability declared in profile (${requirement.requiredCapability || requirement.category}), but requires buyer technical on-site verification.`,
          matchedDocumentId: null,
          matchedDocumentName: '',
          matchedDocumentCategory: '',
          matchedDocumentExpiry: null,
        };
      } else {
        return {
          requirementCode: requirement.code,
          requirementTitle: requirement.title,
          plainLanguageExplanation: requirement.plainLanguageExplanation,
          category: requirement.category,
          isMandatory: requirement.isMandatory !== false,
          checkType: requirement.checkType,
          status: MATCH_STATUSES.MISSING,
          reason: `Capability not found: Please add "${requirement.requiredCapability || requirement.category}" and relevant machinery to your company profile.`,
          matchedDocumentId: null,
          matchedDocumentName: '',
          matchedDocumentCategory: '',
          matchedDocumentExpiry: null,
        };
      }
    }

    // 4. Document check: checkType = 'document' or 'document_with_validity'
    const targetCategory = (requirement.requiredEvidenceCategory || requirement.category || '').toLowerCase();
    
    // Find all active documents matching this category
    const matchingDocs = documents.filter(doc => {
      if (doc.isSoftDeleted) return false;
      const docCat = (doc.category || '').toLowerCase();
      return docCat === targetCategory;
    });

    if (matchingDocs.length === 0) {
      return {
        requirementCode: requirement.code,
        requirementTitle: requirement.title,
        plainLanguageExplanation: requirement.plainLanguageExplanation,
        category: requirement.category,
        isMandatory: requirement.isMandatory !== false,
        checkType: requirement.checkType,
        status: MATCH_STATUSES.MISSING,
        reason: `No evidence found: Upload a valid document under category "${requirement.requiredEvidenceCategory || requirement.category}".`,
        matchedDocumentId: null,
        matchedDocumentName: '',
        matchedDocumentCategory: '',
        matchedDocumentExpiry: null,
      };
    }

    // Sort matching docs: prefer VERIFIED first, then PENDING_REVIEW, then newest
    const sortedDocs = [...matchingDocs].sort((a, b) => {
      const statusWeight = { verified: 3, pending_review: 2, rejected: 1 };
      const weightA = statusWeight[a.reviewStatus] || 0;
      const weightB = statusWeight[b.reviewStatus] || 0;
      if (weightB !== weightA) return weightB - weightA;
      // then by expiry date (further out preferred) or createdAt
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    const bestDoc = sortedDocs[0];
    const isVerified = bestDoc.reviewStatus === REVIEW_STATUSES.VERIFIED;
    const isPending = bestDoc.reviewStatus === REVIEW_STATUSES.PENDING_REVIEW;
    const isRejected = bestDoc.reviewStatus === REVIEW_STATUSES.REJECTED;

    // Check expiry
    let isExpired = false;
    let isExpiringSoon = false;
    let daysRemaining = null;

    if (bestDoc.expiryDate) {
      const expDate = new Date(bestDoc.expiryDate);
      const diffMs = expDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (daysRemaining < 0) {
        isExpired = true;
      } else if (daysRemaining <= warningDays) {
        isExpiringSoon = true;
      }
    } else if (requirement.checkType === CHECK_TYPES.DOCUMENT_WITH_VALIDITY) {
      // Validity required but no expiry date provided
      return {
        requirementCode: requirement.code,
        requirementTitle: requirement.title,
        plainLanguageExplanation: requirement.plainLanguageExplanation,
        category: requirement.category,
        isMandatory: requirement.isMandatory !== false,
        checkType: requirement.checkType,
        status: MATCH_STATUSES.AWAITING_REVIEW,
        reason: `Document uploaded ("${bestDoc.name}"), but buyer requires validity tracking with an issue and expiry date.`,
        matchedDocumentId: bestDoc._id,
        matchedDocumentName: bestDoc.name,
        matchedDocumentCategory: bestDoc.category,
        matchedDocumentExpiry: null,
      };
    }

    // Now decide the exact status
    if (isExpired) {
      return {
        requirementCode: requirement.code,
        requirementTitle: requirement.title,
        plainLanguageExplanation: requirement.plainLanguageExplanation,
        category: requirement.category,
        isMandatory: requirement.isMandatory !== false,
        checkType: requirement.checkType,
        status: MATCH_STATUSES.EVIDENCE_EXPIRED,
        reason: `Evidence expired: Document "${bestDoc.name}" expired ${Math.abs(daysRemaining)} days ago on ${new Date(bestDoc.expiryDate).toLocaleDateString()}. Please upload renewal.`,
        matchedDocumentId: bestDoc._id,
        matchedDocumentName: bestDoc.name,
        matchedDocumentCategory: bestDoc.category,
        matchedDocumentExpiry: bestDoc.expiryDate,
      };
    }

    if (isVerified) {
      if (isExpiringSoon) {
        return {
          requirementCode: requirement.code,
          requirementTitle: requirement.title,
          plainLanguageExplanation: requirement.plainLanguageExplanation,
          category: requirement.category,
          isMandatory: requirement.isMandatory !== false,
          checkType: requirement.checkType,
          status: MATCH_STATUSES.EXPIRING_SOON,
          reason: `Fulfilled with warning: Verified document "${bestDoc.name}" will expire in ${daysRemaining} days (${new Date(bestDoc.expiryDate).toLocaleDateString()}).`,
          matchedDocumentId: bestDoc._id,
          matchedDocumentName: bestDoc.name,
          matchedDocumentCategory: bestDoc.category,
          matchedDocumentExpiry: bestDoc.expiryDate,
        };
      }

      return {
        requirementCode: requirement.code,
        requirementTitle: requirement.title,
        plainLanguageExplanation: requirement.plainLanguageExplanation,
        category: requirement.category,
        isMandatory: requirement.isMandatory !== false,
        checkType: requirement.checkType,
        status: MATCH_STATUSES.FULFILLED_BY_EVIDENCE,
        reason: `Fulfilled by evidence: Document "${bestDoc.name}" is verified and active.`,
        matchedDocumentId: bestDoc._id,
        matchedDocumentName: bestDoc.name,
        matchedDocumentCategory: bestDoc.category,
        matchedDocumentExpiry: bestDoc.expiryDate,
      };
    }

    if (isPending) {
      return {
        requirementCode: requirement.code,
        requirementTitle: requirement.title,
        plainLanguageExplanation: requirement.plainLanguageExplanation,
        category: requirement.category,
        isMandatory: requirement.isMandatory !== false,
        checkType: requirement.checkType,
        status: MATCH_STATUSES.AWAITING_REVIEW,
        reason: `Awaiting review: Document "${bestDoc.name}" is uploaded and queued for reviewer verification.`,
        matchedDocumentId: bestDoc._id,
        matchedDocumentName: bestDoc.name,
        matchedDocumentCategory: bestDoc.category,
        matchedDocumentExpiry: bestDoc.expiryDate,
      };
    }

    if (isRejected) {
      const rejectNote = bestDoc.reviewDetails?.reviewNotes || 'Does not meet requirement criteria';
      return {
        requirementCode: requirement.code,
        requirementTitle: requirement.title,
        plainLanguageExplanation: requirement.plainLanguageExplanation,
        category: requirement.category,
        isMandatory: requirement.isMandatory !== false,
        checkType: requirement.checkType,
        status: MATCH_STATUSES.REJECTED_EVIDENCE,
        reason: `Rejected evidence: Document "${bestDoc.name}" was rejected during review (${rejectNote}). Please upload a corrected file.`,
        matchedDocumentId: bestDoc._id,
        matchedDocumentName: bestDoc.name,
        matchedDocumentCategory: bestDoc.category,
        matchedDocumentExpiry: bestDoc.expiryDate,
      };
    }

    // Fallback
    return {
      requirementCode: requirement.code,
      requirementTitle: requirement.title,
      plainLanguageExplanation: requirement.plainLanguageExplanation,
      category: requirement.category,
      isMandatory: requirement.isMandatory !== false,
      checkType: requirement.checkType,
      status: MATCH_STATUSES.AWAITING_REVIEW,
      reason: `Document "${bestDoc.name}" on file; status pending.`,
      matchedDocumentId: bestDoc._id,
      matchedDocumentName: bestDoc.name,
      matchedDocumentCategory: bestDoc.category,
      matchedDocumentExpiry: bestDoc.expiryDate,
    };
  }
}

/**
 * Main Matching Orchestrator
 * Pure function: takes template, supplierProfile, and documents list.
 */
export function runMatchingEngine(template, supplierProfile = {}, documents = [], options = {}) {
  const matcher = options.matcher || new RulesBasedMatcher(options.warningDays || 30);
  const requirements = template.requirements || [];

  const results = requirements.map(req => {
    return matcher.evaluateRequirement(req, supplierProfile, documents, options);
  });

  // Calculate summary counts
  let totalApplicableMandatory = 0;
  let fulfilled = 0;
  let expiringSoon = 0;
  let awaitingReview = 0;
  let expired = 0;
  let missing = 0;
  let needsManualAssessment = 0;
  let rejected = 0;
  let notApplicable = 0;

  for (const res of results) {
    if (res.status === MATCH_STATUSES.NOT_APPLICABLE) {
      notApplicable++;
      continue;
    }

    if (res.isMandatory) {
      totalApplicableMandatory++;
    }

    switch (res.status) {
      case MATCH_STATUSES.FULFILLED_BY_EVIDENCE:
        fulfilled++;
        break;
      case MATCH_STATUSES.EXPIRING_SOON:
        expiringSoon++;
        break;
      case MATCH_STATUSES.AWAITING_REVIEW:
        awaitingReview++;
        break;
      case MATCH_STATUSES.EVIDENCE_EXPIRED:
        expired++;
        break;
      case MATCH_STATUSES.MISSING:
        missing++;
        break;
      case MATCH_STATUSES.NEEDS_MANUAL_ASSESSMENT:
        needsManualAssessment++;
        break;
      case MATCH_STATUSES.REJECTED_EVIDENCE:
        rejected++;
        break;
      default:
        break;
    }
  }

  // Readiness Formula: (Fulfilled + Expiring Soon) / Applicable Mandatory Requirements * 100%
  const qualifyingCount = fulfilled + expiringSoon;
  const readinessScore = totalApplicableMandatory > 0
    ? Math.round((qualifyingCount / totalApplicableMandatory) * 100)
    : 100;

  return {
    templateId: template._id,
    templateName: template.name,
    buyerId: template.buyer,
    readinessScore,
    formula: 'Readiness = (Fulfilled + Expiring Soon) / Total Applicable Mandatory Requirements * 100%',
    disclaimer: 'Internal readiness indicator - not a certification or buyer approval score.',
    summary: {
      totalApplicableMandatory,
      fulfilled,
      expiringSoon,
      awaitingReview,
      expired,
      missing,
      needsManualAssessment,
      rejected,
      notApplicable,
    },
    results,
  };
}

