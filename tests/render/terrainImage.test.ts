// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { CLASSIC_TERRAIN_COLORS } from '../../src/render/palettes';
import { paintTerrainPixels, slotColors } from '../../src/render/terrainImage';
import { COLOR_BRICK, createTerrain, SOLID } from '../../src/sim/terrain';

describe('terrain image', () => {
  it('maps every slot to its colour, empty pixels to transparent', () => {
    const colors = CLASSIC_TERRAIN_COLORS.dirt;
    expect(slotColors(colors)).toHaveLength(17);
    const terrain = createTerrain(3, 1);
    terrain.mask.set([0, SOLID, SOLID]);
    terrain.colors.set([5, COLOR_BRICK, 99]);
    const data = new Uint8ClampedArray(12);
    paintTerrainPixels(terrain, colors, data);
    expect([...data.subarray(0, 4)]).toEqual([0, 0, 0, 0]);
    expect([...data.subarray(4, 8)]).toEqual([0xc8, 0xa0, 0x70, 255]);
    // An unknown slot falls back to the body colour (slot 5).
    expect([...data.subarray(8, 12)]).toEqual([0xa0, 0x64, 0x28, 255]);
  });
});
