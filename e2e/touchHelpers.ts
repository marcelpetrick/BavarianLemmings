// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Real touch input for the tablet projects (vision P-06). Playwright only offers `tap`, so fingers
 * that stay down, move and lift go through the Chrome DevTools Protocol (`Input.dispatchTouchEvent`):
 * the browser turns them into the same touch and pointer events as a real touch screen.
 */
import { expect, type CDPSession, type Page } from '@playwright/test';
import { screen } from './helpers';

export interface Finger {
  x: number;
  y: number;
  id?: number;
}

interface Point {
  x: number;
  y: number;
}

export class Touch {
  private constructor(private readonly cdp: CDPSession) {}

  static async on(page: Page): Promise<Touch> {
    return new Touch(await page.context().newCDPSession(page));
  }

  private async send(type: 'touchStart' | 'touchMove' | 'touchEnd', fingers: readonly Finger[]): Promise<void> {
    const touchPoints = fingers.map((f, index) => ({ x: f.x, y: f.y, id: f.id ?? index, radiusX: 4, radiusY: 4, force: 1 }));
    await this.cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
  }

  /** Put down the fingers (all that are on the screen now). */
  down(...fingers: Finger[]): Promise<void> {
    return this.send('touchStart', fingers);
  }

  /** Move the fingers that are down. */
  move(...fingers: Finger[]): Promise<void> {
    return this.send('touchMove', fingers);
  }

  /** Lift every finger. */
  up(): Promise<void> {
    return this.send('touchEnd', []);
  }
}

function hook<T>(page: Page, expression: string): Promise<T> {
  return page.evaluate<T>(`window.__bavarianLemmings.${expression}`);
}

/** Client coordinates of a level pixel in the current view. */
export const levelToClient = (page: Page, x: number, y: number): Promise<Point> => hook(page, `levelToClient(${x}, ${y})`);

/** Tap a menu item with a finger. */
export async function tapMenu(page: Page, id: string): Promise<void> {
  const point = await hook<Point | null>(page, `menuItem(${JSON.stringify(id)})`);
  if (!point) throw new Error(`menu item ${id} not on screen ${await screen(page)}`);
  await page.touchscreen.tap(point.x, point.y);
}

/** Tap a button of the touch panel. */
export async function tapButton(page: Page, button: string): Promise<void> {
  await page.locator(`[data-touch-button="${button}"]`).tap();
}

/** Start Fun 1 from the title screen through the preview, by touch. */
export async function tapIntoFirstLevel(page: Page): Promise<void> {
  await tapMenu(page, 'play');
  await expect.poll(() => screen(page)).toBe('preview');
  const centre = await hook<Point>(page, 'screenToClient(160, 100)');
  await page.touchscreen.tap(centre.x, centre.y);
  await expect.poll(() => screen(page)).toBe('play');
}

/** The centre of a touch panel button in client coordinates. */
export async function buttonCentre(page: Page, button: string): Promise<Point> {
  const box = await page.locator(`[data-touch-button="${button}"]`).boundingBox();
  if (!box) throw new Error(`touch button ${button} is not visible`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}
