import { Router, Request, Response, NextFunction } from 'express';
import * as canonicalSchemasService from '../services/canonicalSchemas.service';
import { requireAuth } from '../middleware/auth';
import { NotFoundError } from '../lib/errors';

const router = Router();

// GET /api/canonical-schemas
router.get(
  '/api/canonical-schemas',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = req.query.category as string | undefined;
      const result = await canonicalSchemasService.listCanonicalSchemas(category);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/canonical-schemas/:id
router.get(
  '/api/canonical-schemas/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await canonicalSchemasService.getCanonicalSchemaById(req.params.id);
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
