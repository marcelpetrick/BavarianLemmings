// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import {
  blobPolygon,
  hash01,
  hash3,
  insidePolygon,
  pointBounds,
  ringNoise,
  roughenPolygon,
  turnCos,
  turnSin,
  valueNoise,
  type Point,
} from '../../src/sim/geometry';

describe('hashing and noise (G-12)', () => {
  it('hashes deterministically into 32 unsigned bits', () => {
    expect(hash3(1, 2, 3)).toBe(hash3(1, 2, 3));
    expect(hash3(1, 2, 3)).not.toBe(hash3(2, 1, 3));
    expect(hash3(-5, -7, 9)).toBeGreaterThanOrEqual(0);
    for (let i = 0; i < 200; i += 1) {
      const value = hash01(i, -i, 4);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('value noise passes through its knots and stays in [0, 1)', () => {
    expect(valueNoise(0, 10, 1)).toBe(hash01(0, 0, 1));
    expect(valueNoise(20, 10, 1)).toBe(hash01(2, 0, 1));
    for (let t = -30; t < 30; t += 0.7) {
      const value = valueNoise(t, 7, 2);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('ring noise closes the ring', () => {
    expect(ringNoise(5, 5, 3)).toBe(ringNoise(0, 5, 3));
    expect(ringNoise(-1, 5, 3)).toBe(ringNoise(4, 5, 3));
  });

  it('turnSin and turnCos match Math.sin within 1e-6', () => {
    for (let t = -2; t <= 2; t += 0.013) {
      expect(Math.abs(turnSin(t) - Math.sin(t * 2 * Math.PI))).toBeLessThan(1e-6);
      expect(Math.abs(turnCos(t) - Math.cos(t * 2 * Math.PI))).toBeLessThan(1e-6);
    }
  });
});

describe('polygons', () => {
  const square: Point[] = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
  ];

  it('tests points against a polygon and bounds it', () => {
    expect(insidePolygon(square, 5, 5)).toBe(true);
    expect(insidePolygon(square, 15, 5)).toBe(false);
    expect(
      pointBounds([
        [1.5, 2],
        [4, 7.2],
      ] as Point[]),
    ).toEqual({ x: 1, y: 2, w: 4, h: 7 });
  });

  it('roughens edges but keeps the corners', () => {
    expect(roughenPolygon(square, 0, 1)).toEqual(square);
    const rough = roughenPolygon(square, 1, 1);
    expect(rough.length).toBeGreaterThan(square.length);
    for (const corner of square) expect(rough).toContainEqual(corner);
    for (const [x, y] of rough) {
      expect(x).toBeGreaterThanOrEqual(-3);
      expect(y).toBeLessThanOrEqual(13);
    }
    // A zero-length edge adds no points and divides by nothing.
    expect(
      roughenPolygon(
        [
          [0, 0],
          [0, 0],
          [3, 3],
        ] as Point[],
        1,
        1,
      ),
    ).toHaveLength(3);
  });

  it('keeps a blob inside its box and makes it irregular with rough', () => {
    for (const [w, h] of [
      [4, 4],
      [80, 30],
      [600, 150],
    ] as const) {
      const blob = blobPolygon(10, 20, w, h, 1, 9);
      expect(blob.length).toBeGreaterThanOrEqual(16);
      expect(blob.length).toBeLessThanOrEqual(160);
      for (const [x, y] of blob) {
        expect(x).toBeGreaterThanOrEqual(10 - 1e-9);
        expect(x).toBeLessThanOrEqual(10 + w + 1e-9);
        expect(y).toBeGreaterThanOrEqual(20 - 1e-9);
        expect(y).toBeLessThanOrEqual(20 + h + 1e-9);
      }
    }
    expect(blobPolygon(0, 0, 40, 20, 0.5, 1)).not.toEqual(blobPolygon(0, 0, 40, 20, 0.5, 2));
  });
});
