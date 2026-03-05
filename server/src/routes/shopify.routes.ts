import { Router } from 'express';
import { shopifyController } from '../controllers/shopify.controller';
import { webhookController } from '../controllers/webhook.controller';

const router = Router();

router.get('/sync-products', shopifyController.syncProducts);
router.post('/webhooks/orders/create', webhookController.handleOrderCreate);
router.post('/webhooks/carts/create', webhookController.handleCartUpdate);
router.post('/webhooks/carts/update', webhookController.handleCartUpdate);
router.post('/webhooks/checkouts/create', webhookController.handleCheckoutUpdate);
router.post('/webhooks/checkouts/update', webhookController.handleCheckoutUpdate);

export default router;
