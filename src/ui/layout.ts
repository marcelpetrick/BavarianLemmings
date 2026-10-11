// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Screen geometry (vision V-01, V-03, V-04): the 320×200 logical screen, its integer scaling, and the
 * classic bottom panel with its buttons and minimap. Pure functions, no DOM.
 */
import { PANEL_HEIGHT, PLAYFIELD_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from '../sim/constants';
import { SKILLS, type Skill } from '../sim/skills';

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

/** Convert a pointer position inside an element of the given CSS size into logical screen pixels. */
export function toLogical(offsetX: number, offsetY: number, cssWidth: number, cssHeight: number): { x: number; y: number } {
  return { x: Math.floor((offsetX * SCREEN_WIDTH) / cssWidth), y: Math.floor((offsetY * SCREEN_HEIGHT) / cssHeight) };
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
