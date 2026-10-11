// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { expect, test } from '@playwright/test';
import { advance, assignWhen, clickMenu, clickPanel, gameState, openGame, playUntilEnd, screen, startFirstLevel } from './helpers';

test.describe('playing Fun 1 (P-01, C-01, C-02, G-10)', () => {
  test('win by mouse: select the digger in the panel, click a lemming, reach the exit', async ({ page }) => {
    const errors = await openGame(page);
    await startFirstLevel(page);
    await clickPanel(page, 'digger');
    expect((await gameState(page)).selectedSkill).toBe('digger');
    await assignWhen(page, (l) => l.action === 'walking' && l.x >= 300 && l.x <= 360);
    await expect.poll(async () => (await gameState(page)).skills.digger).toBe(9);
    await playUntilEnd(page);
    expect(await screen(page)).toBe('result');
    const end = await gameState(page);
    expect(end.outcome).toBe('won');
    expect(end.saved).toBeGreaterThanOrEqual(1);
    // The win unlocked progress; the result menu offers a retry.
    await clickMenu(page, 'menu');
    expect(await screen(page)).toBe('title');
    expect(errors).toEqual([]);
  });

  test('keyboard: F-keys and digits select skills, pause, release rate; nuke needs two presses', async ({ page }) => {
    const errors = await openGame(page);
    await page.keyboard.press('Enter');
    await expect.poll(() => screen(page)).toBe('preview');
    await page.keyboard.press('Enter');
    await expect.poll(() => screen(page)).toBe('play');
    await page.keyboard.press('F10');
    expect((await gameState(page)).selectedSkill).toBe('digger');
    await page.keyboard.press('3');
    expect((await gameState(page)).selectedSkill).toBe('bomber');
    await page.keyboard.press('F2');
    await advance(page, 120);
    expect((await gameState(page)).releaseRate).toBe(51);
    await page.keyboard.press('p');
    expect((await gameState(page)).paused).toBe(true);
    await page.keyboard.press('p');
    await page.keyboard.press('n');
    await advance(page, 120);
    expect((await gameState(page)).nuking).toBe(false);
    await page.keyboard.press('n');
    await page.keyboard.press('n');
    await advance(page, 120);
    expect((await gameState(page)).nuking).toBe(true);
    await playUntilEnd(page);
    expect(await screen(page)).toBe('result');
    expect(errors).toEqual([]);
  });

  test('conveniences: fast-forward, scrolling and restart', async ({ page }) => {
    const errors = await openGame(page);
    await startFirstLevel(page);
    await page.keyboard.press('f');
    expect((await gameState(page)).fastForward).toBe(true);
    const before = (await gameState(page)).viewX;
    await page.keyboard.press('ArrowRight');
    expect((await gameState(page)).viewX).toBeGreaterThan(before);
    await advance(page, 3000);
    const ticksBefore = (await gameState(page)).tick;
    await page.keyboard.press('r');
    // Fast-forward stays on and the frame loop keeps running, so only "much earlier" is stable.
    expect((await gameState(page)).tick).toBeLessThan(ticksBefore / 2);
    await page.keyboard.press('Escape');
    expect(await screen(page)).toBe('title');
    expect(errors).toEqual([]);
  });
});
