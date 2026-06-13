import { Router } from 'express';
import { authMiddleware } from '../shared/middleware/authMiddleware.js';
import { adminOnly }      from '../shared/middleware/roleMiddleware.js';
import { getAllAudience, getAudienceById, createAudience, updateAudience, deleteAudience, getAudienceTimeline } from './AudienceController.js';

const router = Router();
router.get('/',              authMiddleware, adminOnly, getAllAudience);
router.get('/:id',           authMiddleware, adminOnly, getAudienceById);
router.post('/',             authMiddleware, adminOnly, createAudience);
router.put('/:id',           authMiddleware, adminOnly, updateAudience);
router.delete('/:id',        authMiddleware, adminOnly, deleteAudience);
router.get('/:id/timeline',  authMiddleware, adminOnly, getAudienceTimeline);
export default router;
