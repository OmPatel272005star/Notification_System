import { Router } from 'express';
import { authMiddleware } from '../shared/middleware/authMiddleware.js';
import { adminOnly }      from '../shared/middleware/roleMiddleware.js';
import { createConnection, getAllConnections, getConnectionById, updateConnection, deleteConnection, testConnection } from './ConnectionController.js';

const router = Router();
router.get('/',          authMiddleware, getAllConnections);
router.get('/:id',       authMiddleware, getConnectionById);
router.post('/',         authMiddleware, adminOnly, createConnection);
router.put('/:id',       authMiddleware, adminOnly, updateConnection);
router.delete('/:id',    authMiddleware, adminOnly, deleteConnection);
router.post('/:id/test', authMiddleware, testConnection);
export default router;
