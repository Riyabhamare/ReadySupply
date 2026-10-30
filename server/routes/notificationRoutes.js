import { Router } from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  checkExpiryOnDemand,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', getNotifications);
router.put('/:id/read', markNotificationRead);
router.post('/mark-all-read', markAllNotificationsRead);
router.post('/check-expiry', checkExpiryOnDemand);

export default router;

