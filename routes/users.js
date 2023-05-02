// const express = require('express');
import express from 'express';
import { login, register, current } from '../controllers/login.js'
import auth from '../middleware/auth.js'

const router = express.Router();

// /api/user/login
router.post('/login', login);

// /api/user/register
router.post('/register', register);

// /api/user/current
router.get('/current', auth, current);

export default router;
