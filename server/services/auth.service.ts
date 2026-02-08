import bcrypt from 'bcrypt';
import { db } from '../db/index';
import { users } from '../db/schema/index';
import { eq, and, isNull } from 'drizzle-orm';
import { generateToken, TokenPayload } from '../lib/auth';
import { UnauthorizedError, NotFoundError } from '../lib/errors';

export async function login(email: string, password: string) {
  const user = await db.query.users.findFirst({
    where: and(eq(users.email, email), isNull(users.deletedAt)),
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const payload: TokenPayload = {
    id: user.id,
    organisationId: user.organisationId,
    role: user.role,
  };

  const token = generateToken(payload);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      organisationId: user.organisationId,
    },
  };
}

export async function logout(userId: string) {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // This method exists for future session management if needed
  return;
}

export async function validateSession(userId: string) {
  const user = await db.query.users.findFirst({
    where: and(eq(users.id, userId), isNull(users.deletedAt)),
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    organisationId: user.organisationId,
  };
}
