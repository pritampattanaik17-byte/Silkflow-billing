import express from 'express';
import { login, register, checkOwner } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/check-owner', checkOwner);

export default router;
