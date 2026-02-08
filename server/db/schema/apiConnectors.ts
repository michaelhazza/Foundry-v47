import { pgTable, uuid, text, timestamp, index, unique, pgEnum, json, integer, boolean } from 'drizzle-orm/pg-core';

export const authMethodEnum = pgEnum('auth_method', ['oauth2', 'apiKey', 'basic']);

export const apiConnectors = pgTable(
  'api_connectors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    provider: text('provider').notNull(),
    authMethod: authMethodEnum('auth_method').notNull(),
    baseUrl: text('base_url'),
    configTemplate: json('config_template'),
    configTemplateVersion: integer('config_template_version'),
    isActive: boolean('is_active').notNull().default(true),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_connectors_deleted').on(table.deletedAt),
    unique('idx_connectors_name_active')
      .on(table.name)
      .nullsNotDistinct()
      .where(table.deletedAt.isNull()),
    index('idx_connectors_provider').on(table.provider, table.deletedAt),
  ]
);
