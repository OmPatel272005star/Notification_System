import { Router } from 'express';
import { authMiddleware } from '../shared/middleware/authMiddleware.js';
import { getMyProfile, updateMyProfile } from './ProfileController.js';

const router = Router();
router.get('/me',  authMiddleware, getMyProfile);
router.put('/me',  authMiddleware, updateMyProfile);
export default router;
