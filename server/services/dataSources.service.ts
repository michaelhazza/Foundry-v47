import { db } from '../db/index';
import { dataSources } from '../db/schema/index';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError } from '../lib/errors';

export async function createDataSource(
  organisationId: string,
  file: any,
  name: string,
  sourceType: string,
  createdByUserId: string
) {
  const [dataSource] = await db
    .insert(dataSources)
    .values({
      organisationId,
      name,
      sourceType: sourceType as any,
      filePath: file?.path || null,
      originalFileName: file?.originalname || null,
      mimeType: file?.mimetype || null,
      sizeBytes: file?.size || null,
      createdByUserId,
    })
    .returning();

  return dataSource;
}

export async function listDataSources(
  organisationId: string,
  status?: string,
  sourceType?: string
) {
  let conditions = [eq(dataSources.organisationId, organisationId), isNull(dataSources.deletedAt)];

  if (status) {
    conditions.push(eq(dataSources.status, status as any));
  }

  if (sourceType) {
    conditions.push(eq(dataSources.sourceType, sourceType as any));
  }

  const dataSourceList = await db.query.dataSources.findMany({
    where: and(...conditions),
  });

  return dataSourceList;
}

export async function getDataSourceById(organisationId: string, dataSourceId: string) {
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

  return dataSource;
}

export async function updateDataSource(
  organisationId: string,
  dataSourceId: string,
  name?: string,
  status?: string
) {
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

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (name !== undefined) updateData.name = name;
  if (status !== undefined) updateData.status = status;

  const [updated] = await db
    .update(dataSources)
    .set(updateData)
    .where(eq(dataSources.id, dataSourceId))
    .returning();

  return updated;
}

export async function deleteDataSource(organisationId: string, dataSourceId: string) {
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

  // Soft delete
  await db
    .update(dataSources)
    .set({
      deletedAt: new Date(),
    })
    .where(eq(dataSources.id, dataSourceId));
}

export async function createApiConnection(
  organisationId: string,
  dataSourceId: string,
  apiConnectorId: string,
  connectionConfig: any,
  createdByUserId: string
) {
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

  const newVersion = (dataSource.connectionConfigVersion || 0) + 1;

  const [updated] = await db
    .update(dataSources)
    .set({
      apiConnectorId,
      connectionConfig,
      connectionConfigVersion: newVersion,
      sourceType: 'apiConnection',
      updatedAt: new Date(),
    })
    .where(eq(dataSources.id, dataSourceId))
    .returning();

  return updated;
}
