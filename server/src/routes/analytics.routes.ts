import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { optionalMerchant } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', optionalMerchant, analyticsController.getDashboardStats);

export default router;
