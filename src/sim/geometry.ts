// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Deterministic geometry and noise for building terrain (vision G-12, V-07).
 *
 * The terrain mask decides where lemmings walk, so it must be bit-identical in every browser. The
 * ECMAScript standard lets `Math.sin` and `Math.atan2` differ between engines, so this module uses
 * only `+ - * /`, `Math.floor`, `Math.sqrt` and integer hashing, which IEEE 754 defines exactly.
 */

export type Point = readonly [number, number];

/** An integer hash of up to three integers, as an unsigned 32-bit number. Same inputs, same output. */
export function hash3(x: number, y: number, seed: number): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 15), 2246822519);
  h = Math.imul(h ^ (h >>> 13), 3266489917);
  return (h ^ (h >>> 16)) >>> 0;
}

/** The hash mapped to [0, 1). */
export function hash01(x: number, y: number, seed: number): number {
  return hash3(x, y, seed) / 4294967296;
}

/** Smooth 1D value noise in [0, 1): random knots every `period` units, smoothstep in between. */
export function valueNoise(t: number, period: number, seed: number): number {
  const u = t / period;
  const knot = Math.floor(u);
  const f = u - knot;
  const s = f * f * (3 - 2 * f);
  const a = hash01(knot, 0, seed);
  const b = hash01(knot + 1, 0, seed);
  return a + (b - a) * s;
}

/** Periodic 1D value noise: like valueNoise, but knot `count` is knot 0 again (closed outlines). */
export function ringNoise(t: number, count: number, seed: number): number {
  const knot = Math.floor(t);
  const f = t - knot;
  const s = f * f * (3 - 2 * f);
  const wrap = (k: number): number => ((k % count) + count) % count;
  const a = hash01(wrap(knot), 1, seed);
  const b = hash01(wrap(knot + 1), 1, seed);
  return a + (b - a) * s;
}

const PI = 3.141592653589793;

/**
 * Sine of a fraction of a full turn (`turns` = 0.25 is 90 degrees), from a Taylor polynomial on
 * [-pi/2, pi/2]. Error below 1e-6, identical in every engine.
 */
export function turnSin(turns: number): number {
  let t = turns - Math.floor(turns); // [0, 1)
  if (t > 0.5) t -= 1; // (-0.5, 0.5]
  if (t > 0.25) t = 0.5 - t;
  else if (t < -0.25) t = -0.5 - t;
  const x = t * 2 * PI;
  const x2 = x * x;
  return x * (1 - (x2 / 6) * (1 - (x2 / 20) * (1 - (x2 / 42) * (1 - (x2 / 72) * (1 - x2 / 110)))));
}

export function turnCos(turns: number): number {
  return turnSin(turns + 0.25);
}

/** Even-odd test of the point (x, y) against a closed polygon. */
export function insidePolygon(points: readonly Point[], x: number, y: number): boolean {
  let inside = false;
  let previous = points[points.length - 1];
  for (const point of points) {
    /* v8 ignore next -- callers pass at least three points; this guard only satisfies noUncheckedIndexedAccess */
    if (previous === undefined) break;
    const [xi, yi] = point;
    const [xj, yj] = previous;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    previous = point;
  }
  return inside;
}

/** Integer bounding box (x, y, w, h) that holds every point. */
export function pointBounds(points: readonly Point[]): { x: number; y: number; w: number; h: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [px, py] of points) {
    minX = Math.min(minX, px);
    minY = Math.min(minY, py);
    maxX = Math.max(maxX, px);
    maxY = Math.max(maxY, py);
  }
  const x = Math.floor(minX);
  const y = Math.floor(minY);
  return { x, y, w: Math.ceil(maxX) - x + 1, h: Math.ceil(maxY) - y + 1 };
}

/**
 * A craggy version of a polygon: every edge is cut into pieces of about 5 px, and each new point is
 * pushed sideways by up to `rough` × 3 px. The original corners stay where they are.
 */
export function roughenPolygon(points: readonly Point[], rough: number, seed: number): Point[] {
  if (rough <= 0) return [...points];
  const result: Point[] = [];
  points.forEach((start, index) => {
    const end = points[(index + 1) % points.length] ?? start;
    result.push(start);
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const length = Math.sqrt(dx * dx + dy * dy);
    const pieces = Math.max(1, Math.round(length / 5));
    for (let k = 1; k < pieces; k += 1) {
      const t = k / pieces;
      const push = (hash01(index, k, seed) * 2 - 1) * rough * 3;
      result.push([start[0] + dx * t + (-dy / length) * push, start[1] + dy * t + (dx / length) * push]);
    }
  });
  return result;
}

/**
 * The outline of a blob: an ellipse filling the box (x, y, w, h) whose radius is pulled inwards by
 * smooth lumps (up to `rough` × 30 %) and small crags (up to `rough` × 8 %). It never leaves the box.
 */
export function blobPolygon(x: number, y: number, w: number, h: number, rough: number, seed: number): Point[] {
  const count = Math.min(160, Math.max(16, Math.round((w + h) * 0.9)));
  const lumps = Math.max(3, Math.min(12, Math.round((w + h) / 24)));
  const rx = w / 2;
  const ry = h / 2;
  const cx = x + rx;
  const cy = y + ry;
  const points: Point[] = [];
  for (let i = 0; i < count; i += 1) {
    const turns = i / count;
    const lump = ringNoise(turns * lumps, lumps, seed);
    const crag = hash01(i, 2, seed);
    const radius = 1 - rough * (0.3 * lump + 0.08 * crag);
    points.push([cx + rx * radius * turnCos(turns), cy + ry * radius * turnSin(turns)]);
  }
  return points;
}
