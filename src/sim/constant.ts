// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Facts about the original game carry their provenance (architecture.md 6.2).
 *
 * A constant is `unverified` until a documented source confirms it; `scripts/check-constants.mjs`
 * lists every unverified one, so the fidelity debt stays visible.
 */
export type ConstantStatus = 'verified' | 'unverified' | 'design';

export interface ConstantInfo {
  /** Unit of the value, for example 'px', 'ticks', 'lemmings'. */
  readonly unit: string;
  /** 'design' marks our own choices that do not claim to match the original. */
  readonly status: ConstantStatus;
  /** Where the number comes from. */
  readonly source: string;
}

export interface Constant extends ConstantInfo {
  readonly value: number;
}

/** Registry of every declared constant, by name; read by tests and the constants check. */
export const constantRegistry = new Map<string, Constant>();

/** Declare a constant with its provenance and return its value. Names must be unique. */
export function constant(name: string, value: number, info: ConstantInfo): number {
  if (constantRegistry.has(name)) throw new Error(`constant ${name} declared twice`);
  if (!Number.isFinite(value)) throw new Error(`constant ${name} is not a finite number`);
  constantRegistry.set(name, { value, ...info });
  return value;
}
