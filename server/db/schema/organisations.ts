import { pgTable, uuid, text, timestamp, index, unique } from 'drizzle-orm/pg-core';

export const organisations = pgTable(
  'organisations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_organisations_deleted').on(table.deletedAt),
    unique('idx_organisations_name_active')
      .on(table.name)
      .nullsNotDistinct()
      .where(table.deletedAt.isNull()),
  ]
);
