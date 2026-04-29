import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to restrict access to Merchant Owners only.
 * Must be used AFTER identifyMerchant middleware.
 * Team members (role='member') will be blocked from protected routes like settings, billing, team management.
 */
export const isOwner = (req: Request, res: Response, next: NextFunction) => {
    const merchant = req.merchant;

    if (!merchant) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // If the user is a team member (not the owner), block access
    if ((req as any).teamMember) {
        console.warn(`[Team Middleware] Team member ${(req as any).teamMember.id} blocked from owner-only route`);
        return res.status(403).json({ error: 'Access denied. Only the store owner can perform this action.' });
    }

    next();
};
