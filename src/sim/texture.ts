// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Terrain textures (vision V-02, V-07; architecture.md 6.3): which colour slot every terrain pixel
 * gets. The simulation never reads colours; only the renderer and the replay fingerprint do.
 *
 * The level builder first writes a *hint* per pixel, then `paintTerrain` turns hints into slots:
 * - `HINT_NATURAL`: the terrain style's texture (strata, lava cells, marble blocks, ...);
 * - a slot `1..16`: a piece chose this slot itself (flutes, rivets, mortar), lighting still applies;
 * - `HINT_FIXED | slot`: a piece chose the final slot (grass tufts, chains, steel plates).
 *
 * Lighting comes from the top left, as in most VGA pixel art: the top edge is lit, the left side
 * is a step lighter, the right side a step darker, and undersides fade into the outline tone, so
 * every shape reads clearly against the black background. Every pattern is a fixed function of the
 * position (no randomness, G-12), so the same level always looks the same.
 */
import { hash3, valueNoise } from './geometry';
import { ONE_WAY_LEFT, ONE_WAY_RIGHT, SLOT, STEEL, type Terrain } from './terrain';

/** The pixel takes the terrain style's own texture. */
export const HINT_NATURAL = 32;
/** Flag: the slot in the low bits is final; no lighting is applied. */
export const HINT_FIXED = 64;

const SLOT_BITS = 31;

/** Texture inputs of one pixel. */
export interface TexelInfo {
  readonly x: number;
  readonly y: number;
  /** Solid pixels between this one and the air above it (0 = top edge). */
  readonly depth: number;
  /** Solid pixels between this one and the air below it (0 = underside). */
  readonly under: number;
}

const RAMP: readonly number[] = [SLOT.outline, SLOT.deep, SLOT.shadow, SLOT.bodyDark, SLOT.body, SLOT.bodyLight, SLOT.highlight];

/** One step darker along the slot's ramp. */
export function darker(slot: number): number {
  switch (slot) {
    case SLOT.topLight:
      return SLOT.top;
    case SLOT.top:
      return SLOT.topDark;
    case SLOT.topDark:
      return SLOT.shadow;
    case SLOT.accentLight:
      return SLOT.accent;
    case SLOT.accent:
      return SLOT.deep;
    default: {
      const index = RAMP.indexOf(slot);
      return index <= 0 ? SLOT.outline : (RAMP[index - 1] ?? SLOT.outline);
    }
  }
}

/** One step lighter along the slot's ramp. */
export function lighter(slot: number): number {
  switch (slot) {
    case SLOT.topDark:
      return SLOT.top;
    case SLOT.top:
    case SLOT.topLight:
      return SLOT.topLight;
    case SLOT.accent:
    case SLOT.accentLight:
      return SLOT.accentLight;
    default: {
      const index = RAMP.indexOf(slot);
      return index < 0 ? slot : (RAMP[Math.min(RAMP.length - 1, index + 1)] ?? slot);
    }
  }
}

// --- Cellular pattern (lava cells, crystal facets) ------------------------------------------------

export interface Cells {
  /** Distance to the nearest and second-nearest feature point, in pixels. */
  d1: number;
  d2: number;
  /** Hash of the nearest and second-nearest cell. */
  id1: number;
  id2: number;
  /** Offset of the pixel from its feature point. */
  dx: number;
  dy: number;
}

const cells: Cells = { d1: 0, d2: 0, id1: 0, id2: 0, dx: 0, dy: 0 };

/**
 * Worley cells on a grid of `cw` × `ch` px, one jittered feature point per grid cell. Returns a
 * shared record that the next call overwrites.
 */
export function cellular(x: number, y: number, cw: number, ch: number, seed: number): Cells {
  const gx = Math.floor(x / cw);
  const gy = Math.floor(y / ch);
  let best = Infinity;
  let second = Infinity;
  for (let j = gy - 1; j <= gy + 1; j += 1) {
    for (let i = gx - 1; i <= gx + 1; i += 1) {
      const h = hash3(i, j, seed);
      const px = i * cw + 1 + (h % (cw - 2));
      const py = j * ch + 1 + ((h >>> 8) % (ch - 2));
      const dx = x - px;
      const dy = y - py;
      const d = dx * dx + dy * dy;
      if (d < best) {
        second = best;
        cells.id2 = cells.id1;
        best = d;
        cells.id1 = h;
        cells.dx = dx;
        cells.dy = dy;
      } else if (d < second) {
        second = d;
        cells.id2 = h;
      }
    }
  }
  cells.d1 = Math.sqrt(best);
  cells.d2 = Math.sqrt(second);
  return cells;
}

// --- Style textures -------------------------------------------------------------------------------

/** Dirt: grass on top with hanging blades, earth strata, pebbles and roots. */
function dirt({ x, y, depth }: TexelInfo): number {
  const grass = 3 + ((hash3(x, 0, 7) >>> 4) % 3);
  if (depth === 0) return SLOT.topLight;
  if (depth < grass - 1) return SLOT.top;
  if (depth === grass - 1) return SLOT.topDark;
  if (depth === grass) return SLOT.shadow;
  // Roots: a few columns grow a wiggly root down from the grass.
  for (let start = x - 1; start <= x + 1; start += 1) {
    const h = hash3(start, 1, 23);
    if (h % 17 !== 0) continue;
    const length = 4 + ((h >>> 5) % 9);
    const below = depth - grass;
    if (below > length) continue;
    const wiggle = Math.floor(valueNoise(below, 4, start) * 3) - 1;
    if (start + wiggle === x) return below === length ? SLOT.bodyDark : SLOT.deep;
  }
  // Pebbles: at most one per 10 × 8 cell, with a lit top left and a shadow below right.
  const cx = Math.floor(x / 10);
  const cy = Math.floor(y / 8);
  const h = hash3(cx, cy, 31);
  if (h % 5 < 2 && depth > grass + 1) {
    const px = cx * 10 + 2 + (h % 6);
    const py = cy * 8 + 2 + ((h >>> 3) % 4);
    const rx = 1 + ((h >>> 6) % 2);
    const dx = x - px;
    const dy = y - py;
    if ((dx * dx) / (rx * rx) + dy * dy <= 1.3) {
      const d = dx + dy;
      if (d <= -1) return SLOT.accentLight;
      return SLOT.accent;
    }
    if (dy === 1 && dx >= 0 && dx <= rx) return SLOT.deep;
  }
  // Strata: soft wavy bands of earth.
  const wave = valueNoise(x, 37, 5) * 6 + valueNoise(x, 13, 6) * 2;
  const band = Math.floor((y + wave) / 4);
  const kind = hash3(band, 0, 3) % 6;
  if (kind === 0) return SLOT.bodyDark;
  if (kind === 1) return SLOT.bodyLight;
  return SLOT.body;
}

/** Fire: dark lava rock in cells, glowing ember cracks between them, a hot crust on top. */
function fire({ x, y, depth }: TexelInfo): number {
  const drip = (hash3(x, 2, 41) >>> 3) % 7 === 0 ? 2 + (hash3(x, 3, 41) % 3) : 0;
  if (depth === 0) return SLOT.topLight;
  if (depth === 1) return SLOT.top;
  if (depth === 2 || depth < 3 + drip) return SLOT.topDark;
  const c = cellular(x, y, 13, 10, 17);
  const gap = c.d2 - c.d1;
  if (gap < 1.1) {
    const glowing = (c.id1 ^ c.id2) % 3 !== 0;
    if (!glowing) return SLOT.deep;
    return gap < 0.5 ? SLOT.accentLight : SLOT.accent;
  }
  if (gap < 2.2) return SLOT.bodyDark;
  const v = (c.dx * 0.7 + c.dy) / 6;
  if (v < -0.5) return SLOT.bodyLight;
  if (v > 0.8) return SLOT.shadow;
  return SLOT.body;
}

/** Marble: blocks in running bond with mortar lines, bevelled faces and wavy veins. */
function marble({ x, y, depth }: TexelInfo): number {
  if (depth === 0) return SLOT.highlight;
  const row = Math.floor(y / 12);
  const shifted = x + (row % 2 === 0 ? 0 : 12);
  const column = Math.floor(shifted / 24);
  const bx = shifted - column * 24;
  const by = y - row * 12;
  if (by === 11 || bx === 23) return SLOT.deep;
  const block = hash3(column, row, 53);
  const t = x * 0.45 + y + valueNoise(x + y, 9, block) * 9 + valueNoise(y, 5, block >>> 4) * 3;
  const vein = Math.floor(t) % 23 === block % 23;
  if (vein) return block % 3 === 0 ? SLOT.accentLight : SLOT.accent;
  if (by === 0 || bx === 0) return SLOT.bodyLight;
  if (by === 10 || bx === 22) return SLOT.bodyDark;
  return block % 4 === 0 ? SLOT.bodyLight : SLOT.body;
}

/** Pillar: sandstone ashlar with vertical flutes and a carved band in every second course. */
function pillar({ x, y, depth }: TexelInfo): number {
  if (depth === 0) return SLOT.highlight;
  const row = Math.floor(y / 16);
  const by = y - row * 16;
  const shifted = x + (row % 2 === 0 ? 0 : 16);
  const bx = shifted % 32;
  if (by === 15 || bx === 31) return SLOT.deep;
  if (by === 0) return SLOT.bodyLight;
  const carved = row % 2 === 0;
  if (carved && by === 5) return SLOT.shadow;
  if (carved && (by === 6 || by === 7)) {
    const motif = (Math.floor(shifted / 3) + by) % 2 === 0;
    return motif ? SLOT.accentLight : SLOT.accent;
  }
  if (carved && by === 8) return SLOT.bodyLight;
  const flute = shifted % 6;
  if (flute === 5) return SLOT.bodyDark;
  if (flute === 0) return SLOT.bodyLight;
  return SLOT.body;
}

/** Crystal: large facets with their own tone, bright facet edges and a few sparkles. */
function crystal({ x, y, depth }: TexelInfo): number {
  if (depth === 0) return SLOT.topLight;
  if (depth === 1) return SLOT.top;
  const c = cellular(x, y, 17, 13, 71);
  if (c.id1 % 9 === 0 && c.d1 < 2.5) {
    if (c.dx === 0 && c.dy === 0) return SLOT.highlight;
    if ((c.dx === 0 || c.dy === 0) && c.d1 <= 2) return SLOT.accentLight;
  }
  const gap = c.d2 - c.d1;
  if (gap < 0.9) return c.dy < 0 ? SLOT.bodyLight : SLOT.accent;
  const tone = c.id1 % 4;
  const lean = (c.dx * ((c.id1 >>> 4) % 2 === 0 ? 1 : -1) + c.dy) / 7;
  const base = tone === 0 ? SLOT.bodyDark : tone === 3 ? SLOT.bodyLight : SLOT.body;
  if (lean < -0.6) return lighter(base);
  if (lean > 0.8) return darker(base);
  return base;
}

/** The texture function of each terrain style; unknown styles use dirt (as the theme does). */
const STYLE_TEXTURES: Readonly<Record<string, (info: TexelInfo) => number>> = { dirt, fire, marble, pillar, crystal };

export function styleTexture(style: string): (info: TexelInfo) => number {
  return STYLE_TEXTURES[style] ?? dirt;
}

/** Steel as riveted plates of 16 × 8 px, counted from the steel area's top-left corner. */
export function steelSlot(localX: number, localY: number, width: number, height: number): number {
  const px = localX % 16;
  const py = localY % 8;
  const plateW = Math.min(16, width - (localX - px));
  const plateH = Math.min(8, height - (localY - py));
  if (py === plateH - 1 || px === plateW - 1) return SLOT.steelDark;
  if (py === 0 || px === 0) return SLOT.steelLight;
  if (plateW >= 8 && plateH >= 6) {
    const rivetX = px === 2 || px === plateW - 3;
    const rivetY = py === 2 || py === plateH - 3;
    if (rivetX && rivetY) return SLOT.steelLight;
    if ((px === 3 || px === plateW - 2) && (py === 3 || py === plateH - 2)) return SLOT.steelDark;
  }
  return SLOT.steel;
}

/** Arrow chevrons on one-way pixels, pointing the way they may be dug. */
function oneWayArrow(x: number, y: number, right: boolean): boolean {
  const tx = x % 12;
  const ty = y % 8;
  if (ty === 7) return false;
  const reach = 3 - Math.abs(ty - 3);
  const column = right ? 3 + reach : 8 - reach;
  return tx === column || tx === column + (right ? -1 : 1);
}

/**
 * Turn the builder's hints into final colour slots for every solid pixel of the terrain.
 * `hints` has one byte per pixel (see the HINT_ constants).
 */
export function paintTerrain(terrain: Terrain, hints: Uint8Array, style: string): void {
  const { width, height, mask, colors } = terrain;
  const texture = styleTexture(style);
  const depth = new Uint16Array(width * height);
  const under = new Uint16Array(width * height);
  for (let x = 0; x < width; x += 1) {
    for (let y = 1; y < height; y += 1) {
      const i = y * width + x;
      if (mask[i] !== 0 && mask[i - width] !== 0) depth[i] = Math.min(999, (depth[i - width] ?? 0) + 1);
    }
    // The bottom row continues below the level: it is not an underside.
    const bottom = (height - 1) * width + x;
    if (mask[bottom] !== 0) under[bottom] = 999;
    for (let y = height - 2; y >= 0; y -= 1) {
      const i = y * width + x;
      if (mask[i] !== 0 && mask[i + width] !== 0) under[i] = Math.min(999, (under[i + width] ?? 0) + 1);
    }
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      const flags = mask[i] ?? 0;
      if (flags === 0) continue;
      const hint = hints[i] ?? HINT_NATURAL;
      if ((hint & HINT_FIXED) !== 0 || (flags & STEEL) !== 0) {
        colors[i] = hint & SLOT_BITS;
        continue;
      }
      const info: TexelInfo = { x, y, depth: depth[i] ?? 0, under: under[i] ?? 0 };
      let slot = hint === HINT_NATURAL ? texture(info) : hint & SLOT_BITS;
      if (hint !== HINT_NATURAL && info.depth === 0) slot = SLOT.highlight;
      if (info.depth > 0 && info.under > 0) {
        if (x > 0 && mask[i - 1] === 0) slot = lighter(slot);
        else if (x < width - 1 && mask[i + 1] === 0) slot = darker(slot);
      }
      if (info.under === 0) slot = SLOT.outline;
      else if (info.under === 1 && info.depth > 0) slot = darker(slot);
      if ((flags & (ONE_WAY_LEFT | ONE_WAY_RIGHT)) !== 0 && oneWayArrow(x, y, (flags & ONE_WAY_RIGHT) !== 0)) slot = SLOT.accentLight;
      colors[i] = slot;
    }
  }
  terrain.dirty = true;
}
