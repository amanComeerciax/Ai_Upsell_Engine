import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/react';
import apiClient, { setClerkUserId, setMerchantId } from '@/lib/api-client';

interface MerchantProfile {
    id: number;
    clerk_user_id: string;
    business_name: string | null;
    email: string | null;
    shopify_shop_name: string | null;
    shopify_access_token: string | null;
    webhook_id: string | null;
    plan: string | null;
    email_subject: string | null;
    email_body: string | null;
    discount_min: number;
    discount_max: number;
    stats: {
        products: number;
        orders: number;
        upsells: number;
    };
    shopify_connected: boolean;
}

interface MerchantContextType {
    merchant: MerchantProfile | null;
    loading: boolean;
    error: string | null;
    isOnboarded: boolean;
    isShopifyConnected: boolean;
    refreshMerchant: () => Promise<void>;
    connectShopify: (shopName: string, accessToken: string) => Promise<boolean>;
    syncProducts: () => Promise<{ count: number } | null>;
    disconnectShopify: () => Promise<boolean>;
    updateSettings: (settings: { email_subject?: string; email_body?: string; discount_min?: number; discount_max?: number }) => Promise<boolean>;
}

const MerchantContext = createContext<MerchantContextType>({
    merchant: null,
    loading: true,
    error: null,
    isOnboarded: false,
    isShopifyConnected: false,
    refreshMerchant: async () => { },
    connectShopify: async () => false,
    syncProducts: async () => null,
    disconnectShopify: async () => false,
    updateSettings: async () => false,
});

export function MerchantProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded: isClerkLoaded } = useUser();
    const [merchant, setMerchant] = useState<MerchantProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasInitialized = React.useRef(false);

    // Auto-register merchant when Clerk user is available
    const initMerchant = useCallback(async () => {
        if (!isClerkLoaded || !user || hasInitialized.current) {
            if (!isClerkLoaded || !user) setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            hasInitialized.current = true;

            // Set Clerk user ID for all API calls
            setClerkUserId(user.id);

            // Step 1: Register (or get existing) merchant
            const registerRes = await apiClient.post('/merchant/register', {
                clerk_user_id: user.id,
                business_name: user.fullName || user.firstName || 'My Store',
                email: user.primaryEmailAddress?.emailAddress || null,
            });

            // Enhanced register already returns full profile with stats
            const merchantData = registerRes.data.merchant;
            setMerchantId(merchantData.id);
            setMerchant(merchantData);

            console.log(`[Merchant] Initialized: ${merchantData.business_name} (ID: ${merchantData.id})`);
        } catch (err: any) {
            console.error('[Merchant] Init failed:', err);
            setError(err.response?.data?.error || 'Failed to initialize merchant');
            // Reset initialized flag on error to allow retry
            hasInitialized.current = false;
        } finally {
            setLoading(false);
        }
    }, [isClerkLoaded, user]);

    useEffect(() => {
        initMerchant();
    }, [initMerchant]);

    const refreshMerchant = async () => {
        if (!merchant) return;
        try {
            const res = await apiClient.get('/merchant/profile');
            setMerchant(res.data);
        } catch (err) {
            console.error('[Merchant] Refresh failed:', err);
        }
    };

    const connectShopify = async (shopName: string, accessToken: string): Promise<boolean> => {
        try {
            await apiClient.post('/merchant/connect-shopify', {
                shop_name: shopName,
                access_token: accessToken,
            });
            await refreshMerchant();
            return true;
        } catch (err: any) {
            console.error('[Merchant] Connect Shopify failed:', err);
            throw new Error(err.response?.data?.error || 'Failed to connect Shopify');
        }
    };

    const syncProducts = async (): Promise<{ count: number } | null> => {
        try {
            const res = await apiClient.post('/merchant/sync-products');
            await refreshMerchant();
            return { count: res.data.count };
        } catch (err: any) {
            console.error('[Merchant] Sync failed:', err);
            throw new Error(err.response?.data?.error || 'Failed to sync products');
        }
    };

    const disconnectShopify = async (): Promise<boolean> => {
        try {
            await apiClient.post('/merchant/disconnect-shopify');
            await refreshMerchant();
            return true;
        } catch (err) {
            console.error('[Merchant] Disconnect failed:', err);
            return false;
        }
    };

    const updateSettings = async (settings: { email_subject?: string; email_body?: string }): Promise<boolean> => {
        try {
            await apiClient.put('/merchant/settings', settings);
            await refreshMerchant();
            return true;
        } catch (err: any) {
            console.error('[Merchant] Update settings failed:', err);
            throw new Error(err.response?.data?.error || 'Failed to update settings');
        }
    };

    return (
        <MerchantContext.Provider
            value={{
                merchant,
                loading,
                error,
                isOnboarded: !!merchant,
                isShopifyConnected: !!merchant?.shopify_connected,
                refreshMerchant,
                connectShopify,
                syncProducts,
                disconnectShopify,
                updateSettings,
            }}
        >
            {children}
        </MerchantContext.Provider>
    );
}

export const useMerchant = () => useContext(MerchantContext);
