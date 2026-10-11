// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import {
  CSS_PX_PER_MM,
  DOUBLE_TAP_MS,
  HoldButton,
  NUKE_HOLD_MS,
  PINCH_FACTOR,
  PlayfieldGestures,
  REPEAT_DELAY_MS,
  REPEAT_INTERVAL_MS,
  RepeatButton,
  TOUCH_SELECT_RADIUS_MM,
  selectRadius,
} from '../../src/input/touchGestures';

const bounds = { width: 320, height: 160 };

describe('press, aim, release (vision 3.4.1)', () => {
  it('aims while the finger is down and assigns where it is lifted', () => {
    const g = new PlayfieldGestures(bounds);
    expect(g.aim).toBeNull();
    expect(g.down(1, 100, 50)).toEqual([{ type: 'aim', x: 100, y: 50 }]);
    expect(g.aim).toEqual({ x: 100, y: 50 });
    expect(g.move(1, 104, 52)).toEqual([{ type: 'aim', x: 104, y: 52 }]);
    expect(g.up(1)).toEqual([{ type: 'assign', x: 104, y: 52 }]);
    expect(g.aim).toBeNull();
  });

  it('cancels when the finger slides out of the playfield, and stays cancelled until lifted', () => {
    const g = new PlayfieldGestures(bounds);
    g.down(1, 10, 150);
    expect(g.move(1, 10, 160)).toEqual([{ type: 'aimCancel' }]);
    expect(g.move(1, 10, 150)).toEqual([]);
    expect(g.up(1)).toEqual([]);
    // Every edge counts.
    for (const [x, y] of [
      [-1, 5],
      [5, -1],
      [320, 5],
    ] as const) {
      g.down(2, 5, 5);
      expect(g.move(2, x, y)).toEqual([{ type: 'aimCancel' }]);
      g.up(2);
    }
    // After the lift the next touch aims again.
    expect(g.down(3, 20, 20)).toEqual([{ type: 'aim', x: 20, y: 20 }]);
  });

  it('never assigns on a browser cancel', () => {
    const g = new PlayfieldGestures(bounds);
    g.down(1, 10, 10);
    expect(g.cancel(1)).toEqual([{ type: 'aimCancel' }]);
    expect(g.aim).toBeNull();
    expect(g.cancel(1)).toEqual([]);
    expect(g.up(1)).toEqual([]);
    expect(g.move(1, 3, 3)).toEqual([]);
  });
});

describe('two fingers (vision 3.4.1)', () => {
  it('a second finger cancels the aim and pans by the movement of the middle', () => {
    const g = new PlayfieldGestures(bounds);
    g.down(1, 100, 80);
    expect(g.down(2, 140, 80)).toEqual([{ type: 'aimCancel' }, { type: 'panStart' }]);
    expect(g.aim).toBeNull();
    expect(g.move(1, 90, 80)).toEqual([{ type: 'pan', offsetX: -5 }]);
    expect(g.move(2, 130, 80)).toEqual([{ type: 'pan', offsetX: -10 }]);
    // A third finger changes nothing.
    expect(g.down(3, 5, 5)).toEqual([]);
    expect(g.move(3, 6, 6)).toEqual([]);
    g.up(3);
    // Lifting one finger ends the pan; the other one must not assign.
    expect(g.up(1)).toEqual([]);
    expect(g.move(2, 100, 80)).toEqual([]);
    expect(g.up(2)).toEqual([]);
    expect(g.down(4, 1, 1)).toEqual([{ type: 'aim', x: 1, y: 1 }]);
  });

  it('a pinch toggles the zoom once per gesture, in the direction of the pinch', () => {
    const g = new PlayfieldGestures(bounds);
    g.down(1, 100, 80);
    g.down(2, 120, 80);
    const spread = g.move(2, 100 + 20 * PINCH_FACTOR, 80);
    expect(spread).toContainEqual({ type: 'zoom', zoomIn: true, x: 100 + 10 * PINCH_FACTOR, y: 80 });
    expect(g.move(2, 200, 80).some((e) => e.type === 'zoom')).toBe(false);
    g.up(1);
    g.up(2);
    g.down(1, 100, 80);
    g.down(2, 200, 80);
    expect(g.move(2, 150, 80)).toContainEqual({ type: 'zoom', zoomIn: false, x: 125, y: 80 });
  });

  it('a second finger after a cancelled aim still pans, and a cancel during a pan is quiet', () => {
    const g = new PlayfieldGestures(bounds);
    g.down(1, 10, 10);
    g.move(1, -5, 10);
    expect(g.down(2, 50, 50)).toEqual([{ type: 'panStart' }]);
    expect(g.cancel(2)).toEqual([]);
    expect(g.cancel(1)).toEqual([]);
    expect(g.down(3, 7, 7)).toEqual([{ type: 'aim', x: 7, y: 7 }]);
  });

  it('two fingers on the same spot do not divide by zero', () => {
    const g = new PlayfieldGestures(bounds);
    g.down(1, 50, 50);
    g.down(2, 50, 50);
    expect(g.move(2, 51, 50)).toEqual([{ type: 'pan', offsetX: 0.5 }]);
    expect(g.move(2, 52, 50)).toContainEqual({ type: 'zoom', zoomIn: true, x: 51, y: 50 });
  });
});

describe('nuke button: hold one second or double tap (vision 3.4.1)', () => {
  it('fires once after a full hold and shows the progress', () => {
    const b = new HoldButton();
    expect(b.progress(0)).toBe(0);
    expect(b.press(1000)).toBe(false);
    expect(b.progress(1000 + NUKE_HOLD_MS / 2)).toBeCloseTo(0.5);
    expect(b.update(1000 + NUKE_HOLD_MS - 1)).toBe(false);
    expect(b.update(1000 + NUKE_HOLD_MS)).toBe(true);
    expect(b.update(1000 + NUKE_HOLD_MS + 50)).toBe(false);
    expect(b.progress(1000 + NUKE_HOLD_MS + 50)).toBe(0);
    b.release(3000);
    // A tap after a fired hold is not the second half of a double tap.
    expect(b.press(3100)).toBe(false);
  });

  it('a short press does nothing, a second tap soon after fires', () => {
    const b = new HoldButton();
    b.press(0);
    b.release(100);
    expect(b.update(2000)).toBe(false);
    expect(b.press(100 + DOUBLE_TAP_MS)).toBe(true);
    expect(b.update(5000)).toBe(false);
    b.release(5000);
    b.release(5001);
    // Too slow: two single taps.
    b.press(10_000);
    b.release(10_050);
    expect(b.press(10_051 + DOUBLE_TAP_MS)).toBe(false);
  });
});

describe('release rate buttons repeat while held (vision 3.4.1)', () => {
  it('fires on press, then after the delay once per interval', () => {
    const b = new RepeatButton();
    expect(b.update(0)).toBe(0);
    expect(b.held).toBe(false);
    expect(b.press(0)).toBe(1);
    expect(b.held).toBe(true);
    expect(b.update(REPEAT_DELAY_MS - 1)).toBe(0);
    expect(b.update(REPEAT_DELAY_MS)).toBe(1);
    expect(b.update(REPEAT_DELAY_MS + 3 * REPEAT_INTERVAL_MS)).toBe(3);
    b.release();
    expect(b.update(10_000)).toBe(0);
  });
});

describe('selection radius', () => {
  it('is about 8 mm in CSS pixels, converted to logical pixels', () => {
    expect(TOUCH_SELECT_RADIUS_MM * CSS_PX_PER_MM).toBeCloseTo(30.24, 1);
    expect(selectRadius(1)).toBeCloseTo(30.24, 1);
    expect(selectRadius(3)).toBeCloseTo(10.08, 1);
  });
});
