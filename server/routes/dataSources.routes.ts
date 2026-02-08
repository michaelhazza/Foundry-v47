import { Router, Request, Response, NextFunction } from 'express';
import * as dataSourcesService from '../services/dataSources.service';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateMultipart } from '../middleware/validateBody';
import { upload } from '../middleware/upload';
import { NotFoundError, ValidationError } from '../lib/errors';

const router = Router();

// POST /api/data-sources
router.post(
  '/api/data-sources',
  requireAuth,
  upload.single('file'),
  validateMultipart,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, sourceType } = req.body;

      if (!name || !sourceType) {
        throw new ValidationError('Name and sourceType are required');
      }

      const result = await dataSourcesService.createDataSource(
        req.user!.organisationId,
        req.file,
        name,
        sourceType,
        req.user!.id
      );
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        next(error);
      } else {
        next(error);
      }
    }
  }
);

// GET /api/data-sources
router.get(
  '/api/data-sources',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as string | undefined;
      const sourceType = req.query.sourceType as string | undefined;
      const result = await dataSourcesService.listDataSources(
        req.user!.organisationId,
        status,
        sourceType
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/data-sources/:id
router.get(
  '/api/data-sources/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await dataSourcesService.getDataSourceById(
        req.user!.organisationId,
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

// PATCH /api/data-sources/:id
router.patch(
  '/api/data-sources/:id',
  requireAuth,
  validateBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, status } = req.body;

      const result = await dataSourcesService.updateDataSource(
        req.user!.organisationId,
        req.params.id,
        name,
        status
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

// DELETE /api/data-sources/:id
router.delete(
  '/api/data-sources/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await dataSourcesService.deleteDataSource(req.user!.organisationId, req.params.id);
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

// POST /api/data-sources/:id/api-connection
router.post(
  '/api/data-sources/:id/api-connection',
  requireAuth,
  validateBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { apiConnectorId, connectionConfig } = req.body;

      if (!apiConnectorId || !connectionConfig) {
        throw new ValidationError('apiConnectorId and connectionConfig are required');
      }

      const result = await dataSourcesService.createApiConnection(
        req.user!.organisationId,
        req.params.id,
        apiConnectorId,
        connectionConfig,
        req.user!.id
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
