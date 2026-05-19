import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { authenticate } from './middlewares/auth.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFoundHandler } from './middlewares/not-found.js';
import authRouter from './routes/auth.js';
import booksRouter from './routes/books.js';
import borrowRecordsRouter from './routes/borrow-records.js';
import chatRouter from './routes/chat.js';
import dashboardRouter from './routes/dashboard.js';
import usersRouter from './routes/users.js';
import { sendSuccess } from './utils/response.js';

const app = express();
const corsOrigins = env.CORS_ORIGIN.split(',').map((item) => item.trim());

app.use(helmet());
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  sendSuccess(res, { status: 'ok' }, '服务运行正常。');
});

app.use('/api/auth', authRouter);
app.use('/api/dashboard', authenticate, dashboardRouter);
app.use('/api/users', authenticate, usersRouter);
app.use('/api/books', authenticate, booksRouter);
app.use('/api/borrow-records', authenticate, borrowRecordsRouter);
app.use('/api/chat', authenticate, chatRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
