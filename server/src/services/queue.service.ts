import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
});

// Initialize the BullMQ queue
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
    }
};
