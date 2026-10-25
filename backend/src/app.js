import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/env.js';
import errorHandler from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { success } from './utils/response.js';
import { AppError } from './utils/AppError.js';
import menuRoutes from './routes/menus.js';
import eventRoutes from './routes/events.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import orderRoutes from './routes/orders.js';
import chatRoutes from './routes/chat.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = config.FRONTEND_URL.split(',').map((url) => url.trim());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));

if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(globalLimiter);

app.get('/api/v1/health', (req, res) => {
  return success(res, { status: 'ok', time: new Date().toISOString() });
});

app.use('/api/v1/menus', menuRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/chat', chatRoutes);

app.use((req, res, next) => {
  next(new AppError('NOT_FOUND', 404, `Rute ${req.method} ${req.originalUrl} tidak ditemukan`));
});

app.use(errorHandler);

export default app;
