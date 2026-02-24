import { Product } from '../types/ai.types';

export interface ScoredProduct extends Product {
    score: number;
    reason: string;
}

export class ScoringService {
    /**
     * Bidirectional complementary category pairs.
     * Key = trigger category → values = good upsell categories (and vice versa).
     */
    private readonly CATEGORY_PAIRS: Record<string, string[]> = {
        // Beauty & Personal Care
        'beauty': ['beauty', 'skincare', 'health', 'wellness', 'accessories', 'nail care', 'hair care', 'makeup'],
        'skincare': ['beauty', 'skincare', 'health', 'wellness', 'accessories'],
        'nail care': ['beauty', 'skincare', 'nail care', 'accessories', 'health'],
        'hair care': ['beauty', 'hair care', 'accessories', 'skincare'],
        'makeup': ['beauty', 'skincare', 'makeup', 'accessories'],
        'health': ['beauty', 'health', 'wellness', 'skincare', 'fitness'],
        'wellness': ['health', 'wellness', 'beauty', 'fitness', 'accessories'],
        'fitness': ['health', 'wellness', 'fitness', 'accessories', 'footwear', 'apparel'],

        // Fashion
        'apparel': ['accessories', 'footwear', 'apparel', 'bags', 'jewelry'],
        'footwear': ['apparel', 'accessories', 'footwear', 'bags', 'socks'],
        'accessories': ['apparel', 'footwear', 'accessories', 'bags', 'jewelry', 'watches'],
        'bags': ['accessories', 'apparel', 'footwear', 'bags', 'travel'],
        'jewelry': ['accessories', 'apparel', 'jewelry', 'watches'],
        'watches': ['accessories', 'jewelry', 'watches', 'apparel'],
        'formal wear': ['accessories', 'footwear', 'formal wear', 'watches', 'bags'],

        // Electronics
        'electronics': ['accessories', 'cables', 'cases', 'gaming', 'electronics'],
        'gaming': ['electronics', 'gaming', 'accessories'],
        'cables': ['electronics', 'accessories', 'cables'],
        'cases': ['electronics', 'accessories', 'cases'],

        // Home & Lifestyle
        'home': ['home decor', 'home', 'kitchen', 'beauty', 'wellness'],
        'home decor': ['home', 'home decor', 'kitchen', 'accessories'],
        'kitchen': ['home', 'kitchen', 'home decor'],

        // Travel
        'travel': ['accessories', 'electronics', 'bags', 'travel', 'apparel'],

        // General fallback
        'general': ['accessories', 'general'],
    };

    /**
     * Normalizes a category string for matching.
     */
    private normalizeCategory(cat: string | null | undefined): string {
        return (cat || 'general').toLowerCase().trim();
    }

    /**
     * Scores a candidate product based on how well it fits as an upsell for the trigger product.
     */
    calculateScore(triggerProduct: Product, candidate: Product, interests?: string[]): number {
        let score = 0;
        const triggerCat = this.normalizeCategory(triggerProduct.category);
        const candidateCat = this.normalizeCategory(candidate.category);

        // ── 1. Category Relevance ─────────────────────────────────────────────
        if (triggerCat === candidateCat && triggerCat !== 'general') {
            // Same category = very strong signal (e.g. nail care → nail care)
            score += 60;
        } else {
            const goodPairs = this.CATEGORY_PAIRS[triggerCat] || [];
            if (goodPairs.includes(candidateCat)) {
                score += 40; // Complementary category
            } else {
                score -= 30; // Unrelated category penalty
            }
        }

        // ── 2. User Interests Bonus ───────────────────────────────────────────
        if (interests && interests.length > 0) {
            const normalizedInterests = interests.map(i => i.toLowerCase().trim());
            if (normalizedInterests.includes(candidateCat)) {
                console.log(`[Scoring] Interest Bonus! Candidate ${candidate.name} matches user interest.`);
                score += 50; // Big boost for products user has shown interest in before
            }
        }

        // ── 3. Price Strategy ─────────────────────────────────────────────────
        const triggerPrice = Number(triggerProduct.price) || 1;
        const candidatePrice = Number(candidate.price) || 1;
        const priceRatio = candidatePrice / triggerPrice;

        if (priceRatio <= 1.5 && priceRatio >= 0.2) {
            // Sweet spot: within 20%-150% of trigger price → impulse-friendly
            score += 30;
            if (priceRatio <= 1.0) score += 10; // Slightly cheaper = even better
        } else if (priceRatio > 5) {
            score -= 50; // Way too expensive (e.g. ₹50 nail kit → ₹5000 bag)
        } else if (priceRatio < 0.1) {
            score -= 20; // Way too cheap (feels low-value)
        } else {
            score -= 10; // Mildly out of range
        }

        return score;
    }

    /**
     * Ranks all candidates and returns the top scoring products.
     */
    rankCandidates(triggerProduct: Product, candidates: Product[], interests?: string[]): ScoredProduct[] {
        const ranked = candidates
            .map(candidate => ({
                ...candidate,
                score: this.calculateScore(triggerProduct, candidate, interests),
                reason: 'Algorithmic match'
            }))
            .sort((a, b) => b.score - a.score);

        // Logging the top 3 for debugging
        console.log(`[Scoring] Top picks for ${triggerProduct.name} (customer interests: ${interests?.join(', ') || 'none'}):`);
        ranked.slice(0, 3).forEach(r =>
            console.log(`  - ${r.name}: Score ${r.score} (${r.category})`)
        );

        return ranked;
    }
}

export const scoringService = new ScoringService();
