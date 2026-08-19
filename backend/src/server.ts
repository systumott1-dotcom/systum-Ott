import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { productsRouter } from './routes/products.js';
import { ordersRouter } from './routes/orders.js';
import { faqsRouter } from './routes/faqs.js';
import { reviewsRouter } from './routes/reviews.js';
import { couponsRouter } from './routes/coupons.js';
import { authRouter } from './routes/auth.js';
import { adminRouter } from './routes/admin.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Systum OTT India API',
    database: process.env.MONGODB_URI ? 'Configured' : 'In-Memory Mock',
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/faqs', faqsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/coupons', couponsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'API Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Systum OTT Backend API running on http://localhost:${PORT}`);
  console.log(`📱 WhatsApp support configured: +${process.env.WHATSAPP_SUPPORT_PHONE || '919306022703'}`);
});
