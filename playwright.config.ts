import { defineConfig } from '@playwright/test';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

const PORT = Number(process.env.PORT ?? 3100);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html']] : [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${PORT}`,
    url: BASE_URL,
    env: {
      E2E_MEMORY_DB: '1',
      ADMIN_ID: 'admin',
      ADMIN_PASSWORD: 'phase0-e2e-admin-password',
      JWT_SECRET: 'phase0-e2e-jwt-secret-with-at-least-32-bytes',
      RESEND_API_KEY: '',
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
