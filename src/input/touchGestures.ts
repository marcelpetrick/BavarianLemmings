// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Touch gestures (vision C-06, 3.4.1), as pure state machines. They receive finger positions and
 * times, and return *effects*; the app applies the effects to the session. No DOM here.
 *
 * - `PlayfieldGestures`: one finger is "press, aim, release" (lifting the finger assigns the skill,
 *   sliding out of the playfield cancels); two fingers pan the view; a pinch toggles the zoom.
 * - `HoldButton`: the nuke button fires after a one-second hold, or on a double tap.
 * - `RepeatButton`: the release rate buttons fire on press and repeat while held.
 */

/** One CSS pixel is 1/96 inch (CSS Values 4), so one millimetre is 96 / 25.4 CSS pixels. */
export const CSS_PX_PER_MM = 96 / 25.4;
/** Radius around the finger in which a lemming is selected (vision 3.4.1: about 8 mm, a fingertip). */
export const TOUCH_SELECT_RADIUS_MM = 8;
/** A pinch must change the finger distance by this factor before the zoom toggles (design value). */
export const PINCH_FACTOR = 1.4;
/** Nuke: hold this long to fire (vision 3.4.1: one second). */
export const NUKE_HOLD_MS = 1000;
/** Nuke: a second tap within this time after the first release fires too (design value). */
export const DOUBLE_TAP_MS = 400;
/** Release rate: the first repeat comes after this delay, then one per interval (like a keyboard). */
export const REPEAT_DELAY_MS = 400;
export const REPEAT_INTERVAL_MS = 100;

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** What a gesture asks the app to do. Coordinates are in logical playfield pixels. */
export type GestureEffect =
  /** Show the selection box and the magnifier at this point. */
  | { readonly type: 'aim'; readonly x: number; readonly y: number }
  /** Hide them again; no skill is assigned. */
  | { readonly type: 'aimCancel' }
  /** The finger was lifted: assign the selected skill at this point. */
  | { readonly type: 'assign'; readonly x: number; readonly y: number }
  /** A two-finger pan begins: remember the current view position. */
  | { readonly type: 'panStart' }
  /** The fingers moved this far (logical pixels) since `panStart`. */
  | { readonly type: 'pan'; readonly offsetX: number }
  /** A pinch: zoom in (fingers apart) or out (fingers together), centred between the fingers. */
  | { readonly type: 'zoom'; readonly zoomIn: boolean; readonly x: number; readonly y: number };

type Phase = 'idle' | 'aiming' | 'multi' | 'ignored';

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function middle(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export class PlayfieldGestures {
  private phase: Phase = 'idle';
  private readonly fingers = new Map<number, Point>();
  private aimId = -1;
  private aimPoint: Point = { x: 0, y: 0 };
  private startMiddle: Point = { x: 0, y: 0 };
  private startDistance = 1;
  private pinched = false;
  /** The two fingers of a pan; a third finger is ignored. */
  private panIds: readonly number[] = [];

  /** The playfield size in logical pixels; a finger outside it cancels the aim. */
  constructor(private readonly bounds: { readonly width: number; readonly height: number }) {}

  /** The point the selection box follows, or null when no finger aims. */
  get aim(): Point | null {
    return this.phase === 'aiming' ? this.aimPoint : null;
  }

  private inside(point: Point): boolean {
    return point.x >= 0 && point.y >= 0 && point.x < this.bounds.width && point.y < this.bounds.height;
  }

  down(id: number, x: number, y: number): GestureEffect[] {
    this.fingers.set(id, { x, y });
    if (this.phase === 'idle') {
      this.phase = 'aiming';
      this.aimId = id;
      this.aimPoint = { x, y };
      return [{ type: 'aim', x, y }];
    }
    if (this.fingers.size !== 2) return [];
    // A second finger turns any one-finger state into a pan: scrolling never assigns a skill.
    const effects: GestureEffect[] = this.phase === 'aiming' ? [{ type: 'aimCancel' }] : [];
    this.panIds = [...this.fingers.keys()];
    const [a, b] = this.panPoints();
    this.phase = 'multi';
    this.startMiddle = middle(a, b);
    this.startDistance = Math.max(1, distance(a, b));
    this.pinched = false;
    effects.push({ type: 'panStart' });
    return effects;
  }

  move(id: number, x: number, y: number): GestureEffect[] {
    if (!this.fingers.has(id)) return [];
    this.fingers.set(id, { x, y });
    if (this.phase === 'aiming' && id === this.aimId) {
      if (!this.inside({ x, y })) {
        this.phase = 'ignored';
        return [{ type: 'aimCancel' }];
      }
      this.aimPoint = { x, y };
      return [{ type: 'aim', x, y }];
    }
    if (this.phase !== 'multi' || !this.panIds.includes(id)) return [];
    const [a, b] = this.panPoints();
    const centre = middle(a, b);
    const effects: GestureEffect[] = [{ type: 'pan', offsetX: centre.x - this.startMiddle.x }];
    const ratio = distance(a, b) / this.startDistance;
    if (!this.pinched && (ratio >= PINCH_FACTOR || ratio <= 1 / PINCH_FACTOR)) {
      this.pinched = true;
      effects.push({ type: 'zoom', zoomIn: ratio > 1, x: centre.x, y: centre.y });
    }
    return effects;
  }

  private panPoints(): [Point, Point] {
    return this.panIds.map((id) => this.fingers.get(id) ?? { x: 0, y: 0 }) as [Point, Point];
  }

  up(id: number): GestureEffect[] {
    if (!this.fingers.delete(id)) return [];
    if (this.phase === 'aiming') {
      this.phase = 'idle';
      return [{ type: 'assign', x: this.aimPoint.x, y: this.aimPoint.y }];
    }
    this.release();
    return [];
  }

  /** The browser took the finger away (a system gesture, an alert): never assign. */
  cancel(id: number): GestureEffect[] {
    if (!this.fingers.delete(id)) return [];
    const wasAiming = this.phase === 'aiming';
    if (wasAiming) this.phase = this.fingers.size === 0 ? 'idle' : 'ignored';
    this.release();
    return wasAiming ? [{ type: 'aimCancel' }] : [];
  }

  /** After a pan or a cancel, the remaining fingers do nothing until all are lifted. */
  private release(): void {
    if (this.fingers.size === 0) this.phase = 'idle';
    else if (this.phase === 'multi' && this.panIds.some((panId) => !this.fingers.has(panId))) this.phase = 'ignored';
  }
}

/** The nuke button: a one-second hold with a progress ring, or a double tap (vision 3.4.1). */
export class HoldButton {
  private pressedAt: number | null = null;
  private lastReleaseAt = Number.NEGATIVE_INFINITY;
  private fired = false;

  constructor(
    private readonly holdMs = NUKE_HOLD_MS,
    private readonly doubleTapMs = DOUBLE_TAP_MS,
  ) {}

  /** Returns true when this press is the second tap of a double tap. */
  press(time: number): boolean {
    const doubleTap = time - this.lastReleaseAt <= this.doubleTapMs;
    this.pressedAt = time;
    this.fired = doubleTap;
    this.lastReleaseAt = Number.NEGATIVE_INFINITY;
    return doubleTap;
  }

  /** Returns true once, in the frame in which the hold reaches its full time. */
  update(time: number): boolean {
    if (this.pressedAt === null || this.fired || time - this.pressedAt < this.holdMs) return false;
    this.fired = true;
    return true;
  }

  release(time: number): void {
    if (this.pressedAt === null) return;
    // Only a short press that fired nothing counts as the first tap of a double tap.
    this.lastReleaseAt = this.fired ? Number.NEGATIVE_INFINITY : time;
    this.pressedAt = null;
    this.fired = false;
  }

  /** 0 when not held, rising to 1 at the end of the hold; drawn as the progress ring. */
  progress(time: number): number {
    if (this.pressedAt === null || this.fired) return 0;
    return Math.min(1, Math.max(0, (time - this.pressedAt) / this.holdMs));
  }
}

/** A button that fires on press and then repeats while held (release rate −/+). */
export class RepeatButton {
  private nextAt: number | null = null;

  constructor(
    private readonly delayMs = REPEAT_DELAY_MS,
    private readonly intervalMs = REPEAT_INTERVAL_MS,
  ) {}

  /** Returns 1: the press itself fires once. */
  press(time: number): number {
    this.nextAt = time + this.delayMs;
    return 1;
  }

  /** The number of repeats due since the last update. */
  update(time: number): number {
    if (this.nextAt === null) return 0;
    let count = 0;
    while (time >= this.nextAt) {
      count += 1;
      this.nextAt += this.intervalMs;
    }
    return count;
  }

  release(): void {
    this.nextAt = null;
  }

  get held(): boolean {
    return this.nextAt !== null;
  }
}

/** The selection radius in logical pixels for a playfield drawn at `cssPerLogical` CSS pixels per pixel. */
export function selectRadius(cssPerLogical: number): number {
  return (TOUCH_SELECT_RADIUS_MM * CSS_PX_PER_MM) / cssPerLogical;
}
