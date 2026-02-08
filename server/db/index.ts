import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { neon } from '@neondatabase/serverless';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema/index';

const databaseUrl = process.env.DATABASE_URL!;

// Runtime driver detection based on DATABASE_URL scheme
let db: ReturnType<typeof drizzleNeon> | ReturnType<typeof drizzlePg>;

if (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) {
  // Check if URL contains Neon-specific patterns (wss://, pooler, etc.)
  const isNeon = databaseUrl.includes('neon.tech') || databaseUrl.includes('pooler');

  if (isNeon && process.env.NODE_ENV === 'production') {
    // Use Neon serverless driver in production
    const sql = neon(databaseUrl);
    db = drizzleNeon(sql, { schema }) as ReturnType<typeof drizzleNeon>;
  } else {
    // Use pg driver for local development or non-Neon PostgreSQL
    const pool = new Pool({ connectionString: databaseUrl });
    db = drizzlePg(pool, { schema }) as ReturnType<typeof drizzlePg>;
  }
} else {
  throw new Error('DATABASE_URL must start with postgresql:// or postgres://');
}

export { db };
