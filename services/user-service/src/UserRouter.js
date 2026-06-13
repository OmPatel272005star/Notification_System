import { Router } from 'express';
import { authMiddleware } from '../shared/middleware/authMiddleware.js';
import { adminOnly }      from '../shared/middleware/roleMiddleware.js';
import { getUserById, addUser, deleteUser, updateUser, toggleStatus, getBulkUser } from './UserController.js';

const router = Router();
router.get('/getBulkUser', authMiddleware, adminOnly, getBulkUser);
router.get('/:id',         authMiddleware, getUserById);
router.post('/add',        authMiddleware, adminOnly, addUser);
router.delete('/:id',      authMiddleware, adminOnly, deleteUser);
router.put('/:id',         authMiddleware, adminOnly, updateUser);
router.patch('/:id/status',authMiddleware, adminOnly, toggleStatus);
export default router;
