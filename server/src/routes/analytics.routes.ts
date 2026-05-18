import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { identifyMerchant } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', identifyMerchant, analyticsController.getDashboardStats);
router.get('/detailed', identifyMerchant, analyticsController.getDetailedAnalytics);
router.get('/insights', identifyMerchant, analyticsController.getInsights);
router.get('/ab-test', identifyMerchant, analyticsController.getABTestMetrics);


export default router;
