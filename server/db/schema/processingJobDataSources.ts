import { pgTable, uuid, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { processingJobs } from './processingJobs';
import { dataSources } from './dataSources';

export const processingJobDataSources = pgTable(
  'processing_job_data_sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    processingJobId: uuid('processing_job_id')
      .notNull()
      .references(() => processingJobs.id),
    dataSourceId: uuid('data_source_id')
      .notNull()
      .references(() => dataSources.id),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_pjds_deleted').on(table.deletedAt),
    index('idx_pjds_job').on(table.processingJobId, table.deletedAt),
    index('idx_pjds_source').on(table.dataSourceId, table.deletedAt),
    unique('idx_pjds_unique_active')
      .on(table.processingJobId, table.dataSourceId)
      .nullsNotDistinct()
      .where(table.deletedAt.isNull()),
  ]
);
