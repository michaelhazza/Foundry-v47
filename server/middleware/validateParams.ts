import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../lib/errors';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateUuidParams(req: Request, res: Response, next: NextFunction) {
  const params = req.params;

  for (const [key, value] of Object.entries(params)) {
    if (key === 'id' || key.endsWith('Id')) {
      if (!UUID_REGEX.test(value)) {
        return next(new ValidationError(`Invalid UUID format for parameter: ${key}`));
      }
    }
  }

  next();
}
