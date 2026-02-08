import { db } from '../db/index';
import { projects } from '../db/schema/index';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError } from '../lib/errors';

export async function createProject(
  organisationId: string,
  name: string,
  description: string | undefined,
  createdByUserId: string
) {
  const [project] = await db
    .insert(projects)
    .values({
      organisationId,
      name,
      description: description || null,
      createdByUserId,
    })
    .returning();

  return project;
}

export async function listProjects(organisationId: string, status?: string) {
  let conditions = [eq(projects.organisationId, organisationId), isNull(projects.deletedAt)];

  if (status) {
    conditions.push(eq(projects.status, status as any));
  }

  const projectList = await db.query.projects.findMany({
    where: and(...conditions),
  });

  return projectList;
}

export async function getProjectById(organisationId: string, projectId: string) {
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

  return project;
}

export async function updateProject(
  organisationId: string,
  projectId: string,
  name?: string,
  description?: string,
  status?: string,
  canonicalSchemaId?: string,
  processingPipelineId?: string
) {
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

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;
  if (canonicalSchemaId !== undefined) updateData.canonicalSchemaId = canonicalSchemaId;
  if (processingPipelineId !== undefined) updateData.processingPipelineId = processingPipelineId;

  const [updated] = await db
    .update(projects)
    .set(updateData)
    .where(eq(projects.id, projectId))
    .returning();

  return updated;
}

export async function deleteProject(organisationId: string, projectId: string) {
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

  // Soft delete
  await db
    .update(projects)
    .set({
      deletedAt: new Date(),
    })
    .where(eq(projects.id, projectId));
}

export async function updateFieldMapping(
  organisationId: string,
  projectId: string,
  fieldMappingConfig: any
) {
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

  const newVersion = (project.fieldMappingConfigVersion || 0) + 1;

  const [updated] = await db
    .update(projects)
    .set({
      fieldMappingConfig,
      fieldMappingConfigVersion: newVersion,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

  return updated;
}

export async function updateDeIdentification(
  organisationId: string,
  projectId: string,
  deIdentificationConfig: any
) {
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

  const newVersion = (project.deIdentificationConfigVersion || 0) + 1;

  const [updated] = await db
    .update(projects)
    .set({
      deIdentificationConfig,
      deIdentificationConfigVersion: newVersion,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

  return updated;
}
