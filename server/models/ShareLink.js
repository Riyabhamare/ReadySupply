import mongoose from 'mongoose';

const accessLogSchema = new mongoose.Schema(
  {
    accessedAt: { type: Date, default: Date.now },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { _id: true }
);

const shareLinkSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RequirementTemplate',
      required: true,
    },
    recipientName: {
      type: String,
      default: '',
    },
    recipientEmail: {
      type: String,
      default: '',
    },
    purpose: {
      type: String,
      default: 'Buyer Readiness Verification',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    maxAccessCount: {
      type: Number,
      default: 10,
    },
    accessCount: {
      type: Number,
      default: 0,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    consentGranted: {
      type: Boolean,
      required: [true, 'Consent to share is required'],
      default: true,
    },
    accessLogs: [accessLogSchema],
  },
  {
    timestamps: true,
  }
);

shareLinkSchema.methods.isValid = function () {
  if (this.isRevoked) return { valid: false, reason: 'Link has been revoked by supplier' };
  if (this.expiresAt && new Date(this.expiresAt) < new Date()) {
    return { valid: false, reason: 'Share link has expired' };
  }
  if (this.maxAccessCount && this.accessCount >= this.maxAccessCount) {
    return { valid: false, reason: 'Maximum access count reached' };
  }
  return { valid: true };
};

export const ShareLink = mongoose.model('ShareLink', shareLinkSchema);

