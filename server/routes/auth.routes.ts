import { Router, Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { ValidationError, NotFoundError, UnauthorizedError } from '../lib/errors';

const router = Router();

// GET /api/auth/session
router.get(
  '/api/auth/session',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.validateSession(req.user!.id);
      res.json(result);
    } catch (error) {
      if (error instanceof NotFoundError) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

// POST /api/auth/login
router.post(
  '/api/auth/login',
  validateBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof UnauthorizedError) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

// POST /api/auth/logout
router.post(
  '/api/auth/logout',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.logout(req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
