import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose/jwt/verify';

const USER_PROTECTED_ROUTES = ['/fraud-lookup', '/safe-name'];

type MiddlewareSession = {
  role?: 'user' | 'admin';
};

async function verifyToken(token: string): Promise<MiddlewareSession | null> {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret));
    return payload as MiddlewareSession;
  } catch {
    return null;
  }
}

function unauthorizedResponse(message: string) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
      },
    },
    { status: 401 },
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/v1/admin') && pathname !== '/api/v1/admin/login') {
    const token = request.cookies.get('admin_session')?.value;
    if (!token) {
      return unauthorizedResponse('Admin authentication is required.');
    }

    const session = await verifyToken(token);
    if (!session || session.role !== 'admin') {
      return unauthorizedResponse('Admin session is invalid.');
    }
  }

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_session')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/admin-login', request.url));
    }
  }

  if (USER_PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const token = request.cookies.get('user_session')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session || session.role !== 'user') {
      const verifyUrl = new URL('/auth/verify', request.url);
      verifyUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(verifyUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/v1/admin/:path*', '/admin/:path*', '/fraud-lookup', '/safe-name'],
};
