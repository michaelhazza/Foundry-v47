import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../lib/errors';

export function validateBody(req: Request, res: Response, next: NextFunction) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ValidationError('Request body cannot be empty'));
  }
  next();
}

export function validateMultipart(req: Request, res: Response, next: NextFunction) {
  // For multipart form data, both req.file/req.files and req.body may be present
  if (!req.file && !req.files && (!req.body || Object.keys(req.body).length === 0)) {
    return next(new ValidationError('Request must include file or form data'));
  }
  next();
}
