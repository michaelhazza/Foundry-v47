import bcrypt from 'bcrypt';
import { db } from '../db/index';
import { users } from '../db/schema/index';
import { eq, and, isNull } from 'drizzle-orm';
import { NotFoundError, ConflictError } from '../lib/errors';

const SALT_ROUNDS = 10;

export async function createUser(
  organisationId: string,
  email: string,
  password: string,
  role: 'admin' | 'member'
) {
  // Check if user with this email already exists
  const existingUser = await db.query.users.findFirst({
    where: and(eq(users.email, email), isNull(users.deletedAt)),
  });

  if (existingUser) {
    throw new ConflictError('User with this email already exists');
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await db
    .insert(users)
    .values({
      organisationId,
      email,
      passwordHash,
      role,
    })
    .returning();

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function listUsers(organisationId: string) {
  const userList = await db.query.users.findMany({
    where: and(eq(users.organisationId, organisationId), isNull(users.deletedAt)),
  });

  // Return users without password hashes
  return userList.map(({ passwordHash, ...user }) => user);
}

export async function getUserById(organisationId: string, userId: string) {
  const user = await db.query.users.findFirst({
    where: and(
      eq(users.id, userId),
      eq(users.organisationId, organisationId),
      isNull(users.deletedAt)
    ),
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateUser(
  organisationId: string,
  userId: string,
  email: string,
  role: 'admin' | 'member'
) {
  const user = await db.query.users.findFirst({
    where: and(
      eq(users.id, userId),
      eq(users.organisationId, organisationId),
      isNull(users.deletedAt)
    ),
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Check if email is being changed to an existing email
  if (email !== user.email) {
    const existingUser = await db.query.users.findFirst({
      where: and(eq(users.email, email), isNull(users.deletedAt)),
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }
  }

  const [updated] = await db
    .update(users)
    .set({
      email,
      role,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  const { passwordHash, ...userWithoutPassword } = updated;
  return userWithoutPassword;
}

export async function deleteUser(organisationId: string, userId: string) {
  const user = await db.query.users.findFirst({
    where: and(
      eq(users.id, userId),
      eq(users.organisationId, organisationId),
      isNull(users.deletedAt)
    ),
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Soft delete
  await db
    .update(users)
    .set({
      deletedAt: new Date(),
    })
    .where(eq(users.id, userId));
}
