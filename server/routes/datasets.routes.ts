import { Router, Request, Response, NextFunction } from 'express';
import * as datasetsService from '../services/datasets.service';
import { requireAuth } from '../middleware/auth';
import { validateProjectAccess } from '../middleware/validateProjectAccess';
import { NotFoundError } from '../lib/errors';
import fs from 'fs';

const router = Router();

// GET /api/projects/:projectId/datasets
router.get(
  '/api/projects/:projectId/datasets',
  requireAuth,
  validateProjectAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await datasetsService.listDatasets(
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

// GET /api/projects/:projectId/datasets/:id
router.get(
  '/api/projects/:projectId/datasets/:id',
  requireAuth,
  validateProjectAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await datasetsService.getDatasetById(
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

// GET /api/projects/:projectId/datasets/:id/download
router.get(
  '/api/projects/:projectId/datasets/:id/download',
  requireAuth,
  validateProjectAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const format = req.query.format as string | undefined;
      const result = await datasetsService.downloadDataset(
        req.user!.organisationId,
        req.params.projectId,
        req.params.id,
        format
      );

      // Set download headers and stream file
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');

      const fileStream = fs.createReadStream(result.filePath);
      fileStream.pipe(res);
    } catch (error) {
      if (error instanceof NotFoundError) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

// DELETE /api/projects/:projectId/datasets/:id
router.delete(
  '/api/projects/:projectId/datasets/:id',
  requireAuth,
  validateProjectAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await datasetsService.deleteDataset(
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
