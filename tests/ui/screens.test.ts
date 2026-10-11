// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { cycle, itemAt, layoutMenu, moveFocus, resultCommentKey } from '../../src/ui/screens';

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
});
