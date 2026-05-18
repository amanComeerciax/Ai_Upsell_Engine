import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const isTLS = REDIS_URL.startsWith('rediss://');
const connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null, // BullMQ requires null for workers
    enableReadyCheck: false,
    lazyConnect: false,
    ...(isTLS ? { tls: { rejectUnauthorized: false } } : {}),
});

connection.on('error', (err) => {
    console.error('[Queue] ❌ Redis connection error:', err.message);
});

connection.on('connect', () => {
    console.log('[Queue] ✅ Redis connected for BullMQ');
});

// Initialize the BullMQ queues
export const upsellQueue = new Queue('upsell-processing', {
    connection: connection as any,
    defaultJobOptions: {
        attempts: 3, // Retry failed jobs 3 times
        backoff: {
            type: 'exponential',
            delay: 5000, // Wait 5s before first retry
        },
        removeOnComplete: true, // Clean up successful jobs
        removeOnFail: false,    // Keep failed jobs for debugging
    },
});

export const cartQueue = new Queue('cart-abandonment', {
    connection: connection as any,
    defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'fixed', delay: 10000 },
        removeOnComplete: true,
        removeOnFail: false,
    },
});

export const queueService = {
    /**
     * Adds an order processing job to the queue
     */
    async addUpsellJob(orderData: any, merchantId: number | null, shopDomain: string) {
        try {
            // Use Shopify Order ID as the Job ID to prevent duplicates
            const jobId = `order-${orderData.id}`;

            const job = await upsellQueue.add('process-order', {
                orderData,
                merchantId,
                shopDomain,
                timestamp: new Date()
            }, { jobId });

            console.log(`[Queue Service] 📥 Job added: ${job.id} for Order: ${orderData.id}`);
            return job;
        } catch (error) {
            console.error('[Queue Service] ❌ Failed to add job to queue:', error);
            throw error;
        }
    },

    /**
     * Adds a cart abandonment check job with a delay (default 30 min)
     * If a job for this cart already exists, it's replaced (customer updated cart)
     */
    async addCartCheckJob(cartToken: string, merchantId: number, delayMs: number = 30 * 60 * 1000) {
        try {
            const jobId = `cart-${cartToken}`;

            // Remove existing job if any (customer updated their cart, reset the timer)
            const existing = await cartQueue.getJob(jobId);
            if (existing) {
                await existing.remove();
                console.log(`[Queue Service] 🔄 Reset cart check timer for: ${cartToken}`);
            }

            const job = await cartQueue.add('check-cart', {
                cartToken,
                merchantId,
                timestamp: new Date()
            }, {
                jobId,
                delay: delayMs,
            });

            const delayMin = Math.round(delayMs / 60000);
            console.log(`[Queue Service] 🛒 Cart check scheduled: ${cartToken} (fires in ${delayMin} min)`);
            return job;
        } catch (error) {
            console.error('[Queue Service] ❌ Failed to add cart check job:', error);
            throw error;
        }
    }
};
