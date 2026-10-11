// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { expect, test } from '@playwright/test';
import { openGame, screen, startFirstLevel } from './helpers';

test('after one visit the game starts and plays without a network (P-05)', async ({ page, context }) => {
  await openGame(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // The first visit may still be uncontrolled; one reload puts every asset through the worker.
  await page.reload();
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('canvas#game')).toBeVisible();
  await expect.poll(() => screen(page)).toBe('title');
  await startFirstLevel(page);
  expect(await screen(page)).toBe('play');
  await context.setOffline(false);
});
