// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { slotsUsed } from '../../src/render/pixelArt';
import { OBJECT_ANIMATIONS } from '../../src/render/sprites/objects';
import { ACTIONS } from '../../src/sim/lemming';
import { BAVARIAN_THEME, CLASSIC_THEME, terrainColorsFor, themeById, trapAnimation } from '../../src/theme/themes';

describe('themes (V-09, V-10, R-05)', () => {
  it('finds themes by id', () => {
    expect(themeById('classic')).toBe(CLASSIC_THEME);
    expect(themeById('bavarian')).toBe(BAVARIAN_THEME);
  });

  it('has an animation for every action, with identical geometry in both themes', () => {
    for (const action of ACTIONS) {
      const classic = CLASSIC_THEME.lemmings[action];
      const bavarian = BAVARIAN_THEME.lemmings[action];
      expect([bavarian.width, bavarian.height, bavarian.anchorX, bavarian.anchorY, bavarian.frames.length], action).toEqual([
        classic.width,
        classic.height,
        classic.anchorX,
        classic.anchorY,
        classic.frames.length,
      ]);
    }
  });

  it('has a palette colour for every slot its sprites use', () => {
    for (const theme of [CLASSIC_THEME, BAVARIAN_THEME]) {
      const animations = [...Object.values(theme.lemmings), theme.hatch, theme.exit, theme.water, ...Object.values(theme.traps)];
      for (const animation of animations)
        for (const frame of animation.frames) for (const slot of slotsUsed(frame)) expect(theme.spritePalette[slot], slot).toBeDefined();
    }
  });

  it('puts a maypole beside the Bavarian exit only (V-10)', () => {
    expect(BAVARIAN_THEME.exitScenery).toBe(OBJECT_ANIMATIONS.maypole);
    expect(CLASSIC_THEME.exitScenery).toBeNull();
  });

  it('falls back for unknown styles and trap kinds', () => {
    expect(terrainColorsFor(CLASSIC_THEME, 'lava')).toBe(CLASSIC_THEME.terrainColors.dirt);
    expect(terrainColorsFor(BAVARIAN_THEME, 'crystal')).toBe(BAVARIAN_THEME.terrainColors.crystal);
    expect(trapAnimation(BAVARIAN_THEME, 'squasher')).toBe(OBJECT_ANIMATIONS.trapWeisswurst);
    expect(trapAnimation(CLASSIC_THEME, 'unknown')).toBe(OBJECT_ANIMATIONS.trapSquasher);
  });
});
