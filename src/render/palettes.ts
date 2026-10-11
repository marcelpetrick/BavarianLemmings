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
 * Terrain colour slots: 1 body, 2 body shadow, 3 body highlight, 4 top edge (grass, crust),
 * 5 steel, 6 steel shadow, 7 builder brick.
 */
export type TerrainSlot = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const TERRAIN_SLOTS: readonly TerrainSlot[] = [1, 2, 3, 4, 5, 6, 7];

export type TerrainColors = Readonly<Record<TerrainSlot, string>>;

export const CLASSIC_TERRAIN_COLORS: Readonly<Record<TerrainStyle, TerrainColors>> = {
  dirt: { 1: '#8a5a2a', 2: '#5e3a18', 3: '#b07a40', 4: '#3aa838', 5: '#8890a0', 6: '#50586a', 7: '#c8a070' },
  fire: { 1: '#a83818', 2: '#6a1e0c', 3: '#e86828', 4: '#f8c838', 5: '#8890a0', 6: '#50586a', 7: '#d88848' },
  marble: { 1: '#9898a8', 2: '#606070', 3: '#d0d0d8', 4: '#f0f0f8', 5: '#8890a0', 6: '#50586a', 7: '#b8b8c8' },
  pillar: { 1: '#c8a868', 2: '#8a6a38', 3: '#e8d098', 4: '#f0e0b0', 5: '#8890a0', 6: '#50586a', 7: '#d8c088' },
  crystal: { 1: '#3878d8', 2: '#1c3c90', 3: '#88c0f8', 4: '#c8f0ff', 5: '#8890a0', 6: '#50586a', 7: '#78a8f0' },
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
  dirt: { 1: '#8a8478', 2: '#5c584e', 3: '#b0aa9c', 4: '#48b040', 5: '#8890a0', 6: '#50586a', 7: '#c89858' },
  fire: { 1: '#7a3a1a', 2: '#4a2010', 3: '#d07030', 4: '#f0b040', 5: '#8890a0', 6: '#50586a', 7: '#d8a060' },
  marble: { 1: '#9a6a3a', 2: '#6a4422', 3: '#c8945a', 4: '#e0c090', 5: '#8890a0', 6: '#50586a', 7: '#d0a060' },
  pillar: { 1: '#d8e4f0', 2: '#0066b3', 3: '#ffffff', 4: '#38a038', 5: '#8890a0', 6: '#50586a', 7: '#a8c8ec' },
  crystal: { 1: '#a8d8f0', 2: '#6aa8d8', 3: '#e8f8ff', 4: '#ffffff', 5: '#8890a0', 6: '#50586a', 7: '#c8e8f8' },
};
