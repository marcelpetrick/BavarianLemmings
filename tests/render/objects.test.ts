// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { validateAnimation } from '../../src/render/pixelArt';
import { ICONS, SKILL_ICON_NAMES } from '../../src/render/sprites/icons';
import { BAVARIAN_OBJECT_COUNTERPART, OBJECT_ANIMATIONS, TRAP_TRIGGER_AREAS } from '../../src/render/sprites/objects';

const geometry = (name: keyof typeof OBJECT_ANIMATIONS) => {
  const { width, height, anchorX, anchorY, frames, loop } = OBJECT_ANIMATIONS[name];
  return { width, height, anchorX, anchorY, frameCount: frames.length, loop };
};

describe('OBJECT_ANIMATIONS', () => {
  for (const [name, animation] of Object.entries(OBJECT_ANIMATIONS)) {
    it(`${name} is valid`, () => {
      expect(validateAnimation(animation)).toEqual([]);
    });
  }

  it('has the sizes and frame counts of the specification', () => {
    expect(geometry('hatch')).toEqual({ width: 40, height: 24, anchorX: 20, anchorY: 14, frameCount: 10, loop: false });
    expect(geometry('exit')).toEqual({ width: 40, height: 28, anchorX: 20, anchorY: 27, frameCount: 6, loop: true });
    expect(geometry('water')).toEqual({ width: 16, height: 8, anchorX: 0, anchorY: 0, frameCount: 4, loop: true });
    expect(geometry('trapSquasher').frameCount).toBeGreaterThanOrEqual(10);
    expect(geometry('trapFire').frameCount).toBeGreaterThanOrEqual(8);
    expect(geometry('maypole')).toEqual({ width: 8, height: 60, anchorX: 4, anchorY: 59, frameCount: 1, loop: false });
  });

  it('opens the hatch: frame 0 differs from the last frame', () => {
    const frames = OBJECT_ANIMATIONS.hatch.frames;
    expect(frames[0]!.rows).not.toEqual(frames[frames.length - 1]!.rows);
  });

  it('gives every Bavarian variant the geometry of its classic counterpart (V-10)', () => {
    for (const [bavarian, classic] of Object.entries(BAVARIAN_OBJECT_COUNTERPART)) {
      expect(geometry(bavarian as keyof typeof OBJECT_ANIMATIONS), bavarian).toEqual(geometry(classic));
      expect(OBJECT_ANIMATIONS[bavarian as keyof typeof OBJECT_ANIMATIONS].frames).not.toEqual(OBJECT_ANIMATIONS[classic].frames);
    }
  });

  it('anchors every trap at the top-left of its trigger area, inside the frame', () => {
    for (const [name, area] of Object.entries(TRAP_TRIGGER_AREAS)) {
      const animation = OBJECT_ANIMATIONS[name as keyof typeof TRAP_TRIGGER_AREAS];
      expect([animation.anchorX, animation.anchorY], name).toEqual([area.x, area.y]);
      expect(area.x + area.width, name).toBeLessThanOrEqual(animation.width);
      expect(area.y + area.height, name).toBeLessThanOrEqual(animation.height);
    }
  });
});

describe('ICONS', () => {
  for (const [name, icon] of Object.entries(ICONS)) {
    it(`${name} is a valid 16 × 16 single frame`, () => {
      expect(validateAnimation(icon)).toEqual([]);
      expect([icon.width, icon.height, icon.frames.length]).toEqual([16, 16, 1]);
      expect(icon.frames[0]!.rows.join('')).toMatch(/[^.]/);
    });
  }

  it('has the eight skills and the six panel buttons', () => {
    expect(SKILL_ICON_NAMES).toHaveLength(8);
    expect(Object.keys(ICONS).sort()).toEqual(
      [...SKILL_ICON_NAMES, 'pause', 'nuke', 'releaseMinus', 'releasePlus', 'fastForward', 'restart'].sort(),
    );
  });
});
