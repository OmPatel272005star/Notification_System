import express from 'express';
import { authMiddleware } from '../../shared/middleware/authMiddleware.js';
import { getMyProfile, updateMyProfile } from './ProfileController.js';

const router = express.Router();

// Both routes require a valid JWT — any authenticated user can access their own profile
router.get('/me',  authMiddleware, getMyProfile);
router.put('/me',  authMiddleware, updateMyProfile);

export default router;
