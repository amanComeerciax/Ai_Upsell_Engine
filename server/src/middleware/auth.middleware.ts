import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// Extend Express Request to include merchant
declare global {
    namespace Express {
        interface Request {
            merchant?: {
                id: number;
                clerk_user_id: string;
                business_name: string | null;
                shopify_shop_name: string | null;
                shopify_access_token: string | null;
                plan: string | null;
                email_subject: string | null;
                email_body: string | null;
            };
        }
    }
}

/**
 * Middleware to identify the merchant from Clerk auth headers.
 * Clerk sends the user ID in the Authorization header or x-clerk-user-id header.
 * For MVP, we also support x-merchant-id header for direct API access.
 */
export async function identifyMerchant(req: Request, res: Response, next: NextFunction) {
    try {
        // Option 1: Direct merchant ID (for internal/testing)
        const directMerchantId = req.headers['x-merchant-id'] as string;
        if (directMerchantId) {
            const merchant = await prisma.merchants.findUnique({
                where: { id: parseInt(directMerchantId) }
            });
            if (merchant) {
                req.merchant = {
                    id: merchant.id,
                    clerk_user_id: merchant.clerk_user_id,
                    business_name: merchant.business_name,
                    shopify_shop_name: merchant.shopify_shop_name,
                    shopify_access_token: merchant.shopify_access_token,
                    plan: merchant.plan,
                    email_subject: merchant.email_subject,
                    email_body: merchant.email_body,
                };
                return next();
            }
        }

        // Option 2: Clerk User ID from header (sent by frontend)
        const clerkUserId = req.headers['x-clerk-user-id'] as string;
        if (clerkUserId) {
            const merchant = await prisma.merchants.findUnique({
                where: { clerk_user_id: clerkUserId }
            });
            if (merchant) {
                req.merchant = {
                    id: merchant.id,
                    clerk_user_id: merchant.clerk_user_id,
                    business_name: merchant.business_name,
                    shopify_shop_name: merchant.shopify_shop_name,
                    shopify_access_token: merchant.shopify_access_token,
                    plan: merchant.plan,
                    email_subject: merchant.email_subject,
                    email_body: merchant.email_body,
                };
                return next();
            }
        }

        // No merchant found
        return res.status(401).json({
            error: 'Merchant not found. Please complete onboarding first.',
            code: 'MERCHANT_NOT_FOUND'
        });
    } catch (error) {
        console.error('[Auth Middleware] Error:', error);
        return res.status(500).json({ error: 'Authentication failed' });
    }
}

/**
 * Optional middleware - doesn't block if merchant not found.
 * Useful for routes that work for both authenticated and public access.
 */
export async function optionalMerchant(req: Request, res: Response, next: NextFunction) {
    try {
        const clerkUserId = req.headers['x-clerk-user-id'] as string;
        const directMerchantId = req.headers['x-merchant-id'] as string;

        if (directMerchantId) {
            const merchant = await prisma.merchants.findUnique({
                where: { id: parseInt(directMerchantId) }
            });
            if (merchant) {
                req.merchant = {
                    id: merchant.id,
                    clerk_user_id: merchant.clerk_user_id,
                    business_name: merchant.business_name,
                    shopify_shop_name: merchant.shopify_shop_name,
                    shopify_access_token: merchant.shopify_access_token,
                    plan: merchant.plan,
                    email_subject: merchant.email_subject,
                    email_body: merchant.email_body,
                };
            }
        } else if (clerkUserId) {
            const merchant = await prisma.merchants.findUnique({
                where: { clerk_user_id: clerkUserId }
            });
            if (merchant) {
                req.merchant = {
                    id: merchant.id,
                    clerk_user_id: merchant.clerk_user_id,
                    business_name: merchant.business_name,
                    shopify_shop_name: merchant.shopify_shop_name,
                    shopify_access_token: merchant.shopify_access_token,
                    plan: merchant.plan,
                    email_subject: merchant.email_subject,
                    email_body: merchant.email_body,
                };
            }
        }
    } catch (error) {
        console.error('[Auth Middleware] Optional merchant error:', error);
    }
    next();
}
