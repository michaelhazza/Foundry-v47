import { Router, Request, Response, NextFunction } from 'express';
import * as usersService from '../services/users.service';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { NotFoundError, ValidationError, ConflictError } from '../lib/errors';

const router = Router();

// POST /api/users
router.post(
  '/api/users',
  requireAuth,
  requireRole('admin'),
  validateBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password || !role) {
        throw new ValidationError('Email, password, and role are required');
      }

      const result = await usersService.createUser(
        req.user!.organisationId,
        email,
        password,
        role
      );
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

// GET /api/users
router.get(
  '/api/users',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await usersService.listUsers(req.user!.organisationId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/:id
router.get(
  '/api/users/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await usersService.getUserById(req.user!.organisationId, req.params.id);
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

// PATCH /api/users/:id
router.patch(
  '/api/users/:id',
  requireAuth,
  requireRole('admin'),
  validateBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, role } = req.body;

      if (!email || !role) {
        throw new ValidationError('Email and role are required');
      }

      const result = await usersService.updateUser(
        req.user!.organisationId,
        req.params.id,
        email,
        role
      );
      res.json(result);
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof ConflictError
      ) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

// DELETE /api/users/:id
router.delete(
  '/api/users/:id',
  requireAuth,
  requireRole('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await usersService.deleteUser(req.user!.organisationId, req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof NotFoundError) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

export default router;
