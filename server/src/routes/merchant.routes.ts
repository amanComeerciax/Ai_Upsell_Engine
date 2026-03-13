import { Router } from 'express';
import { merchantController } from '../controllers/merchant.controller';
import { identifyMerchant } from '../middleware/auth.middleware';

const router = Router();

// Public (no merchant auth needed - this creates the merchant)
router.post('/register', merchantController.register);

// Protected (merchant must be identified)
router.get('/profile', identifyMerchant, merchantController.getProfile);
router.post('/connect-shopify', identifyMerchant, merchantController.connectShopify);
router.post('/disconnect-shopify', identifyMerchant, merchantController.disconnectShopify);
router.post('/sync-products', identifyMerchant, merchantController.syncProducts);
router.post('/register-webhook', identifyMerchant, merchantController.registerWebhook);
router.post('/register-script', identifyMerchant, merchantController.registerScriptTag);
router.put('/settings', identifyMerchant, merchantController.updateSettings);

export default router;
