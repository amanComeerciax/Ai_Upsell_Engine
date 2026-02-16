export interface Product {
    id: number;
    name: string | null;
    category: string | null;
    price: any; // Decimal type from Prisma
}

export interface RecommendationResponse {
    recommended_product_id: number;
    recommended_product_name: string;
    reason: string;
    discount_percent: number;
}

export interface AIStatus {
    model: string;
    status: 'online' | 'offline';
    latency?: number;
}
