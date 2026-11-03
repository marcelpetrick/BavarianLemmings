// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Replay re-timing tool (plan M6.150): after a rule change in src/sim, a recorded replay may click a
 * lemming a few ticks too early or too late. This tool runs each replay under the OLD rules, notes
 * where every clicked lemming stood, and moves each click to the tick at which the lemming stands
 * there again under the NEW rules. Opt-in; a normal test run skips it.
 *
 * Steps:
 *   1. Before changing the rules, export them:  git archive HEAD src | tar -x -C /tmp/old-rules
 *   2. Change src/sim; find the failing replays:  npx vitest run tests/levels
 *   3. BL_RETIME=fun-05,tricky-10 BL_OLD_SRC=/tmp/old-rules/src npm run replays:retime
 *      Optional: BL_SWAP=1 lets a click go to another crowd lemming standing at the old place
 *      (never one that a later click uses); BL_WINDOW=400 searches further than 160 ticks late.
 *   4. A replay is rewritten only when it wins. Then run the level tests again.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ALL_LEVELS } from '../../src/levels';
import { createGame, step } from '../../src/sim/game';
import { runReplay, type Replay, type ReplayEntry } from '../../src/sim/replay';
import type { GameState, Intent } from '../../src/sim/state';

type Snapshot = { x: number; y: number; dir: number; action: string } | null;
interface RulesModule {
  createGame: (level: unknown) => GameState;
  step: (state: GameState, intents: readonly Intent[]) => GameState;
}

const env = process.env;
const ids = (env.BL_RETIME ?? '').split(',').filter(Boolean);
const allowSwap = env.BL_SWAP === '1';
const window = Number(env.BL_WINDOW ?? 160);

function snapshotOf(state: GameState, intent: Intent): Snapshot {
  if (intent.type !== 'assign') return null;
  const lemming = state.lemmings.find((item) => item.id === intent.lemmingId);
  return lemming ? { x: lemming.x, y: lemming.y, dir: lemming.dir, action: lemming.action } : null;
}

const skillsLeft = (state: GameState): number => Object.values(state.skills).reduce((sum, count) => sum + count, 0);
const sameClick = (a: ReplayEntry, b: ReplayEntry): boolean =>
  a.tick === b.tick && a.intent.type === b.intent.type && (a.intent as { skill?: string }).skill === (b.intent as { skill?: string }).skill;

describe.skipIf(ids.length === 0)('replay re-timing (BL_RETIME=<ids> BL_OLD_SRC=<old src>)', () => {
  it('re-times the named replays', async () => {
    const old = (await import(/* @vite-ignore */ `${env.BL_OLD_SRC}/sim/game.ts`)) as RulesModule;
    for (const id of ids) {
      const level = ALL_LEVELS.find((item) => item.id === id);
      expect(level, id).toBeDefined();
      const path = `assets/replays/${id}.json`;
      const replay = JSON.parse(readFileSync(path, 'utf8')) as Replay;
      // Positions come from the committed replay under the old rules, even if the file was edited.
      const committed = JSON.parse(execSync(`git show HEAD:${path}`).toString()) as Replay;
      const oldState = old.createGame(level);
      const committedTargets: Snapshot[] = [];
      for (let next = 0; next < committed.entries.length;) {
        const batch: Intent[] = [];
        for (; next < committed.entries.length && committed.entries[next]!.tick <= oldState.tick + 1; next += 1) {
          committedTargets.push(snapshotOf(oldState, committed.entries[next]!.intent));
          batch.push(committed.entries[next]!.intent);
        }
        old.step(oldState, batch);
      }
      const targets = replay.entries.map((entry) => committedTargets[committed.entries.findIndex((c) => sameClick(c, entry))] ?? null);

      let state = createGame(level!);
      const entries: ReplayEntry[] = [];
      let offset = 0;
      for (const [index, entry] of replay.entries.entries()) {
        const target = targets[index];
        const later = new Set(replay.entries.slice(index + 1).map((e) => (e.intent.type === 'assign' ? e.intent.lemmingId : -1)));
        let best: { tick: number; score: number; state: GameState; intent: Intent } | null = null;
        const first = Math.max(state.tick + 1, Math.min(entry.tick, entry.tick + offset) - 10);
        const runner = structuredClone(state);
        while (runner.tick + 1 < first) step(runner, []);
        for (let tick = first; tick <= Math.max(entry.tick, entry.tick + offset) + window; tick += 1) {
          const candidates: { intent: Intent; score: number }[] = [];
          if (entry.intent.type === 'assign' && target) {
            const original = entry.intent.lemmingId;
            for (const lemming of runner.lemmings) {
              if (lemming.removed || (lemming.id !== original && (later.has(lemming.id) || !allowSwap))) continue;
              const score =
                Math.abs(lemming.x - target.x) * 2 +
                Math.abs(lemming.y - target.y) +
                (lemming.dir === target.dir ? 0 : 50) +
                (lemming.action === target.action ? 0 : 20) +
                (lemming.id === original ? 0 : 1);
              candidates.push({ intent: { ...entry.intent, lemmingId: lemming.id }, score });
            }
            candidates.sort((a, b) => a.score - b.score);
          } else candidates.push({ intent: entry.intent, score: Math.abs(tick - entry.tick - offset) });
          for (const candidate of candidates.slice(0, 3)) {
            if (best && candidate.score >= best.score) break;
            const probe = structuredClone(runner);
            const before = skillsLeft(probe);
            step(probe, [candidate.intent]);
            if (candidate.intent.type === 'assign' && skillsLeft(probe) >= before) continue;
            best = { tick, score: candidate.score, state: probe, intent: candidate.intent };
            break;
          }
          if (best && best.score <= 1) break;
          step(runner, []);
        }
        if (!best) {
          console.log(id, 'click', index, 'is refused at every tick in the window');
          const fallback = structuredClone(state);
          while (fallback.tick + 1 < entry.tick + offset) step(fallback, []);
          step(fallback, [entry.intent]);
          best = { tick: entry.tick + offset, score: -1, state: fallback, intent: entry.intent };
        } else if (best.score > 1) console.log(id, 'click', index, 'moved to tick', best.tick, 'with distance score', best.score);
        offset = best.tick - entry.tick;
        entries.push({ tick: best.tick, intent: best.intent });
        state = best.state;
      }
      const fixed: Replay = { ...replay, entries };
      const result = runReplay(level!, fixed);
      console.log(id, result.outcome, `${result.saved}/${level!.toSave}`);
      if (result.outcome === 'won' && result.saved >= level!.toSave) writeFileSync(path, `${JSON.stringify(fixed, null, 2)}\n`);
    }
  }, 1_800_000);
});
