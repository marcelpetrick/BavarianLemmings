// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { assignSkill, bomberDigit, canAssign, pickLemming } from '../../src/sim/assign';
import { BUILDER_BRICKS, TICKS_PER_SECOND } from '../../src/sim/constants';
import { step } from '../../src/sim/game';
import { SKILLS, isSkill } from '../../src/sim/skills';
import { lemmingAt, stateWith, terrainFromArt } from './helpers';

const flat = Array.from({ length: 20 }, (_, y) => (y >= 15 ? '#' : '.').repeat(40));

describe('skill assignment (G-03, C-04)', () => {
  it('knows the eight skills in panel order', () => {
    expect(SKILLS).toEqual(['climber', 'floater', 'bomber', 'blocker', 'builder', 'basher', 'miner', 'digger']);
    expect(isSkill('digger')).toBe(true);
    expect(isSkill('jumper')).toBe(false);
  });

  it('gives each skill its effect and decrements the counter', () => {
    const state = stateWith(
      terrainFromArt(flat),
      SKILLS.map((_, i) => lemmingAt(5, 14, 'walking', 1, i)),
    );
    SKILLS.forEach((skill, i) => {
      const lemming = state.lemmings[i]!;
      expect(assignSkill(state, lemming, skill)).toBe(true);
    });
    const [climber, floater, bomber, blocker, builder, basher, miner, digger] = state.lemmings;
    expect(climber!.climber).toBe(true);
    expect(floater!.floater).toBe(true);
    expect(bomber!.bombTicks).toBeGreaterThan(0);
    expect(blocker!.action).toBe('blocking');
    expect(builder).toMatchObject({ action: 'building', bricksLeft: BUILDER_BRICKS });
    expect(basher!.action).toBe('bashing');
    expect(miner!.action).toBe('mining');
    expect(digger!.action).toBe('digging');
    expect(state.skills.digger).toBe(8);
    expect(state.events.filter((e) => e.type === 'assign')).toHaveLength(8);
  });

  it('refuses when the counter is empty or the lemming cannot take the skill', () => {
    const state = stateWith(terrainFromArt(flat), [lemmingAt(5, 14)]);
    const lemming = state.lemmings[0]!;
    state.skills.digger = 0;
    expect(assignSkill(state, lemming, 'digger')).toBe(false);
    lemming.climber = true;
    expect(canAssign(lemming, 'climber')).toBe(false);
    lemming.floater = true;
    expect(canAssign(lemming, 'floater')).toBe(false);
    lemming.bombTicks = 10;
    expect(canAssign(lemming, 'bomber')).toBe(false);
    lemming.action = 'falling';
    expect(canAssign(lemming, 'builder')).toBe(false);
    lemming.action = 'blocking';
    expect(canAssign(lemming, 'basher')).toBe(false);
    lemming.action = 'digging';
    expect(canAssign(lemming, 'digger')).toBe(false);
    expect(canAssign(lemming, 'basher')).toBe(true);
    lemming.action = 'splatting';
    expect(canAssign(lemming, 'bomber')).toBe(false);
  });

  it('picks the lemming under the cursor that accepts the skill, then the closest', () => {
    const a = lemmingAt(10, 14, 'walking', 1, 0);
    const b = lemmingAt(12, 14, 'walking', 1, 1);
    const state = stateWith(terrainFromArt(flat), [a, b]);
    expect(pickLemming(state, 12, 10, null)).toBe(b);
    expect(pickLemming(state, 10, 10, null)).toBe(a);
    a.climber = true;
    expect(pickLemming(state, 10, 10, 'climber')).toBe(b);
    expect(pickLemming(state, 30, 10, null)).toBeNull();
    a.removed = true;
    expect(pickLemming(state, 10, 10, null)).toBe(b);
  });

  it('assigns through an intent and shows the bomber digits 5..1', () => {
    const state = stateWith(terrainFromArt(flat), [lemmingAt(5, 14)]);
    step(state, [
      { type: 'assign', lemmingId: 0, skill: 'bomber' },
      { type: 'assign', lemmingId: 7, skill: 'digger' },
    ]);
    const lemming = state.lemmings[0]!;
    expect(bomberDigit(lemming)).toBe(5);
    lemming.bombTicks = TICKS_PER_SECOND;
    expect(bomberDigit(lemming)).toBe(1);
    lemming.bombTicks = -1;
    expect(bomberDigit(lemming)).toBe(0);
  });
});
