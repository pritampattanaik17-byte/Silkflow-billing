import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, checkOwner } from '../controllers/authController.js';

const router = express.Router();

// Rate limit login attempts: max 10 per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit registration: max 5 per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many registration attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth routes — public (no authenticate middleware needed)
router.post('/login', loginLimiter, login);
router.post('/register', registerLimiter, register);
router.get('/check-owner', checkOwner);

export default router;
