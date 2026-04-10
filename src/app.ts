import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from '@/config/env.config';
import { errorHandler } from '@/middlewares';
import { AppError } from '@/utils';
import v1Routes from '@/routes/v1';

const app: Express = express();

// ========================
// Global Middleware
// ========================

// Security headers
app.use(helmet());

// CORS — `credentials: true` forbids wildcard origin per spec.
// When CORS_ORIGIN is '*', reflect the request origin (`true`).
// Otherwise split comma-separated origins into an array.
const corsOrigin: cors.CorsOptions['origin'] =
  env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: corsOrigin,
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
app.use((req, _res, next) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server.`, 404));
});

// Global error handler
app.use(errorHandler);

export default app;
