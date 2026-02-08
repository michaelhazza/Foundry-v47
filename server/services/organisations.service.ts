import { db } from '../db/index';
import { organisations } from '../db/schema/index';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError } from '../lib/errors';

export async function getCurrentOrganisation(organisationId: string) {
  const organisation = await db.query.organisations.findFirst({
    where: and(eq(organisations.id, organisationId), isNull(organisations.deletedAt)),
  });

  if (!organisation) {
    throw new NotFoundError('Organisation not found');
  }

  return organisation;
}

export async function updateOrganisation(organisationId: string, name: string) {
  const organisation = await db.query.organisations.findFirst({
    where: and(eq(organisations.id, organisationId), isNull(organisations.deletedAt)),
  });

  if (!organisation) {
    throw new NotFoundError('Organisation not found');
  }

  const [updated] = await db
    .update(organisations)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(organisations.id, organisationId))
    .returning();

  return updated;
}
