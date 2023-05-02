// const express = require('express');
import express from 'express';
// const path = require('path');
import path from 'path';
// const cookieParser = require('cookie-parser');
import cookieParser from 'cookie-parser';
// const logger = require('morgan');
import logger from 'morgan';

import userRoutes from './routes/users.js'

import dotenv from 'dotenv'
dotenv.config();

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/user', userRoutes);

app.get('/', (res, req) => {
  req.send('APP IS RUNNING.');
})

// module.exports = app;
export default app;
