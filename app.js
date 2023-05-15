import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import userRoutes from './routes/users.js'
import employeeRoutes from './routes/employees.js'

import dotenv from 'dotenv'
dotenv.config();

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/user', userRoutes);
app.use('/api/employees', employeeRoutes);

app.get('/', (res, req) => {
  req.send('APP IS RUNNING.');
})

export default app;
