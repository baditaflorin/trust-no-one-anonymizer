import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4287/trust-no-one-anonymizer/',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run pages-preview',
    url: 'http://127.0.0.1:4287/trust-no-one-anonymizer/',
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
