// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Explosion debris (vision G-05, G-11, plan M6.133): when a lemming explodes, every pixel of its
 * sprite flies off as a particle, with a short burst of sparks. Debris has no life time: it falls
 * until it has left the level, so after a nuke the player watches the lemmings disperse and then
 * sees the holes. Pure and deterministic (seeded), so it is unit-tested; the renderer only draws.
 */
import { TRANSPARENT, type Palette, type PixelFrame } from './pixelArt';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  readonly color: string;
  /** Remaining life in milliseconds for sparks; Infinity for debris, which ends off screen. */
  life: number;
}

/** Physics step: 60 steps per second, so the motion does not depend on the display refresh rate. */
export const STEP_MS = 1000 / 60;
/** Downward acceleration in pixels per step squared. */
export const GRAVITY = 0.11;
export const SPARK_COLORS = ['#f8e830', '#f88820', '#e82828', '#ffffff'] as const;
export const SPARK_COUNT = 18;
export const SPARK_LIFE_MS = 450;

export class Debris {
  particles: Particle[] = [];
  private seed: number;
  private leftover = 0;

  constructor(
    /** Particles below this row (level pixels) or this far outside the level are gone. */
    private readonly levelWidth: number,
    private readonly levelHeight: number,
    seed = 1,
  ) {
    this.seed = seed;
  }

  private random(): number {
    this.seed = (Math.imul(this.seed, 1103515245) + 12345) & 0x7fffffff;
    return this.seed / 0x80000000;
  }

  /**
   * Burst a sprite frame whose anchor pixel sits at (x, y): every opaque pixel becomes a particle
   * that flies away from the sprite's centre, with an upward kick.
   */
  burst(frame: PixelFrame, anchorX: number, anchorY: number, palette: Palette, x: number, y: number): void {
    const height = frame.rows.length;
    const width = frame.rows[0]?.length ?? 0;
    let sumX = 0;
    let sumY = 0;
    let count = 0;
    frame.rows.forEach((row, py) => {
      for (let px = 0; px < width; px += 1) {
        if (row.charAt(px) !== TRANSPARENT) {
          sumX += px;
          sumY += py;
          count += 1;
        }
      }
    });
    const centreX = count > 0 ? sumX / count : width / 2;
    const centreY = count > 0 ? sumY / count : height / 2;
    frame.rows.forEach((row, py) => {
      for (let px = 0; px < width; px += 1) {
        const slot = row.charAt(px);
        const color = palette[slot];
        if (slot === TRANSPARENT || color === undefined) continue;
        const dx = px - centreX + (this.random() - 0.5);
        const dy = py - centreY + (this.random() - 0.5);
        const length = Math.hypot(dx, dy) || 1;
        const speed = 0.9 + this.random() * 1.9;
        this.particles.push({
          x: x - anchorX + px,
          y: y - anchorY + py,
          vx: (dx / length) * speed,
          vy: (dy / length) * speed - 1.6 - this.random() * 1.4,
          color,
          life: Number.POSITIVE_INFINITY,
        });
      }
    });
    for (let i = 0; i < SPARK_COUNT; i += 1) {
      const angle = this.random() * Math.PI * 2;
      const speed = 1.5 + this.random() * 2.5;
      this.particles.push({
        x: x - anchorX + centreX,
        y: y - anchorY + centreY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        color: SPARK_COLORS[i % SPARK_COLORS.length] ?? '#ffffff',
        life: SPARK_LIFE_MS,
      });
    }
  }

  /** Advance by wall-clock milliseconds in fixed physics steps; drop what has left the level. */
  update(elapsedMs: number): void {
    this.leftover += elapsedMs;
    while (this.leftover >= STEP_MS) {
      this.leftover -= STEP_MS;
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += GRAVITY;
        p.life -= STEP_MS;
      }
    }
    this.particles = this.particles.filter((p) => p.life > 0 && p.y < this.levelHeight + 2 && p.x > -40 && p.x < this.levelWidth + 40);
  }

  /** True while any particle is still flying. */
  get busy(): boolean {
    return this.particles.length > 0;
  }
}
