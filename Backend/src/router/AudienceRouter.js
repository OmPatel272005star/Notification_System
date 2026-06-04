import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

import {
  getAllAudience,
  getAudienceById,
  createAudience,
  updateAudience,
  deleteAudience,
  getAudienceTimeline
} from '../controller/AudienceController.js';

const router = express.Router();

// All routes are admin-only as per requirements
router.get('/', authMiddleware, adminOnly, getAllAudience);
router.get('/:id', authMiddleware, adminOnly, getAudienceById);
router.get('/:id/timeline', authMiddleware, adminOnly, getAudienceTimeline);

router.post('/', authMiddleware, adminOnly, createAudience);
router.put('/:id', authMiddleware, adminOnly, updateAudience);
router.delete('/:id', authMiddleware, adminOnly, deleteAudience);

export default router;
