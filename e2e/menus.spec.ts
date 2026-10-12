// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { appVersion, clickMenu, openGame, screen, settings, startFirstLevel } from './helpers';

test.describe('menus and settings (V-08, V-11, I-01, R-05, L-02)', () => {
  test('language and theme persist across a reload', async ({ page }) => {
    const errors = await openGame(page);
    await clickMenu(page, 'settings');
    expect(await screen(page)).toBe('settings');
    const start = (await settings(page)).language;
    await clickMenu(page, 'language');
    expect((await settings(page)).language).not.toBe(start);
    await clickMenu(page, 'theme');
    expect((await settings(page)).theme).toBe('classic');
    await page.reload();
    await expect.poll(() => page.evaluate('typeof window.__bavarianLemmings')).toBe('object');
    expect((await settings(page)).theme).toBe('classic');
    expect((await settings(page)).language).not.toBe(start);
    expect(errors).toEqual([]);
  });

  test('the Bayern button switches the theme and a Bavarian level runs', async ({ page }) => {
    const errors = await openGame(page);
    expect((await settings(page)).theme).toBe('bavarian');
    await clickMenu(page, 'settings');
    await clickMenu(page, 'theme');
    expect((await settings(page)).theme).toBe('classic');
    await clickMenu(page, 'back');
    await clickMenu(page, 'bayern');
    expect((await settings(page)).theme).toBe('bavarian');
    await startFirstLevel(page);
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
  });

  test('the touch layout can be chosen on a desktop and works with the mouse (C-06)', async ({ page }) => {
    const errors = await openGame(page);
    await clickMenu(page, 'settings');
    await clickMenu(page, 'layout');
    await clickMenu(page, 'layout');
    expect((await settings(page)).layout).toBe('touch');
    await clickMenu(page, 'back');
    await startFirstLevel(page);
    expect(await page.evaluate('window.__bavarianLemmings.layout()')).toBe('touch');
    await page.locator('[data-touch-button="builder"]').click();
    expect(await page.evaluate('window.__bavarianLemmings.state().selectedSkill')).toBe('builder');
    await page.locator('[data-touch-button="menu"]').click();
    expect(await screen(page)).toBe('title');
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

  test('title and credits show the running version from package.json (M6.145)', async ({ page }) => {
    const errors = await openGame(page);
    const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(await appVersion(page)).toBe(version);
    await clickMenu(page, 'credits');
    expect(await screen(page)).toBe('credits');
    expect(errors).toEqual([]);
  });
});
