// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { SCREEN_HEIGHT } from '../../src/sim/constants';
import {
  LEVELS_PER_PAGE,
  MENU_HIT_SLACK,
  cycle,
  itemAt,
  layoutMenu,
  moveFocus,
  pageCount,
  pageOfLevel,
  resultCommentKey,
} from '../../src/ui/screens';

describe('menus (V-08)', () => {
  const items = layoutMenu(
    [
      { id: 'a', label: 'Play' },
      { id: 'b', label: 'Locked', enabled: false },
      { id: 'c', label: 'Back' },
    ],
    100,
  );

  it('centres the entries line by line', () => {
    expect(items[0]).toMatchObject({ id: 'a', x: Math.floor((320 - (4 * 6 + 8)) / 2), y: 100, w: 32, h: 12, enabled: true });
    expect(items[2]?.y).toBe(126);
  });

  it('finds the enabled item under a point', () => {
    expect(itemAt(items, 160, 105)?.id).toBe('a');
    expect(itemAt(items, 160, 117)).toBeUndefined();
    expect(itemAt(items, 0, 0)).toBeUndefined();
  });

  it('accepts clicks beside a label, for small children (M6.146)', () => {
    const play = items[0]!;
    expect(itemAt(items, play.x - MENU_HIT_SLACK, 105)?.id).toBe('a');
    expect(itemAt(items, play.x + play.w + MENU_HIT_SLACK - 1, 105)?.id).toBe('a');
    expect(itemAt(items, play.x - MENU_HIT_SLACK - 1, 105)).toBeUndefined();
  });

  it('moves the focus over enabled items and wraps', () => {
    expect(moveFocus(items, 0, 1)).toBe(2);
    expect(moveFocus(items, 2, 1)).toBe(0);
    expect(moveFocus(items, 0, -1)).toBe(2);
    expect(moveFocus(layoutMenu([{ id: 'x', label: 'x', enabled: false }], 0), 0, 1)).toBe(-1);
  });

  it('comments the result and cycles settings', () => {
    expect(resultCommentKey(100, 50)).toBe('result.comment.perfect');
    expect(resultCommentKey(60, 50)).toBe('result.comment.won');
    expect(resultCommentKey(45, 50)).toBe('result.comment.close');
    expect(resultCommentKey(10, 50)).toBe('result.comment.lost');
    expect(cycle(['en', 'de', 'bar'], 'bar')).toBe('en');
    expect(cycle([1, 2], 3)).toBe(1);
  });

  it('pages the level list so every level fits on the 200-pixel screen (M6.140)', () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(LEVELS_PER_PAGE)).toBe(1);
    expect(pageCount(30)).toBe(3);
    expect(pageCount(31)).toBe(4);
    expect(pageOfLevel(0, 30)).toBe(0);
    expect(pageOfLevel(LEVELS_PER_PAGE, 30)).toBe(1);
    // Every level won: the index is past the end, and the last page stays on show.
    expect(pageOfLevel(30, 30)).toBe(2);
    expect(pageOfLevel(5, 0)).toBe(0);
    // The level list as the app lays it out: rating, a full page, page line, back.
    const entries = Array.from({ length: LEVELS_PER_PAGE + 3 }, (_, index) => ({ id: String(index), label: 'x' }));
    const last = layoutMenu(entries, 40, 12).at(-1)!;
    expect(last.y + last.h).toBeLessThanOrEqual(SCREEN_HEIGHT);
  });
});
