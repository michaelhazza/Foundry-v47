import { db } from '../db/index';
import { processingJobs, projects, processingJobDataSources } from '../db/schema/index';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError } from '../lib/errors';

export async function createProcessingJob(
  organisationId: string,
  projectId: string,
  dataSourceIds: string[],
  createdByUserId: string
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

  // Create config snapshot
  const configSnapshot = {
    projectId,
    canonicalSchemaId: project.canonicalSchemaId,
    processingPipelineId: project.processingPipelineId,
    fieldMappingConfig: project.fieldMappingConfig,
    deIdentificationConfig: project.deIdentificationConfig,
  };

  // Create processing job
  const [job] = await db
    .insert(processingJobs)
    .values({
      projectId,
      configSnapshot,
      triggeredBy: 'user',
      createdByUserId,
    })
    .returning();

  // Create job-datasource associations
  if (dataSourceIds && dataSourceIds.length > 0) {
    await db.insert(processingJobDataSources).values(
      dataSourceIds.map((dataSourceId) => ({
        processingJobId: job.id,
        dataSourceId,
      }))
    );
  }

  return job;
}

export async function listProcessingJobs(
  organisationId: string,
  projectId: string,
  status?: string
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

  let conditions = [eq(processingJobs.projectId, projectId), isNull(processingJobs.deletedAt)];

  if (status) {
    conditions.push(eq(processingJobs.status, status as any));
  }

  const jobList = await db.query.processingJobs.findMany({
    where: and(...conditions),
  });

  return jobList;
}

export async function getProcessingJobById(
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

  return job;
}

export async function retryProcessingJob(
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

  const originalJob = await db.query.processingJobs.findFirst({
    where: and(
      eq(processingJobs.id, jobId),
      eq(processingJobs.projectId, projectId),
      isNull(processingJobs.deletedAt)
    ),
  });

  if (!originalJob) {
    throw new NotFoundError('Processing job not found');
  }

  // Get data sources from original job
  const jobDataSources = await db.query.processingJobDataSources.findMany({
    where: and(
      eq(processingJobDataSources.processingJobId, jobId),
      isNull(processingJobDataSources.deletedAt)
    ),
  });

  // Create new job with same configuration
  const [newJob] = await db
    .insert(processingJobs)
    .values({
      projectId,
      configSnapshot: originalJob.configSnapshot,
      triggeredBy: 'user',
      createdByUserId: originalJob.createdByUserId,
    })
    .returning();

  // Copy job-datasource associations
  if (jobDataSources.length > 0) {
    await db.insert(processingJobDataSources).values(
      jobDataSources.map((jds) => ({
        processingJobId: newJob.id,
        dataSourceId: jds.dataSourceId,
      }))
    );
  }

  return newJob;
}
