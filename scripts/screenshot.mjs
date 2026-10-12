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
 *   bavarian-title.png   title screen, Bavarian theme
 *   bavarian-play.png    Fun 1 in play, Bavarian theme
 *
 *   bavarian-fun06.png   bomber level before assigning a skill
 *   bavarian-bomber-blast.png  first individual bomber explosion
 *   bavarian-bomber-aftermath.png  opened floor after the blast
 *   bavarian-nuke-armed.png  confirmation feedback after the first nuke click
 *   bavarian-nuke-blast.png  first explosion of the confirmed nuke
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

async function openGame(browser, progress = {}) {
  const context = await browser.newContext({ viewport: VIEWPORT });
  await context.addInitScript((savedProgress) => {
    localStorage.setItem('bl.v1.progress', JSON.stringify(savedProgress));
  }, progress);
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
  // Select each theme explicitly: fresh installations default to Bavarian.
  await clickMenu(page, 'settings');
  const settings = await hook(page, 'settings()');
  if (settings.theme !== theme) await clickMenu(page, 'theme');
  await clickMenu(page, 'back');
  if ((await hook(page, 'settings()')).theme !== theme) throw new Error(`could not select ${theme} theme`);
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

/** Capture the first explosion, rather than guessing a wall-clock delay or editing game state. */
async function advanceToExplosion(page) {
  await hook(page, 'events()');
  for (let tick = 0; tick < 200; tick += 1) {
    await hook(page, 'advance(60)');
    if ((await hook(page, 'events()')).includes('explode')) {
      await page.keyboard.press('p');
      return;
    }
  }
  throw new Error('no explosion appeared within 12 seconds of game time');
}

async function shootBombs(browser) {
  const { context, page, errors } = await openGame(browser, { fun: 5 });
  await clickMenu(page, 'play');
  await waitForScreen(page, 'preview');
  await clickScreen(page, 160, 100);
  await waitForScreen(page, 'play');
  await hook(page, 'advance(3000)');
  await page.keyboard.press('p');
  await capture(page, 'bavarian-fun06');
  const state = await hook(page, 'state()');
  if (state.levelId !== 'fun-06') throw new Error(`expected Fun 6, got ${state.levelId}`);
  const lemming = state.lemmings[0];
  if (!lemming) throw new Error('Fun 6 has no lemming to assign a bomber');
  await clickScreen(page, 72, 185);
  const point = await hook(page, `levelToClient(${lemming.x}, ${lemming.y - 4})`);
  await page.mouse.click(point.x, point.y);
  await page.keyboard.press('.');
  await page.keyboard.press('p');
  await advanceToExplosion(page);
  await capture(page, 'bavarian-bomber-blast');
  await page.keyboard.press('p');
  await hook(page, 'advance(1200)');
  await page.keyboard.press('p');
  await capture(page, 'bavarian-bomber-aftermath');
  await context.close();
  if (errors.length > 0) throw new Error(`page errors in bomber captures: ${errors.join('; ')}`);

  const nuke = await openGame(browser);
  await clickMenu(nuke.page, 'play');
  await waitForScreen(nuke.page, 'preview');
  await clickScreen(nuke.page, 160, 100);
  await waitForScreen(nuke.page, 'play');
  await hook(nuke.page, 'advance(9000)');
  await clickScreen(nuke.page, 184, 185);
  await capture(nuke.page, 'bavarian-nuke-armed');
  await clickScreen(nuke.page, 184, 185);
  await advanceToExplosion(nuke.page);
  await capture(nuke.page, 'bavarian-nuke-blast');
  await nuke.context.close();
  if (nuke.errors.length > 0) throw new Error(`page errors in nuke captures: ${nuke.errors.join('; ')}`);
}

let exitCode = 0;
try {
  await waitForServer();
  const browser = await chromium.launch();
  try {
    await shootTheme(browser, 'classic');
    await shootTheme(browser, 'bavarian');
    await shootBombs(browser);
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
