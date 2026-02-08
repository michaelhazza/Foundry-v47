import { db } from '../db/index';
import { datasets, projects } from '../db/schema/index';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError } from '../lib/errors';
import fs from 'fs';
import path from 'path';

export async function listDatasets(organisationId: string, projectId: string) {
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

  const datasetList = await db.query.datasets.findMany({
    where: and(eq(datasets.projectId, projectId), isNull(datasets.deletedAt)),
  });

  return datasetList;
}

export async function getDatasetById(
  organisationId: string,
  projectId: string,
  datasetId: string
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

  const dataset = await db.query.datasets.findFirst({
    where: and(
      eq(datasets.id, datasetId),
      eq(datasets.projectId, projectId),
      isNull(datasets.deletedAt)
    ),
  });

  if (!dataset) {
    throw new NotFoundError('Dataset not found');
  }

  return dataset;
}

export async function downloadDataset(
  organisationId: string,
  projectId: string,
  datasetId: string,
  format?: string
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

  const dataset = await db.query.datasets.findFirst({
    where: and(
      eq(datasets.id, datasetId),
      eq(datasets.projectId, projectId),
      isNull(datasets.deletedAt)
    ),
  });

  if (!dataset) {
    throw new NotFoundError('Dataset not found');
  }

  // Return file path and format for download
  return {
    filePath: dataset.filePath,
    format: format || dataset.format,
    filename: `${dataset.name}-v${dataset.version}.${format === 'JSONL' ? 'jsonl' : 'json'}`,
  };
}

export async function deleteDataset(
  organisationId: string,
  projectId: string,
  datasetId: string
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

  const dataset = await db.query.datasets.findFirst({
    where: and(
      eq(datasets.id, datasetId),
      eq(datasets.projectId, projectId),
      isNull(datasets.deletedAt)
    ),
  });

  if (!dataset) {
    throw new NotFoundError('Dataset not found');
  }

  // Soft delete
  await db
    .update(datasets)
    .set({
      deletedAt: new Date(),
    })
    .where(eq(datasets.id, datasetId));
}
