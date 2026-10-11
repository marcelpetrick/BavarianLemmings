// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Seeded pseudo-random numbers: xorshift32 (Marsaglia 2003). The only randomness in the simulation (G-12).
 * The state is a plain number, so it is part of the game state and of every replay.
 */
export function nextRandom(state: number): { state: number; value: number } {
  let x = state | 0 || 0x9e3779b9;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  const next = x >>> 0;
  return { state: next, value: next / 0x1_0000_0000 };
}

/** A seed derived from a text, for example a level id (FNV-1a, 32 bit). */
export function seedFromText(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}
