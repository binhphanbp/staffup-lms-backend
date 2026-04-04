import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils';
import { env } from '@/config/env.config';

interface ErrorResponse {
  success: boolean;
  status: string;
  message: string;
  error?: unknown;
  stack?: string;
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let status = 'error';
  let message = 'Internal Server Error';

  // Handle known operational errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    status = err.status;
    message = err.message;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as { code?: string; meta?: { target?: string[] } };
    switch (prismaErr.code) {
      case 'P2002':
        statusCode = 409;
        status = 'fail';
        message = `Duplicate value for field: ${prismaErr.meta?.target?.join(', ')}`;
        break;
      case 'P2025':
        statusCode = 404;
        status = 'fail';
        message = 'Record not found';
        break;
      default:
        statusCode = 400;
        status = 'fail';
        message = 'Database operation failed';
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    status = 'fail';
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    status = 'fail';
    message = 'Token expired. Please log in again.';
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    status = 'fail';
    message = 'Validation failed';
  }

  const response: ErrorResponse = {
    success: false,
    status,
    message,
  };

  // Include error details in development
  if (env.NODE_ENV === 'development') {
    response.error =
      err.name === 'ZodError' ? (err as unknown as { issues: unknown }).issues : err.message;
    response.stack = err.stack;

    if (statusCode === 500) {
      console.error('🔥 Unhandled Error:', err);
    }
  }

  res.status(statusCode).json(response);
};
