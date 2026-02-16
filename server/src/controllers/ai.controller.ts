import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import prisma from '../lib/prisma';

/**
 * Controller for AI-driven operations.
 * Designed for production-level reliability and clean separation of concerns.
 */
export const aiController = {
    /**
     * Retrieves status and available models from the local AI core
     */
    async getModels(req: Request, res: Response) {
        try {
            const models = await aiService.listLocalModels();
            res.status(200).json({
                status: 'operational',
                engine: 'Velocity AI v1',
                ...models
            });
        } catch (error: any) {
            res.status(503).json({ error: 'AI Core Unavailable', details: error.message });
        }
    },

    /**
     * Main recommendation pipeline: Triggers AI reasoning to find the best upsell
     */
    async getRecommendation(req: Request, res: Response) {
        try {
            // 1. Fetch available products from DB (Potential candidates)
            const allProducts = await prisma.products.findMany({
                orderBy: { created_at: 'desc' }
            });

            if (allProducts.length < 2) {
                return res.status(400).json({
                    error: 'Insufficient Inventory',
                    message: 'At least 2 products are required for cross-sells.'
                });
            }

            // 2. Logic: Assume first product is what user just bought (Trigger)
            // In production, this triggerId would come from the Request body
            const triggerProduct = allProducts[0];
            const candidates = allProducts.slice(1);

            // 3. Delegation: Ask AI Service for a smart recommendation
            const recommendation = await aiService.getSmartRecommendation(triggerProduct, candidates);

            // 4. Persistence: Log the upsell event for analytics tracking
            const event = await prisma.upsell_events.create({
                data: {
                    user_id: 1, // Global Admin/Default User for now
                    order_id: null, // Before order completion
                    upsell_product_id: recommendation.recommended_product_id,
                    discount_percent: recommendation.discount_percent,
                    expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000), // Valid for 1 hour
                    converted: false
                }
            });

            // 5. Response: Return structured data for the frontend/SDK
            res.status(200).json({
                success: true,
                trigger_context: {
                    id: triggerProduct.id,
                    name: triggerProduct.name,
                },
                recommendation: {
                    ...recommendation,
                    event_id: event.id
                }
            });

        } catch (error: any) {
            console.error('[AI Controller] Pipeline Exception:', error);
            res.status(500).json({
                error: 'Internal Logic Error',
                message: 'Failed to generate autonomous recommendation.'
            });
        }
    }
};
