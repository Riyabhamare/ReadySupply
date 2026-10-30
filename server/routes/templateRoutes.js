import { Router } from 'express';
import { getTemplates, getTemplateById, createTemplate } from '../controllers/templateController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/roles.js';

const router = Router();
router.use(authenticate);
router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.post('/', requireAdmin, createTemplate);

export default router;

