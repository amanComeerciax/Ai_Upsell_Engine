import { Router } from 'express';
import { shopifyController } from '../controllers/shopify.controller';
import { webhookController } from '../controllers/webhook.controller';

const router = Router();

router.get('/sync-products', shopifyController.syncProducts);
router.post('/webhooks/orders/create', webhookController.handleOrderCreate);

export default router;
