import { Request, Response, NextFunction } from 'express';
import { db } from '../db/index';
import { projects } from '../db/schema/index';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError, ForbiddenError, UnauthorizedError } from '../lib/errors';

export async function validateProjectAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const projectId = req.params.projectId;
    if (!projectId) {
      return next(new NotFoundError('Project ID required'));
    }

    const project = await db.query.projects.findFirst({
      where: and(eq(projects.id, projectId), isNull(projects.deletedAt)),
    });

    if (!project) {
      return next(new NotFoundError('Project not found'));
    }

    if (project.organisationId !== req.user.organisationId) {
      return next(new ForbiddenError('Access denied to this project'));
    }

    next();
  } catch (error) {
    next(error);
  }
}
