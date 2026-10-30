import { Document } from '../models/Document.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { REVIEW_STATUSES } from '../config/constants.js';
import { logActivity } from '../services/activityService.js';
import { notifyUser } from '../services/notifierService.js';
import { env } from '../config/env.js';

export const getReviewQueue = async (req, res, next) => {
  try {
    const queue = await Document.find({
      isSoftDeleted: false,
      reviewStatus: REVIEW_STATUSES.PENDING_REVIEW,
    })
      .populate('supplier', 'name email')
      .sort({ createdAt: 1 });

    const warningDays = env.EXPIRY_WARNING_DAYS || 30;
    const enriched = queue.map(doc => {
      const obj = doc.toObject();
      obj.expiryInfo = doc.computeExpiryState(warningDays);
      return obj;
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
};

export const verifyDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const doc = await Document.findById(id).populate('supplier');
    if (!doc) {
      return res.status(404).json({ error: 'NotFound', message: 'Document not found' });
    }

    doc.reviewStatus = REVIEW_STATUSES.VERIFIED;
    doc.reviewDetails = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      reviewNotes: notes || 'Document verified: meets requirement criteria.',
    };

    await doc.save();

    await logActivity({
      supplierId: doc.supplier._id,
      performedById: req.user._id,
      action: 'VERIFY_DOCUMENT',
      entityType: 'Document',
      entityId: doc._id.toString(),
      details: { reviewerName: req.user.name, notes: doc.reviewDetails.reviewNotes },
      ip: req.ip,
    });

    await notifyUser({
      recipientId: doc.supplier._id,
      type: 'DOCUMENT_VERIFIED',
      title: `Document Verified: ${doc.name}`,
      message: `Your document "${doc.name}" was reviewed and verified by administrator. Notes: ${doc.reviewDetails.reviewNotes}`,
      data: { documentId: doc._id },
    });

    res.json({
      message: 'Document marked as verified.',
      document: doc,
    });
  } catch (err) {
    next(err);
  }
};

export const rejectDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!notes || notes.trim().length < 5) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'A rejection reason note is required (minimum 5 characters).',
      });
    }

    const doc = await Document.findById(id).populate('supplier');
    if (!doc) {
      return res.status(404).json({ error: 'NotFound', message: 'Document not found' });
    }

    doc.reviewStatus = REVIEW_STATUSES.REJECTED;
    doc.reviewDetails = {
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      reviewNotes: notes.trim(),
    };

    await doc.save();

    await logActivity({
      supplierId: doc.supplier._id,
      performedById: req.user._id,
      action: 'REJECT_DOCUMENT',
      entityType: 'Document',
      entityId: doc._id.toString(),
      details: { reviewerName: req.user.name, notes: doc.reviewDetails.reviewNotes },
      ip: req.ip,
    });

    await notifyUser({
      recipientId: doc.supplier._id,
      type: 'DOCUMENT_REJECTED',
      title: `Document Rejected: ${doc.name}`,
      message: `Your document "${doc.name}" was rejected during review. Reason: ${doc.reviewDetails.reviewNotes}. Please upload a replacement.`,
      data: { documentId: doc._id },
    });

    res.json({
      message: 'Document marked as rejected.',
      document: doc,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllActivity = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate('performedBy', 'name email role')
      .populate('supplier', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (err) {
    next(err);
  }
};

