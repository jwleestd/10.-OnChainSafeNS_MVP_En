import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, withErrorHandler } from '@/lib/api-response';
import { validateEmail } from '@/lib/validators';
import { sendVerificationCode } from '@/lib/email';
import { signToken } from '@/lib/auth';
import { EMAIL_VERIFICATION, ERROR_MESSAGES } from '@/lib/constants';
import { VerifyEmailRequest, VerifyEmailSendResponse, VerifyEmailVerifyResponse } from '@/types';

export const dynamic = 'force-dynamic';

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function verifyEmailHandler(req: NextRequest) {
  const body = (await req.json()) as VerifyEmailRequest;
  const { email, code } = body;

  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) {
    return errorResponse('VALIDATION_ERROR', emailCheck.error!, 400);
  }

  if (!code) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser?.verificationExpiresAt) {
      const timeRemaining = existingUser.verificationExpiresAt.getTime() - Date.now();
      const cooldownMs =
        EMAIL_VERIFICATION.EXPIRY_MINUTES * 60 * 1000 -
        EMAIL_VERIFICATION.COOLDOWN_SECONDS * 1000;

      if (timeRemaining > cooldownMs) {
        return errorResponse('RATE_LIMITED', ERROR_MESSAGES.RATE_LIMITED, 429);
      }
    }

    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION.EXPIRY_MINUTES * 60 * 1000);

    await prisma.user.upsert({
      where: { email },
      update: {
        verificationCode,
        verificationExpiresAt: expiresAt,
      },
      create: {
        email,
        emailVerified: false,
        verificationCode,
        verificationExpiresAt: expiresAt,
      },
    });

    const emailSent = await sendVerificationCode(email, verificationCode);
    if (!emailSent) {
      return errorResponse(
        'EMAIL_SEND_FAILED',
        'Verification email could not be sent. Please try again later.',
        502,
      );
    }

    return successResponse<VerifyEmailSendResponse>({
      message: 'Verification code has been sent.',
    });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.verificationCode) {
    return errorResponse('NOT_FOUND', 'Verification request was not found.', 404);
  }

  if (user.verificationExpiresAt && user.verificationExpiresAt < new Date()) {
    return errorResponse('EXPIRED', ERROR_MESSAGES.EXPIRED, 410);
  }

  if (user.verificationCode !== code) {
    return errorResponse('INVALID_CODE', ERROR_MESSAGES.INVALID_CODE, 401);
  }

  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: true,
      verificationCode: null,
      verificationExpiresAt: null,
    },
  });

  const token = await signToken({ userId: user.userId, email: user.email, role: 'user' });

  cookies().set({
    name: 'user_session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60,
  });

  return successResponse<VerifyEmailVerifyResponse>({ success: true });
}

export const POST = withErrorHandler(verifyEmailHandler);
