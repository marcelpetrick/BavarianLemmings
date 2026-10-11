// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Screen geometry (vision V-01, V-03, V-04, C-06): the 320×200 logical screen, its integer scaling,
 * the classic bottom panel with its buttons and minimap, and the touch layout (vision 3.4.1).
 * Pure functions, no DOM.
 */
import { PANEL_HEIGHT, PLAYFIELD_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../sim/constants';
import { SKILLS, type Skill } from '../sim/skills';
import type { LayoutChoice } from '../persist/storage';

/** The CRT option stretches the 320×200 picture to 4:3, so every pixel is 1.2 times as tall as wide. */
export const CRT_PIXEL_ASPECT = 1.2;

export interface Scaling {
  readonly scale: number;
  readonly cssWidth: number;
  readonly cssHeight: number;
}

/** The largest integer scale at which the logical screen fits the viewport (at least 1). */
export function computeScaling(viewportWidth: number, viewportHeight: number, crt: boolean): Scaling {
  const aspect = crt ? CRT_PIXEL_ASPECT : 1;
  const scale = Math.max(1, Math.floor(Math.min(viewportWidth / SCREEN_WIDTH, viewportHeight / (SCREEN_HEIGHT * aspect))));
  return { scale, cssWidth: SCREEN_WIDTH * scale, cssHeight: Math.round(SCREEN_HEIGHT * scale * aspect) };
}

/**
 * Convert a pointer position inside an element of the given CSS size into logical screen pixels.
 * `logicalHeight` is 200 for the whole screen, 160 when the canvas shows only the playfield (touch).
 */
export function toLogical(
  offsetX: number,
  offsetY: number,
  cssWidth: number,
  cssHeight: number,
  logicalHeight: number = SCREEN_HEIGHT,
): { x: number; y: number } {
  return { x: Math.floor((offsetX * SCREEN_WIDTH) / cssWidth), y: Math.floor((offsetY * logicalHeight) / cssHeight) };
}

export type PanelButton = 'releaseMinus' | 'releasePlus' | Skill | 'pause' | 'nuke';

export const PANEL_BUTTONS: readonly PanelButton[] = ['releaseMinus', 'releasePlus', ...SKILLS, 'pause', 'nuke'];
export const BUTTON_WIDTH = 16;
/** Panel rows, relative to the top of the panel: the status line, then the buttons. */
export const STATUS_LINE_HEIGHT = 16;
export const BUTTON_TOP = STATUS_LINE_HEIGHT;
export const BUTTON_HEIGHT = PANEL_HEIGHT - STATUS_LINE_HEIGHT;
export const MINIMAP = { x: PANEL_BUTTONS.length * BUTTON_WIDTH + 8, y: BUTTON_TOP + 2, w: 104, h: 20 } as const;

export type PanelHit =
  | { readonly kind: 'button'; readonly button: PanelButton }
  | { readonly kind: 'minimap'; readonly levelX: number }
  | { readonly kind: 'none' };

/** What lies at a point of the screen below the playfield (y in screen pixels). */
export function hitPanel(x: number, y: number, levelWidth: number): PanelHit {
  const panelY = y - PLAYFIELD_HEIGHT;
  if (panelY < BUTTON_TOP || panelY >= PANEL_HEIGHT) return { kind: 'none' };
  const index = Math.floor(x / BUTTON_WIDTH);
  const button = PANEL_BUTTONS[index];
  if (x >= 0 && button !== undefined) return { kind: 'button', button };
  if (x >= MINIMAP.x && x < MINIMAP.x + MINIMAP.w && panelY >= MINIMAP.y && panelY < MINIMAP.y + MINIMAP.h) {
    return { kind: 'minimap', levelX: Math.floor(((x - MINIMAP.x) * levelWidth) / MINIMAP.w) };
  }
  return { kind: 'none' };
}

/** Keep the view inside the level: 0 .. levelWidth - 320. */
export function clampView(viewX: number, levelWidth: number): number {
  return Math.max(0, Math.min(levelWidth - SCREEN_WIDTH, Math.round(viewX)));
}

/** The view position that centres a level column on screen. */
export function centreView(levelX: number, levelWidth: number): number {
  return clampView(levelX - SCREEN_WIDTH / 2, levelWidth);
}

// ---------------------------------------------------------------- touch layout (vision 3.4.1)

export type EffectiveLayout = 'classic' | 'touch';

/** "Automatic" picks the touch layout when the primary pointer is coarse (a finger). */
export function resolveLayout(choice: LayoutChoice, coarsePointer: boolean): EffectiveLayout {
  if (choice === 'auto') return coarsePointer ? 'touch' : 'classic';
  return choice;
}

/** Smallest touch target in CSS pixels (WCAG 2.5.5 target size, Material Design touch targets). */
export const MIN_TOUCH_TARGET = 48;
/** Largest touch button in CSS pixels, so the buttons never crowd out the playfield (design value). */
export const MAX_TOUCH_TARGET = 100;
/** The bar above the playfield in the touch layout: status line, then a full-width minimap. Logical px. */
export const TOUCH_BAR_HEIGHT = 32;
export const TOUCH_MINIMAP = { x: 0, y: 11, w: SCREEN_WIDTH, h: 20 } as const;

export type TouchButton = PanelButton | 'fastForward' | 'restart' | 'fullscreen' | 'menu';

/**
 * Landscape: the first group is the left column, the second the right column, two buttons wide each,
 * so both thumbs reach four skills. Portrait: the first group is the upper row, the second the lower.
 */
export const TOUCH_BUTTON_GROUPS: readonly (readonly TouchButton[])[] = [
  ['releaseMinus', 'releasePlus', 'climber', 'floater', 'bomber', 'blocker', 'pause', 'fastForward'],
  ['builder', 'basher', 'miner', 'digger', 'nuke', 'restart', 'fullscreen', 'menu'],
];
/** Buttons per group row: two per column row in landscape, all eight in one row in portrait. */
export const TOUCH_COLUMNS = { landscape: 2, portrait: 8 } as const;

export interface TouchLayout {
  readonly orientation: 'landscape' | 'portrait';
  /** Integer scale of the playfield and the bar (V-01). */
  readonly scale: number;
  /** Edge length of one square button in CSS pixels, at least MIN_TOUCH_TARGET. */
  readonly button: number;
  readonly fieldWidth: number;
  readonly fieldHeight: number;
  readonly barHeight: number;
}

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}

/**
 * Size the touch layout for a viewport in CSS pixels. Landscape: the largest integer scale that
 * leaves room for two 48-pixel columns on each side; the buttons then take the room that is left.
 * Portrait: two rows of eight buttons across the width, the playfield above them.
 */
export function computeTouchLayout(viewportWidth: number, viewportHeight: number): TouchLayout {
  const landscape = viewportWidth >= viewportHeight;
  const unitHeight = PLAYFIELD_HEIGHT + TOUCH_BAR_HEIGHT;
  const sideColumns = 2 * TOUCH_COLUMNS.landscape;
  const rowsPerSide = (TOUCH_BUTTON_GROUPS[0]?.length ?? 0) / TOUCH_COLUMNS.landscape;
  let scale: number;
  let button: number;
  if (landscape) {
    const widthScale = Math.floor((viewportWidth - sideColumns * MIN_TOUCH_TARGET) / SCREEN_WIDTH);
    scale = Math.max(1, Math.min(widthScale, Math.floor(viewportHeight / unitHeight)));
    const sideRoom = (viewportWidth - SCREEN_WIDTH * scale) / sideColumns;
    button = Math.floor(clamp(Math.min(sideRoom, viewportHeight / rowsPerSide), MIN_TOUCH_TARGET, MAX_TOUCH_TARGET));
  } else {
    button = Math.floor(clamp(viewportWidth / TOUCH_COLUMNS.portrait, MIN_TOUCH_TARGET, MAX_TOUCH_TARGET));
    const freeHeight = viewportHeight - TOUCH_BUTTON_GROUPS.length * button;
    scale = Math.max(1, Math.floor(Math.min(viewportWidth / SCREEN_WIDTH, freeHeight / unitHeight)));
  }
  return {
    orientation: landscape ? 'landscape' : 'portrait',
    scale,
    button,
    fieldWidth: SCREEN_WIDTH * scale,
    fieldHeight: PLAYFIELD_HEIGHT * scale,
    barHeight: TOUCH_BAR_HEIGHT * scale,
  };
}

/** The level column under a point of the touch bar (logical pixels), or null outside the minimap. */
export function touchMinimapLevelX(x: number, y: number, levelWidth: number): number | null {
  const m = TOUCH_MINIMAP;
  if (y < m.y - 4 || y >= m.y + m.h + 4) return null;
  return Math.floor(((clamp(x, m.x, m.x + m.w - 1) - m.x) * levelWidth) / m.w);
}

export interface MagnifierRect {
  /** Source rectangle on the playfield (logical pixels). */
  readonly sx: number;
  readonly sy: number;
  readonly sw: number;
  readonly sh: number;
  /** Destination rectangle, twice as large. */
  readonly dx: number;
  readonly dy: number;
}

/** Size of the area the magnifier enlarges, in logical pixels; it is drawn twice as large. */
export const MAGNIFIER_SOURCE = { w: 32, h: 20 } as const;
export const MAGNIFIER_ZOOM = 2;
/** Gap between the finger and the magnifier, so the fingertip does not cover it (logical px). */
export const MAGNIFIER_GAP = 14;

/**
 * Where the magnifier shows the area under the finger: centred above the finger, kept on screen;
 * near the top edge it moves beside the finger instead.
 */
export function magnifierRect(x: number, y: number): MagnifierRect {
  const sw = MAGNIFIER_SOURCE.w;
  const sh = MAGNIFIER_SOURCE.h;
  const w = sw * MAGNIFIER_ZOOM;
  const h = sh * MAGNIFIER_ZOOM;
  const sx = clamp(Math.round(x - sw / 2), 0, SCREEN_WIDTH - sw);
  const sy = clamp(Math.round(y - sh / 2), 0, PLAYFIELD_HEIGHT - sh);
  let dx = clamp(Math.round(x - w / 2), 0, SCREEN_WIDTH - w);
  let dy = y - MAGNIFIER_GAP - h;
  if (dy < 0) {
    dy = clamp(Math.round(y - h / 2), 0, PLAYFIELD_HEIGHT - h);
    dx = x < SCREEN_WIDTH / 2 ? Math.round(x + MAGNIFIER_GAP) : Math.round(x - MAGNIFIER_GAP - w);
  }
  return { sx, sy, sw, sh, dx, dy: Math.round(dy) };
}
