// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { defineConfig, devices } from '@playwright/test';

/**
 * Preview port: 4173 plus an offset derived from the checkout path, so several worktrees can run
 * their pipelines at the same time without fighting over one port. `BL_E2E_PORT` overrides it.
 */
function previewPort(): number {
  if (process.env.BL_E2E_PORT) return Number(process.env.BL_E2E_PORT);
  let hash = 0;
  for (const char of process.cwd()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return 4173 + (hash % 800);
}
const port = previewPort();

// End-to-end tests run in Chromium only (owner decision 2026-10-11, AGENTS.md): faster, one browser.
// Firefox is checked by manual play-testing; `BL_E2E_FIREFOX=1 npx playwright test` adds it on demand.
/** Specs that play by touch: they run only in the tablet projects, the others only on the desktop. */
const TOUCH_SPECS = /touch\.spec\.ts$/;
const TABLET = { ...devices['Desktop Chrome'], hasTouch: true, isMobile: true, deviceScaleFactor: 1 };

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  outputDir: 'test-results',
  use: { baseURL: `http://localhost:${port}`, viewport: { width: 1280, height: 800 } },
  projects: [
    { name: 'chromium', testIgnore: TOUCH_SPECS, use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    // P-06: touch play on a tablet, emulated in Chromium (touch events, coarse pointer, mobile viewport).
    { name: 'tablet-landscape', testMatch: TOUCH_SPECS, use: { ...TABLET, viewport: { width: 1280, height: 800 } } },
    { name: 'tablet-portrait', testMatch: TOUCH_SPECS, use: { ...TABLET, viewport: { width: 800, height: 1280 } } },
    ...(process.env.BL_E2E_FIREFOX === '1'
      ? [{ name: 'firefox', testIgnore: TOUCH_SPECS, use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 800 } } }]
      : []),
  ],
  webServer: {
    // Always test what was just built; reusing a stray server could certify a stale dist/.
    command: `npx vite preview --port ${port} --strictPort`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
