import { Router, Request, Response, NextFunction } from 'express';
import * as healthService from '../services/health.service';

const router = Router();

router.get('/health', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await healthService.checkHealth();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
