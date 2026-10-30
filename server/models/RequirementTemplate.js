import mongoose from 'mongoose';
import { CHECK_TYPES, DOCUMENT_CATEGORIES } from '../config/constants.js';

const requirementItemSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    plainLanguageExplanation: { type: String, required: true },
    category: { type: String, required: true },
    checkType: {
      type: String,
      enum: Object.values(CHECK_TYPES),
      default: CHECK_TYPES.DOCUMENT,
    },
    isMandatory: { type: Boolean, default: true },
    applicability: {
      sectors: [{ type: String }],
      capabilities: [{ type: String }],
    },
    additionalInstructions: { type: String, default: '' },
    requiredEvidenceCategory: { type: String, default: '' },
    requiredCapability: { type: String, default: '' },
  },
  { _id: true }
);

const requirementTemplateSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    version: {
      type: String,
      default: '1.0',
    },
    description: {
      type: String,
      default: '',
    },
    sector: {
      type: String,
      required: true,
    },
    requirements: [requirementItemSchema],
    isDemo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const RequirementTemplate = mongoose.model('RequirementTemplate', requirementTemplateSchema);

