import axios from 'axios';
import { RecommendationResponse, Product } from '../types/ai.types';
import { scoringService } from './scoring.service';
import prisma from '../lib/prisma';

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const DEFAULT_MODEL = 'dolphin-llama3:latest';
const OLLAMA_TIMEOUT_MS = 8000; // 8s max — fall back to smart default if slower

export class AIService {
    // In-memory L1 cache (per process lifetime, instant)
    private recommendationCache = new Map<string, RecommendationResponse>();

    /**
     * Lists all models available in the local Ollama instance and calculates server telemetry
     */
    async listLocalModels() {
        const start = Date.now();
        try {
            const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 3000 });
            const latency = Date.now() - start;

            return {
                models: response.data.models || [],
                telemetry: {
                    latency: `${latency}ms`,
                    status: 'online',
                    baseUrl: OLLAMA_BASE_URL,
                    activeModel: DEFAULT_MODEL
                }
            };
        } catch (error: any) {
            console.error('[AI Service] List Models Error:', error.message);
            return {
                models: [],
                telemetry: {
                    latency: '0ms',
                    status: 'offline',
                    baseUrl: OLLAMA_BASE_URL,
                    activeModel: DEFAULT_MODEL
                }
            };
        }
    }

    /**
     * Hybrid logic: Scoring Engine selects, AI Engine persuades.
     * Cache hierarchy: L1 (in-memory) -> L2 (DB) -> Ollama -> Smart fallback
     */
    async getSmartRecommendation(
        triggerProduct: Product,
        candidates: Product[],
        context?: { location?: string; interests?: string[] },
        testGroup: 'A' | 'B' = 'A',
        discountRange?: { min: number; max: number }
    ): Promise<RecommendationResponse> {
        const dRange = discountRange || { min: 5, max: 25 };

        // 1. Scoring Engine selects the BEST candidate based on context & business logic
        const ranked = scoringService.rankCandidates(triggerProduct, candidates, context?.interests);
        const winner = ranked[0];

        if (!winner) throw new Error('No candidates found');

        // Include context in cache key to ensure personalization is cached correctly
        const contextKey = context ? `_${context.location || ''}_${context.interests?.join(',') || ''}` : '';
        const groupKey = `_group_${testGroup}`;
        const cacheKey = `rec_${triggerProduct.id}_${winner.id}${contextKey}${groupKey}`;

        // ── L1: In-memory cache (instant, same process) ──────────────────────
        if (this.recommendationCache.has(cacheKey)) {
            console.log(`[AI Service] ⚡ L1 Cache HIT for ${cacheKey}`);
            return this.recommendationCache.get(cacheKey)!;
        }

        // ── L2: DB cache (persistent across restarts) ─────────────────────────
        const cached = await this.getFromDbCache(cacheKey, winner.id, winner.name || 'Unknown');
        if (cached) {
            this.recommendationCache.set(cacheKey, cached); // Populate L1 from L2
            return cached;
        }

        // If Group B, skip AI and return generic fallback immediately
        if (testGroup === 'B') {
            console.log(`[AI Service] 🧪 Group B (Control). Returning generic pitch.`);
            const genericFallback = this.buildSmartFallback(triggerProduct, winner, undefined, 'B', dRange);
            this.recommendationCache.set(cacheKey, genericFallback);
            this.saveToDbCache(cacheKey, genericFallback.reason, genericFallback.discount_percent).catch(() => { });
            return genericFallback;
        }

        console.log(`[AI Service] ⚡ Cache MISS. Returning smart fallback immediately, warming AI cache in background...`);

        // ── Return smart fallback IMMEDIATELY (< 50ms, no Ollama wait) ──────────
        const smartFallback = this.buildSmartFallback(triggerProduct, winner, context, testGroup, dRange);
        this.recommendationCache.set(cacheKey, smartFallback);
        this.saveToDbCache(cacheKey, smartFallback.reason, smartFallback.discount_percent).catch(() => { });

        // ── Warm the cache with AI pitch in the background (fire-and-forget) ───
        this.warmCacheWithAI(triggerProduct, winner, context, cacheKey, smartFallback.discount_percent, dRange);

        return smartFallback;
    }

    /**
     * Returns top N recommendations for the carousel widget.
     * Each product gets an instant smart fallback; Ollama warms cache in background.
     */
    async getTopRecommendations(
        triggerProduct: Product,
        candidates: Product[],
        context?: { location?: string; interests?: string[] },
        testGroup: 'A' | 'B' = 'A',
        n: number = 3
    ): Promise<RecommendationResponse[]> {
        const ranked = scoringService.rankCandidates(triggerProduct, candidates, context?.interests);
        const topN = ranked.slice(0, Math.min(n, ranked.length));
        const results: RecommendationResponse[] = [];

        for (const winner of topN) {
            const contextKey = context ? `_${context.location || ''}_${context.interests?.join(',') || ''}` : '';
            const cacheKey = `rec_${triggerProduct.id}_${winner.id}${contextKey}_group_${testGroup}`;

            // L1 cache hit — instant
            if (this.recommendationCache.has(cacheKey)) {
                results.push(this.recommendationCache.get(cacheKey)!);
                continue;
            }

            // L2 DB cache hit
            const dbCached = await this.getFromDbCache(cacheKey, winner.id, winner.name || 'Unknown');
            if (dbCached) {
                this.recommendationCache.set(cacheKey, dbCached);
                results.push(dbCached);
                continue;
            }

            // Group B: generic pitch, no AI
            if (testGroup === 'B') {
                const generic = this.buildSmartFallback(triggerProduct, winner, undefined, 'B');
                this.recommendationCache.set(cacheKey, generic);
                this.saveToDbCache(cacheKey, generic.reason, generic.discount_percent).catch(() => { });
                results.push(generic);
                continue;
            }

            // Group A: instant smart fallback + background AI warm
            const fallback = this.buildSmartFallback(triggerProduct, winner, context, testGroup);
            this.recommendationCache.set(cacheKey, fallback);
            this.saveToDbCache(cacheKey, fallback.reason, fallback.discount_percent).catch(() => { });
            this.warmCacheWithAI(triggerProduct, winner, context, cacheKey, fallback.discount_percent);
            results.push(fallback);
        }

        return results;
    }

    /**
     * Calls Ollama asynchronously to upgrade the cached pitch.

     * Never blocks the main request — runs entirely in the background.
     */
    private async warmCacheWithAI(
        triggerProduct: Product,
        winner: Product,
        context: { location?: string; interests?: string[] } | undefined,
        cacheKey: string,
        fallbackDiscount: number,
        discountRange?: { min: number; max: number }
    ): Promise<void> {
        try {
            const dRange = discountRange || { min: 5, max: 25 };
            const locationStr = context?.location ? ` The customer is located in ${context.location}.` : '';
            const interestStr = context?.interests?.length
                ? ` Their interests based on past purchases include: ${context.interests.join(', ')}.`
                : '';

            const prompt = `You are a High-Conversion Marketing Copywriter for an E-commerce store.
A customer just bought: "${triggerProduct.name}".
Product Details: ${triggerProduct.description || 'No description available'}
Tags: ${triggerProduct.tags || 'none'}
${locationStr}${interestStr}

We have decided to offer them: "${winner.name}" as an upsell.
Upsell Details: ${winner.description || 'No description available'}
Upsell Tags: ${winner.tags || 'none'}

Task:
Write a brief, catchy one-sentence "Reason" why these products go perfect together. 
Make it PERSONALIZED using the customer's location or interests if provided. 
Use a friendly, persuasive tone. 
Also suggest a discount between ${dRange.min}% and ${dRange.max}% as a percentage.

Output Format (STRICT JSON):
{
    "marketing_pitch": "Your personalized one sentence pitch here",
    "discount_percent": number
}`;

            const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
                model: DEFAULT_MODEL,
                prompt,
                stream: false,
                format: 'json'
            }, { timeout: OLLAMA_TIMEOUT_MS });

            const result = JSON.parse(response.data.response);

            const aiResponse: RecommendationResponse = {
                recommended_product_id: winner.id,
                recommended_product_name: winner.name || 'Unknown',
                reason: result.marketing_pitch || '',
                discount_percent: result.discount_percent || fallbackDiscount
            };

            if (aiResponse.reason) {
                console.log(`[AI Service] 🎯 AI pitch ready for "${winner.name}" — cache upgraded!`);
                this.recommendationCache.set(cacheKey, aiResponse);
                this.saveToDbCache(cacheKey, aiResponse.reason, aiResponse.discount_percent).catch(() => { });
            }
        } catch {
            console.log(`[AI Service] ℹ️ Background AI warming skipped (Ollama unavailable). Fallback stays in cache.`);
        }
    }

    /**
     * Builds a smart, category-aware fallback pitch without calling Ollama
     */
    private buildSmartFallback(
        trigger: Product,
        winner: Product,
        context?: { location?: string; interests?: string[] },
        testGroup: 'A' | 'B' = 'A',
        discountRange?: { min: number; max: number }
    ): RecommendationResponse {
        const dRange = discountRange || { min: 5, max: 25 };

        // If Group B, we keep it purely generic
        const locationPrefix = (testGroup === 'A' && context?.location) ? `Since you're in ${context.location.split(',')[0]}, ` : '';
        const interestSuffix = (testGroup === 'A' && context?.interests?.length) ? ` especially given your interest in ${context.interests[0]}` : '';

        const pitches: Record<string, string[]> = {
            Apparel: [
                `${locationPrefix}Complete your look — ${winner.name} pairs perfectly with your new ${trigger.name}${interestSuffix}!`,
                `Style upgrade: ${winner.name} is the ideal match for your ${trigger.name}${interestSuffix}.`,
            ],
            Accessories: [
                `${locationPrefix}Customers who bought ${trigger.name} love adding ${winner.name} to their order${interestSuffix}.`,
                `${locationPrefix}The perfect finishing touch — ${winner.name} complements your ${trigger.name} beautifully.`,
            ],
            Footwear: [
                `${locationPrefix}Step it up! ${winner.name} is the perfect pair for your ${trigger.name}${interestSuffix}.`,
                `Complete your outfit from head to toe with ${winner.name}.`,
            ],
        };

        const category = winner.category || 'Apparel';
        const options = pitches[category] || pitches['Apparel'];
        const reason = options[Math.floor(Math.random() * options.length)];

        // Smart discount: pick a value within merchant's allowed range
        // Use midpoint of range as sensible default, with slight randomization
        const mid = Math.round((dRange.min + dRange.max) / 2);
        const step = 5;
        const possibleDiscounts: number[] = [];
        for (let d = dRange.min; d <= dRange.max; d += step) {
            possibleDiscounts.push(d);
        }
        if (possibleDiscounts.length === 0) possibleDiscounts.push(mid);
        const discount = possibleDiscounts[Math.floor(Math.random() * possibleDiscounts.length)];

        return {
            recommended_product_id: winner.id,
            recommended_product_name: winner.name || 'Top Pick',
            reason,
            discount_percent: discount
        };
    }

    /**
     * Persists a pitch to the DB cache table (fire-and-forget)
     */
    private async saveToDbCache(cacheKey: string, pitch: string, discountPercent: number) {
        try {
            await (prisma as any).ai_pitch_cache.upsert({
                where: { cache_key: cacheKey },
                update: { pitch, discount_percent: discountPercent, updated_at: new Date() },
                create: { cache_key: cacheKey, pitch, discount_percent: discountPercent }
            });
        } catch (_) {
            // Table doesn't exist yet — silently skip
        }
    }

    /**
     * Retrieves a pitch from the DB cache
     */
    private async getFromDbCache(cacheKey: string, winnerId: number, winnerName: string): Promise<RecommendationResponse | null> {
        try {
            const dbCache = await (prisma as any).ai_pitch_cache.findUnique({
                where: { cache_key: cacheKey }
            });
            if (dbCache) {
                console.log(`[AI Service] 💾 L2 DB Cache HIT for ${cacheKey}`);
                return {
                    recommended_product_id: winnerId,
                    recommended_product_name: winnerName,
                    reason: dbCache.pitch,
                    discount_percent: dbCache.discount_percent
                };
            }
        } catch (_) {
            // Table doesn't exist yet
        }
        return null;
    }
}

export const aiService = new AIService();
