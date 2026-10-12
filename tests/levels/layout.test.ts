// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/** A solvable replay alone does not catch scenery buried in the terrain or clipped by the level. */
import { describe, expect, it } from 'vitest';
import { ALL_LEVELS } from '../../src/levels';
import { buildTerrain } from '../../src/sim/level';
import { flagsAt, SOLID } from '../../src/sim/terrain';
import { themeById, trapAnimation } from '../../src/theme/themes';

for (const level of ALL_LEVELS.filter((item) => item.rating !== 'test')) {
  describe(`${level.id} object clearance`, () => {
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
