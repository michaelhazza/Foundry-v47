import { pgTable, uuid, text, timestamp, index, unique, pgEnum } from 'drizzle-orm/pg-core';
import { organisations } from './organisations';

export const userRoleEnum = pgEnum('user_role', ['admin', 'member']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organisationId: uuid('organisation_id')
      .notNull()
      .references(() => organisations.id),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').notNull().default('member'),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_users_deleted').on(table.deletedAt),
    index('idx_users_org').on(table.organisationId, table.deletedAt),
    unique('idx_users_email_active')
      .on(table.email)
      .nullsNotDistinct()
      .where(table.deletedAt.isNull()),
  ]
);
