import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Middleware to verify that the webhook request came from Shopify.
 */
export const verifyShopifyHmac = (req: Request, res: Response, next: NextFunction) => {
    const hmacHeader = req.headers['x-shopify-hmac-sha256'] as string;
    const shopifySecret = process.env.SHOPIFY_API_SECRET;

    if (!shopifySecret) {
        console.error('[Security] ❌ SHOPIFY_API_SECRET is not defined in environment variables.');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (!hmacHeader) {
        console.warn('[Security] ⚠️ Missing X-Shopify-Hmac-Sha256 header.');
        return res.status(401).json({ error: 'Unauthorized: Missing HMAC header' });
    }

    // Shopify webhooks send raw body. We need to hash it with our secret.
    // Note: express.json() might have already parsed the body. 
    // In production, you might need a custom rawBody parser for this.
    // For now, we'll try with stringified body if available.

    const bodyString = JSON.stringify(req.body);
    const hash = crypto
        .createHmac('sha256', shopifySecret)
        .update(bodyString, 'utf8')
        .digest('base64');

    if (hash === hmacHeader) {
        return next();
    } else {
        console.warn('[Security] ❌ HMAC mismatch. Potential malicious request blocked.');
        return res.status(401).json({ error: 'Unauthorized: HMAC verification failed' });
    }
};
