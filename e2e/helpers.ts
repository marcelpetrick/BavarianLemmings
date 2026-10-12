// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { expect, type Page } from '@playwright/test';

export interface LemmingView {
  id: number;
  x: number;
  y: number;
  action: string;
  bombTicks: number;
}

export interface GameView {
  levelId: string;
  tick: number;
  outcome: string;
  saved: number;
  spawned: number;
  releaseRate: number;
  skills: Record<string, number>;
  selectedSkill: string | null;
  paused: boolean;
  fastForward: boolean;
  zoomed: boolean;
  /** A finger aims on the playfield (touch press-aim-release). */
  aiming: boolean;
  nuking: boolean;
  nukeArmed: boolean;
  viewX: number;
  lemmings: LemmingView[];
}

interface Point {
  x: number;
  y: number;
}

/** Open the game with the test hook and collect page errors. */
export async function openGame(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?test');
  await expect
    .poll(() => page.evaluate(() => typeof (window as unknown as { __bavarianLemmings?: unknown }).__bavarianLemmings))
    .toBe('object');
  return errors;
}

function hook<T>(page: Page, expression: string): Promise<T> {
  return page.evaluate<T>(`window.__bavarianLemmings.${expression}`);
}

export const screen = (page: Page): Promise<string> => hook(page, 'screen()');
export const gameState = async (page: Page): Promise<GameView> => {
  const state = await hook<GameView | null>(page, 'state()');
  if (!state) throw new Error('no game running');
  return state;
};
export const settings = (page: Page): Promise<Record<string, unknown>> => hook(page, 'settings()');
export const appVersion = (page: Page): Promise<string> => hook(page, 'version()');
export const advance = (page: Page, ms: number): Promise<void> => hook(page, `advance(${ms})`);

/** Click a menu item with the real mouse. */
export async function clickMenu(page: Page, id: string): Promise<void> {
  const point = await hook<(Point & { enabled: boolean }) | null>(page, `menuItem(${JSON.stringify(id)})`);
  if (!point) throw new Error(`menu item ${id} not on screen ${await screen(page)}`);
  await page.mouse.click(point.x, point.y);
}

/** Click a pixel of the 320×200 screen with the real mouse. */
export async function clickScreen(page: Page, x: number, y: number): Promise<void> {
  const point = await hook<Point>(page, `screenToClient(${x}, ${y})`);
  await page.mouse.click(point.x, point.y);
}

/** Click a level pixel in the current view with the real mouse. */
export async function clickLevel(page: Page, x: number, y: number): Promise<void> {
  const point = await hook<Point>(page, `levelToClient(${x}, ${y})`);
  await page.mouse.click(point.x, point.y);
}

/** Panel button positions on the 320×200 screen: 16-pixel buttons from x = 0, at y = 180. */
export const PANEL_BUTTON = {
  releaseMinus: 0,
  releasePlus: 1,
  climber: 2,
  floater: 3,
  bomber: 4,
  blocker: 5,
  builder: 6,
  basher: 7,
  miner: 8,
  digger: 9,
  pause: 10,
  nuke: 11,
} as const;

export async function clickPanel(page: Page, button: keyof typeof PANEL_BUTTON): Promise<void> {
  await clickScreen(page, PANEL_BUTTON[button] * 16 + 8, 185);
}

/** Start Fun 1 from the title screen through the preview. */
export async function startFirstLevel(page: Page): Promise<void> {
  await clickMenu(page, 'play');
  await expect.poll(() => screen(page)).toBe('preview');
  await clickScreen(page, 160, 100);
  await expect.poll(() => screen(page)).toBe('play');
}

/** Pause, then assign the selected skill to the first lemming that satisfies `ready`, by mouse. */
export async function assignWhen(page: Page, ready: (lemming: LemmingView) => boolean): Promise<void> {
  for (let i = 0; i < 400; i += 1) {
    const state = await gameState(page);
    const lemming = state.lemmings.find(ready);
    if (lemming) {
      await page.keyboard.press('p');
      const paused = await gameState(page);
      const target = paused.lemmings.find((l) => l.id === lemming.id) ?? lemming;
      await clickLevel(page, target.x, target.y - 4);
      await page.keyboard.press('p');
      return;
    }
    await advance(page, 60);
  }
  throw new Error('no lemming became ready');
}

export async function playUntilEnd(page: Page): Promise<void> {
  for (let i = 0; i < 200 && (await screen(page)) === 'play'; i += 1) await advance(page, 2000);
}
