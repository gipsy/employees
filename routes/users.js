import express from 'express';
import { login, logout, register } from '../controllers/users.js'
import auth from '../middleware/auth.js'

const router = express.Router();

// /api/user/login
router.post('/login', login);

// /api/user/register
router.post('/register', register);

// /api/user/current
// router.get('/current', auth, current);

// /api/user/logout
router.get('/logout', logout);

export default router;
