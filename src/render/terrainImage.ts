// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Terrain colour slots to RGBA pixels (architecture.md 6.3). Pure, so the browser's TerrainLayer
 * and the level preview tool (tests/tools/render-levels.test.ts) share it.
 */
import { TERRAIN_SLOT_COUNT, type Terrain } from '../sim/terrain';
import type { TerrainColors, TerrainSlot } from './palettes';
import { parseHexColor } from './pixelArt';

/** RGB of every slot; index 0 (empty) is black. */
export function slotColors(colors: TerrainColors): [number, number, number][] {
  const rgb: [number, number, number][] = [[0, 0, 0]];
  for (let slot = 1; slot <= TERRAIN_SLOT_COUNT; slot += 1) rgb.push(parseHexColor(colors[slot as TerrainSlot]));
  return rgb;
}

/**
 * Write the terrain into an RGBA buffer of the same size (width × height × 4 bytes). Empty pixels
 * become transparent; a slot the palette lacks falls back to slot 5 (body).
 */
export function paintTerrainPixels(terrain: Terrain, colors: TerrainColors, data: Uint8ClampedArray): void {
  const rgb = slotColors(colors);
  const fallback = rgb[5] ?? [0, 0, 0];
  for (let i = 0; i < terrain.colors.length; i += 1) {
    const slot = terrain.mask[i] === 0 ? 0 : (terrain.colors[i] ?? 0);
    const color = rgb[slot] ?? fallback;
    const o = i * 4;
    data[o] = color[0];
    data[o + 1] = color[1];
    data[o + 2] = color[2];
    data[o + 3] = slot === 0 ? 0 : 255;
  }
}
