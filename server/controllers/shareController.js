import crypto from 'crypto';
import { z } from 'zod';
import { ShareLink } from '../models/ShareLink.js';
import { RequirementTemplate } from '../models/RequirementTemplate.js';
import { SupplierProfile } from '../models/SupplierProfile.js';
import { Document } from '../models/Document.js';
import { RequirementMapping } from '../models/RequirementMapping.js';
import { CorrectiveAction } from '../models/CorrectiveAction.js';
import { getStorage } from '../services/storage/index.js';
import { logActivity } from '../services/activityService.js';
import { env } from '../config/env.js';

const createLinkSchema = z.object({
  templateId: z.string().min(1, 'Template ID is required'),
  recipientName: z.string().optional(),
  recipientEmail: z.string().email().optional().or(z.literal('')),
  purpose: z.string().optional(),
  expiryDays: z.number().min(1).max(30).default(7),
  maxAccessCount: z.number().min(1).max(100).default(10),
  consentGranted: z.literal(true, {
    errorMap: () => ({ message: 'You must provide consent to share your documents with this recipient.' }),
  }),
});

export const createShareLink = async (req, res, next) => {
  try {
    const data = createLinkSchema.parse(req.body);

    const template = await RequirementTemplate.findById(data.templateId);
    if (!template) {
      return res.status(404).json({ error: 'NotFound', message: 'Template not found' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiryDays);

    const shareLink = await ShareLink.create({
      supplier: req.user._id,
      token,
      template: template._id,
      recipientName: data.recipientName || 'Buyer Reviewer',
      recipientEmail: data.recipientEmail || '',
      purpose: data.purpose || 'Readiness verification',
      expiresAt,
      maxAccessCount: data.maxAccessCount,
      consentGranted: true,
    });

    await logActivity({
      supplierId: req.user._id,
      performedById: req.user._id,
      action: 'CREATE_SHARE_LINK',
      entityType: 'ShareLink',
      entityId: shareLink._id.toString(),
      details: { token: shareLink.token, expiresAt },
      ip: req.ip,
    });

    res.status(201).json({
      message: 'Share link created successfully',
      shareLink,
      shareUrl: `${env.CLIENT_URL}/shared/${token}`,
    });
  } catch (err) {
    next(err);
  }
};

export const listShareLinks = async (req, res, next) => {
  try {
    const links = await ShareLink.find({ supplier: req.user._id })
      .populate('template')
      .sort({ createdAt: -1 });

    const enriched = links.map(link => {
      const obj = link.toObject();
      obj.validity = link.isValid();
      return obj;
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
};

export const revokeShareLink = async (req, res, next) => {
  try {
    const link = await ShareLink.findOne({
      _id: req.params.id,
      supplier: req.user._id,
    });

    if (!link) {
      return res.status(404).json({ error: 'NotFound', message: 'Share link not found' });
    }

    link.isRevoked = true;
    link.revokedAt = new Date();
    await link.save();

    await logActivity({
      supplierId: req.user._id,
      performedById: req.user._id,
      action: 'REVOKE_SHARE_LINK',
      entityType: 'ShareLink',
      entityId: link._id.toString(),
      ip: req.ip,
    });

    res.json({ message: 'Share link revoked successfully', link });
  } catch (err) {
    next(err);
  }
};

// PUBLIC VIEW (Token-authenticated)
export const getSharedPackView = async (req, res, next) => {
  try {
    const { token } = req.params;
    const shareLink = await ShareLink.findOne({ token }).populate('template');

    if (!shareLink) {
      return res.status(404).json({ error: 'NotFound', message: 'Invalid or unknown share link' });
    }

    const validity = shareLink.isValid();
    if (!validity.valid) {
      return res.status(403).json({ error: 'Forbidden', message: validity.reason });
    }

    // Increment access count and record access log
    shareLink.accessCount += 1;
    shareLink.accessLogs.push({
      accessedAt: new Date(),
      ip: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });
    await shareLink.save();

    const supplierId = shareLink.supplier;
    const template = await RequirementTemplate.findById(shareLink.template._id).populate('buyer');
    const profile = await SupplierProfile.findOne({ supplier: supplierId });
    const mapping = await RequirementMapping.findOne({ supplier: supplierId, template: template._id });
    const documents = await Document.find({ supplier: supplierId, isSoftDeleted: false });
    const actions = await CorrectiveAction.find({
      supplier: supplierId,
      $or: [{ relatedTemplate: template._id }, { relatedTemplate: null }],
    });

    const warningDays = env.EXPIRY_WARNING_DAYS || 30;
    const enrichedDocs = documents.map(d => {
      const obj = d.toObject();
      obj.expiryInfo = d.computeExpiryState(warningDays);
      return obj;
    });

    await logActivity({
      supplierId,
      performedById: supplierId,
      action: 'ACCESS_SHARE_LINK',
      entityType: 'ShareLink',
      entityId: shareLink._id.toString(),
      details: { accessCount: shareLink.accessCount },
      ip: req.ip,
    });

    res.json({
      shareLink: {
        token: shareLink.token,
        purpose: shareLink.purpose,
        recipientName: shareLink.recipientName,
        expiresAt: shareLink.expiresAt,
        accessCount: shareLink.accessCount,
        maxAccessCount: shareLink.maxAccessCount,
      },
      profile,
      template,
      buyer: template.buyer,
      mapping,
      documents: enrichedDocs,
      actions,
      disclaimer: 'Preparation document generated by ReadySupply. Not a certification or supplier approval. Final approval rests with the buyer.',
    });
  } catch (err) {
    next(err);
  }
};

// PUBLIC DOCUMENT STREAM VIA VALID SHARE TOKEN
export const streamSharedDocument = async (req, res, next) => {
  try {
    const { token, documentId } = req.params;
    const shareLink = await ShareLink.findOne({ token });

    if (!shareLink) {
      return res.status(404).json({ error: 'NotFound', message: 'Invalid share link' });
    }

    const validity = shareLink.isValid();
    if (!validity.valid) {
      return res.status(403).json({ error: 'Forbidden', message: validity.reason });
    }

    const doc = await Document.findOne({
      _id: documentId,
      supplier: shareLink.supplier,
      isSoftDeleted: false,
    });

    if (!doc) {
      return res.status(404).json({ error: 'NotFound', message: 'Document not found or access denied' });
    }

    const storage = getStorage();
    const stream = await storage.getStream(doc.fileRef.storagePath);

    res.setHeader('Content-Type', doc.fileRef.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.fileRef.originalName)}"`);

    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};

