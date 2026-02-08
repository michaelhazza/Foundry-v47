import { db } from '../db/index';
import { projectDataSources, projects, dataSources } from '../db/schema/index';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError, ConflictError } from '../lib/errors';

export async function addDataSourceToProject(
  organisationId: string,
  projectId: string,
  dataSourceId: string
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

  // Verify data source exists and belongs to organisation
  const dataSource = await db.query.dataSources.findFirst({
    where: and(
      eq(dataSources.id, dataSourceId),
      eq(dataSources.organisationId, organisationId),
      isNull(dataSources.deletedAt)
    ),
  });

  if (!dataSource) {
    throw new NotFoundError('Data source not found');
  }

  // Check if association already exists
  const existing = await db.query.projectDataSources.findFirst({
    where: and(
      eq(projectDataSources.projectId, projectId),
      eq(projectDataSources.dataSourceId, dataSourceId),
      isNull(projectDataSources.deletedAt)
    ),
  });

  if (existing) {
    throw new ConflictError('Data source already associated with this project');
  }

  const [association] = await db
    .insert(projectDataSources)
    .values({
      projectId,
      dataSourceId,
    })
    .returning();

  return association;
}

export async function listProjectDataSources(organisationId: string, projectId: string) {
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

  const associations = await db.query.projectDataSources.findMany({
    where: and(
      eq(projectDataSources.projectId, projectId),
      isNull(projectDataSources.deletedAt)
    ),
  });

  return associations;
}

export async function removeDataSourceFromProject(
  organisationId: string,
  projectId: string,
  associationId: string
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

  const association = await db.query.projectDataSources.findFirst({
    where: and(
      eq(projectDataSources.id, associationId),
      eq(projectDataSources.projectId, projectId),
      isNull(projectDataSources.deletedAt)
    ),
  });

  if (!association) {
    throw new NotFoundError('Project data source association not found');
  }

  // Soft delete
  await db
    .update(projectDataSources)
    .set({
      deletedAt: new Date(),
    })
    .where(eq(projectDataSources.id, associationId));
}
