import { Notification } from '../models/Notification.js';
import { recalculateExpiriesAndAlert } from '../services/expiryService.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.json({
      unreadCount,
      notifications,
    });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({ error: 'NotFound', message: 'Notification not found' });
    }

    res.json(notif);
  } catch (err) {
    next(err);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};

export const checkExpiryOnDemand = async (req, res, next) => {
  try {
    const result = await recalculateExpiriesAndAlert();
    res.json({
      message: 'Expiry check and alerts processed successfully',
      result,
    });
  } catch (err) {
    next(err);
  }
};

