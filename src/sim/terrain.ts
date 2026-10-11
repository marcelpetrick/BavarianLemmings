// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Destructible terrain, one byte of flags and one byte of colour per pixel (architecture.md 6.3).
 *
 * Coordinates outside the level: left and right of it are solid (lemmings turn at the level edge),
 * above and below it are empty (a lemming falling below the bottom is lost, G-09).
 */
export const SOLID = 1;
export const STEEL = 2;
export const ONE_WAY_LEFT = 4;
export const ONE_WAY_RIGHT = 8;

/** Palette slots of terrain pixels; the theme maps them to colours. 0 is empty. */
export const COLOR_EMPTY = 0;
export const COLOR_STEEL = 5;
export const COLOR_BRICK = 7;

export interface Terrain {
  readonly width: number;
  readonly height: number;
  readonly mask: Uint8Array;
  readonly colors: Uint8Array;
  /** Rows changed since the renderer last looked; the renderer clears it. */
  dirty: boolean;
}

export function createTerrain(width: number, height: number): Terrain {
  return { width, height, mask: new Uint8Array(width * height), colors: new Uint8Array(width * height), dirty: true };
}

export function cloneTerrain(terrain: Terrain): Terrain {
  return { width: terrain.width, height: terrain.height, mask: terrain.mask.slice(), colors: terrain.colors.slice(), dirty: true };
}

function inside(terrain: Terrain, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < terrain.width && y < terrain.height;
}

export function flagsAt(terrain: Terrain, x: number, y: number): number {
  if (y < 0 || y >= terrain.height) return 0;
  if (x < 0 || x >= terrain.width) return SOLID | STEEL;
  return terrain.mask[y * terrain.width + x] ?? 0;
}

export function isSolid(terrain: Terrain, x: number, y: number): boolean {
  return (flagsAt(terrain, x, y) & SOLID) !== 0;
}

export function isSteel(terrain: Terrain, x: number, y: number): boolean {
  return (flagsAt(terrain, x, y) & STEEL) !== 0;
}

/** Fill one pixel (level building); `flags` must include SOLID. */
export function setPixel(terrain: Terrain, x: number, y: number, flags: number, color: number): void {
  if (!inside(terrain, x, y)) return;
  const index = y * terrain.width + x;
  terrain.mask[index] = flags;
  terrain.colors[index] = color;
  terrain.dirty = true;
}

/** Erase one pixel unconditionally (level building only; skills use removePixel). */
export function erasePixel(terrain: Terrain, x: number, y: number): void {
  setPixel(terrain, x, y, 0, COLOR_EMPTY);
}

/**
 * Whether a skill digging in direction `dir` (-1 left, +1 right, 0 none: digger, bomber) may remove
 * this pixel. Steel never; one-way pixels only when digging the way their arrows point (G-08).
 * Bombers and diggers ignore one-way areas, as they have no horizontal direction.
 */
export function canRemove(terrain: Terrain, x: number, y: number, dir: -1 | 0 | 1): boolean {
  const flags = flagsAt(terrain, x, y);
  if ((flags & STEEL) !== 0) return false;
  if (dir === 1 && (flags & ONE_WAY_LEFT) !== 0) return false;
  if (dir === -1 && (flags & ONE_WAY_RIGHT) !== 0) return false;
  return true;
}

/** Remove a pixel if allowed. Returns false when the pixel was solid and could not be removed. */
export function removePixel(terrain: Terrain, x: number, y: number, dir: -1 | 0 | 1): boolean {
  if (!isSolid(terrain, x, y)) return true;
  if (!canRemove(terrain, x, y, dir)) return false;
  erasePixel(terrain, x, y);
  return true;
}

/** Add a builder brick pixel; never overwrites existing terrain. */
export function addBrickPixel(terrain: Terrain, x: number, y: number): void {
  if (!inside(terrain, x, y) || isSolid(terrain, x, y)) return;
  setPixel(terrain, x, y, SOLID, COLOR_BRICK);
}
