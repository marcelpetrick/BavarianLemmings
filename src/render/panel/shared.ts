// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Drawing shared by the classic and the touch panel: the minimap with the lemmings as dots and the
 * visible area as a frame (vision V-03). Browser-only (canvas).
 */
import type { GameState } from '../../sim/state';
import type { Context } from '../draw';

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export function drawMinimap(
  ctx: Context,
  state: GameState,
  rect: Rect,
  terrainImage: HTMLCanvasElement,
  view: { readonly viewX: number; readonly viewWidth: number },
  frameColor: string,
): void {
  const { x, y, w, h } = rect;
  ctx.fillStyle = '#000000';
  ctx.fillRect(x, y, w, h);
  ctx.drawImage(terrainImage, 0, 0, terrainImage.width, terrainImage.height, x, y, w, h);
  const sx = w / state.level.width;
  const sy = h / state.terrain.height;
  ctx.fillStyle = '#ffff40';
  for (const lemming of state.lemmings) {
    if (!lemming.removed) ctx.fillRect(x + Math.floor(lemming.x * sx), y + Math.floor((lemming.y - 4) * sy), 1, 1);
  }
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + Math.floor(view.viewX * sx) + 0.5, y + 0.5, Math.max(2, Math.floor(view.viewWidth * sx)), h - 1);
}
