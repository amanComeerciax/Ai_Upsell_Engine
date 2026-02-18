import { Router } from 'express';
import { upsellController } from '../controllers/upsell.controller';
import { optionalMerchant } from '../middleware/auth.middleware';

const router = Router();

router.get('/', optionalMerchant, upsellController.getAllUpsells);
router.get('/order/:orderId', upsellController.getUpsellByOrderId);       // Widget: fetch recommendation
router.post('/:eventId/shown', upsellController.markShown);               // Widget: impression tracking
router.post('/:eventId/convert', upsellController.convertUpsell);         // Widget: click/conversion tracking

export default router;
