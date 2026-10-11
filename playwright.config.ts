// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run in Chromium only (owner decision 2026-10-11, AGENTS.md): faster, one browser.
// Firefox is checked by manual play-testing; `BL_E2E_FIREFOX=1 npx playwright test` adds it on demand.
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  outputDir: 'test-results',
  use: { baseURL: 'http://localhost:4173', viewport: { width: 1280, height: 800 } },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    ...(process.env.BL_E2E_FIREFOX === '1'
      ? [{ name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 800 } } }]
      : []),
  ],
  webServer: {
    // Always test what was just built; reusing a stray server could certify a stale dist/.
    command: 'npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
