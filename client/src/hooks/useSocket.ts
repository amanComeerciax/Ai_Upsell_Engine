import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';

export const useSocket = () => {
    const socketRef = useRef<Socket | null>(null);
    const { addNotification } = useNotifications();

    useEffect(() => {
        // Use the origin from the API URL or fallback to localhost
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        const socketUrl = new URL(apiUrl).origin;

        console.log(`[Socket] 🔌 Connecting to ${socketUrl}...`);
        socketRef.current = io(socketUrl);

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log(`[Socket] ✅ Connected: ${socket.id}`);
        });

        socket.on('order:created', (data) => {
            console.log('[Socket] 📦 New Order:', data);
            toast.success(`New Order: ${data.customer}`, {
                description: `Total: ₹${data.total}`,
                duration: 5000,
            });
            addNotification({
                type: 'order',
                title: `New Order — ${data.customer}`,
                description: `Total: ₹${data.total}`,
            });
        });

        socket.on('upsell:created', (data) => {
            console.log('[Socket] ✨ AI Upsell Generated:', data);
            toast.info(`AI Choice: ${data.productName}`, {
                description: `Sent to ${data.customer}`,
                duration: 5000,
            });
            addNotification({
                type: 'upsell',
                title: `AI Upsell — ${data.productName}`,
                description: `Sent to ${data.customer}`,
            });
        });

        socket.on('upsell:converted', (data) => {
            console.log('[Socket] 💰 Conversion recorded!', data);
            toast.success('Conversion Recorded!', {
                description: `${data.productName} purchased! Revenue: ₹${data.revenue.toFixed(2)}`,
                duration: 8000,
                style: { backgroundColor: '#10b981', color: 'white' }
            });
            addNotification({
                type: 'conversion',
                title: `💰 Conversion — ${data.productName}`,
                description: `Revenue: ₹${data.revenue.toFixed(2)}`,
            });
        });

        socket.on('upsell:shown', (data) => {
            console.log('[Socket] 👀 Upsell viewed by customer', data);
            addNotification({
                type: 'impression',
                title: `Widget Viewed`,
                description: `Customer saw upsell offer`,
            });
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    return socketRef.current;
};
