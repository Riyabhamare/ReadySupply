import mongoose from 'mongoose';
import { ACTION_PRIORITIES, ACTION_STATUSES } from '../config/constants.js';

const correctiveActionSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Action title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    relatedRequirementCode: {
      type: String,
      default: '',
    },
    relatedRequirementTitle: {
      type: String,
      default: '',
    },
    relatedTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RequirementTemplate',
      default: null,
    },
    assignedTo: {
      name: { type: String, default: 'Unassigned' },
      role: { type: String, default: 'Quality Head' },
    },
    priority: {
      type: String,
      enum: Object.values(ACTION_PRIORITIES),
      default: ACTION_PRIORITIES.MEDIUM,
      index: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ACTION_STATUSES),
      default: ACTION_STATUSES.OPEN,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    completionEvidenceDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
    notes: {
      type: String,
      default: '',
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

// Method to compute dynamic status including overdue
correctiveActionSchema.methods.computeStatus = function () {
  if (this.status === ACTION_STATUSES.COMPLETED) {
    return ACTION_STATUSES.COMPLETED;
  }
  const now = new Date();
  if (this.dueDate && new Date(this.dueDate) < now) {
    return ACTION_STATUSES.OVERDUE;
  }
  return this.status;
};

export const CorrectiveAction = mongoose.model('CorrectiveAction', correctiveActionSchema);

