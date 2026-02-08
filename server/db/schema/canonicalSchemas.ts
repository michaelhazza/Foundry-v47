import { pgTable, uuid, text, timestamp, index, unique, pgEnum, json, integer, boolean } from 'drizzle-orm/pg-core';

export const schemaCategoryEnum = pgEnum('schema_category', [
  'conversations',
  'knowledgeDocuments',
  'decisionRecords',
]);

export const canonicalSchemas = pgTable(
  'canonical_schemas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    version: integer('version').notNull(),
    category: schemaCategoryEnum('category').notNull(),
    schemaDefinition: json('schema_definition').notNull(),
    schemaDefinitionVersion: integer('schema_definition_version').notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_schemas_deleted').on(table.deletedAt),
    unique('idx_schemas_name_version_active')
      .on(table.name, table.version)
      .nullsNotDistinct()
      .where(table.deletedAt.isNull()),
    index('idx_schemas_category').on(table.category, table.deletedAt),
    index('idx_schemas_category_default').on(table.category, table.isDefault, table.deletedAt),
  ]
);
