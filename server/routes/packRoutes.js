import { Router } from 'express';
import { getPackPreview, exportPackPDF } from '../controllers/packController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/:templateId/preview', getPackPreview);
router.get('/:templateId/pdf', exportPackPDF);

export default router;

