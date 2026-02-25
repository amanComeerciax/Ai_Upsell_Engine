export interface Product {
    id: number;
    name: string | null;
    category: string | null;
    price: any; // Decimal type from Prisma
    // Optional enriched fields (populated by Prisma includes)
    description?: string | null;
    tags?: string | null;
    handle?: string | null;
    image_url?: string | null;
    shopify_id?: bigint | string | null;
    shopify_variant_id?: bigint | string | null;
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
