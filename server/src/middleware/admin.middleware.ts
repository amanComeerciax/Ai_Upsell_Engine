import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to restrict access to Admins only.
 * Must be used AFTER identifyMerchant middleware.
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const merchant = req.merchant;

    if (!merchant) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (merchant.role !== 'admin') {
        console.warn(`[Admin Middleware] Unprivileged access attempt from Merchant ID: ${merchant.id}`);
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    next();
};
