import { Router, Request, Response, NextFunction } from 'express';
import * as organisationsService from '../services/organisations.service';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { NotFoundError, ValidationError } from '../lib/errors';

const router = Router();

// GET /api/organisations/me
router.get(
  '/api/organisations/me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await organisationsService.getCurrentOrganisation(
        req.user!.organisationId
      );
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

// PATCH /api/organisations/me
router.patch(
  '/api/organisations/me',
  requireAuth,
  requireRole('admin'),
  validateBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;

      if (!name) {
        throw new ValidationError('Name is required');
      }

      const result = await organisationsService.updateOrganisation(
        req.user!.organisationId,
        name
      );
      res.json(result);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

export default router;
