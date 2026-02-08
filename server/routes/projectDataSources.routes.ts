import { Router, Request, Response, NextFunction } from 'express';
import * as projectDataSourcesService from '../services/projectDataSources.service';
import { requireAuth } from '../middleware/auth';
import { validateProjectAccess } from '../middleware/validateProjectAccess';
import { validateBody } from '../middleware/validateBody';
import { NotFoundError, ValidationError, ConflictError } from '../lib/errors';

const router = Router();

// POST /api/projects/:projectId/data-sources
router.post(
  '/api/projects/:projectId/data-sources',
  requireAuth,
  validateProjectAccess,
  validateBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dataSourceId } = req.body;

      if (!dataSourceId) {
        throw new ValidationError('dataSourceId is required');
      }

      const result = await projectDataSourcesService.addDataSourceToProject(
        req.user!.organisationId,
        req.params.projectId,
        dataSourceId
      );
      res.status(201).json(result);
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

// GET /api/projects/:projectId/data-sources
router.get(
  '/api/projects/:projectId/data-sources',
  requireAuth,
  validateProjectAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await projectDataSourcesService.listProjectDataSources(
        req.user!.organisationId,
        req.params.projectId
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

// DELETE /api/projects/:projectId/data-sources/:id
router.delete(
  '/api/projects/:projectId/data-sources/:id',
  requireAuth,
  validateProjectAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await projectDataSourcesService.removeDataSourceFromProject(
        req.user!.organisationId,
        req.params.projectId,
        req.params.id
      );
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
