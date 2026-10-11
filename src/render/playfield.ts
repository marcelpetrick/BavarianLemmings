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
import { terrainColorsFor, trapAnimation, type Theme } from '../theme/themes';
import { mountainBackdrop, SpriteCache, TerrainLayer, TextRenderer, type Context } from './draw';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const PARTICLE_COLORS = ['#f8e830', '#f88820', '#e82828', '#f8f8f8'];

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
  private particles: Particle[] = [];
  private particleSeed = 1;

  constructor(
    private readonly theme: Theme,
    levelWidth: number,
    private readonly text: TextRenderer,
  ) {
    this.sprites = new SpriteCache(theme.spritePalette);
    this.terrain = new TerrainLayer(levelWidth);
    this.backdrop = theme.backdrop === 'mountains' ? mountainBackdrop(levelWidth) : null;
  }

  /** Visual reactions to simulation events (explosions). Deterministic pseudo-random spread. */
  react(events: readonly SimEvent[]): void {
    for (const event of events) {
      if (event.type !== 'explode') continue;
      for (let i = 0; i < 24; i += 1) {
        this.particleSeed = (this.particleSeed * 1103515245 + 12345) & 0x7fffffff;
        const angle = (this.particleSeed % 628) / 100;
        const speed = 1 + (this.particleSeed % 7) / 3;
        this.particles.push({
          x: event.x,
          y: event.y - LEMMING_HEIGHT / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 30,
          color: PARTICLE_COLORS[i % PARTICLE_COLORS.length] ?? '#ffffff',
        });
      }
    }
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
          if (layer === 'behind') this.sprites.draw(ctx, this.theme.exit, Math.floor(state.tick / 2), object.x, object.y);
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
    const animation = this.theme.lemmings[lemming.action];
    const tick = animation.loop ? state.tick + lemming.id : lemming.frame;
    this.sprites.draw(ctx, animation, tick, lemming.x, lemming.y, lemming.dir < 0);
    const digit = bomberDigit(lemming);
    if (digit > 0) this.text.draw(ctx, String(digit), lemming.x - 2, lemming.y - LEMMING_HEIGHT - 9, '#ffffff');
  }

  private drawParticles(ctx: Context): void {
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25;
      p.life -= 1;
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
