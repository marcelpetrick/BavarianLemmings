// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The classic bottom panel (vision V-03, V-04): status line, release rate −/+, eight skill buttons
 * with their counters, pause, nuke, and the minimap with the visible area. Browser-only.
 */
import { PANEL_HEIGHT, PLAYFIELD_HEIGHT, SCREEN_WIDTH } from '../../sim/constants';
import { isSkill } from '../../sim/skills';
import type { GameState } from '../../sim/state';
import type { Theme } from '../../theme/themes';
import { BUTTON_HEIGHT, BUTTON_TOP, BUTTON_WIDTH, MINIMAP, PANEL_BUTTONS, type PanelButton } from '../../ui/layout';
import type { StatusParts } from '../../ui/status';
import { SpriteCache, TextRenderer, type Context } from '../draw';
import { CLASSIC_SPRITE_PALETTE } from '../palettes';
import { ICONS, type IconName } from '../sprites/icons';
import { drawMinimap } from './shared';

export interface PanelState {
  readonly selectedSkill: string | null;
  readonly paused: boolean;
  readonly nukeArmed: boolean;
  readonly fastForward: boolean;
  readonly viewX: number;
  readonly viewWidth: number;
}

export class PanelRenderer {
  private readonly icons: SpriteCache;

  constructor(
    private readonly theme: Theme,
    private readonly text: TextRenderer,
  ) {
    this.icons = new SpriteCache({ ...CLASSIC_SPRITE_PALETTE, ...theme.spritePalette });
  }

  draw(ctx: Context, state: GameState, panel: PanelState, status: StatusParts, terrainImage: HTMLCanvasElement): void {
    const top = PLAYFIELD_HEIGHT;
    const ui = this.theme.ui;
    ctx.fillStyle = ui.panel;
    ctx.fillRect(0, top, SCREEN_WIDTH, PANEL_HEIGHT);
    ctx.fillStyle = ui.panelEdge;
    ctx.fillRect(0, top, SCREEN_WIDTH, 1);

    this.text.draw(ctx, status.hovered, 2, top + 5, ui.text);
    this.text.draw(ctx, status.out, 104, top + 5, ui.text);
    this.text.draw(ctx, status.in, 170, top + 5, ui.text);
    this.text.draw(ctx, status.time, 236, top + 5, ui.text);

    PANEL_BUTTONS.forEach((button, index) => {
      this.drawButton(ctx, state, panel, button, index * BUTTON_WIDTH, top + BUTTON_TOP);
    });
    this.drawMinimap(ctx, state, panel, terrainImage, top);
  }

  private drawButton(ctx: Context, state: GameState, panel: PanelState, button: PanelButton, x: number, y: number): void {
    const ui = this.theme.ui;
    const selected =
      button === panel.selectedSkill || (button === 'pause' && panel.paused) || (button === 'nuke' && (panel.nukeArmed || state.nuking));
    ctx.fillStyle = ui.button;
    ctx.fillRect(x + 1, y, BUTTON_WIDTH - 2, BUTTON_HEIGHT - 1);
    let label = '';
    if (button === 'releaseMinus') label = String(state.level.releaseRate);
    else if (button === 'releasePlus') label = String(state.releaseRate);
    else if (isSkill(button)) label = String(state.skills[button]);
    if (label !== '') this.text.centred(ctx, label, x + BUTTON_WIDTH / 2, y + 1, ui.text);
    this.icons.draw(ctx, ICONS[button as IconName], 0, x, y + BUTTON_HEIGHT - 17);
    if (selected) {
      ctx.strokeStyle = ui.buttonSelected;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y - 0.5, BUTTON_WIDTH - 1, BUTTON_HEIGHT);
    }
  }

  private drawMinimap(ctx: Context, state: GameState, panel: PanelState, terrainImage: HTMLCanvasElement, top: number): void {
    const rect = { ...MINIMAP, y: top + MINIMAP.y };
    drawMinimap(ctx, state, rect, terrainImage, panel, this.theme.ui.highlight);
    if (panel.fastForward) this.text.draw(ctx, '>>', rect.x + rect.w - 12, top + 5 + 26, this.theme.ui.highlight);
  }
}
