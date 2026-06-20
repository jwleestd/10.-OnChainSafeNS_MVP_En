import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required to sign or verify sessions.');
  }
  return new TextEncoder().encode(secret);
}

export interface UserSession {
  userId: string;
  email: string;
  role: 'user';
}

export interface AdminSession {
  operatorId: string;
  email: string;
  role: 'admin';
}

type SessionPayload = UserSession | AdminSession;

/**
 * JWT 토큰 생성
 */
export async function signToken(payload: SessionPayload, expiresIn: string = '24h'): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());
}

/**
 * JWT 토큰 검증
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * 현재 로그인된 관리자 세션 가져오기
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const token = cookies().get('admin_session')?.value;
  if (!token) return null;

  const session = await verifyToken(token);
  if (session && session.role === 'admin') {
    return session as AdminSession;
  }
  return null;
}

/**
 * 현재 로그인된 유저 세션 가져오기
 */
export async function getUserSession(): Promise<UserSession | null> {
  const token = cookies().get('user_session')?.value;
  if (!token) return null;

  const session = await verifyToken(token);
  if (session && session.role === 'user') {
    return session as UserSession;
  }
  return null;
}
