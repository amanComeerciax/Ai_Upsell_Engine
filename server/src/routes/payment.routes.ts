import express, { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { identifyMerchant } from '../middleware/auth.middleware';

const router = Router();

// 1. Create Checkout Session (Authenticated)
router.post('/create-checkout-session', identifyMerchant, paymentController.createCheckoutSession);

// 2. Stripe Webhook (Unauthenticated, raw body needed)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

export default router;
