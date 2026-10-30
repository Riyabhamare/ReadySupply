import { Notification } from '../models/Notification.js';

export const notifyUser = async ({
  recipientId,
  type,
  title,
  message,
  data = {},
}) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      data,
    });

    console.log(`[NOTIFIER] Sent notification [${type}] to User ${recipientId}: "${title}"`);
    return notification;
  } catch (err) {
    console.error('[NOTIFIER ERROR]', err.message);
    return null;
  }
};

