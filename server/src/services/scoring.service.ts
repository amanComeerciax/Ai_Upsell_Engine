import { Product } from '../types/ai.types';

export interface ScoredProduct extends Product {
    score: number;
    reason: string;
}

// ─── Feature keyword groups ────────────────────────────────────────────────────
// Products that share keywords from the same group are semantically related
const FEATURE_GROUPS: string[][] = [
    // Connectivity
    ['wireless', 'bluetooth', 'wifi', 'wi-fi', 'cordless', 'usb', 'usb-c', 'charging'],
    // Gaming
    ['gaming', 'game', 'gamer', 'esport', 'rgb', 'mechanical', 'headset', 'controller'],
    // Audio
    ['audio', 'sound', 'speaker', 'headphone', 'earphone', 'noise-cancelling', 'surround', 'bass', 'music'],
    // Photography / Video
    ['camera', 'photo', 'video', '4k', 'lens', 'tripod', 'recording', 'dash cam', 'webcam'],
    // Kitchen
    ['kitchen', 'cooking', 'baking', 'cutting', 'chopping', 'coffee', 'brewing', 'food prep'],
    // Fitness / Sports
    ['fitness', 'workout', 'exercise', 'gym', 'yoga', 'running', 'training', 'weights', 'cardio'],
    // Outdoor / Adventure
    ['outdoor', 'hiking', 'camping', 'trekking', 'travel', 'adventure', 'waterproof'],
    // Office / Productivity
    ['laptop', 'desk', 'office', 'work', 'study', 'ergonomic', 'monitor', 'keyboard', 'mouse', 'hub'],
    // Home / Decor
    ['home', 'decor', 'room', 'living', 'bedroom', 'kitchen', 'storage', 'organizer'],
    // Materials
    ['stainless', 'steel', 'aluminum', 'aluminium', 'wood', 'bamboo', 'silicone', 'leather', 'glass', 'ceramic', 'carbon'],
    // Wellness / Health
    ['health', 'wellness', 'meditation', 'sleep', 'supplement', 'vitamin', 'herbal'],
    // Skincare / Beauty
    ['skincare', 'beauty', 'moisturizer', 'serum', 'face', 'hair', 'nail', 'makeup'],
    // Eco / Sustainable
    ['eco', 'sustainable', 'organic', 'natural', 'biodegradable', 'reusable'],
];

// ─── Category complement pairs ─────────────────────────────────────────────────
const CATEGORY_PAIRS: Record<string, string[]> = {
    'beauty': ['beauty', 'skincare', 'health', 'wellness', 'accessories', 'nail care', 'hair care', 'makeup'],
    'skincare': ['beauty', 'skincare', 'health', 'wellness', 'accessories'],
    'nail care': ['beauty', 'skincare', 'nail care', 'accessories', 'health'],
    'hair care': ['beauty', 'hair care', 'accessories', 'skincare'],
    'makeup': ['beauty', 'skincare', 'makeup', 'accessories'],
    'health': ['beauty', 'health', 'wellness', 'skincare', 'fitness'],
    'wellness': ['health', 'wellness', 'beauty', 'fitness', 'accessories'],
    'fitness': ['health', 'wellness', 'fitness', 'accessories', 'footwear', 'apparel', 'Sports & Outdoors'],
    'apparel': ['accessories', 'footwear', 'apparel', 'bags', 'jewelry'],
    'footwear': ['apparel', 'accessories', 'footwear', 'bags'],
    'accessories': ['apparel', 'footwear', 'accessories', 'bags', 'jewelry', 'watches'],
    'bags': ['accessories', 'apparel', 'footwear', 'bags', 'travel'],
    'jewelry': ['accessories', 'apparel', 'jewelry', 'watches'],
    'watches': ['accessories', 'jewelry', 'watches', 'apparel'],
    'electronics': ['accessories', 'cables', 'cases', 'gaming', 'electronics', 'Electronics'],
    'Electronics': ['accessories', 'cables', 'electronics', 'gaming', 'Electronics'],
    'gaming': ['electronics', 'gaming', 'accessories', 'Electronics'],
    'home': ['home decor', 'home', 'kitchen', 'beauty', 'wellness', 'Home & Kitchen'],
    'home decor': ['home', 'home decor', 'kitchen', 'accessories'],
    'kitchen': ['home', 'kitchen', 'home decor', 'Home & Kitchen'],
    'Home & Kitchen': ['home', 'kitchen', 'home decor', 'Home & Kitchen', 'accessories'],
    'Sports & Outdoors': ['fitness', 'wellness', 'health', 'accessories', 'apparel', 'Sports & Outdoors'],
    'travel': ['accessories', 'electronics', 'bags', 'travel', 'apparel'],
    'general': ['accessories', 'general'],
};

export class ScoringService {

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Extract a clean token set from a comma/space separated string */
    private tokenize(text: string | null | undefined): Set<string> {
        if (!text) return new Set();
        return new Set(
            text.toLowerCase()
                .replace(/[^a-z0-9\s,-]/g, ' ')
                .split(/[\s,]+/)
                .map(t => t.trim())
                .filter(t => t.length > 2)
        );
    }

    /** Find how many feature-groups are shared between two token sets */
    private featureGroupOverlap(setA: Set<string>, setB: Set<string>): number {
        let sharedGroups = 0;
        for (const group of FEATURE_GROUPS) {
            const aHas = group.some(kw => setA.has(kw) || [...setA].some(t => t.includes(kw)));
            const bHas = group.some(kw => setB.has(kw) || [...setB].some(t => t.includes(kw)));
            if (aHas && bHas) sharedGroups++;
        }
        return sharedGroups;
    }

    /** Jaccard similarity between two sets (0–1) */
    private jaccard(setA: Set<string>, setB: Set<string>): number {
        if (setA.size === 0 && setB.size === 0) return 0;
        let intersection = 0;
        setA.forEach(v => { if (setB.has(v)) intersection++; });
        const union = setA.size + setB.size - intersection;
        return union === 0 ? 0 : intersection / union;
    }

    private normalizeCategory(cat: string | null | undefined): string {
        return (cat || 'general').toLowerCase().trim();
    }

    // ── Main Scoring Function ─────────────────────────────────────────────────

    calculateScore(triggerProduct: Product, candidate: Product, interests?: string[]): number {
        let score = 0;
        const reasons: string[] = [];

        // ── SIGNAL 1: Tag DNA Matching ─────────────────────────────────────
        const triggerTags = this.tokenize(triggerProduct.tags);
        const candidateTags = this.tokenize(candidate.tags);

        if (triggerTags.size > 0 && candidateTags.size > 0) {
            const tagJaccard = this.jaccard(triggerTags, candidateTags);
            const tagBonus = Math.round(tagJaccard * 80); // up to +80 for perfect tag match
            score += tagBonus;
            if (tagBonus > 20) reasons.push(`tag-match:${Math.round(tagJaccard * 100)}%`);
        }

        // ── SIGNAL 2: Feature Group Overlap (semantic clusters) ───────────
        const triggerAll = new Set([
            ...this.tokenize(triggerProduct.tags),
            ...this.tokenize(triggerProduct.description),
            ...this.tokenize(triggerProduct.name),
        ]);
        const candidateAll = new Set([
            ...this.tokenize(candidate.tags),
            ...this.tokenize(candidate.description),
            ...this.tokenize(candidate.name),
        ]);

        const groupOverlap = this.featureGroupOverlap(triggerAll, candidateAll);
        const groupBonus = groupOverlap * 18; // +18 per shared feature group
        score += groupBonus;
        if (groupBonus > 0) reasons.push(`feature-groups:${groupOverlap}`);

        // ── SIGNAL 3: Description Keyword Overlap ─────────────────────────
        const triggerDesc = this.tokenize(triggerProduct.description);
        const candidateDesc = this.tokenize(candidate.description);
        if (triggerDesc.size > 0 && candidateDesc.size > 0) {
            const descOverlap = this.jaccard(triggerDesc, candidateDesc);
            const descBonus = Math.round(descOverlap * 30); // up to +30
            score += descBonus;
        }

        // ── SIGNAL 4: Category Pairs (preserved from original) ────────────
        const triggerCat = this.normalizeCategory(triggerProduct.category);
        const candidateCat = this.normalizeCategory(candidate.category);

        if (triggerCat === candidateCat && triggerCat !== 'general') {
            score += 50; // Same category
            reasons.push('same-category');
        } else {
            const goodPairs = CATEGORY_PAIRS[triggerCat] || CATEGORY_PAIRS[triggerProduct.category || ''] || [];
            const isComplement = goodPairs.some(p => p.toLowerCase() === candidateCat || p === candidate.category);
            if (isComplement) {
                score += 30;
                reasons.push('complementary-category');
            } else {
                score -= 20; // Unrelated category mild penalty
            }
        }

        // ── SIGNAL 5: User Interest Bonus ─────────────────────────────────
        if (interests && interests.length > 0) {
            const normalizedInterests = interests.map(i => i.toLowerCase().trim());
            const interestMatch = normalizedInterests.some(interest =>
                candidateCat.includes(interest) ||
                interest.includes(candidateCat) ||
                this.tokenize(interest).size > 0 && [...this.tokenize(interest)].some(t => candidateAll.has(t))
            );
            if (interestMatch) {
                console.log(`[Scoring] Interest Bonus! Candidate ${candidate.name} matches user interest.`);
                score += 40;
                reasons.push('interest-match');
            }
        }

        // ── SIGNAL 6: Price Strategy ──────────────────────────────────────
        const triggerPrice = Number(triggerProduct.price) || 1;
        const candidatePrice = Number(candidate.price) || 1;
        const priceRatio = candidatePrice / triggerPrice;

        if (priceRatio <= 1.5 && priceRatio >= 0.2) {
            score += 25; // Impulse-friendly price range
            if (priceRatio <= 1.0) score += 10; // Slightly cheaper = better
        } else if (priceRatio > 5) {
            score -= 40; // Way too expensive
        } else if (priceRatio < 0.1) {
            score -= 15; // Way too cheap
        }

        return score;
    }

    // ── Rank Candidates ───────────────────────────────────────────────────────

    rankCandidates(triggerProduct: Product, candidates: Product[], interests?: string[]): ScoredProduct[] {
        const ranked = candidates
            .filter(c => c.id !== triggerProduct.id) // Never recommend the same product
            .map(candidate => ({
                ...candidate,
                score: this.calculateScore(triggerProduct, candidate, interests),
                reason: 'Feature-based match'
            }))
            .sort((a, b) => b.score - a.score);

        // Log top 3 for debugging
        console.log(`[Scoring] Top picks for ${triggerProduct.name} (customer interests: ${interests?.join(', ') || 'none'}):`);
        ranked.slice(0, 3).forEach(r =>
            console.log(`  - ${r.name}: Score ${r.score} (${r.category})`)
        );

        return ranked;
    }
}

export const scoringService = new ScoringService();
