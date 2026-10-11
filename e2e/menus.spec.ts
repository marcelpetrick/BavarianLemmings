// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { expect, test } from '@playwright/test';
import { clickMenu, openGame, screen, settings, startFirstLevel } from './helpers';

test.describe('menus and settings (V-08, V-11, I-01, R-05, L-02)', () => {
  test('language and theme persist across a reload', async ({ page }) => {
    const errors = await openGame(page);
    await clickMenu(page, 'settings');
    expect(await screen(page)).toBe('settings');
    const start = (await settings(page)).language;
    await clickMenu(page, 'language');
    expect((await settings(page)).language).not.toBe(start);
    await clickMenu(page, 'theme');
    expect((await settings(page)).theme).toBe('bavarian');
    await page.reload();
    await expect.poll(() => page.evaluate('typeof window.__bavarianLemmings')).toBe('object');
    expect((await settings(page)).theme).toBe('bavarian');
    expect((await settings(page)).language).not.toBe(start);
    expect(errors).toEqual([]);
  });

  test('the Bayern button switches the theme and a Bavarian level runs', async ({ page }) => {
    const errors = await openGame(page);
    await clickMenu(page, 'bayern');
    expect((await settings(page)).theme).toBe('bavarian');
    await startFirstLevel(page);
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
  });

  test('credits show the homage notice; level select lists Fun 1', async ({ page }) => {
    const errors = await openGame(page);
    await clickMenu(page, 'credits');
    expect(await screen(page)).toBe('credits');
    await clickMenu(page, 'back');
    await clickMenu(page, 'levels');
    expect(await screen(page)).toBe('levels');
    await clickMenu(page, 'level:fun-01');
    expect(await screen(page)).toBe('preview');
    expect(errors).toEqual([]);
  });
});
