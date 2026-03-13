import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ai-upsell-engine.onrender.com/api/v1';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
    },
});

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
