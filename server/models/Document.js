import mongoose from 'mongoose';
import { DOCUMENT_CATEGORIES, REVIEW_STATUSES, EXPIRY_STATES } from '../config/constants.js';

const versionHistorySchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changeNote: { type: String, default: '' },
  },
  { _id: true }
);

const documentSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: DOCUMENT_CATEGORIES,
      required: [true, 'Document category is required'],
      index: true,
    },
    issueDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    tags: [{ type: String }],
    version: {
      type: Number,
      default: 1,
    },
    fileRef: {
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
      storageDriver: { type: String, default: 'local' },
      storagePath: { type: String, required: true },
    },
    versionHistory: [versionHistorySchema],
    uploaded: {
      type: Boolean,
      default: true,
    },
    reviewStatus: {
      type: String,
      enum: Object.values(REVIEW_STATUSES),
      default: REVIEW_STATUSES.PENDING_REVIEW,
      index: true,
    },
    reviewDetails: {
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      reviewedAt: { type: Date, default: null },
      reviewNotes: { type: String, default: '' },
    },
    isSoftDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Dynamic helper method to compute expiry state (never stored stale)
documentSchema.methods.computeExpiryState = function (warningDays = 30) {
  if (!this.expiryDate) {
    return {
      state: EXPIRY_STATES.VALID,
      daysRemaining: null,
      isExpiringSoon: false,
      isExpired: false,
      hasExpiry: false,
    };
  }

  const now = new Date();
  const expiry = new Date(this.expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      state: EXPIRY_STATES.EXPIRED,
      daysRemaining,
      isExpiringSoon: false,
      isExpired: true,
      hasExpiry: true,
    };
  } else if (daysRemaining <= warningDays) {
    return {
      state: EXPIRY_STATES.EXPIRING_SOON,
      daysRemaining,
      isExpiringSoon: true,
      isExpired: false,
      hasExpiry: true,
    };
  } else {
    return {
      state: EXPIRY_STATES.VALID,
      daysRemaining,
      isExpiringSoon: false,
      isExpired: false,
      hasExpiry: true,
    };
  }
};

export const Document = mongoose.model('Document', documentSchema);

