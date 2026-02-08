import { db } from '../db/index';
import { canonicalSchemas } from '../db/schema/index';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError } from '../lib/errors';

export async function listCanonicalSchemas(category?: string) {
  let conditions = [isNull(canonicalSchemas.deletedAt)];

  if (category) {
    conditions.push(eq(canonicalSchemas.category, category as any));
  }

  const schemaList = await db.query.canonicalSchemas.findMany({
    where: and(...conditions),
  });

  return schemaList;
}

export async function getCanonicalSchemaById(schemaId: string) {
  const schema = await db.query.canonicalSchemas.findFirst({
    where: and(eq(canonicalSchemas.id, schemaId), isNull(canonicalSchemas.deletedAt)),
  });

  if (!schema) {
    throw new NotFoundError('Canonical schema not found');
  }

  return schema;
}
