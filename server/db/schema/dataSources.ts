import { pgTable, uuid, text, timestamp, index, pgEnum, integer, json } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';
import { users } from './users';

export const sourceTypeEnum = pgEnum('source_type', ['fileUpload', 'apiConnection']);
export const dataSourceStatusEnum = pgEnum('data_source_status', [
  'uploaded',
  'validating',
  'ready',
  'expired',
  'error',
]);

export const dataSources = pgTable(
  'data_sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organisationId: uuid('organisation_id')
      .notNull()
      .references(() => organisations.id),
    name: text('name').notNull(),
    sourceType: sourceTypeEnum('source_type').notNull(),
    status: dataSourceStatusEnum('status').notNull().default('uploaded'),
    filePath: text('file_path'),
    originalFileName: text('original_file_name'),
    mimeType: text('mime_type'),
    sizeBytes: integer('size_bytes'),
    apiConnectorId: uuid('api_connector_id'),
    connectionConfig: json('connection_config'),
    connectionConfigVersion: integer('connection_config_version'),
    detectedColumns: json('detected_columns'),
    expiresAt: timestamp('expires_at'),
    createdByUserId: uuid('created_by_user_id').references(() => users.id),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_datasources_deleted').on(table.deletedAt),
    index('idx_datasources_org_status').on(table.organisationId, table.status, table.deletedAt),
    index('idx_datasources_connector').on(table.apiConnectorId, table.deletedAt),
    index('idx_datasources_created_by').on(table.createdByUserId, table.deletedAt),
    index('idx_datasources_expires').on(table.expiresAt),
  ]
);
