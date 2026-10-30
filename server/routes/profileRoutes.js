import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { authenticate } from '../middleware/auth.js';
import { requireSupplier } from '../middleware/roles.js';

const router = Router();

router.use(authenticate);
router.get('/', getProfile);
router.put('/', requireSupplier, updateProfile);

export default router;

