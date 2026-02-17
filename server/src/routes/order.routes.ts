import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { optionalMerchant } from '../middleware/auth.middleware';

const router = Router();

router.get('/', optionalMerchant, orderController.getAllOrders);

export default router;
