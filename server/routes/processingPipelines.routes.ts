import { Router, Request, Response, NextFunction } from 'express';
import * as processingPipelinesService from '../services/processingPipelines.service';
import { requireAuth } from '../middleware/auth';
import { NotFoundError } from '../lib/errors';

const router = Router();

// GET /api/processing-pipelines
router.get(
  '/api/processing-pipelines',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await processingPipelinesService.listProcessingPipelines();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/processing-pipelines/:id
router.get(
  '/api/processing-pipelines/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await processingPipelinesService.getProcessingPipelineById(req.params.id);
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
