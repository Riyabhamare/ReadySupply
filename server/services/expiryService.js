import { Document } from '../models/Document.js';
import { CorrectiveAction } from '../models/CorrectiveAction.js';
import { notifyUser } from './notifierService.js';
import { env } from '../config/env.js';

export const recalculateExpiriesAndAlert = async () => {
  try {
    const warningDays = env.EXPIRY_WARNING_DAYS || 30;
    const now = new Date();

    // 1. Process documents with expiry dates
    const documents = await Document.find({
      isSoftDeleted: false,
      expiryDate: { $ne: null },
    });

    let expiringSoonCount = 0;
    let expiredCount = 0;

    for (const doc of documents) {
      const expDate = new Date(doc.expiryDate);
      const diffMs = expDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        expiredCount++;
        // Check if an alert was already sent in the last 24 hours to avoid spamming
        await notifyUser({
          recipientId: doc.supplier,
          type: 'DOCUMENT_EXPIRED',
          title: `Document Expired: ${doc.name}`,
          message: `The document "${doc.name}" expired on ${expDate.toLocaleDateString()}. Please upload an updated renewal copy to keep your buyer readiness intact.`,
          data: { documentId: doc._id, category: doc.category },
        });
      } else if (daysRemaining <= warningDays) {
        expiringSoonCount++;
        if (daysRemaining === 30 || daysRemaining === 15 || daysRemaining === 7 || daysRemaining <= 3) {
          await notifyUser({
            recipientId: doc.supplier,
            type: 'EXPIRY_WARNING',
            title: `Document Expiring Soon: ${doc.name}`,
            message: `Document "${doc.name}" expires in ${daysRemaining} days (${expDate.toLocaleDateString()}). Plan your renewal now.`,
            data: { documentId: doc._id, daysRemaining, category: doc.category },
          });
        }
      }
    }

    // 2. Check overdue corrective actions
    const openActions = await CorrectiveAction.find({
      status: { $in: ['open', 'in_progress'] },
      dueDate: { $lt: now },
    });

    for (const action of openActions) {
      action.status = 'overdue';
      await action.save();

      await notifyUser({
        recipientId: action.supplier,
        type: 'ACTION_OVERDUE',
        title: `Corrective Action Overdue: ${action.title}`,
        message: `Action "${action.title}" was due on ${new Date(action.dueDate).toLocaleDateString()}. Please update or complete this action.`,
        data: { actionId: action._id },
      });
    }

    console.log(`[EXPIRY JOB] Checked ${documents.length} documents. ${expiringSoonCount} expiring soon, ${expiredCount} expired. Checked ${openActions.length} overdue actions.`);
    return {
      documentsChecked: documents.length,
      expiringSoonCount,
      expiredCount,
      overdueActionsCount: openActions.length,
    };
  } catch (err) {
    console.error('[EXPIRY JOB ERROR]', err.message);
    throw err;
  }
};

