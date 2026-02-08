import { Router, Request, Response, NextFunction } from 'express';
import * as processingJobsService from '../services/processingJobs.service';
import { requireAuth } from '../middleware/auth';
import { validateProjectAccess } from '../middleware/validateProjectAccess';
import { validateBody } from '../middleware/validateBody';
import { NotFoundError, ValidationError } from '../lib/errors';

const router = Router();

// POST /api/projects/:projectId/processing-jobs
router.post(
  '/api/projects/:projectId/processing-jobs',
  requireAuth,
  validateProjectAccess,
  validateBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { dataSourceIds } = req.body;

      if (!dataSourceIds || !Array.isArray(dataSourceIds)) {
        throw new ValidationError('dataSourceIds must be an array');
      }

      const result = await processingJobsService.createProcessingJob(
        req.user!.organisationId,
        req.params.projectId,
        dataSourceIds,
        req.user!.id
      );
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

// GET /api/projects/:projectId/processing-jobs
router.get(
  '/api/projects/:projectId/processing-jobs',
  requireAuth,
  validateProjectAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as string | undefined;
      const result = await processingJobsService.listProcessingJobs(
        req.user!.organisationId,
        req.params.projectId,
        status
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

// GET /api/projects/:projectId/processing-jobs/:id
router.get(
  '/api/projects/:projectId/processing-jobs/:id',
  requireAuth,
  validateProjectAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await processingJobsService.getProcessingJobById(
        req.user!.organisationId,
        req.params.projectId,
        req.params.id
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

// POST /api/projects/:projectId/processing-jobs/:id/retry
router.post(
  '/api/projects/:projectId/processing-jobs/:id/retry',
  requireAuth,
  validateProjectAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await processingJobsService.retryProcessingJob(
        req.user!.organisationId,
        req.params.projectId,
        req.params.id
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

export default router;
