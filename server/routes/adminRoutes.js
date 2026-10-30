import { Router } from 'express';
import {
  getReviewQueue,
  verifyDocument,
  rejectDocument,
  getAllActivity,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/queue', getReviewQueue);
router.post('/verify/:id', verifyDocument);
router.post('/reject/:id', rejectDocument);
router.get('/activity', getAllActivity);

export default router;

