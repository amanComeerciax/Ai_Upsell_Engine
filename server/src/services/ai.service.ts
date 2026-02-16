import axios from 'axios';
import { RecommendationResponse, Product } from '../types/ai.types';

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const DEFAULT_MODEL = 'dolphin-llama3:latest';

export class AIService {
    /**
     * Lists all models available in the local Ollama instance
     */
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
     * Core logic to determine the best upsell product using LLM reasoning
     */
    async getSmartRecommendation(triggerProduct: Product, candidates: Product[]): Promise<RecommendationResponse> {
        try {
            const candidatesList = candidates
                .map(p => `- ${p.name} (Category: ${p.category}, Price: ₹${p.price})`)
                .join('\n');

            const prompt = `
You are the High-Velocity AI Upsell Engine. 
Context: A customer just placed an order for: "${triggerProduct.name}" (Category: ${triggerProduct.category}).

Available Inventory for Upsell:
${candidatesList}

Task:
1. Analyze the relationship between the trigger product and the candidates.
2. Select the most logical accessory or related product that increases the Total Order Value.
3. Provide a brief, persuasive reason for the merchant to understand the logic.
4. Suggest a discount (0, 5, 10, or 15 percent) to ensure high conversion.

Output Format:
Return ONLY a valid JSON object. No extra text.
{
    "recommended_product_name": "exact name from list",
    "reason": "short persuasive reason",
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

            // Refined Matching Logic: Case-insensitive and trimmed to handle AI hallucination in naming
            const recommendedName = (result.recommended_product_name || '').trim().toLowerCase();

            const selectedProduct = candidates.find(c => {
                const candidateName = (c.name || '').trim().toLowerCase();
                return candidateName === recommendedName || recommendedName.includes(candidateName) || candidateName.includes(recommendedName);
            }) || candidates[0];

            return {
                recommended_product_id: selectedProduct.id,
                recommended_product_name: selectedProduct.name || 'Unknown',
                reason: result.reason,
                discount_percent: result.discount_percent || 10
            };

        } catch (error) {
            console.error('[AI Service] Recommendation Logic Error:', error);
            throw new Error('AI failed to process recommendation');
        }
    }
}

export const aiService = new AIService();
