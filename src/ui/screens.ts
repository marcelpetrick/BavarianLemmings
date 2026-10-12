// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Menu geometry and screen texts (vision V-08, V-11, L-04, G-10): pure, so the menus can be tested
 * without a browser. The app draws the items and maps clicks with `itemAt`.
 */
import { FONT, measureText } from '../render/font';
import { SCREEN_WIDTH } from '../sim/constants';

export type ScreenId = 'title' | 'levels' | 'preview' | 'play' | 'result' | 'settings' | 'credits';

export interface MenuEntry {
  readonly id: string;
  readonly label: string;
  readonly enabled?: boolean;
}

export interface MenuItem {
  readonly id: string;
  readonly label: string;
  readonly enabled: boolean;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export const MENU_LINE_HEIGHT = 13;
/**
 * A click this far left or right of a menu label still hits it, in logical pixels (design value,
 * plan M6.146): labels are short, and small children click near them rather than on them.
 */
export const MENU_HIT_SLACK = 24;

/** Centre the entries on the screen, one per line, from `top` downwards. */
export function layoutMenu(entries: readonly MenuEntry[], top: number, lineHeight = MENU_LINE_HEIGHT): MenuItem[] {
  return entries.map((entry, index) => {
    const w = measureText(entry.label) + 8;
    return {
      id: entry.id,
      label: entry.label,
      enabled: entry.enabled ?? true,
      x: Math.floor((SCREEN_WIDTH - w) / 2),
      y: top + index * lineHeight,
      w,
      h: FONT.height + 4,
    };
  });
}

/** The enabled item at a point, if any. */
export function itemAt(items: readonly MenuItem[], x: number, y: number): MenuItem | undefined {
  return items.find(
    (item) => item.enabled && x >= item.x - MENU_HIT_SLACK && x < item.x + item.w + MENU_HIT_SLACK && y >= item.y && y < item.y + item.h,
  );
}

/** Move the keyboard focus by `delta` over the enabled items, wrapping around. */
export function moveFocus(items: readonly MenuItem[], focus: number, delta: number): number {
  if (!items.some((item) => item.enabled)) return -1;
  let index = focus;
  do {
    index = (((index + delta) % items.length) + items.length) % items.length;
  } while (!items[index]?.enabled);
  return index;
}

/** The comment on the result screen, like the original's one-liners (our own words). */
export function resultCommentKey(savedPercent: number, neededPercent: number): string {
  if (savedPercent >= 100) return 'result.comment.perfect';
  if (savedPercent >= neededPercent) return 'result.comment.won';
  if (savedPercent >= neededPercent - 10) return 'result.comment.close';
  return 'result.comment.lost';
}

/** Cycle a value through a list (settings toggles). */
export function cycle<T>(values: readonly T[], current: T): T {
  const index = values.indexOf(current);
  return values[(index + 1) % values.length] ?? current;
}
