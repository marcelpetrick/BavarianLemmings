// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { Debris, SPARK_COUNT, SPARK_LIFE_MS, STEP_MS } from '../../src/render/debris';
import { frame } from '../../src/render/pixelArt';

const sprite = frame(['.A.', 'ABA', '.A.']);
const palette = { A: '#ff0000', B: '#00ff00' };

describe('explosion debris (M6.133)', () => {
  it('turns every opaque sprite pixel into a particle, plus sparks', () => {
    const debris = new Debris(320, 160);
    debris.burst(sprite, 1, 2, palette, 100, 50);
    const pixels = debris.particles.filter((p) => p.life === Number.POSITIVE_INFINITY);
    expect(pixels).toHaveLength(5);
    expect(pixels.map((p) => p.color).sort()).toEqual(['#00ff00', '#ff0000', '#ff0000', '#ff0000', '#ff0000']);
    expect(pixels[0]).toMatchObject({ x: 100, y: 48 });
    expect(debris.particles).toHaveLength(5 + SPARK_COUNT);
    expect(debris.busy).toBe(true);
  });

  it('sparks fade, debris falls until it has left the level', () => {
    const debris = new Debris(320, 160);
    debris.burst(sprite, 1, 2, palette, 100, 50);
    debris.update(SPARK_LIFE_MS + STEP_MS);
    expect(debris.particles.every((p) => p.life === Number.POSITIVE_INFINITY)).toBe(true);
    expect(debris.busy).toBe(true);
    for (let i = 0; i < 600 && debris.busy; i += 1) debris.update(STEP_MS);
    expect(debris.busy).toBe(false);
  });

  it('is deterministic for a seed and frame-rate independent', () => {
    const a = new Debris(320, 160, 7);
    const b = new Debris(320, 160, 7);
    a.burst(sprite, 1, 2, palette, 10, 10);
    b.burst(sprite, 1, 2, palette, 10, 10);
    a.update(STEP_MS * 10);
    for (let i = 0; i < 10; i += 1) b.update(STEP_MS);
    expect(a.particles).toEqual(b.particles);
  });

  it('handles an empty frame and drops particles that fly sideways out of the level', () => {
    const debris = new Debris(20, 160);
    debris.burst(frame(['..', '..']), 0, 0, palette, 10, 10);
    expect(debris.particles).toHaveLength(SPARK_COUNT);
    debris.particles = [{ x: 100, y: 10, vx: 0, vy: 0, color: '#fff', life: Number.POSITIVE_INFINITY }];
    debris.update(STEP_MS);
    expect(debris.busy).toBe(false);
  });
});
