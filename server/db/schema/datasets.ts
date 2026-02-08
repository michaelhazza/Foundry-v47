import { pgTable, uuid, text, timestamp, index, unique, pgEnum, json, integer } from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { processingJobs } from './processingJobs';
import { canonicalSchemas } from './canonicalSchemas';

export const datasetFormatEnum = pgEnum('dataset_format', [
  'conversationalJsonl',
  'structuredJson',
  'qaPairsJson',
]);
export const retentionPolicyEnum = pgEnum('retention_policy', [
  'untilDeleted',
  'timebound',
  'projectLifecycle',
]);

export const datasets = pgTable(
  'datasets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    processingJobId: uuid('processing_job_id')
      .notNull()
      .references(() => processingJobs.id),
    canonicalSchemaId: uuid('canonical_schema_id')
      .notNull()
      .references(() => canonicalSchemas.id),
    name: text('name').notNull(),
    version: integer('version').notNull(),
    format: datasetFormatEnum('format').notNull(),
    filePath: text('file_path').notNull(),
    recordCount: integer('record_count').notNull(),
    sizeBytes: integer('size_bytes'),
    lineage: json('lineage').notNull(),
    retentionPolicy: retentionPolicyEnum('retention_policy').notNull().default('untilDeleted'),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_datasets_deleted').on(table.deletedAt),
    index('idx_datasets_project').on(table.projectId, table.deletedAt),
    index('idx_datasets_job').on(table.processingJobId, table.deletedAt),
    index('idx_datasets_schema').on(table.canonicalSchemaId, table.deletedAt),
    unique('idx_datasets_project_name_version_active')
      .on(table.projectId, table.name, table.version)
      .nullsNotDistinct()
      .where(table.deletedAt.isNull()),
  ]
);
