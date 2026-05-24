import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminOnly }      from '../middleware/roleMiddleware.js';

import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
} from '../controller/TemplateController.js';

const router = express.Router();

// ── Any authenticated user (read) ─────────────────────────────────────────
// Viewers get filtered results (visible_to: "all" only)
// Admins get all templates
router.get('/',    authMiddleware, getAllTemplates);
router.get('/:id', authMiddleware, getTemplateById);

// ── Admin only (write) ────────────────────────────────────────────────────
router.post(  '/',               authMiddleware, adminOnly, createTemplate);
router.put(   '/:id',            authMiddleware, adminOnly, updateTemplate);
router.delete('/:id',            authMiddleware, adminOnly, deleteTemplate);
router.post(  '/:id/duplicate',  authMiddleware, adminOnly, duplicateTemplate);

export default router;
