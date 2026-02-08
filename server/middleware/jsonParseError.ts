import { Request, Response, NextFunction } from 'express';

export function jsonParseErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      type: 'JsonParseError',
    });
  }
  next(err);
}
