import { Router } from 'express';
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  updateDocumentMetadata,
  uploadNewVersion,
  softDeleteDocument,
  restoreDocument,
  downloadDocument,
} from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(authenticate);

router.get('/', getDocuments);
router.post('/', upload.single('file'), uploadDocument);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocumentMetadata);
router.post('/:id/version', upload.single('file'), uploadNewVersion);
router.delete('/:id', softDeleteDocument);
router.post('/:id/restore', restoreDocument);
router.get('/:id/download', downloadDocument);

export default router;

