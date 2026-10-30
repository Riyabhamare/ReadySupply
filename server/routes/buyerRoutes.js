import { Router } from 'express';
import { getBuyers, getBuyerById } from '../controllers/buyerController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);
router.get('/', getBuyers);
router.get('/:id', getBuyerById);

export default router;

