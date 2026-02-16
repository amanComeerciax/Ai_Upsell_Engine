import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import aiRoutes from './routes/ai.routes';
import productRoutes from './routes/product.routes';
import analyticsRoutes from './routes/analytics.routes';
import shopifyRoutes from './routes/shopify.routes';
import orderRoutes from './routes/order.routes';
import upsellRoutes from './routes/upsell.routes';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
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

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'active', system: 'Velocity AI Engine', timestamp: new Date().toISOString() });
});

// Basic Route for AI Operations (Placeholder)
app.get('/api/v1/ping', (req, res) => {
    res.status(200).json({ message: 'Intelligence Core Online' });
});

export default app;
