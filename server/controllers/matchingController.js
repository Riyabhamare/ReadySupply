import { RequirementTemplate } from '../models/RequirementTemplate.js';
import { SupplierProfile } from '../models/SupplierProfile.js';
import { Document } from '../models/Document.js';
import { RequirementMapping } from '../models/RequirementMapping.js';
import { runMatchingEngine } from '../services/matchingEngine.js';
import { logActivity } from '../services/activityService.js';
import { env } from '../config/env.js';

export const runMapping = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const supplierId = req.user._id;

    const template = await RequirementTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: 'NotFound', message: 'Requirement template not found' });
    }

    const profile = await SupplierProfile.findOne({ supplier: supplierId });
    const documents = await Document.find({
      supplier: supplierId,
      isSoftDeleted: false,
    });

    const engineResult = runMatchingEngine(template, profile, documents, {
      warningDays: env.EXPIRY_WARNING_DAYS || 30,
    });

    // Check if there was a previous mapping to preserve manual document links or buyer acceptances
    const previousMapping = await RequirementMapping.findOne({
      supplier: supplierId,
      template: template._id,
    });

    if (previousMapping) {
      engineResult.results = engineResult.results.map(r => {
        const prev = previousMapping.results.find(p => p.requirementCode === r.requirementCode);
        if (prev) {
          if (prev.manualLinkedDocumentId) {
            r.manualLinkedDocumentId = prev.manualLinkedDocumentId;
          }
          if (prev.buyerAcceptance && prev.buyerAcceptance.isAccepted) {
            r.buyerAcceptance = prev.buyerAcceptance;
          }
        }
        return r;
      });
    }

    // Upsert snapshot
    let mapping = await RequirementMapping.findOneAndUpdate(
      { supplier: supplierId, template: template._id },
      {
        supplier: supplierId,
        template: template._id,
        buyer: template.buyer,
        generatedAt: new Date(),
        readinessScore: engineResult.readinessScore,
        formula: engineResult.formula,
        disclaimer: engineResult.disclaimer,
        summary: engineResult.summary,
        results: engineResult.results,
        isDemo: profile?.isDemo || false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await logActivity({
      supplierId,
      performedById: req.user._id,
      action: 'RUN_MAPPING',
      entityType: 'RequirementMapping',
      entityId: mapping._id.toString(),
      details: {
        templateName: template.name,
        readinessScore: mapping.readinessScore,
      },
      ip: req.ip,
    });

    res.json(mapping);
  } catch (err) {
    next(err);
  }
};

export const getMappingSnapshot = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const mapping = await RequirementMapping.findOne({
      supplier: req.user._id,
      template: templateId,
    })
      .populate('template')
      .populate('buyer')
      .populate('results.matchedDocumentId')
      .populate('results.manualLinkedDocumentId');

    if (!mapping) {
      return res.status(404).json({ error: 'NotFound', message: 'No mapping found for this template yet. Run match first.' });
    }

    res.json(mapping);
  } catch (err) {
    next(err);
  }
};

export const linkDocumentManually = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const { requirementCode, documentId } = req.body;

    const mapping = await RequirementMapping.findOne({
      supplier: req.user._id,
      template: templateId,
    });

    if (!mapping) {
      return res.status(404).json({ error: 'NotFound', message: 'Mapping not found. Please run matching first.' });
    }

    const item = mapping.results.find(r => r.requirementCode === requirementCode);
    if (!item) {
      return res.status(404).json({ error: 'NotFound', message: 'Requirement not found in mapping' });
    }

    if (documentId) {
      const doc = await Document.findOne({ _id: documentId, supplier: req.user._id });
      if (!doc) {
        return res.status(404).json({ error: 'NotFound', message: 'Document not found or access denied' });
      }
      item.manualLinkedDocumentId = doc._id;
    } else {
      item.manualLinkedDocumentId = null;
    }

    await mapping.save();

    res.json({ message: 'Linked document updated successfully', mapping });
  } catch (err) {
    next(err);
  }
};

export const updateBuyerAcceptance = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const { requirementCode, isAccepted, notes } = req.body;

    const mapping = await RequirementMapping.findOne({
      supplier: req.user._id,
      template: templateId,
    });

    if (!mapping) {
      return res.status(404).json({ error: 'NotFound', message: 'Mapping not found' });
    }

    const item = mapping.results.find(r => r.requirementCode === requirementCode);
    if (!item) {
      return res.status(404).json({ error: 'NotFound', message: 'Requirement not found in mapping' });
    }

    item.buyerAcceptance = {
      isAccepted: !!isAccepted,
      acceptedAt: isAccepted ? new Date() : null,
      notes: notes || '',
    };

    await mapping.save();

    await logActivity({
      supplierId: req.user._id,
      performedById: req.user._id,
      action: 'UPDATE_BUYER_ACCEPTANCE',
      entityType: 'RequirementMapping',
      entityId: mapping._id.toString(),
      details: { requirementCode, isAccepted },
      ip: req.ip,
    });

    res.json({
      message: isAccepted ? 'Recorded buyer acceptance note' : 'Cleared buyer acceptance note',
      mapping,
    });
  } catch (err) {
    next(err);
  }
};

