import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '@/config/env.config';
import { errorHandler } from '@/middlewares';
import { AppError } from '@/utils';
import v1Routes from '@/routes/v1';

const app = express();

// ========================
// Global Middleware
// ========================

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// HTTP request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ========================
// Routes
// ========================

app.use('/api/v1', v1Routes);

// ========================
// Error Handling
// ========================

// Handle 404 — unmatched routes
app.all('*', (req, _res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server.`, 404));
});

// Global error handler
app.use(errorHandler);

export default app;
