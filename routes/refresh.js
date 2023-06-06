import express from 'express';
import { refresh } from '../controllers/refresh.js'

const router = express.Router();

// /api/refresh
router.get('/', refresh);

export default router;
