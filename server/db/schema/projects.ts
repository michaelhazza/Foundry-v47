import { pgTable, uuid, text, timestamp, index, pgEnum, json, integer } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';
import { users } from './users';

export const projectStatusEnum = pgEnum('project_status', [
  'draft',
  'configuring',
  'processing',
  'completed',
  'archived',
]);

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organisationId: uuid('organisation_id')
      .notNull()
      .references(() => organisations.id),
    name: text('name').notNull(),
    description: text('description'),
    status: projectStatusEnum('status').notNull().default('draft'),
    canonicalSchemaId: uuid('canonical_schema_id'),
    processingPipelineId: uuid('processing_pipeline_id'),
    fieldMappingConfig: json('field_mapping_config'),
    fieldMappingConfigVersion: integer('field_mapping_config_version'),
    deIdentificationConfig: json('de_identification_config'),
    deIdentificationConfigVersion: integer('de_identification_config_version'),
    createdByUserId: uuid('created_by_user_id').references(() => users.id),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_projects_deleted').on(table.deletedAt),
    index('idx_projects_org_status').on(table.organisationId, table.status, table.deletedAt),
    index('idx_projects_schema').on(table.canonicalSchemaId, table.deletedAt),
    index('idx_projects_pipeline').on(table.processingPipelineId, table.deletedAt),
    index('idx_projects_created_by').on(table.createdByUserId, table.deletedAt),
  ]
);
