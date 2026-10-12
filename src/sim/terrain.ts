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

/**
 * Colour slots of terrain pixels (architecture.md 6.3). The level builder writes a slot per pixel,
 * the theme maps every slot of a terrain style to a colour (render/palettes.ts). 0 is empty.
 * Slots 1 to 7 are one brightness ramp from the outline to the lit top edge; the texture functions
 * step along it for shading.
 */
export const SLOT = {
  /** Darkest visible tone: the underside where terrain meets air. */
  outline: 1,
  /** Deep shadow: mortar, cracks, the second row of an underside. */
  deep: 2,
  shadow: 3,
  bodyDark: 4,
  body: 5,
  bodyLight: 6,
  /** Lit top edge and sparkles. */
  highlight: 7,
  /** Surface layer (grass, glowing crust, frost): dark, middle, light. */
  topDark: 8,
  top: 9,
  topLight: 10,
  /** Second material (pebbles, embers, veins, carvings, facets): middle and light. */
  accent: 11,
  accentLight: 12,
  /** Steel (indestructible) as riveted plates. */
  steelDark: 13,
  steel: 14,
  steelLight: 15,
  /** Bricks laid by builders. */
  brick: 16,
} as const;

/** The number of terrain colour slots; a palette defines slots 1 to this number. */
export const TERRAIN_SLOT_COUNT = 16;

export const COLOR_EMPTY = 0;
export const COLOR_STEEL = SLOT.steel;
export const COLOR_BRICK = SLOT.brick;

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
