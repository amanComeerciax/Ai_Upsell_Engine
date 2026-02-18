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
     * Cache hierarchy: L1 (in-memory) → L2 (DB) → Ollama → Smart fallback
     */
    async getSmartRecommendation(triggerProduct: Product, candidates: Product[]): Promise<RecommendationResponse> {
        // 1. Scoring Engine selects the BEST candidate based on business logic
        const ranked = scoringService.rankCandidates(triggerProduct, candidates);
        const winner = ranked[0];

        if (!winner) throw new Error('No candidates found');

        const cacheKey = `rec_${triggerProduct.id}_${winner.id}`;

        // ── L1: In-memory cache (instant, same process) ──────────────────────
        if (this.recommendationCache.has(cacheKey)) {
            console.log(`[AI Service] ⚡ L1 Cache HIT for ${cacheKey}`);
            return this.recommendationCache.get(cacheKey)!;
        }

        // ── L2: DB cache (persistent across restarts) ─────────────────────────
        try {
            const dbCache = await (prisma as any).ai_pitch_cache.findUnique({
                where: { cache_key: cacheKey }
            });
            if (dbCache) {
                console.log(`[AI Service] 💾 L2 DB Cache HIT for ${cacheKey}`);
                const cached: RecommendationResponse = {
                    recommended_product_id: winner.id,
                    recommended_product_name: winner.name || 'Unknown',
                    reason: dbCache.pitch,
                    discount_percent: dbCache.discount_percent
                };
                this.recommendationCache.set(cacheKey, cached);
                return cached;
            }
        } catch (_) {
            // ai_pitch_cache table may not exist yet — fall through to Ollama
        }

        console.log(`[AI Service] 🤖 Cache MISS. Generating AI pitch for ${triggerProduct.name} -> ${winner.name}...`);

        // ── Smart fallback pitches (instant, no AI needed) ────────────────────
        const smartFallback = this.buildSmartFallback(triggerProduct, winner);

        try {
            // ── Ollama with strict timeout ────────────────────────────────────
            const prompt = `You are a High-Conversion Marketing Copywriter for an E-commerce store.
A customer just bought: "${triggerProduct.name}".
We have decided to offer them: "${winner.name}" as an upsell.

Task:
Write a brief, catchy one-sentence "Reason" why these products go perfect together. Use a friendly, persuasive tone. 
Also suggest a discount (5, 10, or 15) as a percentage.

Output Format (STRICT JSON):
{
    "marketing_pitch": "Your one sentence pitch here",
    "discount_percent": number
}`;

            const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
                model: DEFAULT_MODEL,
                prompt,
                stream: false,
                format: 'json'
            }, { timeout: OLLAMA_TIMEOUT_MS });

            const result = JSON.parse(response.data.response);

            const finalResponse: RecommendationResponse = {
                recommended_product_id: winner.id,
                recommended_product_name: winner.name || 'Unknown',
                reason: result.marketing_pitch || smartFallback.reason,
                discount_percent: result.discount_percent || 10
            };

            // Save to L1 + L2 cache
            this.recommendationCache.set(cacheKey, finalResponse);
            this.saveToDbCache(cacheKey, finalResponse.reason, finalResponse.discount_percent).catch(() => { });

            return finalResponse;

        } catch (error: any) {
            const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
            console.warn(`[AI Service] ${isTimeout ? '⏱️ Ollama timeout' : '❌ Ollama error'} — using smart fallback`);

            // Cache the fallback too so next request is instant
            this.recommendationCache.set(cacheKey, smartFallback);
            this.saveToDbCache(cacheKey, smartFallback.reason, smartFallback.discount_percent).catch(() => { });

            return smartFallback;
        }
    }

    /**
     * Builds a smart, category-aware fallback pitch without calling Ollama
     */
    private buildSmartFallback(trigger: Product, winner: Product): RecommendationResponse {
        const pitches: Record<string, string[]> = {
            Apparel: [
                `Complete your look — ${winner.name} pairs perfectly with your new ${trigger.name}!`,
                `Style upgrade: ${winner.name} is the ideal match for your ${trigger.name}.`,
            ],
            Accessories: [
                `Customers who bought ${trigger.name} love adding ${winner.name} to their order.`,
                `The perfect finishing touch — ${winner.name} complements your ${trigger.name} beautifully.`,
            ],
            Footwear: [
                `Step it up! ${winner.name} is the perfect pair for your ${trigger.name}.`,
                `Complete your outfit from head to toe with ${winner.name}.`,
            ],
        };

        const category = (winner as any).category || 'Apparel';
        const options = pitches[category] || pitches['Apparel'];
        const reason = options[Math.floor(Math.random() * options.length)];

        return {
            recommended_product_id: winner.id,
            recommended_product_name: winner.name || 'Top Pick',
            reason,
            discount_percent: 10
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
}

export const aiService = new AIService();


