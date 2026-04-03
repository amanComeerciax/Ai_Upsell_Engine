import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia' as any,
});

export const paymentController = {
    /**
     * Create a Stripe Checkout Session
     */
    async createCheckoutSession(req: Request, res: Response) {
        try {
            const merchant = req.merchant!;
            const { successUrl, cancelUrl } = req.body;

            console.log('[Payment Controller] Creating session for merchant:', merchant.id);
            console.log('[Payment Controller] Using Price ID:', process.env.STRIPE_PRO_PRICE_ID);

            // 1. Check if merchant already has a stripe_customer_id
            let customerId = merchant.stripe_customer_id;
            console.log('[Payment Controller] Existing Customer ID:', customerId);
            
            if (!customerId) {
                console.log('[Payment Controller] Creating new Stripe customer...');
                const customer = await stripe.customers.create({
                    email: merchant.email || undefined,
                    metadata: {
                        merchant_id: merchant.id.toString(),
                        clerk_user_id: merchant.clerk_user_id
                    }
                });
                customerId = customer.id;
                console.log('[Payment Controller] New Customer ID created:', customerId);
                
                // Save customer ID
                await (prisma.merchants as any).update({
                    where: { id: merchant.id },
                    data: { stripe_customer_id: customerId }
                });
            }

            // 2. Create Checkout Session
            console.log('[Payment Controller] Creating checkout session at Stripe...');
            const session = await stripe.checkout.sessions.create({
                customer: customerId,
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: process.env.STRIPE_PRO_PRICE_ID,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: cancelUrl,
                metadata: {
                    merchant_id: merchant.id.toString()
                }
            });

            console.log('[Payment Controller] Session created successfully:', session.id);
            res.status(200).json({ url: session.url });
        } catch (error: any) {
            console.error('[Payment Controller] Checkout Error Detail:', error);
            res.status(500).json({ 
                error: error.message || 'Failed to create checkout session',
                detail: error.raw?.message || error.message 
            });
        }
    },

    /**
     * Handle Stripe Webhooks
     */
    async handleWebhook(req: Request, res: Response) {
        const sig = req.headers['stripe-signature'] as string;
        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err: any) {
            console.error(`[Webhook] Signature verification failed:`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        console.log(`[Webhook] Received event: ${event.type}`);

        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session;
                    const merchantId = session.metadata?.merchant_id;
                    const subscriptionId = session.subscription as string;

                    if (merchantId) {
                        await (prisma.merchants as any).update({
                            where: { id: parseInt(merchantId) },
                            data: {
                                plan: 'pro',
                                subscription_id: subscriptionId,
                                subscription_status: 'active'
                            }
                        });
                        console.log(`[Webhook] Merchant ${merchantId} upgraded to PRO`);
                    }
                    break;
                }

                case 'customer.subscription.deleted': {
                    const subscription = event.data.object as Stripe.Subscription;
                    const merchant = await (prisma.merchants as any).findFirst({
                        where: { subscription_id: subscription.id }
                    });

                    if (merchant) {
                        await (prisma.merchants as any).update({
                            where: { id: merchant.id },
                            data: {
                                plan: 'free',
                                subscription_status: 'canceled'
                            }
                        });
                        console.log(`[Webhook] Merchant ${merchant.id} reverted to FREE`);
                    }
                    break;
                }

                case 'customer.subscription.updated': {
                    const subscription = event.data.object as Stripe.Subscription;
                    const merchant = await (prisma.merchants as any).findFirst({
                        where: { subscription_id: subscription.id }
                    });

                    if (merchant) {
                        await (prisma.merchants as any).update({
                            where: { id: merchant.id },
                            data: {
                                subscription_status: subscription.status
                            }
                        });
                    }
                    break;
                }
            }

            res.json({ received: true });
        } catch (error: any) {
            console.error('[Webhook Controller] Error:', error);
            res.status(500).json({ error: 'Webhook processing failed' });
        }
    }
};
