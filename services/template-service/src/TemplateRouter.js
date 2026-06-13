import { Router } from 'express';
import { authMiddleware } from '../shared/middleware/authMiddleware.js';
import { adminOnly }      from '../shared/middleware/roleMiddleware.js';
import { getAllTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate } from './TemplateController.js';

const router = Router();
router.get('/',                 authMiddleware, getAllTemplates);
router.get('/:id',              authMiddleware, getTemplateById);
router.post('/',                authMiddleware, adminOnly, createTemplate);
router.put('/:id',              authMiddleware, adminOnly, updateTemplate);
router.delete('/:id',           authMiddleware, adminOnly, deleteTemplate);
router.post('/:id/duplicate',   authMiddleware, adminOnly, duplicateTemplate);
export default router;
