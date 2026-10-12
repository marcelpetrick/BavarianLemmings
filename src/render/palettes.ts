// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import type { Palette } from './pixelArt';

/**
 * Colours per theme. Sprites use semantic colour slots (one character each); a palette maps every
 * slot to a CSS colour `#rrggbb`. The colours are our own choices in the spirit of a 1991 VGA game
 * (vision V-02); none is sampled from the original.
 */

/** Every colour slot a sprite may use, with its meaning. `.` (transparent) is not a slot. */
export const SPRITE_SLOTS = {
  H: 'hair',
  S: 'skin (face, hands, knees)',
  B: 'clothes main (robe, Lederhosen)',
  C: 'clothes second (far limbs, shirt braces, alpine hat)',
  W: 'white (eyes, umbrella panels, foam, shirt)',
  T: 'tool (pickaxe, shovel, brick in hand)',
  K: 'dark (outline, shoes, openings)',
  R: 'red (umbrella panel, embers, splat)',
  Y: 'yellow (sparks, flame core, beer)',
  G: 'grey (metal, stone)',
  O: 'orange (fire)',
  P: 'brown (wood)',
  L: 'light blue (water highlight)',
  D: 'deep blue (water, Bavarian blue)',
  N: 'green (grass, wreath, feather)',
} as const;

export type SpriteSlot = keyof typeof SPRITE_SLOTS;

/** The classic look: green hair, blue robe, red-and-white umbrella. */
export const CLASSIC_SPRITE_PALETTE: Palette & Readonly<Record<SpriteSlot, string>> = {
  H: '#00b800',
  S: '#f0d0c0',
  B: '#4848f0',
  C: '#2c2ca8',
  W: '#f8f8f8',
  T: '#b8a888',
  K: '#383848',
  R: '#e82828',
  Y: '#f8e830',
  G: '#9898a0',
  O: '#f88820',
  P: '#905828',
  L: '#88c8ff',
  D: '#2848b8',
  N: '#30a830',
};

/** The Bavarian look: blond hair under a green hat, Lederhosen brown, white and Bavarian blue. */
export const BAVARIAN_SPRITE_PALETTE: Palette & Readonly<Record<SpriteSlot, string>> = {
  H: '#e8c860',
  S: '#f4c8a8',
  B: '#8a5426',
  C: '#2f7040',
  W: '#ffffff',
  T: '#b0b0b8',
  K: '#2c2018',
  R: '#d82828',
  Y: '#f8d838',
  G: '#a8a8b0',
  O: '#f89830',
  P: '#a8703a',
  L: '#6ab0f0',
  D: '#0066b3',
  N: '#38a038',
};

/** The five terrain styles of a level (vision V-07). */
export type TerrainStyle = 'dirt' | 'fire' | 'marble' | 'pillar' | 'crystal';

export const TERRAIN_STYLES: readonly TerrainStyle[] = ['dirt', 'fire', 'marble', 'pillar', 'crystal'];

/**
 * Terrain colour slots 1 to 16, with the meaning the level builder gives them (sim/terrain.ts SLOT):
 * 1 outline, 2 deep shadow, 3 shadow, 4 body dark, 5 body, 6 body light, 7 highlight (lit top edge),
 * 8-10 surface layer dark/middle/light (grass, crust, frost), 11-12 second material middle/light
 * (pebbles, embers, veins, carvings, crystal), 13-15 steel dark/middle/light, 16 builder brick.
 * Slots 1 to 7 must go from dark to light: the texture functions shade by stepping along them.
 */
export type TerrainSlot = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export const TERRAIN_SLOTS: readonly TerrainSlot[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

export type TerrainColors = Readonly<Record<TerrainSlot, string>>;

/** Steel looks the same in every style and theme, so players always recognise it (slots 13-15). */
const STEEL_COLORS = ['#4c5468', '#8890a0', '#c8d0dc'] as const;

/** Slots 1-12 of a style, then steel, then the builder brick. */
function colors(style: readonly string[], brick: string): TerrainColors {
  const all = [...style, ...STEEL_COLORS, brick];
  return Object.fromEntries(all.map((color, index) => [index + 1, color])) as unknown as TerrainColors;
}

export const CLASSIC_TERRAIN_COLORS: Readonly<Record<TerrainStyle, TerrainColors>> = {
  // Brown earth in strata, green grass, grey pebbles.
  dirt: colors(
    ['#2a1608', '#4a2a10', '#6a3c18', '#84501f', '#a06428', '#bc7e38', '#d8a050', '#1e7a1e', '#30a830', '#78e050', '#8c8c84', '#c8c8bc'],
    '#c8a070',
  ),
  // Dark red lava rock, a glowing crust, orange and yellow embers.
  fire: colors(
    ['#200604', '#3e0c06', '#5c160a', '#7a2010', '#962c14', '#b4401c', '#e06a28', '#d84010', '#f88820', '#fce860', '#e85818', '#ffd040'],
    '#d88848',
  ),
  // White-grey marble blocks with blue-grey veins.
  marble: colors(
    ['#24242e', '#44444f', '#686874', '#8c8c98', '#b0b0bc', '#d0d0d8', '#f0f0f8', '#8890a0', '#c0c8d8', '#f8f8ff', '#5a6a8a', '#8a9ac0'],
    '#b8b8c8',
  ),
  // Sandstone with terracotta carvings.
  pillar: colors(
    ['#2e2010', '#4e3818', '#6e5226', '#8e6e36', '#b08c4c', '#ccaa68', '#ecd498', '#8e6e36', '#ccaa68', '#f0e0b0', '#a84828', '#d87048'],
    '#d8c088',
  ),
  // Blue crystal with frost on top and violet shards.
  crystal: colors(
    ['#0a1238', '#142060', '#1c3088', '#2848b0', '#3868d0', '#5890e8', '#a0d0ff', '#78b0f0', '#b0e0ff', '#f0ffff', '#8048d0', '#c890ff'],
    '#78a8f0',
  ),
};

/** What each classic terrain style becomes in Bavarian mode (vision V-09). */
export const BAVARIAN_TERRAIN_NAMES: Readonly<Record<TerrainStyle, string>> = {
  dirt: 'Alm meadow and rock',
  fire: 'Hendl grill',
  marble: 'Wirtshaus wood',
  pillar: 'Maibaum white and blue',
  crystal: 'glacier ice',
};

export const BAVARIAN_TERRAIN_COLORS: Readonly<Record<TerrainStyle, TerrainColors>> = {
  // Alm: grey limestone under a green meadow, pale limestone pebbles.
  dirt: colors(
    ['#1e1e1a', '#3a3a34', '#56544c', '#706c62', '#8c887c', '#aaa698', '#cac6b8', '#2f7a28', '#48a838', '#9ad860', '#b8b4a8', '#ece8dc'],
    '#c89858',
  ),
  // Hendl grill: charcoal with glowing embers under a golden roast crust.
  fire: colors(
    ['#100c0a', '#221a16', '#342822', '#4a3a30', '#5e4a3c', '#76604e', '#a08068', '#a85a18', '#d88a28', '#f8c050', '#e84818', '#ffb030'],
    '#d8a060',
  ),
  // Wirtshaus: wooden planks with darker grain.
  marble: colors(
    ['#1e1008', '#3a2010', '#5a3418', '#7a4a22', '#9a6a3a', '#b8844a', '#e0b070', '#6a4422', '#a87a48', '#e0c090', '#6a3e1a', '#c89050'],
    '#d0a060',
  ),
  // Maibaum: white and Bavarian blue stripes, green garlands with gold.
  pillar: colors(
    ['#0a2448', '#003a78', '#0058a8', '#0066b3', '#c8dcf0', '#ffffff', '#ffffff', '#2a7a30', '#38a038', '#78d060', '#38a038', '#ffe060'],
    '#a8c8ec',
  ),
  // Glacier: pale blue ice, snow on top, turquoise crevasses.
  crystal: colors(
    ['#1a3a5a', '#2a5a80', '#4a80a8', '#6aa8d0', '#98cce8', '#c0e4f4', '#ffffff', '#c8dce8', '#e8f4fc', '#ffffff', '#4ab0e0', '#b0f0ff'],
    '#c8e8f8',
  ),
};
