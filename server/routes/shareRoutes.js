import { Router } from 'express';
import {
  createShareLink,
  listShareLinks,
  revokeShareLink,
  getSharedPackView,
  streamSharedDocument,
} from '../controllers/shareController.js';
import { authenticate } from '../middleware/auth.js';
import { requireSupplier } from '../middleware/roles.js';

const router = Router();

// Public token routes
router.get('/view/:token', getSharedPackView);
router.get('/view/:token/document/:documentId', streamSharedDocument);

// Protected supplier routes
router.post('/', authenticate, requireSupplier, createShareLink);
router.get('/list', authenticate, requireSupplier, listShareLinks);
router.post('/:id/revoke', authenticate, requireSupplier, revokeShareLink);

export default router;

