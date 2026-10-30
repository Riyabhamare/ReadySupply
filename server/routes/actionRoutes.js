import { Router } from 'express';
import {
  getActions,
  createAction,
  updateAction,
  deleteAction,
} from '../controllers/actionController.js';
import { authenticate } from '../middleware/auth.js';
import { requireSupplier } from '../middleware/roles.js';

const router = Router();
router.use(authenticate);

router.get('/', getActions);
router.post('/', requireSupplier, createAction);
router.put('/:id', requireSupplier, updateAction);
router.delete('/:id', requireSupplier, deleteAction);

export default router;

