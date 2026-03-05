import { Router } from 'express';
import { upsellController } from '../controllers/upsell.controller';
import { optionalMerchant } from '../middleware/auth.middleware';

const router = Router();

router.get('/', optionalMerchant, upsellController.getAllUpsells);
router.get('/order/:orderId', upsellController.getUpsellByOrderId);       // Widget: fetch recommendation by order
router.get('/:eventId', upsellController.getUpsellById);                    // Widget: fetch recommendation by event ID
router.post('/:eventId/shown', upsellController.markShown);               // Widget: impression tracking
router.post('/:eventId/convert', upsellController.convertUpsell);         // Widget: click/conversion tracking
router.post('/:eventId/resend', optionalMerchant, upsellController.resendUpsell); // Dashboard: retrigger campaign
router.get('/recovery/:cartToken', upsellController.getCartRecovery);      // Widget: cart recovery recommendations

export default router;

