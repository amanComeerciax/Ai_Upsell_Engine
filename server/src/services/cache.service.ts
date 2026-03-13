import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Shared Redis connection for caching (separate from BullMQ connections)
let isRedisAvailable = false;
const redis = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: 1, // Don't spam retries if it's down
    keyPrefix: 'cache:',
    reconnectOnError: () => false,
});

redis.on('connect', () => {
    isRedisAvailable = true;
    console.log('[Cache] ✅ Redis cache connected');
});

redis.on('error', (err) => {
    if (isRedisAvailable) {
        console.error('[Cache] ❌ Redis disconnected:', err.message);
        isRedisAvailable = false;
    }
});

export const cacheService = {
    /**
     * Get a cached value by key. Returns null on miss.
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redis.get(key);
            if (data) {
                console.log(`[Cache] HIT: ${key}`);
                return JSON.parse(data) as T;
            }
            console.log(`[Cache] MISS: ${key}`);
            return null;
        } catch (err) {
            console.error(`[Cache] GET error for ${key}:`, err);
            return null;
        }
    },

    /**
     * Set a value in cache with a TTL in seconds.
     */
    async set(key: string, data: any, ttlSeconds: number): Promise<void> {
        try {
            await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
            console.log(`[Cache] SET: ${key} (TTL: ${ttlSeconds}s)`);
        } catch (err) {
            console.error(`[Cache] SET error for ${key}:`, err);
        }
    },

    /**
     * Invalidate (delete) a specific cache key.
     */
    async invalidate(key: string): Promise<void> {
        try {
            await redis.del(key);
            console.log(`[Cache] DEL: ${key}`);
        } catch (err) {
            console.error(`[Cache] DEL error for ${key}:`, err);
        }
    },

    /**
     * Invalidate all keys matching a glob pattern.
     * Uses SCAN so it's production-safe (non-blocking).
     * Note: keyPrefix 'cache:' is auto-prepended by ioredis, so we need to handle that.
     */
    async invalidatePattern(pattern: string): Promise<void> {
        try {
            let cursor = '0';
            let totalDeleted = 0;
            // Since keyPrefix is set, SCAN searches within 'cache:' namespace automatically
            do {
                const [nextCursor, keys] = await redis.scan(
                    cursor, 'MATCH', pattern, 'COUNT', 100
                );
                cursor = nextCursor;
                if (keys.length > 0) {
                    // Keys returned by SCAN already have prefix stripped by ioredis
                    await Promise.all(keys.map(k => redis.del(k)));
                    totalDeleted += keys.length;
                }
            } while (cursor !== '0');

            if (totalDeleted > 0) {
                console.log(`[Cache] PATTERN DEL: ${pattern} (${totalDeleted} keys)`);
            }
        } catch (err) {
            console.error(`[Cache] PATTERN DEL error for ${pattern}:`, err);
        }
    },

    /**
     * Invalidate all caches for a specific merchant.
     * Called on mutations (new orders, conversions, product CRUD, syncs).
     */
    async invalidateMerchant(merchantId: number): Promise<void> {
        await this.invalidatePattern(`merchant:${merchantId}:*`);
    },

    /**
     * Build a merchant-scoped cache key.
     */
    key(merchantId: number | undefined, endpoint: string): string {
        return `merchant:${merchantId || 'global'}:${endpoint}`;
    }
};
