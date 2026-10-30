import { ActivityLog } from '../models/ActivityLog.js';

export const logActivity = async ({
  supplierId = null,
  performedById,
  action,
  entityType = '',
  entityId = '',
  details = {},
  ip = '',
}) => {
  try {
    await ActivityLog.create({
      supplier: supplierId,
      performedBy: performedById,
      action,
      entityType,
      entityId,
      details,
      ip,
    });
  } catch (err) {
    console.error('[ACTIVITY LOG ERROR]', err.message);
  }
};

