// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The touch panel (vision C-06, 3.4.1): the classic buttons as large HTML buttons (at least 48 × 48
 * CSS pixels), in two columns left and right of the playfield (landscape) or in two rows under it
 * (portrait), plus a bar above the playfield with the status line and a full-width minimap.
 * It only draws and reports presses; what a press does is decided by the app. Browser-only.
 */
import { SCREEN_WIDTH } from '../../sim/constants';
import { isSkill } from '../../sim/skills';
import type { GameState } from '../../sim/state';
import type { Theme } from '../../theme/themes';
import { TOUCH_BAR_HEIGHT, TOUCH_BUTTON_GROUPS, TOUCH_MINIMAP, type TouchButton, type TouchLayout } from '../../ui/layout';
import type { StatusParts } from '../../ui/status';
import { SpriteCache, TextRenderer, context2d, type Context } from '../draw';
import { CLASSIC_SPRITE_PALETTE } from '../palettes';
import { ICONS } from '../sprites/icons';
import type { PanelState } from './classic';
import { drawMinimap } from './shared';

/** Icon edge in pixels: the panel icons are 16 × 16 (render/sprites/icons.ts). */
const ICON_SIZE = 16;

export interface TouchPanelState extends PanelState {
  /** 0..1 while the nuke button is held: the progress ring. */
  readonly nukeProgress: number;
  /** Purist mode: fast-forward and restart are switched off (vision C-05). */
  readonly purist: boolean;
}

export interface TouchPanelEvents {
  press(button: TouchButton, time: number): void;
  release(button: TouchButton, time: number): void;
  /** A finger or the mouse pressed or dragged on the bar, in logical bar pixels. */
  bar(x: number, y: number): void;
}

interface ButtonParts {
  readonly element: HTMLButtonElement;
  readonly count: HTMLSpanElement;
  readonly icon: HTMLCanvasElement;
  text: string;
  classes: string;
}

export class TouchPanel {
  /** The bar above the playfield: status line and minimap, TOUCH_BAR_HEIGHT logical pixels high. */
  readonly bar: HTMLCanvasElement;
  private readonly barContext: Context;
  private readonly groups: HTMLDivElement[];
  private readonly buttons = new Map<TouchButton, ButtonParts>();
  private readonly text = new TextRenderer();
  private theme: Theme | null = null;

  constructor(
    root: HTMLElement,
    private readonly events: TouchPanelEvents,
  ) {
    this.bar = document.createElement('canvas');
    this.bar.className = 'touch-bar';
    this.bar.width = SCREEN_WIDTH;
    this.bar.height = TOUCH_BAR_HEIGHT;
    this.barContext = context2d(this.bar);
    this.bindMinimap();
    this.groups = TOUCH_BUTTON_GROUPS.map((group, index) => {
      const element = document.createElement('div');
      element.className = `touch-buttons touch-buttons-${index === 0 ? 'start' : 'end'}`;
      for (const button of group) element.append(this.createButton(button));
      return element;
    });
    root.append(this.bar, ...this.groups);
  }

  private createButton(button: TouchButton): HTMLButtonElement {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = 'touch-button';
    element.dataset.touchButton = button;
    const count = document.createElement('span');
    count.className = 'touch-count';
    const icon = document.createElement('canvas');
    icon.width = ICON_SIZE;
    icon.height = ICON_SIZE;
    element.append(count, icon);
    const release = (event: PointerEvent): void => {
      if (!element.classList.contains('held')) return;
      element.classList.remove('held');
      this.events.release(button, event.timeStamp);
    };
    element.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      element.setPointerCapture(event.pointerId);
      element.classList.add('held');
      this.events.press(button, event.timeStamp);
    });
    element.addEventListener('pointerup', release);
    element.addEventListener('pointercancel', release);
    element.addEventListener('lostpointercapture', release);
    this.buttons.set(button, { element, count, icon, text: '', classes: '' });
    return element;
  }

  private bindMinimap(): void {
    const report = (event: PointerEvent): void => {
      const rect = this.bar.getBoundingClientRect();
      const x = ((event.clientX - rect.left) * SCREEN_WIDTH) / rect.width;
      const y = ((event.clientY - rect.top) * TOUCH_BAR_HEIGHT) / rect.height;
      this.events.bar(x, y);
    };
    this.bar.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      this.bar.setPointerCapture(event.pointerId);
      report(event);
    });
    this.bar.addEventListener('pointermove', (event) => {
      if (this.bar.hasPointerCapture(event.pointerId)) report(event);
    });
  }

  /** Accessible names (the buttons show only icons and counters). */
  setLabels(label: (button: TouchButton) => string): void {
    for (const [button, parts] of this.buttons) {
      parts.element.setAttribute('aria-label', label(button));
      parts.element.title = label(button);
    }
  }

  /** Redraw the icons and colours for a theme (V-09). */
  setTheme(theme: Theme): void {
    if (this.theme === theme) return;
    this.theme = theme;
    const icons = new SpriteCache({ ...CLASSIC_SPRITE_PALETTE, ...theme.spritePalette });
    for (const [button, parts] of this.buttons) {
      const ctx = context2d(parts.icon);
      ctx.clearRect(0, 0, ICON_SIZE, ICON_SIZE);
      if (button === 'fullscreen' || button === 'menu') drawSymbol(ctx, button, theme.ui.text);
      else icons.draw(ctx, ICONS[button], 0, 0, 0);
    }
  }

  /** Show the panel with a layout, or hide it (null). */
  layout(layout: TouchLayout | null): void {
    const hidden = layout === null;
    this.bar.hidden = hidden;
    for (const group of this.groups) group.hidden = hidden;
    if (!layout) return;
    this.bar.style.width = `${layout.fieldWidth}px`;
    this.bar.style.height = `${layout.barHeight}px`;
  }

  draw(state: GameState, panel: TouchPanelState, status: StatusParts, terrainImage: HTMLCanvasElement): void {
    const theme = this.theme;
    if (!theme) return;
    const ctx = this.barContext;
    const ui = theme.ui;
    ctx.fillStyle = ui.panel;
    ctx.fillRect(0, 0, SCREEN_WIDTH, TOUCH_BAR_HEIGHT);
    this.text.draw(ctx, status.hovered, 2, 1, ui.text);
    this.text.draw(ctx, status.out, 104, 1, ui.text);
    this.text.draw(ctx, status.in, 170, 1, ui.text);
    this.text.draw(ctx, status.time, 236, 1, ui.text);
    drawMinimap(ctx, state, TOUCH_MINIMAP, terrainImage, panel, ui.highlight);
    for (const [button, parts] of this.buttons) this.updateButton(button, parts, state, panel);
  }

  private updateButton(button: TouchButton, parts: ButtonParts, state: GameState, panel: TouchPanelState): void {
    let text = '';
    if (button === 'releaseMinus') text = String(state.level.releaseRate);
    else if (button === 'releasePlus') text = String(state.releaseRate);
    else if (isSkill(button)) text = String(state.skills[button]);
    if (text !== parts.text) {
      parts.count.textContent = text;
      parts.text = text;
    }
    const selected =
      button === panel.selectedSkill ||
      (button === 'pause' && panel.paused) ||
      (button === 'fastForward' && panel.fastForward) ||
      (button === 'nuke' && state.nuking);
    const disabled = panel.purist && (button === 'fastForward' || button === 'restart');
    const classes = `${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`;
    if (classes !== parts.classes) {
      parts.element.classList.toggle('selected', selected);
      parts.element.classList.toggle('disabled', disabled);
      parts.classes = classes;
    }
    if (button === 'nuke') parts.element.style.setProperty('--progress', panel.nukeProgress.toFixed(3));
  }
}

/** The two symbols the original panel has no icon for, drawn in 16 × 16 pixels by us. */
function drawSymbol(ctx: Context, symbol: 'fullscreen' | 'menu', color: string): void {
  ctx.fillStyle = color;
  if (symbol === 'menu') {
    for (const y of [4, 7, 10]) ctx.fillRect(3, y, 10, 2);
    return;
  }
  // Four corner brackets.
  for (const [x, y, dx, dy] of [
    [2, 2, 1, 1],
    [13, 2, -1, 1],
    [2, 13, 1, -1],
    [13, 13, -1, -1],
  ] as const) {
    ctx.fillRect(Math.min(x, x + 3 * dx), y, 4, 1);
    ctx.fillRect(x, Math.min(y, y + 3 * dy), 1, 4);
  }
}
