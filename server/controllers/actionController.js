import { z } from 'zod';
import { CorrectiveAction } from '../models/CorrectiveAction.js';
import { logActivity } from '../services/activityService.js';
import { ACTION_PRIORITIES, ACTION_STATUSES } from '../config/constants.js';

const createActionSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  relatedRequirementCode: z.string().optional(),
  relatedRequirementTitle: z.string().optional(),
  relatedTemplate: z.string().optional(),
  assignedTo: z.object({
    name: z.string().optional(),
    role: z.string().optional(),
  }).optional(),
  priority: z.enum(Object.values(ACTION_PRIORITIES)).optional(),
  dueDate: z.string().or(z.date()),
  notes: z.string().optional(),
});

export const getActions = async (req, res, next) => {
  try {
    const { status, priority, templateId } = req.query;

    const query = { supplier: req.user._id };

    if (status && Object.values(ACTION_STATUSES).includes(status)) {
      query.status = status;
    }
    if (priority && Object.values(ACTION_PRIORITIES).includes(priority)) {
      query.priority = priority;
    }
    if (templateId) {
      query.relatedTemplate = templateId;
    }

    const actions = await CorrectiveAction.find(query)
      .populate('completionEvidenceDocument')
      .populate('relatedTemplate')
      .sort({ dueDate: 1 });

    // Compute dynamic overdue status
    const enriched = actions.map(act => {
      const actObj = act.toObject();
      actObj.computedStatus = act.computeStatus();
      return actObj;
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
};

export const createAction = async (req, res, next) => {
  try {
    const data = createActionSchema.parse(req.body);

    const action = await CorrectiveAction.create({
      supplier: req.user._id,
      title: data.title,
      description: data.description || '',
      relatedRequirementCode: data.relatedRequirementCode || '',
      relatedRequirementTitle: data.relatedRequirementTitle || '',
      relatedTemplate: data.relatedTemplate || null,
      assignedTo: data.assignedTo || { name: 'Unassigned', role: 'Quality Head' },
      priority: data.priority || ACTION_PRIORITIES.MEDIUM,
      dueDate: new Date(data.dueDate),
      status: ACTION_STATUSES.OPEN,
      notes: data.notes || '',
      isDemo: false,
    });

    await logActivity({
      supplierId: req.user._id,
      performedById: req.user._id,
      action: 'CREATE_ACTION',
      entityType: 'CorrectiveAction',
      entityId: action._id.toString(),
      details: { title: action.title, priority: action.priority },
      ip: req.ip,
    });

    const actObj = action.toObject();
    actObj.computedStatus = action.computeStatus();

    res.status(201).json({
      message: 'Corrective action created',
      action: actObj,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAction = async (req, res, next) => {
  try {
    const action = await CorrectiveAction.findOne({
      _id: req.params.id,
      supplier: req.user._id,
    });

    if (!action) {
      return res.status(404).json({ error: 'NotFound', message: 'Action not found' });
    }

    const {
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      status,
      completionEvidenceDocument,
      notes,
    } = req.body;

    if (title !== undefined) action.title = title;
    if (description !== undefined) action.description = description;
    if (assignedTo !== undefined) action.assignedTo = assignedTo;
    if (priority !== undefined) action.priority = priority;
    if (dueDate !== undefined) action.dueDate = new Date(dueDate);
    if (notes !== undefined) action.notes = notes;
    if (completionEvidenceDocument !== undefined) {
      action.completionEvidenceDocument = completionEvidenceDocument || null;
    }

    if (status !== undefined && Object.values(ACTION_STATUSES).includes(status)) {
      action.status = status;
      if (status === ACTION_STATUSES.COMPLETED && !action.completedAt) {
        action.completedAt = new Date();
      } else if (status !== ACTION_STATUSES.COMPLETED) {
        action.completedAt = null;
      }
    }

    await action.save();

    await logActivity({
      supplierId: req.user._id,
      performedById: req.user._id,
      action: 'UPDATE_ACTION',
      entityType: 'CorrectiveAction',
      entityId: action._id.toString(),
      details: { status: action.status },
      ip: req.ip,
    });

    const actObj = action.toObject();
    actObj.computedStatus = action.computeStatus();

    res.json({
      message: 'Action updated successfully',
      action: actObj,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAction = async (req, res, next) => {
  try {
    const action = await CorrectiveAction.findOneAndDelete({
      _id: req.params.id,
      supplier: req.user._id,
    });

    if (!action) {
      return res.status(404).json({ error: 'NotFound', message: 'Action not found' });
    }

    await logActivity({
      supplierId: req.user._id,
      performedById: req.user._id,
      action: 'DELETE_ACTION',
      entityType: 'CorrectiveAction',
      entityId: req.params.id,
      ip: req.ip,
    });

    res.json({ message: 'Action deleted successfully' });
  } catch (err) {
    next(err);
  }
};

