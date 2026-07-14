// SilkFlow Backend - All routes registered
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import visionRoutes from './routes/visionRoutes.js';

dotenv.config();

// Fail fast if JWT_SECRET is missing — never fall back to a hardcoded value
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Exiting.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers (X-Frame-Options, X-Content-Type-Options, HSTS, etc.)
app.use(helmet());

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://silkflow-billing.vercel.app',
  process.env.FRONTEND_URL,     // Additional production URL from env (if any)
].filter(Boolean); // Remove undefined/null entries

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Body parsers with explicit size limits to prevent DoS via oversized payloads
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Higher body limit specifically for vision/scan endpoint (base64 images can be large)
app.use('/api/vision', express.json({ limit: '5mb' }));

// Basic Health Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SilkFlow Backend is running' });
});

// V10: General API rate limiter for authenticated routes (500 requests per minute per IP)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  message: { message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/invoices', apiLimiter, invoiceRoutes);
app.use('/api/returns', apiLimiter, returnRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);
app.use('/api/reports', apiLimiter, reportsRoutes);
app.use('/api/vision', apiLimiter, visionRoutes);

// V12: Global error handler — catch unhandled errors, suppress stack traces in production
app.use((err, req, res, _next) => {
  const isProd = process.env.NODE_ENV === 'production';
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, isProd ? err.message : err);
  res.status(err.status || 500).json({
    message: isProd ? 'Internal server error' : err.message || 'Internal server error',
  });
});

// Only start the server when running locally (Vercel handles this in serverless mode)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel serverless function
export default app;
