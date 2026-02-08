import { pgTable, uuid, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { projects } from './projects';
import { dataSources } from './dataSources';

export const projectDataSources = pgTable(
  'project_data_sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    dataSourceId: uuid('data_source_id')
      .notNull()
      .references(() => dataSources.id),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('idx_pds_deleted').on(table.deletedAt),
    index('idx_pds_project').on(table.projectId, table.deletedAt),
    index('idx_pds_source').on(table.dataSourceId, table.deletedAt),
    unique('idx_pds_unique_active')
      .on(table.projectId, table.dataSourceId)
      .nullsNotDistinct()
      .where(table.deletedAt.isNull()),
  ]
);
