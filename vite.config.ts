// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative asset paths, so the same build works under /BavarianLemmings/ on GitHub Pages and at / in nginx.
  base: './',
  build: { target: 'es2022' },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
      // Code that needs a real browser (canvas, Web Audio, Pointer Events) is covered by Playwright in e2e/.
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts'],
      thresholds: { statements: 95, branches: 95, functions: 95, lines: 95 },
    },
  },
});
