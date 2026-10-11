// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { expect, test, type Page } from '@playwright/test';
import { advance, gameState, openGame, playUntilEnd, screen, type LemmingView } from './helpers';
import { Touch, buttonCentre, levelToClient, tapButton, tapIntoFirstLevel, tapMenu } from './touchHelpers';

// Runs only in the tablet projects (playwright.config.ts): Chromium with touch, landscape and portrait.

const layout = (page: Page): Promise<string> => page.evaluate<string>('window.__bavarianLemmings.layout()');

async function waitForLemming(page: Page, ready: (lemming: LemmingView) => boolean): Promise<LemmingView> {
  for (let i = 0; i < 400; i += 1) {
    const lemming = (await gameState(page)).lemmings.find(ready);
    if (lemming) return lemming;
    await advance(page, 60);
  }
  throw new Error('no lemming became ready');
}

test.describe('touch play (C-06, P-06)', () => {
  test('automatic layout picks the touch panel; every button is at least 48 × 48 CSS pixels', async ({ page }, info) => {
    const errors = await openGame(page);
    await tapIntoFirstLevel(page);
    expect(await layout(page)).toBe('touch');
    const orientation = await page.evaluate<string>('window.__bavarianLemmings.touchLayout().orientation');
    expect(orientation).toBe(info.project.name === 'tablet-portrait' ? 'portrait' : 'landscape');
    const buttons = page.locator('[data-touch-button]');
    expect(await buttons.count()).toBe(16);
    for (const box of await Promise.all((await buttons.all()).map((b) => b.boundingBox()))) {
      expect(box?.width).toBeGreaterThanOrEqual(48);
      expect(box?.height).toBeGreaterThanOrEqual(48);
    }
    // The playfield and the buttons never overlap.
    const field = await page.locator('#game').boundingBox();
    const digger = await page.locator('[data-touch-button="digger"]').boundingBox();
    expect(field && digger).toBeTruthy();
    const overlap =
      field!.x < digger!.x + digger!.width &&
      digger!.x < field!.x + field!.width &&
      field!.y < digger!.y + digger!.height &&
      digger!.y < field!.y + field!.height;
    expect(overlap).toBe(false);
    // The browser stays out of the way (vision 3.4.1).
    expect(await page.locator('#app').evaluate((e) => getComputedStyle(e).touchAction)).toBe('none');
    expect(await page.locator('body').evaluate((e) => getComputedStyle(e).userSelect)).toBe('none');
    expect(errors).toEqual([]);
  });

  test('win Fun 1 by touch only: tap the digger, press, aim and release on a lemming', async ({ page }) => {
    const errors = await openGame(page);
    const touch = await Touch.on(page);
    await tapIntoFirstLevel(page);
    await tapButton(page, 'digger');
    expect((await gameState(page)).selectedSkill).toBe('digger');
    const lemming = await waitForLemming(page, (l) => l.action === 'walking' && l.x >= 300 && l.x <= 360);
    await tapButton(page, 'pause');
    expect((await gameState(page)).paused).toBe(true);
    const target = (await gameState(page)).lemmings.find((l) => l.id === lemming.id) ?? lemming;
    // Touch a little beside the lemming: the 8 mm radius still finds it. Slide onto it, then lift.
    const beside = await levelToClient(page, target.x + 8, target.y - 12);
    const onIt = await levelToClient(page, target.x, target.y - 4);
    await touch.down(beside);
    await expect.poll(async () => (await gameState(page)).aiming).toBe(true);
    await touch.move(onIt);
    expect((await gameState(page)).skills.digger).toBe(10);
    await touch.up();
    await expect.poll(async () => (await gameState(page)).aiming).toBe(false);
    await tapButton(page, 'pause');
    await expect.poll(async () => (await gameState(page)).skills.digger).toBe(9);
    await playUntilEnd(page);
    expect(await screen(page)).toBe('result');
    const end = await gameState(page);
    expect(end.outcome).toBe('won');
    expect(end.saved).toBeGreaterThanOrEqual(1);
    expect(errors).toEqual([]);
  });

  test('a plain tap on a lemming assigns at once (M5.05)', async ({ page }) => {
    const errors = await openGame(page);
    await tapIntoFirstLevel(page);
    await tapButton(page, 'digger');
    const lemming = await waitForLemming(page, (l) => l.action === 'walking' && l.x >= 300 && l.x <= 360);
    await tapButton(page, 'pause');
    const target = (await gameState(page)).lemmings.find((l) => l.id === lemming.id) ?? lemming;
    const point = await levelToClient(page, target.x + 3, target.y - 6);
    await page.touchscreen.tap(point.x, point.y);
    await tapButton(page, 'pause');
    await expect.poll(async () => (await gameState(page)).skills.digger).toBe(9);
    expect(errors).toEqual([]);
  });

  test('sliding out of the playfield cancels; two fingers scroll; the minimap scrolls; a pinch zooms', async ({ page }) => {
    const errors = await openGame(page);
    const touch = await Touch.on(page);
    await tapIntoFirstLevel(page);
    await tapButton(page, 'digger');
    const lemming = await waitForLemming(page, (l) => l.action === 'walking');
    await tapButton(page, 'pause');
    const field = (await page.locator('#game').boundingBox())!;
    // Slide out: no assignment.
    await touch.down(await levelToClient(page, lemming.x, lemming.y - 4));
    await touch.move({ x: field.x + 10, y: field.y + field.height + 30 });
    await touch.up();
    await tapButton(page, 'pause');
    await advance(page, 200);
    expect((await gameState(page)).skills.digger).toBe(10);
    // Two fingers dragged to the left move the view to the right.
    const before = (await gameState(page)).viewX;
    const y = field.y + field.height / 2;
    const cx = field.x + field.width / 2;
    await touch.down({ x: cx, y, id: 1 });
    await touch.down({ x: cx, y, id: 1 }, { x: cx + 60, y, id: 2 });
    await touch.move({ x: cx - 120, y, id: 1 }, { x: cx - 60, y, id: 2 });
    await touch.up();
    expect((await gameState(page)).viewX).toBeGreaterThan(before);
    expect((await gameState(page)).skills.digger).toBe(10);
    // The minimap: tap at the left end, then drag to the right end.
    const left = await page.evaluate<{ x: number; y: number }>('window.__bavarianLemmings.touchMinimapToClient(0)');
    const right = await page.evaluate<{ x: number; y: number }>('window.__bavarianLemmings.touchMinimapToClient(639)');
    await touch.down(left);
    await touch.up();
    expect((await gameState(page)).viewX).toBe(0);
    await touch.down(left);
    await touch.move(right);
    await touch.up();
    expect((await gameState(page)).viewX).toBe(320);
    // Pinch out zooms in, pinch in zooms out.
    await touch.down({ x: cx - 20, y, id: 1 }, { x: cx + 20, y, id: 2 });
    await touch.move({ x: cx - 80, y, id: 1 }, { x: cx + 80, y, id: 2 });
    await touch.up();
    expect((await gameState(page)).zoomed).toBe(true);
    await touch.down({ x: cx - 80, y, id: 1 }, { x: cx + 80, y, id: 2 });
    await touch.move({ x: cx - 20, y, id: 1 }, { x: cx + 20, y, id: 2 });
    await touch.up();
    expect((await gameState(page)).zoomed).toBe(false);
    expect(errors).toEqual([]);
  });

  test('release rate repeats while held; the nuke needs a one-second hold or a double tap', async ({ page }) => {
    const errors = await openGame(page);
    const touch = await Touch.on(page);
    await tapIntoFirstLevel(page);
    const start = (await gameState(page)).releaseRate;
    await touch.down(await buttonCentre(page, 'releasePlus'));
    await page.waitForTimeout(1000);
    await touch.up();
    await advance(page, 120);
    expect((await gameState(page)).releaseRate).toBeGreaterThan(start + 2);
    // A short press on the nuke does nothing.
    const nuke = await buttonCentre(page, 'nuke');
    await touch.down(nuke);
    await page.waitForTimeout(200);
    await touch.up();
    await page.waitForTimeout(600);
    await advance(page, 120);
    expect((await gameState(page)).nuking).toBe(false);
    // The progress ring fills while held, and the nuke fires after one second.
    await touch.down(nuke);
    await page.waitForTimeout(500);
    const progress = Number(await page.locator('[data-touch-button="nuke"]').evaluate((e) => e.style.getPropertyValue('--progress')));
    expect(progress).toBeGreaterThan(0.2);
    expect(progress).toBeLessThan(1);
    await page.waitForTimeout(800);
    await touch.up();
    await advance(page, 120);
    expect((await gameState(page)).nuking).toBe(true);
    // Restart, then a double tap fires the nuke too.
    await tapButton(page, 'restart');
    expect((await gameState(page)).nuking).toBe(false);
    await touch.down(nuke);
    await touch.up();
    await touch.down(nuke);
    await touch.up();
    await advance(page, 120);
    expect((await gameState(page)).nuking).toBe(true);
    expect(errors).toEqual([]);
  });

  test('full screen, the menu button, and the classic layout chosen in the settings', async ({ page }) => {
    const errors = await openGame(page);
    await tapIntoFirstLevel(page);
    await tapButton(page, 'fullscreen');
    await tapButton(page, 'menu');
    expect(await screen(page)).toBe('title');
    await expect(page.locator('[data-touch-button="digger"]')).toBeHidden();
    await tapMenu(page, 'settings');
    await tapMenu(page, 'layout');
    expect(await page.evaluate('window.__bavarianLemmings.settings().layout')).toBe('classic');
    await tapMenu(page, 'back');
    await tapIntoFirstLevel(page);
    expect(await layout(page)).toBe('classic');
    await expect(page.locator('[data-touch-button="digger"]')).toBeHidden();
    expect(errors).toEqual([]);
  });
});
