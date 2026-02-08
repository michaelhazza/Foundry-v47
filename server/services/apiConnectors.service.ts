import { db } from '../db/index';
import { apiConnectors } from '../db/schema/index';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError } from '../lib/errors';

export async function listApiConnectors() {
  const connectorList = await db.query.apiConnectors.findMany({
    where: isNull(apiConnectors.deletedAt),
  });

  return connectorList;
}

export async function getApiConnectorById(connectorId: string) {
  const connector = await db.query.apiConnectors.findFirst({
    where: and(eq(apiConnectors.id, connectorId), isNull(apiConnectors.deletedAt)),
  });

  if (!connector) {
    throw new NotFoundError('API connector not found');
  }

  return connector;
}
