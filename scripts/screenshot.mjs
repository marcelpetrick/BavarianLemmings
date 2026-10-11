// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * screenshot.mjs: capture the README screenshots from the real, running production build.
 *
 * It builds nothing. It expects a finished `dist/` (run `npx vite build` first), starts
 * `vite preview` on its own port, drives the game in Chromium through the `?test` hook
 * (`window.__bavarianLemmings`, the same hook the end-to-end tests use) with the real mouse, and
 * writes 1280×800 PNG files to `docs/screenshots/`:
 *
 *   classic-title.png    title screen, classic theme
 *   classic-play.png     Fun 1 in play, classic theme
 *   bavarian-title.png   title screen after clicking the "Bayern" menu item
 *   bavarian-play.png    Fun 1 in play, Bavarian theme
 *
 * Every capture uses a fresh browser context, so saved settings never leak between shots.
 *
 * Usage:      node scripts/screenshot.mjs   (expects dist/; `npm run screenshots` builds first)
 * Exit codes: 0 = all screenshots written, 1 = dist/ missing, server did not start or a capture failed
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const PORT = 4178;
const BASE_URL = `http://localhost:${PORT}`;
const OUTPUT_DIRECTORY = 'docs/screenshots';
const VIEWPORT = { width: 1280, height: 800 };
/** Game time in milliseconds to run Fun 1 before the shot, so lemmings are out and walking. */
const PLAY_TIME_MS = 9000;

if (!existsSync('dist/index.html')) {
  console.error('screenshot: dist/ is missing; run `npx vite build` first');
  process.exit(1);
}
mkdirSync(OUTPUT_DIRECTORY, { recursive: true });

const server = spawn('npx', ['--no-install', 'vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: 'ignore',
  detached: true,
});

/** Stop the preview server and its child processes (npx starts vite as a child). */
function stopServer() {
  try {
    if (server.pid !== undefined) process.kill(-server.pid, 'SIGTERM');
  } catch {
    // Already gone.
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) return;
    } catch {
      // Not up yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`vite preview did not answer on ${BASE_URL} within 20 s`);
}

/** Evaluate an expression on the test hook. */
function hook(page, expression) {
  return page.evaluate(`window.__bavarianLemmings.${expression}`);
}

async function waitForScreen(page, name) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if ((await hook(page, 'screen()')) === name) return;
    await page.waitForTimeout(50);
  }
  throw new Error(`screen ${name} never appeared (now: ${await hook(page, 'screen()')})`);
}

async function clickMenu(page, id) {
  const point = await hook(page, `menuItem(${JSON.stringify(id)})`);
  if (!point) throw new Error(`menu item ${id} not on screen`);
  await page.mouse.click(point.x, point.y);
}

async function clickScreen(page, x, y) {
  const point = await hook(page, `screenToClient(${x}, ${y})`);
  await page.mouse.click(point.x, point.y);
}

async function openGame(browser) {
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${BASE_URL}/?test`);
  await page.waitForFunction(() => typeof window.__bavarianLemmings === 'object');
  return { context, page, errors };
}

async function capture(page, name) {
  // Two animation frames, so the canvas shows the latest state.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const path = `${OUTPUT_DIRECTORY}/${name}.png`;
  await page.screenshot({ path });
  console.log(`wrote ${path}`);
}

async function shootTheme(browser, theme) {
  const { context, page, errors } = await openGame(browser);
  if (theme === 'bavarian') await clickMenu(page, 'bayern');
  await waitForScreen(page, 'title');
  await capture(page, `${theme}-title`);
  await clickMenu(page, 'play');
  await waitForScreen(page, 'preview');
  await clickScreen(page, 160, 100);
  await waitForScreen(page, 'play');
  await hook(page, `advance(${PLAY_TIME_MS})`);
  await capture(page, `${theme}-play`);
  await context.close();
  if (errors.length > 0) throw new Error(`page errors in ${theme}: ${errors.join('; ')}`);
}

let exitCode = 0;
try {
  await waitForServer();
  const browser = await chromium.launch();
  try {
    await shootTheme(browser, 'classic');
    await shootTheme(browser, 'bavarian');
  } finally {
    await browser.close();
  }
} catch (error) {
  console.error(`screenshot: ${error instanceof Error ? error.message : String(error)}`);
  exitCode = 1;
} finally {
  stopServer();
}
process.exit(exitCode);
