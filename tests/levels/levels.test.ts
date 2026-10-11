// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Every shipped level is valid, named in three languages, and proven solvable by its replay
 * (architecture.md 8; plan M6 definition of done).
 */
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LANGUAGES, translate } from '../../src/i18n';
import { ALL_LEVELS, RATINGS, collectLevels, levelById, levelsOf, nextLevel } from '../../src/levels';
import { runReplay, type Replay } from '../../src/sim/replay';

const shipped = ALL_LEVELS.filter((level) => level.rating !== 'test');

describe('shipped levels', () => {
  it('exist and are ordered by rating and file name', () => {
    expect(shipped.length).toBeGreaterThan(0);
    expect(levelsOf('fun')[0]?.id).toBe('fun-01');
    expect(levelById('fun-01')?.rating).toBe('fun');
    expect(levelById('nope')).toBeUndefined();
    expect(nextLevel(levelsOf('fun').at(-1)!)).toBeUndefined();
    expect(RATINGS).toEqual(['fun', 'tricky', 'taxing', 'mayhem']);
    expect(() => collectLevels({ 'x.json': {} })).toThrow(/invalid level/);
  });

  for (const level of shipped) {
    describe(level.id, () => {
      it('has its name in every language and records what it recreates', () => {
        for (const language of LANGUAGES) expect(translate(language, level.name), language).not.toBe(level.name);
        expect(level.inspiredBy.length).toBeGreaterThan(10);
      });

      it('is solved by its recorded replay', () => {
        const path = `assets/replays/${level.id}.json`;
        expect(existsSync(path), path).toBe(true);
        const replay = JSON.parse(readFileSync(path, 'utf8')) as Replay;
        const result = runReplay(level, replay);
        expect(result.outcome).toBe('won');
        expect(result.saved).toBeGreaterThanOrEqual(level.toSave);
      });
    });
  }
});
