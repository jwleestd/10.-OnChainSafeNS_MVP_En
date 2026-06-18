import { SignJWT } from 'jose/jwt/sign';
import { E2E_TEST } from '../../src/lib/e2e-memory-prisma';

export const TEST = {
  users: {
    verified: E2E_TEST.users.verified.email,
    second: E2E_TEST.users.second.email,
    unverified: E2E_TEST.users.unverified.email,
    restricted: E2E_TEST.users.restricted.email,
    auth: E2E_TEST.users.auth.email,
    sendFailure: E2E_TEST.users.sendFailure.email,
  },
  admin: E2E_TEST.admin,
  addresses: E2E_TEST.addresses,
  names: E2E_TEST.names,
};

const userIdsByEmail = new Map<string, string>([
  [E2E_TEST.users.verified.email, E2E_TEST.users.verified.id],
  [E2E_TEST.users.second.email, E2E_TEST.users.second.id],
  [E2E_TEST.users.unverified.email, E2E_TEST.users.unverified.id],
  [E2E_TEST.users.restricted.email, E2E_TEST.users.restricted.id],
  [E2E_TEST.users.auth.email, E2E_TEST.users.auth.id],
  [E2E_TEST.users.sendFailure.email, E2E_TEST.users.sendFailure.id],
]);

const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only',
);

async function signCookie(
  cookieName: 'user_session' | 'admin_session',
  payload: Record<string, string>,
) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(jwtSecret);

  return `${cookieName}=${token}`;
}

export async function userCookie(email: string = TEST.users.verified) {
  const userId = userIdsByEmail.get(email);
  if (!userId) throw new Error(`Missing test user id for ${email}`);

  return signCookie('user_session', {
    userId,
    email,
    role: 'user',
  });
}

export async function adminCookie() {
  return signCookie('admin_session', {
    operatorId: TEST.admin.operatorId,
    email: TEST.admin.email,
    role: 'admin',
  });
}
