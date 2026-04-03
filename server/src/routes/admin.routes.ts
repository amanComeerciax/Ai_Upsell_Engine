import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { identifyMerchant } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

// All admin routes require authentication AND admin role
router.use(identifyMerchant);
router.use(isAdmin);

/**
 * @route GET /api/v1/admin/stats
 * @desc Get global SaaS statistics
 */
router.get('/stats', adminController.getGlobalStats);

/**
 * @route GET /api/v1/admin/merchants
 * @desc Get all registered merchants
 */
router.get('/merchants', adminController.getAllMerchants);

/**
 * @route PATCH /api/v1/admin/merchants/:id
 * @desc Update merchant plan or role
 */
router.patch('/merchants/:id', adminController.updateMerchant);

export default router;
