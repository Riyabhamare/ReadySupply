import { Document } from '../models/Document.js';
import { getStorage } from '../services/storage/index.js';
import { logActivity } from '../services/activityService.js';
import { DOCUMENT_CATEGORIES, REVIEW_STATUSES, ROLES } from '../config/constants.js';
import { env } from '../config/env.js';

export const getDocuments = async (req, res, next) => {
  try {
    const { category, reviewStatus, expiryState, search, includeDeleted } = req.query;

    const query = {
      supplier: req.user._id,
      isSoftDeleted: includeDeleted === 'true' ? true : false,
    };

    if (category && DOCUMENT_CATEGORIES.includes(category)) {
      query.category = category;
    }

    if (reviewStatus && Object.values(REVIEW_STATUSES).includes(reviewStatus)) {
      query.reviewStatus = reviewStatus;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { description: searchRegex }, { tags: searchRegex }];
    }

    const docs = await Document.find(query).sort({ createdAt: -1 });

    // Compute dynamic expiry states
    const warningDays = env.EXPIRY_WARNING_DAYS || 30;
    const enrichedDocs = docs.map(doc => {
      const docObj = doc.toObject();
      const expiryInfo = doc.computeExpiryState(warningDays);
      return {
        ...docObj,
        expiryInfo,
      };
    });

    // Filter by computed expiry state if requested
    const filteredDocs = expiryState
      ? enrichedDocs.filter(d => d.expiryInfo.state === expiryState)
      : enrichedDocs;

    res.json(filteredDocs);
  } catch (err) {
    next(err);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'NotFound', message: 'Document not found' });
    }

    // Tenant check: supplier can only view own doc; admin can view any
    if (req.user.role === ROLES.SUPPLIER && doc.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }

    const docObj = doc.toObject();
    docObj.expiryInfo = doc.computeExpiryState(env.EXPIRY_WARNING_DAYS || 30);
    res.json(docObj);
  } catch (err) {
    next(err);
  }
};

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'BadRequest', message: 'Please attach a document file (PDF, JPG, or PNG).' });
    }

    const { name, category, issueDate, expiryDate, description, tags } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'BadRequest', message: 'Document name and category are required.' });
    }

    const storage = getStorage();
    const savedFile = await storage.save({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    });

    const parsedTags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [];

    const newDoc = await Document.create({
      supplier: req.user._id,
      name,
      category,
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      description: description || '',
      tags: parsedTags,
      version: 1,
      fileRef: {
        filename: savedFile.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: savedFile.size,
        storageDriver: env.STORAGE_DRIVER || 'local',
        storagePath: savedFile.storagePath,
      },
      uploaded: true,
      reviewStatus: REVIEW_STATUSES.PENDING_REVIEW,
      isSoftDeleted: false,
      isDemo: false,
    });

    await logActivity({
      supplierId: req.user._id,
      performedById: req.user._id,
      action: 'UPLOAD_DOCUMENT',
      entityType: 'Document',
      entityId: newDoc._id.toString(),
      details: { name: newDoc.name, category: newDoc.category, version: 1 },
      ip: req.ip,
    });

    const responseObj = newDoc.toObject();
    responseObj.expiryInfo = newDoc.computeExpiryState(env.EXPIRY_WARNING_DAYS || 30);

    res.status(201).json({
      message: 'Document uploaded successfully and queued for review.',
      document: responseObj,
    });
  } catch (err) {
    next(err);
  }
};

export const updateDocumentMetadata = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'NotFound', message: 'Document not found' });
    }

    if (doc.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }

    const { name, category, issueDate, expiryDate, description, tags } = req.body;

    if (name) doc.name = name;
    if (category && DOCUMENT_CATEGORIES.includes(category)) doc.category = category;
    if (issueDate !== undefined) doc.issueDate = issueDate ? new Date(issueDate) : null;
    if (expiryDate !== undefined) doc.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (description !== undefined) doc.description = description;
    if (tags !== undefined) {
      doc.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }

    await doc.save();

    await logActivity({
      supplierId: req.user._id,
      performedById: req.user._id,
      action: 'UPDATE_DOCUMENT',
      entityType: 'Document',
      entityId: doc._id.toString(),
      ip: req.ip,
    });

    const responseObj = doc.toObject();
    responseObj.expiryInfo = doc.computeExpiryState(env.EXPIRY_WARNING_DAYS || 30);

    res.json({
      message: 'Document metadata updated successfully',
      document: responseObj,
    });
  } catch (err) {
    next(err);
  }
};

export const uploadNewVersion = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'BadRequest', message: 'Please attach the updated document file.' });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'NotFound', message: 'Document not found' });
    }

    if (doc.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }

    const storage = getStorage();
    const savedFile = await storage.save({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    });

    // Record previous version in history
    doc.versionHistory.push({
      version: doc.version,
      filename: doc.fileRef.filename,
      originalName: doc.fileRef.originalName,
      mimeType: doc.fileRef.mimeType,
      size: doc.fileRef.size,
      uploadedAt: doc.updatedAt || doc.createdAt,
      uploadedBy: req.user._id,
      changeNote: req.body.changeNote || 'Uploaded newer version',
    });

    doc.version += 1;
    doc.fileRef = {
      filename: savedFile.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: savedFile.size,
      storageDriver: env.STORAGE_DRIVER || 'local',
      storagePath: savedFile.storagePath,
    };

    if (req.body.expiryDate) {
      doc.expiryDate = new Date(req.body.expiryDate);
    }

    // Replacing file resets review status to pending_review
    doc.reviewStatus = REVIEW_STATUSES.PENDING_REVIEW;
    doc.reviewDetails = {
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: 'Version updated - awaiting reviewer re-verification',
    };

    await doc.save();

    await logActivity({
      supplierId: req.user._id,
      performedById: req.user._id,
      action: 'REPLACE_DOCUMENT_VERSION',
      entityType: 'Document',
      entityId: doc._id.toString(),
      details: { newVersion: doc.version },
      ip: req.ip,
    });

    const responseObj = doc.toObject();
    responseObj.expiryInfo = doc.computeExpiryState(env.EXPIRY_WARNING_DAYS || 30);

    res.json({
      message: `Document updated to Version ${doc.version}. Queued for reviewer verification.`,
      document: responseObj,
    });
  } catch (err) {
    next(err);
  }
};

export const softDeleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'NotFound', message: 'Document not found' });
    }

    if (doc.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }

    doc.isSoftDeleted = true;
    await doc.save();

    await logActivity({
      supplierId: req.user._id,
      performedById: req.user._id,
      action: 'DELETE_DOCUMENT',
      entityType: 'Document',
      entityId: doc._id.toString(),
      ip: req.ip,
    });

    res.json({
      message: 'Document deleted. You can undo this within 8 seconds.',
      documentId: doc._id,
    });
  } catch (err) {
    next(err);
  }
};

export const restoreDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'NotFound', message: 'Document not found' });
    }

    if (doc.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
    }

    doc.isSoftDeleted = false;
    await doc.save();

    await logActivity({
      supplierId: req.user._id,
      performedById: req.user._id,
      action: 'RESTORE_DOCUMENT',
      entityType: 'Document',
      entityId: doc._id.toString(),
      ip: req.ip,
    });

    res.json({
      message: 'Document restored successfully',
      documentId: doc._id,
    });
  } catch (err) {
    next(err);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'NotFound', message: 'Document not found' });
    }

    // Strict access control: only owning supplier or admin
    if (req.user.role === ROLES.SUPPLIER && doc.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden', message: 'Access denied to download this file.' });
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

