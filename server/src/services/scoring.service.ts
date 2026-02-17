import { Product } from '../types/ai.types';

export interface ScoredProduct extends Product {
    score: number;
    reason: string;
}

export class ScoringService {
    /**
     * Scores a candidate product based on how well it fits as an upsell for the trigger product.
     */
    calculateScore(triggerProduct: Product, candidate: Product): number {
        let score = 0;
        const triggerCat = (triggerProduct.category || 'General').toLowerCase();
        const candidateCat = (candidate.category || 'General').toLowerCase();

        // 1. Category Matching (+50 points)
        if (triggerCat !== 'general' && triggerCat === candidateCat) {
            score += 50;
        }

        // 2. Price Strategy
        const triggerPrice = Number(triggerProduct.price);
        const candidatePrice = Number(candidate.price);

        if (candidatePrice < triggerPrice) {
            score += 30; // Impulse buy
            if (candidatePrice > triggerPrice * 0.5) {
                score += 10; // "Sweet spot" price
            }
        } else if (candidatePrice > triggerPrice * 5) {
            score -= 50; // Luxury penalty: Don't suggest a ₹1L iPhone for a ₹50 bag
        } else {
            score -= 20; // General more-expensive penalty
        }

        // 3. Complementary Product Patterns (Bonus +20)
        const pairs: Record<string, string[]> = {
            'electronics': ['accessories', 'cables', 'cases', 'gaming'],
            'apparel': ['accessories', 'footwear', 'travel'],
            'travel': ['accessories', 'electronics', 'home'],
            'home decor': ['home', 'beauty'],
            'general': ['accessories']
        };

        if (pairs[triggerCat]?.includes(candidateCat)) {
            score += 20;
        }

        return score;
    }

    /**
     * Ranks all candidates and returns the top scoring products.
     */
    rankCandidates(triggerProduct: Product, candidates: Product[]): ScoredProduct[] {
        const ranked = candidates
            .map(candidate => ({
                ...candidate,
                score: this.calculateScore(triggerProduct, candidate),
                reason: 'Algorithmic match'
            }))
            .sort((a, b) => b.score - a.score);

        // Logging the top 3 for debugging
        console.log(`[Scoring] Top picks for ${triggerProduct.name}:`);
        ranked.slice(0, 3).forEach(r => console.log(`- ${r.name}: Score ${r.score} (${r.category})`));

        return ranked;
    }
}

export const scoringService = new ScoringService();
