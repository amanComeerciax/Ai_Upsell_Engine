import axios from 'axios';
import { RecommendationResponse, Product } from '../types/ai.types';
import { scoringService } from './scoring.service';

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const DEFAULT_MODEL = 'dolphin-llama3:latest';

export class AIService {
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
     */
    async getSmartRecommendation(triggerProduct: Product, candidates: Product[]): Promise<RecommendationResponse> {
        // 1. Scoring Engine selects the BEST candidate based on business logic
        const ranked = scoringService.rankCandidates(triggerProduct, candidates);
        const winner = ranked[0];

        if (!winner) throw new Error('No candidates found');

        // 2. CHECK CACHE: If we already have a pitch for this pair, return it INSTANTLY
        const cacheKey = `rec_${triggerProduct.id}_${winner.id}`;
        if (this.recommendationCache.has(cacheKey)) {
            console.log(`[AI Service] ⚡ Cache HIT for ${cacheKey}`);
            return this.recommendationCache.get(cacheKey)!;
        }

        console.log(`[AI Service] 🤖 Cache MISS. Generating AI pitch for ${triggerProduct.name} -> ${winner.name}...`);

        try {
            // 3. AI acts as a Copywriter to create a persuasive pitch for the winner
            const prompt = `
You are a High-Conversion Marketing Copywriter for an E-commerce store.
A customer just bought: "${triggerProduct.name}".
We have decided to offer them: "${winner.name}" as an upsell.

Task:
Write a brief, catchy one-sentence "Reason" why these products go perfect together. Use a friendly, persuasive tone. 
Also suggest a discount (5, 10, or 15) as a percentage.

Output Format (STRICT JSON):
{
    "marketing_pitch": "Your one sentence pitch here",
    "discount_percent": number
}
            `;

            const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
                model: DEFAULT_MODEL,
                prompt,
                stream: false,
                format: 'json'
            });

            const result = JSON.parse(response.data.response);

            const finalResponse: RecommendationResponse = {
                recommended_product_id: winner.id,
                recommended_product_name: winner.name || 'Unknown',
                reason: result.marketing_pitch || 'Goes perfectly with your purchase!',
                discount_percent: result.discount_percent || 10
            };

            // 4. SAVE TO CACHE
            this.recommendationCache.set(cacheKey, finalResponse);
            return finalResponse;

        } catch (error) {
            console.error('[AI Service] Hybrid Recommendation Error:', error);
            // Fallback to scoring engine winner (already calculated) if AI fails
            return {
                recommended_product_id: winner?.id || 0,
                recommended_product_name: winner?.name || 'Top Pick',
                reason: 'A perfect addition to your order!',
                discount_percent: 10
            };
        }
    }
}

export const aiService = new AIService();
