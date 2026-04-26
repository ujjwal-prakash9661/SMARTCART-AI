import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { adminMiddleware, superAdminMiddleware } from '../middleware/admin.middleware.js';
import { grantAdminAccess, getAdmins, getStats, getUserActivity } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/admins', authMiddleware, adminMiddleware, getAdmins);
router.get('/stats', authMiddleware, adminMiddleware, getStats);
router.get('/activity', authMiddleware, adminMiddleware, getUserActivity);
router.post('/grant-access', authMiddleware, superAdminMiddleware, grantAdminAccess);

export default router;
