import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  createConnection,
  getAllConnections,
  getConnectionById,
  updateConnection,
  deleteConnection,
  testConnection,
} from '../controller/ConnectionController.js';

const router = Router();

// ── Any authenticated user can list / view connections ────────────────────────
router.get('/',    authMiddleware, getAllConnections);
router.get('/:id', authMiddleware, getConnectionById);

// ── Any authenticated user can create / update / delete their own connection ──
router.post('/',         authMiddleware, createConnection);
router.put('/:id',       authMiddleware, updateConnection);
router.delete('/:id',    authMiddleware, deleteConnection);

// ── Test (live probe email) ───────────────────────────────────────────────────
router.post('/:id/test', authMiddleware, testConnection);

export default router;
