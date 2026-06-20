import { timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-response';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function safeEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

async function adminLoginHandler(req: NextRequest) {
  const { admin_id, password } = (await req.json()) as {
    admin_id?: string;
    password?: string;
  };

  const configuredAdminId = process.env.ADMIN_ID;
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredAdminId || !configuredPassword) {
    return errorResponse('CONFIGURATION_ERROR', 'Admin credentials are not configured.', 500);
  }

  const requestedAdminId = admin_id || configuredAdminId;
  const idMatches = safeEqual(requestedAdminId, configuredAdminId);
  const passwordMatches = password ? safeEqual(password, configuredPassword) : false;

  if (!idMatches || !passwordMatches) {
    return errorResponse('UNAUTHORIZED', 'Admin credentials are invalid.', 401);
  }

  const sessionMinutes = Number(process.env.ADMIN_SESSION_MINUTES || '30');
  const token = await signToken(
    {
      operatorId: configuredAdminId,
      email: `${configuredAdminId}@admin.local`,
      role: 'admin',
    },
    `${sessionMinutes}m`,
  );

  cookies().set({
    name: 'admin_session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: sessionMinutes * 60,
  });

  return successResponse({ success: true });
}

export const POST = withErrorHandler(adminLoginHandler);
