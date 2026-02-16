import { Router } from 'express';
import { upsellController } from '../controllers/upsell.controller';

const router = Router();

router.get('/', upsellController.getAllUpsells);
router.get('/order/:orderId', upsellController.getUpsellByOrderId);

export default router;
