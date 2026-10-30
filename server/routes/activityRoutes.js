import { Router } from 'express';
import { ActivityLog } from '../models/ActivityLog.js';
import { authenticate } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const query = req.user.role === ROLES.ADMIN
      ? {}
      : { supplier: req.user._id };

    const logs = await ActivityLog.find(query)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(logs);
  } catch (err) {
    next(err);
  }
});

export default router;

