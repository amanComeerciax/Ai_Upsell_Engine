import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
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
    const cached = memoryCache[url];
    const now = Date.now();

    // If we have a fresh cache, return it immediately
    if (cached && (now - cached.timestamp < ttl)) {
        console.log(`[API Cache] HIT: ${url}`);
        // Trigger a background refresh to keep data fresh (Revalidate)
        apiClient.get(url).then(res => {
            memoryCache[url] = { data: res.data, timestamp: Date.now() };
        }).catch(() => { });

        return cached.data;
    }

    // Otherwise fetch fresh
    const res = await apiClient.get(url);
    memoryCache[url] = { data: res.data, timestamp: Date.now() };
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
    apiClient.defaults.headers.common['x-clerk-user-id'] = userId;
}

/**
 * Set the merchant ID directly (for after registration)
 */
export function setMerchantId(merchantId: number) {
    apiClient.defaults.headers.common['x-merchant-id'] = merchantId.toString();
}

export default apiClient;
