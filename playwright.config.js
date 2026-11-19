// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { AUTH_FILE } = require('./playwright/constants');

module.exports = defineConfig({
  testDir: './playwright',
  // Every test runs in parallel, spread across worker processes (one browser each).
  // GitHub's ubuntu-latest runner has 4 vCPUs, so CI uses all of them; locally
  // half of the cores keeps the machine usable. Override with --workers=N.
  fullyParallel: true,
  workers: process.env.CI ? '100%' : '50%',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // On CI each shard writes a blob report; the merge job turns them into one HTML report
  reporter: process.env.CI
    ? [['list'], ['blob']]
    : [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],

  use: {
    baseURL: 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Starts ServeRest for the API project (reuses one already running locally)
  webServer: {
    command: 'npm run api:server',
    url: 'http://localhost:3000/usuarios',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },

  projects: [
    // Logs in once and saves the session; the browser projects reuse it
    { name: 'setup', testDir: './playwright/tests', testMatch: /auth\.setup\.js/ },
    {
      name: 'chromium',
      testDir: './playwright/tests',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      testDir: './playwright/tests',
      use: { ...devices['Pixel 7'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    // API tests: no browser, only Playwright's request fixture against ServeRest
    {
      name: 'api',
      testDir: './playwright/api',
      use: { baseURL: 'http://localhost:3000' },
    },
  ],
});
