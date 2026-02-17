import { Router } from 'express';
import { upsellController } from '../controllers/upsell.controller';
import { optionalMerchant } from '../middleware/auth.middleware';

const router = Router();

router.get('/', optionalMerchant, upsellController.getAllUpsells);
router.get('/order/:orderId', upsellController.getUpsellByOrderId); // Public endpoint for widget

export default router;
