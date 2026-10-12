// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * One play session of a level: the game state plus everything the player controls around it
 * (selected skill, pause, fast-forward, view position, nuke confirmation, replay log).
 * Pure apart from the time it is handed; the browser loop calls `advance(elapsedMs)`.
 */
import { canAssign, isUnderCursor, pickLemming } from '../sim/assign';
import { FAST_FORWARD_FACTOR, LEMMING_HEIGHT, SCREEN_WIDTH, SELECT_HALF_WIDTH, TICK_MS } from '../sim/constants';
import { createGame, step } from '../sim/game';
import type { Lemming } from '../sim/lemming';
import type { LevelData } from '../sim/level';
import type { ReplayEntry } from '../sim/replay';
import type { Skill } from '../sim/skills';
import type { GameState, Intent, SimEvent } from '../sim/state';
import { CONVENIENCE_COMMANDS, type Command } from './keymap';
import { centreView, clampView } from './layout';

/** Two nuke presses must come within this time (vision G-11: a confirming second action). */
export const NUKE_CONFIRM_MS = 1000;
/** Pixels the view moves per scroll command (keys) and per frame at the screen edge. */
export const SCROLL_STEP = 8;
/**
 * A mouse click that misses every selection box still selects a lemming whose box is this close, in
 * level pixels (design value, plan M6.146): small children aim roughly, and lemmings are only
 * ten pixels tall. A click inside a box always wins, so the original's choice rules stay intact.
 */
export const MOUSE_SELECT_SLACK = 4;
/** Never run more than this many ticks for one frame, so a stalled tab does not fast-forward. */
export const MAX_TICKS_PER_FRAME = 4 * FAST_FORWARD_FACTOR;

export interface SessionOptions {
  /** Purist mode switches off the modern conveniences (vision C-05). */
  readonly purist: boolean;
}

export class Session {
  state: GameState;
  selectedSkill: Skill | null = null;
  paused = false;
  fastForward = false;
  zoomed = false;
  viewX: number;
  readonly replay: ReplayEntry[] = [];
  private pending: Intent[] = [];
  /** Events of single frames stepped while paused; the next `advance` hands them out, so they still sound. */
  private stepped: SimEvent[] = [];
  private accumulator = 0;
  private nukeArmedAt = Number.NEGATIVE_INFINITY;
  private clock = 0;

  constructor(
    readonly level: LevelData,
    private readonly options: SessionOptions,
  ) {
    this.state = createGame(level);
    this.viewX = clampView(level.startX, level.width);
  }

  /** Feed wall-clock time; runs the ticks that are due. Returns every event of those ticks. */
  advance(elapsedMs: number): SimEvent[] {
    this.clock += elapsedMs;
    const events = this.stepped;
    this.stepped = [];
    if (this.paused || this.state.outcome !== 'playing') return events;
    this.accumulator += elapsedMs * (this.fastForward ? FAST_FORWARD_FACTOR : 1);
    let ticks = 0;
    while (this.accumulator >= TICK_MS && ticks < MAX_TICKS_PER_FRAME) {
      this.accumulator -= TICK_MS;
      events.push(...this.tick());
      ticks += 1;
    }
    if (ticks === MAX_TICKS_PER_FRAME) this.accumulator = 0;
    return events;
  }

  private tick(): SimEvent[] {
    const intents = this.pending;
    this.pending = [];
    for (const intent of intents) this.replay.push({ tick: this.state.tick + 1, intent });
    step(this.state, intents);
    return this.state.events;
  }

  /** The lemming the cursor at level coordinates would select for the current skill. */
  lemmingAt(levelX: number, levelY: number): Lemming | null {
    return pickLemming(this.state, levelX, levelY, this.selectedSkill);
  }

  /**
   * The lemming a finger at level coordinates selects (vision 3.4.1): the best lemming whose
   * selection box lies within `radius` level pixels. Like `pickLemming`: one that accepts the skill
   * first, then the box closest to the finger, then the box centre closest to the finger.
   */
  lemmingNear(levelX: number, levelY: number, radius: number): Lemming | null {
    let best: Lemming | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const lemming of this.state.lemmings) {
      if (lemming.removed) continue;
      const outsideX = Math.max(0, Math.abs(lemming.x - levelX) - SELECT_HALF_WIDTH);
      const outsideY = Math.max(0, lemming.y - LEMMING_HEIGHT - levelY, levelY - lemming.y - 1);
      const boxDistance = Math.hypot(outsideX, outsideY);
      if (boxDistance > radius) continue;
      const accepts = this.selectedSkill === null || canAssign(lemming, this.selectedSkill);
      const centreDistance = Math.hypot(lemming.x - levelX, lemming.y - LEMMING_HEIGHT / 2 - levelY);
      const score = (accepts ? 0 : 1e6) + boxDistance * 1000 + centreDistance;
      if (score < bestScore) {
        best = lemming;
        bestScore = score;
      }
    }
    return best;
  }

  /** The lemming a mouse pointer selects: the one under it, else the nearest within MOUSE_SELECT_SLACK. */
  lemmingForMouse(levelX: number, levelY: number): Lemming | null {
    return this.lemmingAt(levelX, levelY) ?? this.lemmingNear(levelX, levelY, MOUSE_SELECT_SLACK);
  }

  /** Click on the playfield at level coordinates: assign the selected skill. Returns success. */
  clickLevel(levelX: number, levelY: number): boolean {
    return this.assignTo(this.lemmingForMouse(levelX, levelY));
  }

  /** A finger was lifted at level coordinates: assign to the best lemming within `radius`. */
  touchLevel(levelX: number, levelY: number, radius: number): boolean {
    return this.assignTo(this.lemmingNear(levelX, levelY, radius));
  }

  private assignTo(lemming: Lemming | null): boolean {
    if (this.selectedSkill === null || this.state.outcome !== 'playing') return false;
    if (!lemming) return false;
    // Check now, so the click gives feedback at once; the sim checks again on its tick.
    if (this.state.skills[this.selectedSkill] <= 0 || !canAssign(lemming, this.selectedSkill)) return false;
    this.pending.push({ type: 'assign', lemmingId: lemming.id, skill: this.selectedSkill });
    return true;
  }

  /** Apply a keyboard or panel command. Returns false when it is ignored (e.g. Purist mode). */
  command(command: Command): boolean {
    if (this.options.purist && CONVENIENCE_COMMANDS.includes(command.type)) return false;
    switch (command.type) {
      case 'releaseRate':
        this.pending.push({ type: 'releaseRate', delta: command.delta });
        return true;
      case 'selectSkill':
        this.selectedSkill = command.skill;
        return true;
      case 'pause':
        this.paused = !this.paused;
        return true;
      case 'nuke':
        return this.pressNuke();
      case 'scroll':
        this.scrollBy(command.direction * SCROLL_STEP);
        return true;
      case 'fastForward':
        this.fastForward = !this.fastForward;
        return true;
      case 'restart':
        this.restart();
        return true;
      case 'frameStep':
        if (!this.paused) return false;
        this.stepped.push(...this.tick());
        return true;
      case 'zoom':
        this.zoomed = !this.zoomed;
        return true;
      case 'menu':
        return false;
    }
  }

  /** The first press arms the nuke, a second press within NUKE_CONFIRM_MS fires it. */
  private pressNuke(): boolean {
    if (this.state.nuking) return false;
    if (this.clock - this.nukeArmedAt <= NUKE_CONFIRM_MS) {
      this.pending.push({ type: 'nuke' });
      this.nukeArmedAt = Number.NEGATIVE_INFINITY;
      return true;
    }
    this.nukeArmedAt = this.clock;
    return false;
  }

  /** The touch nuke button is confirmed by its one-second hold or a double tap: fire at once. */
  confirmNuke(): boolean {
    if (this.state.nuking) return false;
    this.pending.push({ type: 'nuke' });
    this.nukeArmedAt = Number.NEGATIVE_INFINITY;
    return true;
  }

  get nukeArmed(): boolean {
    return this.clock - this.nukeArmedAt <= NUKE_CONFIRM_MS;
  }

  scrollBy(dx: number): void {
    this.viewX = clampView(this.viewX + dx, this.level.width);
  }

  scrollTo(viewX: number): void {
    this.viewX = clampView(viewX, this.level.width);
  }

  centreOn(levelX: number): void {
    this.viewX = centreView(levelX, this.level.width);
  }

  restart(): void {
    this.state = createGame(this.level);
    this.pending = [];
    this.nukeArmedAt = Number.NEGATIVE_INFINITY;
    this.replay.length = 0;
    this.accumulator = 0;
    this.paused = false;
    this.viewX = clampView(this.level.startX, this.level.width);
  }

  /** Lemmings under the cursor, for the status line ("BUILDER 2"). */
  countUnderCursor(levelX: number, levelY: number): number {
    return this.state.lemmings.filter((l) => !l.removed && isUnderCursor(l, levelX, levelY)).length;
  }

  /** Width of the visible part of the level in pixels (narrower when zoomed). */
  get visibleWidth(): number {
    return this.zoomed ? SCREEN_WIDTH / 2 : SCREEN_WIDTH;
  }
}
