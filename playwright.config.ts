import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PORT ?? 4321);
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: origin,
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'node scripts/serve-dist.mjs',
    url: `${origin}/__health`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
