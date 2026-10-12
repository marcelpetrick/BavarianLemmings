// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Themes (vision V-09, V-10, R-05): everything that changes between Classic and Bavarian mode is
 * data here. The simulation never sees a theme. Both themes share sprite geometry, so switching
 * the theme changes only what is drawn and heard.
 */
import type { Action } from '../sim/lemming';
import {
  BAVARIAN_SPRITE_PALETTE,
  BAVARIAN_TERRAIN_COLORS,
  CLASSIC_SPRITE_PALETTE,
  CLASSIC_TERRAIN_COLORS,
  TERRAIN_STYLES,
  type TerrainColors,
  type TerrainStyle,
} from '../render/palettes';
import type { Animation, Palette } from '../render/pixelArt';
import { DIRNDL_LEMMING_ANIMATIONS } from '../render/sprites/dirndlLemmings';
import { BAVARIAN_LEMMING_ANIMATIONS } from '../render/sprites/bavarianLemmings';
import { LEMMING_ANIMATIONS } from '../render/sprites/lemmings';
import { OBJECT_ANIMATIONS } from '../render/sprites/objects';
import type { ThemeId } from '../persist/storage';

export interface UiColors {
  readonly background: string;
  readonly panel: string;
  readonly panelEdge: string;
  readonly text: string;
  readonly highlight: string;
  readonly title: string;
  readonly button: string;
  readonly buttonSelected: string;
}

export interface Theme {
  readonly id: ThemeId;
  readonly spritePalette: Palette;
  readonly terrainColors: Readonly<Record<TerrainStyle, TerrainColors>>;
  readonly lemmings: Readonly<Record<Action, Animation>>;
  readonly hatch: Animation;
  readonly exit: Animation;
  readonly water: Animation;
  /** Trap animation per trap kind of the level format. */
  readonly traps: Readonly<Record<string, Animation>>;
  /** Scenery drawn behind each exit, beside it (vision V-10: the maypole); null for none. */
  readonly exitScenery: Animation | null;
  /** Background: plain black like the original, or Alpine mountains. */
  readonly backdrop: 'black' | 'mountains';
  readonly ui: UiColors;
  /** i18n key prefix of the rating names (vision L-01). */
  readonly ratingPrefix: string;
}

export const CLASSIC_THEME: Theme = {
  id: 'classic',
  spritePalette: CLASSIC_SPRITE_PALETTE,
  terrainColors: CLASSIC_TERRAIN_COLORS,
  lemmings: LEMMING_ANIMATIONS,
  hatch: OBJECT_ANIMATIONS.hatch,
  exit: OBJECT_ANIMATIONS.exit,
  water: OBJECT_ANIMATIONS.water,
  traps: { squasher: OBJECT_ANIMATIONS.trapSquasher, fire: OBJECT_ANIMATIONS.trapFire },
  exitScenery: null,
  backdrop: 'black',
  ui: {
    background: '#000000',
    panel: '#000000',
    panelEdge: '#4848a8',
    text: '#30d830',
    highlight: '#f8f8f8',
    title: '#f8a020',
    button: '#202060',
    buttonSelected: '#f8f8f8',
  },
  ratingPrefix: 'rating.',
};

export const BAVARIAN_THEME: Theme = {
  id: 'bavarian',
  spritePalette: BAVARIAN_SPRITE_PALETTE,
  terrainColors: BAVARIAN_TERRAIN_COLORS,
  lemmings: BAVARIAN_LEMMING_ANIMATIONS,
  hatch: OBJECT_ANIMATIONS.bavarianHatch,
  exit: OBJECT_ANIMATIONS.bavarianExit,
  water: OBJECT_ANIMATIONS.water,
  traps: { squasher: OBJECT_ANIMATIONS.trapWeisswurst, fire: OBJECT_ANIMATIONS.trapMasskrug },
  exitScenery: OBJECT_ANIMATIONS.maypole,
  backdrop: 'mountains',
  ui: {
    background: '#0a2a5a',
    panel: '#0066b3',
    panelEdge: '#ffffff',
    text: '#ffffff',
    highlight: '#ffe060',
    title: '#ffffff',
    button: '#004a86',
    buttonSelected: '#ffffff',
  },
  ratingPrefix: 'rating.bavarian.',
};

export function themeById(id: ThemeId): Theme {
  return id === 'bavarian' ? BAVARIAN_THEME : CLASSIC_THEME;
}

/** The colours of a level's terrain style; unknown styles use dirt. */
export function terrainColorsFor(theme: Theme, style: string): TerrainColors {
  const known = (TERRAIN_STYLES as readonly string[]).includes(style) ? (style as TerrainStyle) : 'dirt';
  return theme.terrainColors[known];
}

/** The trap animation for a kind; unknown kinds use the squasher. */
export function trapAnimation(theme: Theme, kind: string): Animation {
  return theme.traps[kind] ?? OBJECT_ANIMATIONS.trapSquasher;
}

/** Alternate Bavarian costumes by stable entity ID without changing the simulation. */
export function lemmingAnimation(theme: Theme, action: Action, id: number): Animation {
  return theme.id === 'bavarian' && id % 2 === 0 ? DIRNDL_LEMMING_ANIMATIONS[action] : theme.lemmings[action];
}
