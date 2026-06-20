import { expect, test } from '@playwright/test';

test.describe('Phase-0 public and authentication gates', () => {
  test('landing page remains public', async ({ request }) => {
    const response = await request.get('/');
    const body = await response.text();

    expect(response.status()).toBe(200);
    expect(body).toContain('OnChain SafeNS');
  });

  for (const targetPath of ['/fraud-lookup', '/safe-name']) {
    test(`${targetPath} redirects unauthenticated users to email verification`, async ({
      request,
    }) => {
      const response = await request.get(targetPath, { maxRedirects: 0 });

      expect(response.status()).toBe(307);
      const location = response.headers().location ?? '';
      expect(location).toContain('/auth/verify');
      expect(decodeURIComponent(location)).toContain(`redirect=${targetPath}`);
    });
  }

  test('admin approval API rejects unauthenticated requests before handler work', async ({
    request,
  }) => {
    const response = await request.get('/api/v1/admin/approve');
    const body = await response.json();

    expect(response.status()).toBe(401);
    expect(body).toEqual({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Admin authentication is required.',
      },
    });
  });

  for (const apiPath of [
    '/api/v1/fraud/lookup?address=0xBAD0000000000000000000000000000000000001&chain=ethereum',
    '/api/v1/resolve?name=alice.safe',
  ]) {
    test(`${apiPath} requires an authenticated user session`, async ({ request }) => {
      const response = await request.get(apiPath);
      const body = await response.json();

      expect(response.status()).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });
  }
});
