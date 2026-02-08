import { Request, Response, NextFunction } from 'express';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from '../lib/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error for debugging
  console.error('Error:', err);

  // Handle typed errors with appropriate status codes
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      error: err.message,
      type: 'ValidationError',
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({
      error: err.message,
      type: 'NotFoundError',
    });
  }

  if (err instanceof ConflictError) {
    return res.status(err.statusCode).json({
      error: err.message,
      type: 'ConflictError',
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(err.statusCode).json({
      error: err.message,
      type: 'UnauthorizedError',
    });
  }

  if (err instanceof ForbiddenError) {
    return res.status(err.statusCode).json({
      error: err.message,
      type: 'ForbiddenError',
    });
  }

  // Default to 500 for unexpected errors
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    type: 'InternalServerError',
  });
}
