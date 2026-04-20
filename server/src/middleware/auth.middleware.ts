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
                stripe_customer_id: string | null;
                subscription_id: string | null;
                email: string | null;
                role: string;
                teamRole: string; // 'owner' | 'member'
            };
            teamMember?: {
                id: number;
                email: string;
                name: string | null;
                role: string;
            } | null;
        }
    }
}

/**
 * Helper to build the merchant request object from a DB record.
 */
function buildMerchantPayload(merchant: any, teamRole: string = 'owner') {
    return {
        id: merchant.id,
        clerk_user_id: merchant.clerk_user_id,
        business_name: merchant.business_name,
        shopify_shop_name: merchant.shopify_shop_name,
        shopify_access_token: merchant.shopify_access_token,
        plan: merchant.plan,
        email_subject: merchant.email_subject,
        email_body: merchant.email_body,
        stripe_customer_id: (merchant as any).stripe_customer_id,
        subscription_id: (merchant as any).subscription_id,
        email: merchant.email,
        role: (merchant as any).role || 'user',
        teamRole,
    };
}

/**
 * Middleware to identify the merchant from Clerk auth headers.
 * Clerk sends the user ID in the Authorization header or x-clerk-user-id header.
 * For MVP, we also support x-merchant-id header for direct API access.
 * 
 * Now also supports team member login:
 * If the Clerk user ID doesn't match any merchant, we check if it matches a team_member.
 * If found, we load the parent merchant and set req.teamMember.
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
                req.merchant = buildMerchantPayload(merchant, 'owner');
                req.teamMember = null;
                return next();
            }
        }

        // Option 2: Clerk User ID from header (sent by frontend)
        const clerkUserId = req.headers['x-clerk-user-id'] as string;
        if (clerkUserId) {
            // First, try to find as a merchant (owner)
            const merchant = await prisma.merchants.findUnique({
                where: { clerk_user_id: clerkUserId }
            });
            if (merchant) {
                req.merchant = buildMerchantPayload(merchant, 'owner');
                req.teamMember = null;
                return next();
            }

            // Not a merchant owner — check if they are a team member
            const teamMember = await prisma.team_members.findUnique({
                where: { clerk_user_id: clerkUserId },
                include: { merchants: true }
            });

            if (teamMember && teamMember.is_active && teamMember.merchants) {
                req.merchant = buildMerchantPayload(teamMember.merchants, teamMember.role || 'member');
                req.teamMember = {
                    id: teamMember.id,
                    email: teamMember.email,
                    name: teamMember.name,
                    role: teamMember.role,
                };
                console.log(`[Auth Middleware] Team member ${teamMember.email} identified for merchant ${teamMember.merchants.id}`);
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
                req.merchant = buildMerchantPayload(merchant, 'owner');
                req.teamMember = null;
            }
        } else if (clerkUserId) {
            // Try merchant first
            const merchant = await prisma.merchants.findUnique({
                where: { clerk_user_id: clerkUserId }
            });
            if (merchant) {
                req.merchant = buildMerchantPayload(merchant, 'owner');
                req.teamMember = null;
            } else {
                // Try team member
                const teamMember = await prisma.team_members.findUnique({
                    where: { clerk_user_id: clerkUserId },
                    include: { merchants: true }
                });
                if (teamMember && teamMember.is_active && teamMember.merchants) {
                    req.merchant = buildMerchantPayload(teamMember.merchants, teamMember.role || 'member');
                    req.teamMember = {
                        id: teamMember.id,
                        email: teamMember.email,
                        name: teamMember.name,
                        role: teamMember.role,
                    };
                }
            }
        }
    } catch (error) {
        console.error('[Auth Middleware] Optional merchant error:', error);
    }
    next();
}
