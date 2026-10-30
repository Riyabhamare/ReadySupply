import { describe, it, expect } from 'vitest';
import { runMatchingEngine, RulesBasedMatcher } from '../services/matchingEngine.js';
import { MATCH_STATUSES, CHECK_TYPES, REVIEW_STATUSES } from '../config/constants.js';

describe('Matching Engine Unit Tests', () => {
  const mockTemplate = {
    _id: 'template_01',
    name: 'Sample Buyer Checklist',
    buyer: 'buyer_01',
    requirements: [
      {
        code: 'REQ-01',
        title: 'GST Registration',
        plainLanguageExplanation: 'Provide valid GST registration certificate.',
        category: 'gst',
        checkType: CHECK_TYPES.DOCUMENT,
        isMandatory: true,
      },
      {
        code: 'REQ-02',
        title: 'ISO 9001 Quality Certificate',
        plainLanguageExplanation: 'Provide valid ISO 9001 certificate with active validity.',
        category: 'quality_certification',
        checkType: CHECK_TYPES.DOCUMENT_WITH_VALIDITY,
        isMandatory: true,
      },
      {
        code: 'REQ-03',
        title: 'Automotive Sector APQP / PPAP',
        plainLanguageExplanation: 'Production part approval process documentation.',
        category: 'inspection_report',
        checkType: CHECK_TYPES.MANUAL_ASSESSMENT,
        isMandatory: true,
        applicability: {
          sectors: ['Automotive'],
        },
      },
      {
        code: 'REQ-04',
        title: 'CNC Precision Tolerance Capability',
        plainLanguageExplanation: 'Ability to hold 10-micron tolerance on CNC lathe.',
        category: 'CNC turning',
        checkType: CHECK_TYPES.CAPABILITY,
        requiredCapability: 'CNC turning',
        isMandatory: true,
      },
      {
        code: 'REQ-05',
        title: 'Aerospace AS9100 Standard',
        plainLanguageExplanation: 'Applies only to Aerospace suppliers.',
        category: 'quality_certification',
        checkType: CHECK_TYPES.DOCUMENT,
        isMandatory: true,
        applicability: {
          sectors: ['Aerospace'],
        },
      },
    ],
  };

  const supplierProfile = {
    manufacturingSector: 'Automotive & Precision Machining',
    manufacturingCapabilities: ['CNC turning', 'VMC milling'],
    machineryRoster: [{ name: 'Ace Micromatic CNC Lathe', type: 'CNC turning', quantity: 2 }],
  };

  it('correctly marks fulfilled_by_evidence when document is verified and valid', () => {
    const documents = [
      {
        _id: 'doc_1',
        name: 'GST Certificate',
        category: 'gst',
        reviewStatus: REVIEW_STATUSES.VERIFIED,
        expiryDate: null,
      },
    ];

    const matcher = new RulesBasedMatcher(30);
    const result = matcher.evaluateRequirement(mockTemplate.requirements[0], supplierProfile, documents);

    expect(result.status).toBe(MATCH_STATUSES.FULFILLED_BY_EVIDENCE);
    expect(result.matchedDocumentId).toBe('doc_1');
  });

  it('correctly marks awaiting_review when document exists but is pending review', () => {
    const documents = [
      {
        _id: 'doc_1',
        name: 'GST Certificate Pending',
        category: 'gst',
        reviewStatus: REVIEW_STATUSES.PENDING_REVIEW,
      },
    ];

    const matcher = new RulesBasedMatcher(30);
    const result = matcher.evaluateRequirement(mockTemplate.requirements[0], supplierProfile, documents);

    expect(result.status).toBe(MATCH_STATUSES.AWAITING_REVIEW);
  });

  it('correctly marks expiring_soon when verified document expires within threshold', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15); // 15 days in future

    const documents = [
      {
        _id: 'doc_iso',
        name: 'ISO 9001 Certificate',
        category: 'quality_certification',
        reviewStatus: REVIEW_STATUSES.VERIFIED,
        expiryDate: futureDate,
      },
    ];

    const matcher = new RulesBasedMatcher(30);
    const result = matcher.evaluateRequirement(mockTemplate.requirements[1], supplierProfile, documents);

    expect(result.status).toBe(MATCH_STATUSES.EXPIRING_SOON);
  });

  it('correctly marks evidence_expired when document expiry has passed', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10); // 10 days in past

    const documents = [
      {
        _id: 'doc_iso_old',
        name: 'Expired ISO Certificate',
        category: 'quality_certification',
        reviewStatus: REVIEW_STATUSES.VERIFIED,
        expiryDate: pastDate,
      },
    ];

    const matcher = new RulesBasedMatcher(30);
    const result = matcher.evaluateRequirement(mockTemplate.requirements[1], supplierProfile, documents);

    expect(result.status).toBe(MATCH_STATUSES.EVIDENCE_EXPIRED);
  });

  it('correctly marks missing when no document exists for category', () => {
    const matcher = new RulesBasedMatcher(30);
    const result = matcher.evaluateRequirement(mockTemplate.requirements[0], supplierProfile, []);

    expect(result.status).toBe(MATCH_STATUSES.MISSING);
  });

  it('correctly marks rejected_evidence when document was rejected', () => {
    const documents = [
      {
        _id: 'doc_bad',
        name: 'Blurred GST',
        category: 'gst',
        reviewStatus: REVIEW_STATUSES.REJECTED,
        reviewDetails: { reviewNotes: 'Document illegible' },
      },
    ];

    const matcher = new RulesBasedMatcher(30);
    const result = matcher.evaluateRequirement(mockTemplate.requirements[0], supplierProfile, documents);

    expect(result.status).toBe(MATCH_STATUSES.REJECTED_EVIDENCE);
    expect(result.reason).toContain('Document illegible');
  });

  it('correctly marks needs_manual_assessment for manual_assessment checkType', () => {
    const matcher = new RulesBasedMatcher(30);
    const result = matcher.evaluateRequirement(mockTemplate.requirements[2], supplierProfile, []);

    expect(result.status).toBe(MATCH_STATUSES.NEEDS_MANUAL_ASSESSMENT);
  });

  it('correctly marks needs_manual_assessment for capability check when declared in profile', () => {
    const matcher = new RulesBasedMatcher(30);
    const result = matcher.evaluateRequirement(mockTemplate.requirements[3], supplierProfile, []);

    expect(result.status).toBe(MATCH_STATUSES.NEEDS_MANUAL_ASSESSMENT);
  });

  it('correctly marks not_applicable when sector condition does not match', () => {
    const matcher = new RulesBasedMatcher(30);
    const result = matcher.evaluateRequirement(mockTemplate.requirements[4], supplierProfile, []);

    expect(result.status).toBe(MATCH_STATUSES.NOT_APPLICABLE);
  });

  it('computes overall readiness score and summary accurately', () => {
    const documents = [
      {
        _id: 'doc_1',
        name: 'GST Certificate',
        category: 'gst',
        reviewStatus: REVIEW_STATUSES.VERIFIED,
      },
    ];

    const outcome = runMatchingEngine(mockTemplate, supplierProfile, documents);

    // Applicable mandatory: REQ-01 (gst), REQ-02 (iso), REQ-03 (ppap), REQ-04 (capability) = 4
    // REQ-05 is not applicable (aerospace).
    // Qualifying: REQ-01 is fulfilled (1). REQ-02 missing (0). REQ-03 manual (0). REQ-04 manual (0).
    // Score = 1 / 4 * 100 = 25%
    expect(outcome.summary.totalApplicableMandatory).toBe(4);
    expect(outcome.summary.fulfilled).toBe(1);
    expect(outcome.summary.missing).toBe(1);
    expect(outcome.summary.needsManualAssessment).toBe(2);
    expect(outcome.summary.notApplicable).toBe(1);
    expect(outcome.readinessScore).toBe(25);
  });
});

