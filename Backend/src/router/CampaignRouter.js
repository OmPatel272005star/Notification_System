import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminOnly }      from '../middleware/roleMiddleware.js';
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  duplicateCampaign,
  setPublishDetails,
  publishCampaign,
} from '../controller/CampaignController.js';

const router = Router();

// ── Read routes (any authenticated user) ──────────────────────────────────────
router.get('/',    authMiddleware,              getAllCampaigns);
router.get('/:id', authMiddleware,              getCampaignById);

// ── Write routes (admin only) ─────────────────────────────────────────────────
router.post('/',                    authMiddleware, adminOnly, createCampaign);
router.put('/:id',                  authMiddleware, adminOnly, updateCampaign);
router.delete('/:id',               authMiddleware, adminOnly, deleteCampaign);
router.post('/:id/duplicate',       authMiddleware, adminOnly, duplicateCampaign);
router.patch('/:id/publish-details',authMiddleware, adminOnly, setPublishDetails);
router.post('/:id/publish',         authMiddleware, adminOnly, publishCampaign);

export default router;
