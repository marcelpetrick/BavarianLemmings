// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The playfield (vision V-04, V-05): backdrop, terrain, objects, lemmings, bomber digits,
 * explosion particles, the selection box and the cursor. Browser-only.
 */
import { bomberDigit } from '../sim/assign';
import { LEMMING_HEIGHT, PLAYFIELD_HEIGHT, SCREEN_WIDTH, TRAP_CYCLE_TICKS } from '../sim/constants';
import type { Lemming } from '../sim/lemming';
import type { GameState, SimEvent } from '../sim/state';
import { lemmingAnimation, terrainColorsFor, trapAnimation, type Theme } from '../theme/themes';
import { Debris } from './debris';
import { mountainBackdrop, SpriteCache, TerrainLayer, TextRenderer, type Context } from './draw';

export interface View {
  /** Left edge of the view in level pixels. */
  readonly x: number;
  /** Top edge of the view in level pixels (non-zero only when zoomed). */
  readonly y: number;
  /** Visible width in level pixels: 320, or 160 when zoomed. */
  readonly width: number;
}

export class PlayfieldRenderer {
  private readonly sprites: SpriteCache;
  private readonly terrain: TerrainLayer;
  private readonly backdrop: HTMLCanvasElement | null;
  private readonly debris: Debris;

  constructor(
    private readonly theme: Theme,
    levelWidth: number,
    private readonly text: TextRenderer,
  ) {
    this.sprites = new SpriteCache(theme.spritePalette);
    this.terrain = new TerrainLayer(levelWidth);
    this.backdrop = theme.backdrop === 'mountains' ? mountainBackdrop(levelWidth) : null;
    this.debris = new Debris(levelWidth, PLAYFIELD_HEIGHT);
  }

  /** Visual reactions to simulation events: an exploding lemming bursts into its own pixels. */
  react(events: readonly SimEvent[]): void {
    const sprite = this.theme.lemmings.ohNo;
    const last = sprite.frames[sprite.frames.length - 1];
    if (!last) return;
    for (const event of events) {
      if (event.type === 'explode') this.debris.burst(last, sprite.anchorX, sprite.anchorY, this.theme.spritePalette, event.x, event.y);
    }
  }

  /** Move the debris by wall-clock time (independent of the display refresh rate). */
  update(elapsedMs: number): void {
    this.debris.update(elapsedMs);
  }

  /** True while explosion debris is still flying; the level end waits for it. */
  get busy(): boolean {
    return this.debris.busy;
  }

  draw(ctx: Context, state: GameState, view: View, hovered: Lemming | null, cursor: { x: number; y: number } | null): void {
    const scale = SCREEN_WIDTH / view.width;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, SCREEN_WIDTH, PLAYFIELD_HEIGHT);
    ctx.clip();
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, SCREEN_WIDTH, PLAYFIELD_HEIGHT);
    ctx.setTransform(ctx.getTransform().scale(scale, scale).translate(-view.x, -view.y));
    if (this.backdrop)
      ctx.drawImage(this.backdrop, Math.round(view.x * 0.5), 0, view.width, PLAYFIELD_HEIGHT, view.x, 0, view.width, PLAYFIELD_HEIGHT);
    this.drawObjects(ctx, state, 'behind');
    this.terrain.update(state.terrain, terrainColorsFor(this.theme, state.level.style));
    ctx.drawImage(this.terrain.canvas, view.x, 0, view.width, PLAYFIELD_HEIGHT, view.x, 0, view.width, PLAYFIELD_HEIGHT);
    this.drawObjects(ctx, state, 'front');
    for (const lemming of state.lemmings) if (!lemming.removed) this.drawLemming(ctx, state, lemming);
    this.drawParticles(ctx);
    if (hovered && !hovered.removed) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1 / scale;
      ctx.strokeRect(hovered.x - 6.5, hovered.y - LEMMING_HEIGHT - 2.5, 14, LEMMING_HEIGHT + 5);
    }
    ctx.restore();
    if (cursor && cursor.y < PLAYFIELD_HEIGHT && !hovered) this.drawCrosshair(ctx, cursor.x, cursor.y);
  }

  private drawObjects(ctx: Context, state: GameState, layer: 'behind' | 'front'): void {
    state.level.objects.forEach((object, index) => {
      switch (object.type) {
        case 'hatch':
          if (layer === 'behind')
            this.sprites.draw(ctx, this.theme.hatch, state.hatchOpen ? 99 : Math.max(0, state.tick - 24), object.x, object.y);
          break;
        case 'exit':
          if (layer !== 'behind') break;
          // The maypole stands beside the beer tent, behind the terrain, with its foot on the exit's floor.
          if (this.theme.exitScenery) this.sprites.draw(ctx, this.theme.exitScenery, 0, object.x + this.theme.exit.width / 2 + 6, object.y);
          this.sprites.draw(ctx, this.theme.exit, Math.floor(state.tick / 2), object.x, object.y);
          break;
        case 'water':
          if (layer === 'front') {
            for (let x = object.x; x < object.x + object.w; x += this.theme.water.width) {
              this.sprites.draw(ctx, this.theme.water, Math.floor(state.tick / 3) + x, x, object.y);
            }
          }
          break;
        case 'trap': {
          if (layer !== 'behind') break;
          const animation = trapAnimation(this.theme, object.kind);
          const ready = state.trapReadyTick[index] ?? 0;
          const frame =
            ready > state.tick ? Math.floor(((TRAP_CYCLE_TICKS - (ready - state.tick)) * animation.frames.length) / TRAP_CYCLE_TICKS) : 0;
          this.sprites.draw(ctx, { ...animation, loop: false }, frame, object.x, object.y);
          break;
        }
      }
    });
  }

  private drawLemming(ctx: Context, state: GameState, lemming: Lemming): void {
    const animation = lemmingAnimation(this.theme, lemming.action, lemming.id);
    const tick = animation.loop ? state.tick + lemming.id : lemming.frame;
    this.sprites.draw(ctx, animation, tick, lemming.x, lemming.y, lemming.dir < 0);
    const digit = bomberDigit(lemming);
    if (digit > 0) this.text.draw(ctx, String(digit), lemming.x - 2, lemming.y - LEMMING_HEIGHT - 9, '#ffffff');
  }

  private drawParticles(ctx: Context): void {
    for (const p of this.debris.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }
  }

  private drawCrosshair(ctx: Context, x: number, y: number): void {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - 6, y, 4, 1);
    ctx.fillRect(x + 3, y, 4, 1);
    ctx.fillRect(x, y - 6, 1, 4);
    ctx.fillRect(x, y + 3, 1, 4);
  }

  /** The minimap terrain source for the panel. */
  get terrainImage(): HTMLCanvasElement {
    return this.terrain.canvas;
  }
}
