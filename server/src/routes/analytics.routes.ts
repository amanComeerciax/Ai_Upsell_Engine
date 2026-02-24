import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { optionalMerchant } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', optionalMerchant, analyticsController.getDashboardStats);
router.get('/detailed', optionalMerchant, analyticsController.getDetailedAnalytics);
router.get('/insights', optionalMerchant, analyticsController.getInsights);
router.get('/ab-test', optionalMerchant, analyticsController.getABTestMetrics);


export default router;
