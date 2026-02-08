import { db } from '../db/index';
import { processingJobDataSources, processingJobs, projects, dataSources } from '../db/schema/index';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError } from '../lib/errors';

// This service is used internally by processingJobs.service.ts
// No direct endpoints are exposed for this junction table

export async function listJobDataSources(
  organisationId: string,
  projectId: string,
  jobId: string
) {
  // Verify project exists and belongs to organisation
  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.organisationId, organisationId),
      isNull(projects.deletedAt)
    ),
  });

  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Verify job exists and belongs to project
  const job = await db.query.processingJobs.findFirst({
    where: and(
      eq(processingJobs.id, jobId),
      eq(processingJobs.projectId, projectId),
      isNull(processingJobs.deletedAt)
    ),
  });

  if (!job) {
    throw new NotFoundError('Processing job not found');
  }

  const associations = await db.query.processingJobDataSources.findMany({
    where: and(
      eq(processingJobDataSources.processingJobId, jobId),
      isNull(processingJobDataSources.deletedAt)
    ),
  });

  return associations;
}
