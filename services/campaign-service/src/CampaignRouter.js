import { Router } from 'express';
import { authMiddleware } from '../shared/middleware/authMiddleware.js';
import { adminOnly }      from '../shared/middleware/roleMiddleware.js';
import { createCampaign, getAllCampaigns, getCampaignById, updateCampaign, deleteCampaign, duplicateCampaign, setPublishDetails, publishCampaign, sendCampaign } from './CampaignController.js';

const router = Router();
router.get('/',                      authMiddleware, getAllCampaigns);
router.get('/:id',                   authMiddleware, getCampaignById);
router.post('/',                     authMiddleware, adminOnly, createCampaign);
router.put('/:id',                   authMiddleware, adminOnly, updateCampaign);
router.delete('/:id',                authMiddleware, adminOnly, deleteCampaign);
router.post('/:id/duplicate',        authMiddleware, adminOnly, duplicateCampaign);
router.patch('/:id/publish-details', authMiddleware, adminOnly, setPublishDetails);
router.post('/:id/publish',          authMiddleware, adminOnly, publishCampaign);
router.post('/:id/send',             authMiddleware, adminOnly, sendCampaign);
export default router;
