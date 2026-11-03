// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/** A solvable replay alone does not catch scenery buried in the terrain or clipped by the level. */
import { TRAP_TRIGGER_AREAS } from '../../src/render/sprites/objects';
import { describe, expect, it } from 'vitest';
import { ALL_LEVELS } from '../../src/levels';
import { buildTerrain } from '../../src/sim/level';
import { flagsAt, SOLID } from '../../src/sim/terrain';
import { themeById, trapAnimation } from '../../src/theme/themes';

for (const level of ALL_LEVELS.filter((item) => item.rating !== 'test')) {
  describe(`${level.id} object clearance`, () => {
    it('keeps every water area open, not buried under walkable terrain (M6.159)', () => {
      // A pool drawn under the floor lets lemmings walk across visible water (owner play-test
      // 2026-11-03). A lake may have pillars standing in it, so up to half its width may be covered.
      const terrain = buildTerrain(level);
      const solid = (x: number, y: number): boolean => (flagsAt(terrain, x, y) & SOLID) !== 0;
      for (const object of level.objects) {
        if (object.type !== 'water') continue;
        let buried = 0;
        for (let x = object.x; x < object.x + object.w; x += 1) if (solid(x, object.y - 1) && solid(x, object.y)) buried += 1;
        expect(buried, `water at (${object.x}, ${object.y})`).toBeLessThanOrEqual(object.w / 2);
      }
    });

    it('uses the visible trap trigger geometry for every authored danger zone', () => {
      for (const object of level.objects) {
        if (object.type !== 'trap') continue;
        const trigger = object.kind === 'squasher' ? TRAP_TRIGGER_AREAS.trapSquasher : TRAP_TRIGGER_AREAS.trapFire;
        expect({ width: object.w, height: object.h }).toEqual({ width: trigger.width, height: trigger.height });
      }
    });

    it('keeps embedded toolkit details inside the existing collision mask', () => {
      const undecorated = {
        ...level,
        terrain: level.terrain.filter((shape, index, shapes) => {
          const support = shapes[index - 1];
          return !(
            shape.shape === 'piece' &&
            support?.shape === 'rect' &&
            !support.erase &&
            shape.x === support.x &&
            shape.y === support.y &&
            shape.w === support.w &&
            shape.h === support.h
          );
        }),
      };
      const decoratedMask = buildTerrain(level).mask;
      const originalMask = buildTerrain(undecorated).mask;
      expect(decoratedMask.every((value, index) => value === originalMask[index])).toBe(true);
    });

    for (const themeId of ['classic', 'bavarian'] as const) {
      it(`keeps the opaque gameplay-object silhouettes separate in ${themeId}`, () => {
        const theme = themeById(themeId);
        const silhouettes: Set<number>[] = [];
        for (const object of level.objects) {
          if (object.type === 'water') continue;
          const sprite = object.type === 'trap' ? trapAnimation(theme, object.kind) : theme[object.type];
          const pixels = new Set<number>();
          for (const frame of sprite.frames) {
            frame.rows.forEach((row, y) => {
              for (let x = 0; x < row.length; x += 1) {
                if (row[x] !== '.') pixels.add((object.y - sprite.anchorY + y) * level.width + object.x - sprite.anchorX + x);
              }
            });
          }
          for (const other of silhouettes) expect([...pixels].some((pixel) => other.has(pixel))).toBe(false);
          silhouettes.push(pixels);
        }
      });

      it(`keeps every opaque hatch, exit and trap pixel clear in ${themeId}`, () => {
        const terrain = buildTerrain(level);
        const theme = themeById(themeId);
        const failures: string[] = [];
        for (const object of level.objects) {
          if (object.type !== 'hatch' && object.type !== 'exit' && object.type !== 'trap') continue;
          const sprite = object.type === 'trap' ? trapAnimation(theme, object.kind) : theme[object.type];
          for (const frame of sprite.frames) {
            frame.rows.forEach((row, y) => {
              for (let x = 0; x < row.length; x += 1) {
                if (row[x] === '.') continue;
                const px = object.x - sprite.anchorX + x;
                const py = object.y - sprite.anchorY + y;
                if (px < 0 || px >= level.width || py < 0 || py >= level.height || (flagsAt(terrain, px, py) & SOLID) !== 0)
                  failures.push(`${object.type} (${px}, ${py})`);
              }
            });
          }
        }
        expect([...new Set(failures)]).toEqual([]);
      });
    }
  });
}
