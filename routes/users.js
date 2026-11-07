import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, register, current } from '../controllers/users.js'
import auth from '../middleware/auth.js'

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

// /api/user/login
router.post('/login', authLimiter, login);

// /api/user/register
router.post('/register', authLimiter, register);

// /api/user/current
router.get('/current', auth, current);

// /api/user/logout (POST preferred; GET kept for backward compatibility)
router.post('/logout', logout);
router.get('/logout', logout);

export default router;
