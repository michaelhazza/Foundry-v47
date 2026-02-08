import { pgTable, uuid, timestamp, index, pgEnum, json } from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { users } from './users';

export const jobStatusEnum = pgEnum('job_status', ['queued', 'running', 'completed', 'failed']);
export const jobTriggerEnum = pgEnum('job_trigger', ['user', 'system', 'scheduler']);

export const processingJobs = pgTable(
  'processing_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    status: jobStatusEnum('status').notNull().default('queued'),
    configSnapshot: json('config_snapshot').notNull(),
    errorDetails: json('error_details'),
    triggeredBy: jobTriggerEnum('triggered_by').notNull(),
    createdByUserId: uuid('created_by_user_id').references(() => users.id),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_jobs_deleted').on(table.deletedAt),
    index('idx_jobs_project_status').on(table.projectId, table.status, table.deletedAt),
    index('idx_jobs_created_by').on(table.createdByUserId, table.deletedAt),
    index('idx_jobs_started').on(table.startedAt),
    index('idx_jobs_completed').on(table.completedAt),
  ]
);
