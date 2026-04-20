import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import aiRoutes from './routes/ai.routes';
import productRoutes from './routes/product.routes';
import analyticsRoutes from './routes/analytics.routes';
import shopifyRoutes from './routes/shopify.routes';
import orderRoutes from './routes/order.routes';
import upsellRoutes from './routes/upsell.routes';
import merchantRoutes from './routes/merchant.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import teamRoutes from './routes/team.routes';
import './workers/upsell.worker'; // Initialize the background worker
import './workers/cart.worker';    // Initialize the cart abandonment worker

dotenv.config();

const app = express();

// Middleware
// Use raw body for stripe webhooks, json for everything else
app.use((req, res, next) => {
    if (req.originalUrl === '/api/v1/payments/webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));
app.use(morgan('dev'));
app.use(express.static('public'));

// Routes
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/shopify', shopifyRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/upsells', upsellRoutes);
app.use('/api/v1/merchant', merchantRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/team', teamRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'active', system: 'Velocity AI Engine', timestamp: new Date().toISOString() });
});

// Basic Route for AI Operations (Placeholder)
app.get('/api/v1/ping', (req, res) => {
    res.status(200).json({ message: 'Intelligence Core Online' });
});

export default app;
