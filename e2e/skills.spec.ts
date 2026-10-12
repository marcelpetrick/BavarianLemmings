// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Every skill end to end in the browser (plan M6.143): a real mouse click on the panel selects the
 * skill, a real click on a lemming assigns it, the counter drops, the action starts and the assign
 * sound event fires. A blocker refuses the tool skills as in the original (M6.142).
 */
import { expect, test, type Page } from '@playwright/test';
import { advance, clickLevel, clickPanel, clickScreen, events, gameState, openGame, openLevel, screen, type LemmingView } from './helpers';

/** The flat test level: walkers stand at y = 119 on the floor; a hill starts at x ≈ 150. */
const FLOOR_Y = 119;
const HILL_X = 150;

const used = new Set<number>();

/** A walker on the open floor, left of the hill, that has no skill yet. */
function fresh(lemming: LemmingView): boolean {
  return (
    !used.has(lemming.id) &&
    lemming.action === 'walking' &&
    lemming.y === FLOOR_Y &&
    lemming.x >= 20 &&
    lemming.x <= HILL_X - 12 &&
    !lemming.climber &&
    !lemming.floater &&
    lemming.bombTicks < 0
  );
}

/** No other lemming stands close enough to steal the click. */
async function alone(page: Page, lemming: LemmingView): Promise<boolean> {
  const state = await gameState(page);
  return state.lemmings.every(
    (other) => other.id === lemming.id || Math.abs(other.x - lemming.x) > 12 || Math.abs(other.y - lemming.y) > 12,
  );
}

/**
 * Pause, click the first lemming that matches, step one frame so the assignment applies, and
 * return the lemming as it is after that frame plus the events of the frame. Stays paused.
 */
async function assignPaused(page: Page, ready: (lemming: LemmingView) => boolean): Promise<{ after: LemmingView; heard: string[] }> {
  for (let i = 0; i < 600; i += 1) {
    const state = await gameState(page);
    const candidate = state.lemmings.find(ready);
    if (candidate) {
      await page.keyboard.press('p');
      const paused = await gameState(page);
      const target = paused.lemmings.find((l) => l.id === candidate.id);
      if (target && ready(target) && (await alone(page, target))) {
        await events(page);
        await clickLevel(page, target.x, target.y - 4);
        await page.keyboard.press('.');
        await expect.poll(async () => (await gameState(page)).tick).toBe(paused.tick + 1);
        let heard: string[] = [];
        await expect.poll(async () => (heard = [...heard, ...(await events(page))])).toContain('assign');
        const after = (await gameState(page)).lemmings.find((l) => l.id === target.id)!;
        used.add(target.id);
        return { after, heard };
      }
      await page.keyboard.press('p');
    }
    await advance(page, 60);
  }
  throw new Error(`no lemming became ready: ${JSON.stringify((await gameState(page)).lemmings)}`);
}

test.describe('all eight skills by mouse (G-03 to G-07, C-01, A-01)', () => {
  test('each skill is assigned, spent, starts its action and sounds', async ({ page }) => {
    const errors = await openGame(page);
    await openLevel(page, 'test-flat');
    await expect.poll(() => screen(page)).toBe('preview');
    await clickScreen(page, 160, 100);
    await expect.poll(() => screen(page)).toBe('play');

    // The basher goes first, while walkers still reach the hill; the blocker then keeps every later
    // walker on the open floor left of it, so the remaining skills always find a lemming.
    const cases: { skill: Parameters<typeof clickPanel>[1]; ready: (l: LemmingView) => boolean; started: (l: LemmingView) => boolean }[] = [
      { skill: 'basher', ready: (l) => fresh(l) && l.dir === 1 && l.x >= HILL_X - 16, started: (l) => l.action === 'bashing' },
      { skill: 'blocker', ready: (l) => fresh(l) && l.x >= 100 && l.x <= 120, started: (l) => l.action === 'blocking' },
      { skill: 'climber', ready: fresh, started: (l) => l.climber },
      { skill: 'floater', ready: fresh, started: (l) => l.floater },
      { skill: 'builder', ready: fresh, started: (l) => l.action === 'building' },
      { skill: 'miner', ready: fresh, started: (l) => l.action === 'mining' },
      { skill: 'digger', ready: fresh, started: (l) => l.action === 'digging' },
    ];
    for (const { skill, ready, started } of cases) {
      await clickPanel(page, skill);
      expect((await gameState(page)).selectedSkill).toBe(skill);
      const before = (await gameState(page)).skills[skill]!;
      const { after } = await assignPaused(page, ready).catch((error: unknown) => {
        throw new Error(`${skill}: ${error instanceof Error ? error.message : String(error)}`);
      });
      expect(started(after), `${skill} started: ${JSON.stringify(after)}`).toBe(true);
      expect((await gameState(page)).skills[skill], skill).toBe(before - 1);
      await page.keyboard.press('p');
    }

    // M6.142: a blocker refuses the builder; nothing is spent and no assign sound plays.
    const blockerId = [...used][1]!;
    await clickPanel(page, 'builder');
    const builders = (await gameState(page)).skills.builder!;
    await page.keyboard.press('p');
    const blocker = (await gameState(page)).lemmings.find((l) => l.id === blockerId)!;
    expect(blocker.action).toBe('blocking');
    await events(page);
    await clickLevel(page, blocker.x, blocker.y - 4);
    await page.keyboard.press('.');
    await advance(page, 0);
    expect((await gameState(page)).skills.builder).toBe(builders);
    expect((await gameState(page)).lemmings.find((l) => l.id === blockerId)?.action).toBe('blocking');
    expect(await events(page)).not.toContain('assign');
    await page.keyboard.press('p');

    // The bomber is the way to free a blocker (G-06): it is accepted and the countdown starts.
    await clickPanel(page, 'bomber');
    const bombers = (await gameState(page)).skills.bomber!;
    const { after: bomb } = await assignPaused(page, (l) => l.id === blockerId);
    expect(bomb.bombTicks).toBeGreaterThan(0);
    expect((await gameState(page)).skills.bomber).toBe(bombers - 1);
    expect(errors).toEqual([]);
  });

  test('a click a few pixels beside a lemming still assigns the skill (M6.146)', async ({ page }) => {
    const errors = await openGame(page);
    await openLevel(page, 'test-flat');
    await clickScreen(page, 160, 100);
    await expect.poll(() => screen(page)).toBe('play');
    await clickPanel(page, 'digger');
    used.clear();
    for (let i = 0; i < 300 && !(await gameState(page)).lemmings.some(fresh); i += 1) await advance(page, 60);
    await page.keyboard.press('p');
    const walker = (await gameState(page)).lemmings.find(fresh)!;
    // The selection box is 5 pixels to each side; this click lands 3 pixels beyond it.
    await clickLevel(page, walker.x + 8, walker.y - 4);
    await page.keyboard.press('.');
    await expect.poll(async () => (await gameState(page)).lemmings.find((l) => l.id === walker.id)?.action).toBe('digging');
    expect(errors).toEqual([]);
  });
});
