import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../lib/auth';
import { UnauthorizedError, ForbiddenError } from '../lib/errors';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof Error && error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
}

export function requireRole(role: 'admin' | 'member') {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (req.user.role !== role && role === 'admin') {
      return next(new ForbiddenError('Admin access required'));
    }

    next();
  };
}
