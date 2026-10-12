// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SELECT_HALF_WIDTH, TICK_MS } from '../../src/sim/constants';
import { parseLevel } from '../../src/sim/level';
import {
  MAGNIFIER_GAP,
  MIN_TOUCH_TARGET,
  TOUCH_BUTTON_GROUPS,
  computeTouchLayout,
  magnifierRect,
  resolveLayout,
  toLogical,
  touchMinimapLevelX,
} from '../../src/ui/layout';
import { MOUSE_SELECT_SLACK, Session } from '../../src/ui/session';
import { lemmingAt } from '../sim/helpers';

const level = parseLevel(JSON.parse(readFileSync('assets/levels/test/flat.json', 'utf8')));

describe('touch layout (vision C-06, 3.4.1)', () => {
  it('resolves "automatic" by the pointer and keeps an explicit choice', () => {
    expect(resolveLayout('auto', true)).toBe('touch');
    expect(resolveLayout('auto', false)).toBe('classic');
    expect(resolveLayout('classic', true)).toBe('classic');
    expect(resolveLayout('touch', false)).toBe('touch');
  });

  it('puts the buttons left and right in landscape, under the playfield in portrait', () => {
    expect(computeTouchLayout(1280, 800)).toEqual({
      orientation: 'landscape',
      scale: 3,
      button: 80,
      fieldWidth: 960,
      fieldHeight: 480,
      barHeight: 96,
    });
    expect(computeTouchLayout(800, 1280)).toEqual({
      orientation: 'portrait',
      scale: 2,
      button: 100,
      fieldWidth: 640,
      fieldHeight: 320,
      barHeight: 64,
    });
  });

  it('never makes a button smaller than 48 CSS pixels, and always draws the playfield', () => {
    for (const [w, h] of [
      [844, 390],
      [640, 360],
      [360, 640],
      [200, 100],
      [2560, 1440],
    ] as const) {
      const layout = computeTouchLayout(w, h);
      expect(layout.button).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
      expect(layout.scale).toBeGreaterThanOrEqual(1);
    }
    // Every panel button appears once, in two groups of eight.
    expect(TOUCH_BUTTON_GROUPS.flat()).toHaveLength(16);
    expect(new Set(TOUCH_BUTTON_GROUPS.flat()).size).toBe(16);
  });

  it('converts playfield-only canvas coordinates', () => {
    expect(toLogical(480, 240, 960, 480, 160)).toEqual({ x: 160, y: 80 });
  });

  it('maps the full-width minimap to level columns, with a small margin above and below', () => {
    expect(touchMinimapLevelX(160, 20, 1600)).toBe(800);
    expect(touchMinimapLevelX(-5, 20, 1600)).toBe(0);
    expect(touchMinimapLevelX(400, 20, 1600)).toBe(1595);
    expect(touchMinimapLevelX(160, 2, 1600)).toBeNull();
    expect(touchMinimapLevelX(160, 40, 1600)).toBeNull();
  });

  it('shows the magnifier above the finger, or beside it near the top', () => {
    const above = magnifierRect(160, 120);
    expect(above).toEqual({ sx: 144, sy: 110, sw: 32, sh: 20, dx: 128, dy: 120 - MAGNIFIER_GAP - 40 });
    const corner = magnifierRect(2, 2);
    expect(corner).toMatchObject({ sx: 0, sy: 0, dx: 2 + MAGNIFIER_GAP, dy: 0 });
    const right = magnifierRect(318, 10);
    expect(right).toMatchObject({ sx: 288, dx: 318 - MAGNIFIER_GAP - 64, dy: 0 });
    expect(magnifierRect(160, 159).sy).toBe(140);
  });
});

describe('session: touch assignment, nuke confirmation, scrolling', () => {
  it('a mouse click just beside a lemming still selects it (M6.146)', () => {
    const session = new Session(level, { purist: false });
    const walker = lemmingAt(100, 120, 'walking', 1, 1);
    session.state.lemmings.push(walker);
    session.command({ type: 'selectSkill', skill: 'digger' });
    // The selection box reaches x = 100 + SELECT_HALF_WIDTH; the slack adds MOUSE_SELECT_SLACK more.
    expect(session.lemmingForMouse(100, 115)).toBe(walker);
    expect(session.lemmingForMouse(100 + SELECT_HALF_WIDTH + MOUSE_SELECT_SLACK, 115)).toBe(walker);
    expect(session.lemmingForMouse(100 + SELECT_HALF_WIDTH + MOUSE_SELECT_SLACK + 1, 115)).toBeNull();
    expect(session.clickLevel(100 - SELECT_HALF_WIDTH - 3, 115)).toBe(true);
    session.advance(TICK_MS);
    expect(session.replay[0]?.intent).toEqual({ type: 'assign', lemmingId: walker.id, skill: 'digger' });
  });

  it('picks the best lemming within the radius, preferring one that accepts the skill', () => {
    const session = new Session(level, { purist: false });
    const near = lemmingAt(100, 120, 'walking', 1, 1);
    const far = lemmingAt(120, 120, 'walking', 1, 2);
    const digging = lemmingAt(98, 120, 'digging', 1, 3);
    session.state.lemmings.push(near, far, digging);
    expect(session.lemmingNear(98, 115, 0)).toBe(digging);
    session.command({ type: 'selectSkill', skill: 'digger' });
    // The digger already digs: the walker next to it is better.
    expect(session.lemmingNear(98, 115, 0)).toBe(near);
    expect(session.lemmingNear(109, 105, 10)).toBe(near);
    expect(session.lemmingNear(111, 105, 10)).toBe(far);
    expect(session.lemmingNear(300, 60, 10)).toBeNull();
    far.removed = true;
    expect(session.lemmingNear(125, 115, 6)).toBeNull();
    expect(session.touchLevel(103, 112, 2)).toBe(true);
    session.advance(TICK_MS);
    expect(session.replay[0]?.intent).toEqual({ type: 'assign', lemmingId: near.id, skill: 'digger' });
    expect(session.touchLevel(300, 60, 2)).toBe(false);
  });

  it('confirms the nuke at once, but only once', () => {
    const session = new Session(level, { purist: false });
    expect(session.confirmNuke()).toBe(true);
    session.advance(TICK_MS);
    expect(session.state.nuking).toBe(true);
    expect(session.confirmNuke()).toBe(false);
  });

  it('scrolls to a position inside the level', () => {
    const session = new Session(level, { purist: false });
    session.scrollTo(100.4);
    expect(session.viewX).toBe(100);
    session.scrollTo(9999);
    expect(session.viewX).toBe(160);
  });
});
