import { Router, Request, Response, NextFunction } from 'express';
import * as apiConnectorsService from '../services/apiConnectors.service';
import { requireAuth } from '../middleware/auth';
import { NotFoundError } from '../lib/errors';

const router = Router();

// GET /api/api-connectors
router.get(
  '/api/api-connectors',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await apiConnectorsService.listApiConnectors();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/api-connectors/:id
router.get(
  '/api/api-connectors/:id',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await apiConnectorsService.getApiConnectorById(req.params.id);
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
