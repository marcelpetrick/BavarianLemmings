// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The shipped levels (vision L-01): every JSON file under assets/levels, validated at start-up and
 * ordered by rating, then by file name (`01-...`, `02-...`).
 */
import { parseLevel, type LevelData } from '../sim/level';

export const RATINGS = ['fun', 'tricky', 'taxing', 'mayhem'] as const;
export type Rating = (typeof RATINGS)[number];

const files = import.meta.glob<unknown>('../../assets/levels/**/*.json', { eager: true, import: 'default' });

/** Parse and sort level files; exported for tests. */
export function collectLevels(entries: Readonly<Record<string, unknown>>): LevelData[] {
  return Object.keys(entries)
    .sort()
    .map((path) => parseLevel(entries[path]));
}

export const ALL_LEVELS: readonly LevelData[] = collectLevels(files);

export function levelsOf(rating: string): LevelData[] {
  return ALL_LEVELS.filter((level) => level.rating === rating);
}

export function levelById(id: string): LevelData | undefined {
  return ALL_LEVELS.find((level) => level.id === id);
}

/** The level after this one in the same rating, if any. */
export function nextLevel(level: LevelData): LevelData | undefined {
  const list = levelsOf(level.rating);
  return list[list.indexOf(level) + 1];
}
