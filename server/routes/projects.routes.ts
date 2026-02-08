import { Router, Request, Response, NextFunction } from 'express';
import * as projectsService from '../services/projects.service';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { NotFoundError, ValidationError } from '../lib/errors';

const router = Router();

// POST /api/projects
router.post(
  '/api/projects',
  requireAuth,
  validateBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        throw new ValidationError('Name is required');
      }

      const result = await projectsService.createProject(
        req.user!.organisationId,
        name,
        description,
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

// GET /api/projects
router.get(
  '/api/projects',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as string | undefined;
      const result = await projectsService.listProjects(req.user!.organisationId, status);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/projects/:id
router.get(
  '/api/projects/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await projectsService.getProjectById(
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

// PATCH /api/projects/:id
router.patch(
  '/api/projects/:id',
  requireAuth,
  validateBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, status, canonicalSchemaId, processingPipelineId } = req.body;

      const result = await projectsService.updateProject(
        req.user!.organisationId,
        req.params.id,
        name,
        description,
        status,
        canonicalSchemaId,
        processingPipelineId
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

// DELETE /api/projects/:id
router.delete(
  '/api/projects/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await projectsService.deleteProject(req.user!.organisationId, req.params.id);
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

// PATCH /api/projects/:id/field-mapping
router.patch(
  '/api/projects/:id/field-mapping',
  requireAuth,
  validateBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fieldMappingConfig } = req.body;

      if (!fieldMappingConfig) {
        throw new ValidationError('fieldMappingConfig is required');
      }

      const result = await projectsService.updateFieldMapping(
        req.user!.organisationId,
        req.params.id,
        fieldMappingConfig
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

// PATCH /api/projects/:id/de-identification
router.patch(
  '/api/projects/:id/de-identification',
  requireAuth,
  validateBody,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { deIdentificationConfig } = req.body;

      if (!deIdentificationConfig) {
        throw new ValidationError('deIdentificationConfig is required');
      }

      const result = await projectsService.updateDeIdentification(
        req.user!.organisationId,
        req.params.id,
        deIdentificationConfig
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
