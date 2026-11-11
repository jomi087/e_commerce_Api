import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';

import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';

interface ErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  errors?: unknown;
  stack?: string;
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: unknown = undefined;

  // 1. Custom application errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = statusCode >= 500 ? 'Internal Server Error' : err.message;
    errors = statusCode >= 500 ? undefined : err.errors;
  }
  
  // 2. Zod validation errors
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';

    errors = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
  }

  // 3. Mongoose validation errors
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Database Validation Error';

    errors = Object.values(err.errors).map((e) => e.message);
  }

  // 4. Mongoose cast errors
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'Invalid database value';
  }

  // 5. MongoDB duplicate key errors
  else if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 11000
  ) {
    statusCode = 409;
    message = 'Duplicate field value entered';
  }

  // 6. Log every error that reaches this middleware
  const logDetails = {
    statusCode,
    message: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined,
    errors,
  };

  if (statusCode >= 500) {
    logger.error(logDetails);
  } else {
    logger.warn(logDetails);
  }

  // 8. Prepare frontend response
  const responseBody: ErrorResponse = {
    success: false,
    statusCode,
    message,
    ...(errors !== undefined && { errors }),

    ...(process.env.NODE_ENV === 'development' && err instanceof Error && err.stack
      ? { stack: err.stack }
      : {}),
  };

  // 9. Send response
  res.status(statusCode).json(responseBody);
};
