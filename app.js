import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import helmet from 'helmet';

import userRoutes from './routes/users.js'
import employeeRoutes from './routes/employees.js'
import refreshRoutes from './routes/refresh.js'

import dotenv from 'dotenv'
dotenv.config();

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://employees-vbhk.onrender.com',
];
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
  : defaultOrigins;

const app = express();

app.use(helmet());
app.use(logger('dev'));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin ?? true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(cookieParser());

app.use('/api/user', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/refresh', refreshRoutes);

app.get('/', (req, res) => {
  res.send('APP IS RUNNING.');
});

export default app;
