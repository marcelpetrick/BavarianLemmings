// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/** Decorative exit scenery uses spare space, never terrain or gameplay-object space. */
import type { LevelData, LevelObject } from '../sim/level';
import { isSolid, type Terrain } from '../sim/terrain';
import { trapAnimation, type Theme } from '../theme/themes';
import { TRANSPARENT, type Animation } from './pixelArt';

/** A small air gap keeps the maypole's ornaments separate from the tent. */
export const EXIT_SCENERY_GAP = 6;

export interface SceneryPosition {
  readonly x: number;
  readonly y: number;
}

interface Bounds {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

function spriteBounds(object: LevelObject, animation: Animation): Bounds {
  return { x: object.x - animation.anchorX, y: object.y - animation.anchorY, w: animation.width, h: animation.height };
}

function objectBounds(object: LevelObject, theme: Theme): Bounds {
  switch (object.type) {
    case 'hatch':
      return spriteBounds(object, theme.hatch);
    case 'exit':
      return spriteBounds(object, theme.exit);
    case 'water':
      return object;
    case 'trap': {
      const sprite = spriteBounds(object, trapAnimation(theme, object.kind));
      const x = Math.min(sprite.x, object.x);
      const y = Math.min(sprite.y, object.y);
      return { x, y, w: Math.max(sprite.x + sprite.w, object.x + object.w) - x, h: Math.max(sprite.y + sprite.h, object.y + object.h) - y };
    }
  }
}

/**
 * Try right, then left of an exit; omit scenery when both placements would bury or clip a pixel.
 * Pass the initial terrain. The browser caches the result for that level, so digging never moves it.
 */
export function findExitSceneryPosition(level: LevelData, terrain: Terrain, exit: LevelObject, theme: Theme): SceneryPosition | null {
  const scenery = theme.exitScenery;
  if (!scenery || exit.type !== 'exit') return null;
  const tent = spriteBounds(exit, theme.exit);
  const obstacles = level.objects.filter((object) => object !== exit).map((object) => objectBounds(object, theme));
  const candidates = [
    { x: tent.x + tent.w + EXIT_SCENERY_GAP + scenery.anchorX, y: exit.y - 1 },
    { x: tent.x - EXIT_SCENERY_GAP - scenery.width + scenery.anchorX, y: exit.y - 1 },
  ];
  for (const position of candidates) {
    const clear = scenery.frames.every((frame) =>
      frame.rows.every((row, py) => {
        for (let px = 0; px < row.length; px += 1) {
          if (row.charAt(px) === TRANSPARENT) continue;
          const x = position.x - scenery.anchorX + px;
          const y = position.y - scenery.anchorY + py;
          if (x < 0 || x >= level.width || y < 0 || y >= level.height || isSolid(terrain, x, y)) return false;
          if (
            obstacles.some((obstacle) => x >= obstacle.x && x < obstacle.x + obstacle.w && y >= obstacle.y && y < obstacle.y + obstacle.h)
          )
            return false;
        }
        return true;
      }),
    );
    if (clear) return position;
  }
  return null;
}
