import { pgTable, uuid, text, timestamp, index, unique, json, integer, boolean } from 'drizzle-orm/pg-core';

export const processingPipelines = pgTable(
  'processing_pipelines',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    version: integer('version').notNull(),
    stageDefinitions: json('stage_definitions').notNull(),
    stageDefinitionsVersion: integer('stage_definitions_version').notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_pipelines_deleted').on(table.deletedAt),
    unique('idx_pipelines_name_version_active')
      .on(table.name, table.version)
      .nullsNotDistinct()
      .where(table.deletedAt.isNull()),
    index('idx_pipelines_default').on(table.isDefault, table.deletedAt),
  ]
);
