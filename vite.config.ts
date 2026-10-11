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
    // Audio rendering tests are CPU-heavy; parallel worktree pipelines can slow them past 5 s.
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
      // Code that needs a real browser (canvas, Web Audio, Pointer Events) is covered by Playwright in e2e/.
      include: ['src/**/*.ts'],
      // src/audio/engine.ts is the thin Web Audio wrapper (no AudioContext in node); its logic lives in
      // the pure fm.ts, sfx.ts and music.ts, which are unit tested, and Playwright covers the wrapper.
      // Browser-only wiring (canvas, Web Audio, DOM events) is covered by the Playwright suite in e2e/.
      exclude: [
        'src/main.ts',
        'src/audio/engine.ts',
        'src/ui/app.ts',
        'src/render/draw.ts',
        'src/render/playfield.ts',
        'src/render/panel/classic.ts',
        'src/render/panel/shared.ts',
        // The touch panel builds DOM buttons and draws on canvas; its geometry lives in ui/layout.ts
        // and its gestures in input/touchGestures.ts, both unit tested; Playwright covers the DOM.
        'src/render/panel/touch.ts',
      ],
      thresholds: { statements: 95, branches: 95, functions: 95, lines: 95 },
    },
  },
});
