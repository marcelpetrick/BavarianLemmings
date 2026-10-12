// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FAST_FORWARD_FACTOR, HATCH_OPEN_TICKS, TICK_MS, TICKS_PER_SECOND } from '../../src/sim/constants';
import { parseLevel } from '../../src/sim/level';
import { runReplay } from '../../src/sim/replay';
import { commandForKey } from '../../src/ui/keymap';
import { MINIMAP, PANEL_BUTTONS, centreView, clampView, computeScaling, hitPanel, toLogical } from '../../src/ui/layout';
import { MAX_TICKS_PER_FRAME, NUKE_CONFIRM_MS, SCROLL_STEP, Session } from '../../src/ui/session';
import { formatTime, lemmingName, statusParts } from '../../src/ui/status';
import { lemmingAt } from '../sim/helpers';

const level = parseLevel(JSON.parse(readFileSync('assets/levels/test/flat.json', 'utf8')));

describe('layout (V-01, V-03, V-04)', () => {
  it('scales by the largest integer factor that fits', () => {
    expect(computeScaling(1280, 800, false)).toEqual({ scale: 4, cssWidth: 1280, cssHeight: 800 });
    expect(computeScaling(1279, 800, false).scale).toBe(3);
    expect(computeScaling(100, 100, false).scale).toBe(1);
    expect(computeScaling(1280, 960, true)).toEqual({ scale: 4, cssWidth: 1280, cssHeight: 960 });
    expect(toLogical(640, 400, 1280, 800)).toEqual({ x: 160, y: 100 });
  });

  it('finds panel buttons and the minimap', () => {
    expect(PANEL_BUTTONS).toHaveLength(12);
    expect(hitPanel(0, 180, 1600)).toEqual({ kind: 'button', button: 'releaseMinus' });
    expect(hitPanel(16 * 2 + 3, 190, 1600)).toEqual({ kind: 'button', button: 'climber' });
    expect(hitPanel(16 * 11, 199, 1600)).toEqual({ kind: 'button', button: 'nuke' });
    expect(hitPanel(10, 165, 1600)).toEqual({ kind: 'none' });
    expect(hitPanel(MINIMAP.x + MINIMAP.w / 2, 160 + MINIMAP.y + 1, 1600)).toEqual({ kind: 'minimap', levelX: 800 });
    expect(hitPanel(MINIMAP.x - 2, 160 + MINIMAP.y + 1, 1600)).toEqual({ kind: 'none' });
  });

  it('keeps the view inside the level', () => {
    expect(clampView(-5, 1600)).toBe(0);
    expect(clampView(5000, 1600)).toBe(1280);
    expect(centreView(800, 1600)).toBe(640);
  });
});

describe('key map (C-02, C-03, C-05)', () => {
  it('maps the DOS function keys', () => {
    expect(commandForKey('F1')).toEqual({ type: 'releaseRate', delta: -1 });
    expect(commandForKey('F2')).toEqual({ type: 'releaseRate', delta: 1 });
    expect(commandForKey('F3')).toEqual({ type: 'selectSkill', skill: 'climber' });
    expect(commandForKey('F10')).toEqual({ type: 'selectSkill', skill: 'digger' });
    expect(commandForKey('F11')).toEqual({ type: 'pause' });
    expect(commandForKey('F12')).toEqual({ type: 'nuke' });
    expect(commandForKey('F13')).toBeNull();
  });

  it('maps the plain alternatives and conveniences', () => {
    expect(commandForKey('8')).toEqual({ type: 'selectSkill', skill: 'digger' });
    expect(commandForKey('9')).toBeNull();
    const keys = ['-', '+', '=', 'p', ' ', 'N', 'ArrowLeft', 'a', 'ArrowRight', 'd', 'f', 'r', '.', 'z', 'Escape', 'q'];
    expect(keys.map((k) => commandForKey(k)?.type ?? null)).toEqual([
      'releaseRate',
      'releaseRate',
      'releaseRate',
      'pause',
      'pause',
      'nuke',
      'scroll',
      'scroll',
      'scroll',
      'scroll',
      'fastForward',
      'restart',
      'frameStep',
      'zoom',
      'menu',
      null,
    ]);
  });
});

describe('session', () => {
  it('runs ticks from wall-clock time, faster when fast-forwarding, capped per frame', () => {
    const session = new Session(level, { purist: false });
    session.advance(TICK_MS * 3 + 1);
    expect(session.state.tick).toBe(3);
    session.command({ type: 'fastForward' });
    session.advance(TICK_MS);
    expect(session.state.tick).toBe(3 + FAST_FORWARD_FACTOR);
    session.advance(TICK_MS * 1000);
    expect(session.state.tick).toBe(3 + FAST_FORWARD_FACTOR + MAX_TICKS_PER_FRAME);
  });

  it('pauses, steps single frames while paused, and restarts', () => {
    const session = new Session(level, { purist: false });
    expect(session.command({ type: 'frameStep' })).toBe(false);
    session.command({ type: 'pause' });
    expect(session.advance(TICK_MS * 10)).toEqual([]);
    session.command({ type: 'frameStep' });
    expect(session.state.tick).toBe(1);
    session.command({ type: 'restart' });
    expect(session.state.tick).toBe(0);
    expect(session.paused).toBe(false);
  });

  it('assigns the selected skill to the lemming under the cursor and records the replay', () => {
    const session = new Session(level, { purist: false });
    for (let i = 0; i < HATCH_OPEN_TICKS + 30; i += 1) session.advance(TICK_MS);
    const lemming = session.state.lemmings[0]!;
    expect(session.clickLevel(lemming.x, lemming.y - 4)).toBe(false);
    session.command({ type: 'selectSkill', skill: 'builder' });
    expect(session.clickLevel(lemming.x + 100, lemming.y)).toBe(false);
    expect(session.lemmingAt(lemming.x, lemming.y - 4)).toBe(lemming);
    expect(session.countUnderCursor(lemming.x, lemming.y - 4)).toBeGreaterThanOrEqual(1);
    expect(session.clickLevel(lemming.x, lemming.y - 4)).toBe(true);
    session.advance(TICK_MS);
    expect(lemming.action).toBe('building');
    expect(session.replay).toHaveLength(1);
    expect(session.clickLevel(lemming.x, lemming.y - 4)).toBe(false);
    const replayed = runReplay(level, { version: 1, levelId: level.id, entries: session.replay }, session.state.tick);
    expect(replayed.lemmings[0]?.action).toBe('building');
  });

  it('assigns a bomber on the first click with its five-second countdown', () => {
    const session = new Session(level, { purist: false });
    session.state.lemmings.push(lemmingAt(100, 100));
    session.command({ type: 'selectSkill', skill: 'bomber' });
    const stock = session.state.skills.bomber;
    expect(session.clickLevel(100, 96)).toBe(true);
    session.advance(TICK_MS);
    expect(session.state.lemmings[0]?.bombTicks).toBe(5 * TICKS_PER_SECOND - 1);
    expect(session.state.skills.bomber).toBe(stock - 1);
    expect(session.replay).toEqual([{ tick: 1, intent: { type: 'assign', lemmingId: 0, skill: 'bomber' } }]);
  });

  it('disarms the nuke when restarting so the first click cannot destroy the new attempt', () => {
    const session = new Session(level, { purist: false });
    session.command({ type: 'nuke' });
    session.restart();
    expect(session.nukeArmed).toBe(false);
    expect(session.command({ type: 'nuke' })).toBe(false);
    session.advance(TICK_MS);
    expect(session.state.nuking).toBe(false);
    expect(session.nukeArmed).toBe(true);
  });

  it('changes the release rate and scrolls', () => {
    const session = new Session(level, { purist: false });
    session.command({ type: 'releaseRate', delta: 5 });
    session.advance(TICK_MS);
    expect(session.state.releaseRate).toBe(level.releaseRate + 5);
    session.command({ type: 'scroll', direction: 1 });
    expect(session.viewX).toBe(SCROLL_STEP);
    session.centreOn(10_000);
    expect(session.viewX).toBe(level.width - 320);
    session.command({ type: 'zoom' });
    expect(session.visibleWidth).toBe(160);
    expect(session.command({ type: 'menu' })).toBe(false);
  });

  it('nukes only on a second press within the confirmation time', () => {
    const session = new Session(level, { purist: false });
    expect(session.command({ type: 'nuke' })).toBe(false);
    expect(session.nukeArmed).toBe(true);
    session.advance(NUKE_CONFIRM_MS + 1);
    expect(session.nukeArmed).toBe(false);
    expect(session.command({ type: 'nuke' })).toBe(false);
    expect(session.command({ type: 'nuke' })).toBe(true);
    session.advance(TICK_MS);
    expect(session.state.nuking).toBe(true);
    expect(session.command({ type: 'nuke' })).toBe(false);
  });

  it('refuses conveniences in Purist mode and stops after the end', () => {
    const session = new Session(level, { purist: true });
    expect(session.command({ type: 'fastForward' })).toBe(false);
    expect(session.command({ type: 'pause' })).toBe(true);
    session.command({ type: 'pause' });
    session.state.outcome = 'lost';
    expect(session.advance(TICK_MS * 5)).toEqual([]);
    session.command({ type: 'selectSkill', skill: 'digger' });
    expect(session.clickLevel(0, 0)).toBe(false);
  });
});

describe('status line (V-03)', () => {
  it('formats the time as minutes-seconds', () => {
    expect(formatTime(TICKS_PER_SECOND * 299)).toEqual({ minutes: 4, seconds: '59' });
    expect(formatTime(-5)).toEqual({ minutes: 0, seconds: '00' });
  });

  it('names lemmings like the original, including the athlete', () => {
    const lemming = lemmingAt(0, 0);
    expect(lemmingName(lemming, 'en')).toBe('WALKER');
    lemming.climber = true;
    expect(lemmingName(lemming, 'en')).toBe('CLIMBER');
    lemming.floater = true;
    expect(lemmingName(lemming, 'en')).toBe('ATHLETE');
    lemming.climber = false;
    expect(lemmingName(lemming, 'en')).toBe('FLOATER');
    lemming.action = 'digging';
    expect(lemmingName(lemming, 'de')).toBe('GRÄBER');
  });

  it('shows OUT, IN and TIME', () => {
    const session = new Session(level, { purist: false });
    const parts = statusParts(session.state, null, 0, 'en');
    expect(parts).toEqual({ hovered: '', out: 'OUT 0', in: 'IN 0%', time: 'TIME 2-00' });
    expect(statusParts(session.state, lemmingAt(0, 0), 3, 'en').hovered).toBe('WALKER 3');
  });
});
