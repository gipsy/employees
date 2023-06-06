import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';

import userRoutes from './routes/users.js'
import employeeRoutes from './routes/employees.js'
import refreshRoutes from './routes/refresh.js'

import dotenv from 'dotenv'
dotenv.config();

const app = express();

// app.options('*',function (req, res, next) {
//   const allowedDomains = ['http://localhost:5173','https://employees-vbhk.onrender.com' ];
//   const origin = req.headers.origin;
//   if(allowedDomains.indexOf(origin) > -1){
//     res.setHeader('Access-Control-Allow-Origin', origin);
//   }
//
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept');
//   res.setHeader('Access-Control-Allow-Credentials', true);
//
//   next();
// })

app.use(logger('dev'));
app.use(cors({
  origin : true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/user', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/refresh', refreshRoutes);

app.get('/', (res, req) => {
  req.send('APP IS RUNNING.');
})

export default app;
