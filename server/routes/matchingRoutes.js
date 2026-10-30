import { Router } from 'express';
import {
  runMapping,
  getMappingSnapshot,
  linkDocumentManually,
  updateBuyerAcceptance,
} from '../controllers/matchingController.js';
import { authenticate } from '../middleware/auth.js';
import { requireSupplier } from '../middleware/roles.js';

const router = Router();
router.use(authenticate);

router.post('/:templateId/run', requireSupplier, runMapping);
router.get('/:templateId/snapshot', getMappingSnapshot);
router.post('/:templateId/link-document', requireSupplier, linkDocumentManually);
router.post('/:templateId/buyer-acceptance', requireSupplier, updateBuyerAcceptance);

export default router;

