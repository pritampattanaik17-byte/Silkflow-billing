import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Health Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SilkFlow Backend is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

// Only start the server when running locally (Vercel handles this in serverless mode)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel serverless function
export default app;
