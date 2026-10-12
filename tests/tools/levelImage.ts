// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Level pictures in plain node, for the preview tools: the terrain in the theme's real colours and
 * the objects as their real sprites, composed in the playfield's order (render/playfield.ts):
 * hatches, exits and traps behind the terrain, water in front of it.
 */
import { findExitSceneryPosition } from '../../src/render/scenery';
import { FONT, glyphFor } from '../../src/render/font';
import { frameAt, parseHexColor, rasterize, type Animation, type Palette } from '../../src/render/pixelArt';
import { paintTerrainPixels } from '../../src/render/terrainImage';
import type { LevelData } from '../../src/sim/level';
import type { Terrain } from '../../src/sim/terrain';
import { terrainColorsFor, trapAnimation, type Theme } from '../../src/theme/themes';

/** An RGBA picture, row by row, 4 bytes per pixel. */
export class Picture {
  readonly data: Uint8ClampedArray;

  constructor(
    readonly width: number,
    readonly height: number,
  ) {
    this.data = new Uint8ClampedArray(width * height * 4);
    for (let i = 3; i < this.data.length; i += 4) this.data[i] = 255; // opaque black
  }

  /** Copy opaque pixels of an RGBA buffer of size w × h to (x, y). */
  blit(pixels: Uint8ClampedArray, w: number, h: number, x: number, y: number): void {
    for (let sy = 0; sy < h; sy += 1) {
      const ty = y + sy;
      if (ty < 0 || ty >= this.height) continue;
      for (let sx = 0; sx < w; sx += 1) {
        const tx = x + sx;
        const s = (sy * w + sx) * 4;
        if (tx < 0 || tx >= this.width || (pixels[s + 3] ?? 0) === 0) continue;
        this.data.set(pixels.subarray(s, s + 4), (ty * this.width + tx) * 4);
      }
    }
  }

  fill(x: number, y: number, w: number, h: number, color: string): void {
    const [r, g, b] = parseHexColor(color);
    const pixel = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i += 1) pixel.set([r, g, b, 255], i * 4);
    this.blit(pixel, w, h, x, y);
  }

  text(text: string, x: number, y: number, color: string): void {
    let cursor = x;
    for (const char of text) {
      glyphFor(char).forEach((row, gy) => {
        for (let gx = 0; gx < row.length; gx += 1) if (row.charAt(gx) === '#') this.fill(cursor + gx, y + gy, 1, 1, color);
      });
      cursor += FONT.width;
    }
  }

  /** A copy enlarged by an integer factor (nearest neighbour, crisp pixels). */
  scaled(factor: number): Picture {
    if (factor === 1) return this;
    const out = new Picture(this.width * factor, this.height * factor);
    for (let y = 0; y < out.height; y += 1) {
      for (let x = 0; x < out.width; x += 1) {
        const s = (Math.floor(y / factor) * this.width + Math.floor(x / factor)) * 4;
        out.data.set(this.data.subarray(s, s + 4), (y * out.width + x) * 4);
      }
    }
    return out;
  }
}

/** Draw an animation frame with its anchor at (x, y), as SpriteCache.draw does. */
export function drawSprite(picture: Picture, animation: Animation, tick: number, palette: Palette, x: number, y: number): void {
  const pixels = rasterize(frameAt(animation, tick), palette, false);
  picture.blit(pixels, animation.width, animation.height, x - animation.anchorX, y - animation.anchorY);
}

export function drawTerrain(picture: Picture, terrain: Terrain, theme: Theme, style: string, x = 0, y = 0): void {
  const pixels = new Uint8ClampedArray(terrain.width * terrain.height * 4);
  paintTerrainPixels(terrain, terrainColorsFor(theme, style), pixels);
  picture.blit(pixels, terrain.width, terrain.height, x, y);
}

/** Faint guide lines every `step` px on the background (behind everything), to read coordinates off. */
export function drawGrid(picture: Picture, step: number): void {
  for (let x = 0; x < picture.width; x += step) picture.fill(x, 0, 1, picture.height, x % (step * 4) === 0 ? '#383838' : '#1c1c1c');
  for (let y = 0; y < picture.height; y += step) picture.fill(0, y, picture.width, 1, y % (step * 4) === 0 ? '#383838' : '#1c1c1c');
}

/** The whole level as the player sees it at the start, hatches open. */
export function levelPicture(level: LevelData, terrain: Terrain, theme: Theme, grid: number): Picture {
  const picture = new Picture(level.width, level.height);
  if (grid > 0) drawGrid(picture, grid);
  const palette = theme.spritePalette;
  for (const object of level.objects) {
    if (object.type === 'hatch') drawSprite(picture, theme.hatch, 99, palette, object.x, object.y);
    else if (object.type === 'exit') {
      const scenery = findExitSceneryPosition(level, terrain, object, theme);
      if (theme.exitScenery && scenery) drawSprite(picture, theme.exitScenery, 0, palette, scenery.x, scenery.y);
      drawSprite(picture, theme.exit, 0, palette, object.x, object.y);
    } else if (object.type === 'trap') drawSprite(picture, trapAnimation(theme, object.kind), 0, palette, object.x, object.y);
  }
  drawTerrain(picture, terrain, theme, level.style);
  for (const object of level.objects) {
    if (object.type !== 'water') continue;
    for (let x = object.x; x < object.x + object.w; x += theme.water.width) drawSprite(picture, theme.water, x, palette, x, object.y);
  }
  return picture;
}
