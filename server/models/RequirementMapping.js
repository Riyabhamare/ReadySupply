import mongoose from 'mongoose';
import { MATCH_STATUSES, CHECK_TYPES } from '../config/constants.js';

const requirementResultSchema = new mongoose.Schema(
  {
    requirementCode: { type: String, required: true },
    requirementTitle: { type: String, required: true },
    plainLanguageExplanation: { type: String, default: '' },
    category: { type: String, required: true },
    isMandatory: { type: Boolean, default: true },
    checkType: { type: String, enum: Object.values(CHECK_TYPES), required: true },
    status: { type: String, enum: Object.values(MATCH_STATUSES), required: true },
    reason: { type: String, required: true },
    matchedDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
    matchedDocumentName: { type: String, default: '' },
    matchedDocumentCategory: { type: String, default: '' },
    matchedDocumentExpiry: { type: Date, default: null },
    manualLinkedDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
    buyerAcceptance: {
      isAccepted: { type: Boolean, default: false },
      acceptedAt: { type: Date, default: null },
      notes: { type: String, default: '' },
    },
  },
  { _id: true }
);

const requirementMappingSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RequirementTemplate',
      required: true,
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer',
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    readinessScore: {
      type: Number,
      default: 0,
    },
    formula: {
      type: String,
      default: 'Readiness = (Fulfilled + Expiring Soon) / Applicable Mandatory Requirements * 100%',
    },
    disclaimer: {
      type: String,
      default: 'Internal readiness indicator - not a certification or buyer approval score.',
    },
    summary: {
      totalApplicableMandatory: { type: Number, default: 0 },
      fulfilled: { type: Number, default: 0 },
      expiringSoon: { type: Number, default: 0 },
      awaitingReview: { type: Number, default: 0 },
      expired: { type: Number, default: 0 },
      missing: { type: Number, default: 0 },
      needsManualAssessment: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 },
      notApplicable: { type: Number, default: 0 },
    },
    results: [requirementResultSchema],
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const RequirementMapping = mongoose.model('RequirementMapping', requirementMappingSchema);

