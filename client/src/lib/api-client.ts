import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ai-upsell-engine.onrender.com/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    },
});

// Simple in-memory cache for GET requests
const memoryCache: Record<string, { data: any, timestamp: number }> = {};

/**
 * Enhanced fetch with stale-while-revalidate behavior
 * @param url The endpoint to fetch
 * @param options Axios options
 * @param ttl Time to live in ms (default 5 minutes)
 */
export async function getCached<T = any>(url: string, ttl: number = 300000): Promise<T> {
    // Include user context in cache key to prevent cross-user leakage in SPA
    const userId = apiClient.defaults.headers.common['x-clerk-user-id'] || 'anonymous';
    const cacheKey = `${userId}:${url}`;
    
    const cached = memoryCache[cacheKey];
    const now = Date.now();

    // If we have a fresh cache, return it immediately
    if (cached && (now - cached.timestamp < ttl)) {
        console.log(`[API Cache] HIT: ${cacheKey}`);
        // Trigger a background refresh to keep data fresh (Revalidate)
        apiClient.get(url).then(res => {
            memoryCache[cacheKey] = { data: res.data, timestamp: Date.now() };
        }).catch(() => { });

        return cached.data;
    }

    // Otherwise fetch fresh
    const res = await apiClient.get(url);
    memoryCache[cacheKey] = { data: res.data, timestamp: Date.now() };
    return res.data;
}

/**
 * Manual cache invalidation (e.g. after a mutation)
 */
export function invalidateCache(url?: string) {
    if (url) {
        delete memoryCache[url];
    } else {
        Object.keys(memoryCache).forEach(key => delete memoryCache[key]);
    }
}

/**
 * Set the Clerk user ID for all API requests.
 * Called once after Clerk loads the user session.
 */
export function setClerkUserId(userId: string) {
    // If the user changed, clear the memory cache to be safe
    if (apiClient.defaults.headers.common['x-clerk-user-id'] !== userId) {
        invalidateCache();
    }
    apiClient.defaults.headers.common['x-clerk-user-id'] = userId;
}

/**
 * Set the merchant ID directly (for after registration)
 */
export function setMerchantId(merchantId: number) {
    apiClient.defaults.headers.common['x-merchant-id'] = merchantId.toString();
}

export default apiClient;
