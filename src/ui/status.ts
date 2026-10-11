// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The status line above the panel buttons (vision V-03): the type of the lemming under the cursor
 * with the count of lemmings there, OUT, IN (percentage saved) and TIME (minutes-seconds left).
 */
import { translate, type Language } from '../i18n';
import { TICKS_PER_SECOND } from '../sim/constants';
import { lemmingsOut, percent } from '../sim/game';
import type { Lemming } from '../sim/lemming';
import type { GameState } from '../sim/state';

export function formatTime(ticksLeft: number): { minutes: number; seconds: string } {
  const total = Math.max(0, Math.ceil(ticksLeft / TICKS_PER_SECOND));
  return { minutes: Math.floor(total / 60), seconds: String(total % 60).padStart(2, '0') };
}

/** "WALKER", "BUILDER", "ATHLETE" (climber and floater): the name the original shows for a lemming. */
export function lemmingName(lemming: Lemming, language: Language): string {
  if (lemming.action === 'walking' && lemming.climber && lemming.floater) return translate(language, 'action.athlete');
  if (lemming.action === 'walking' && lemming.climber) return translate(language, 'action.climbing');
  if (lemming.action === 'walking' && lemming.floater) return translate(language, 'action.floating');
  return translate(language, `action.${lemming.action}`);
}

export interface StatusParts {
  readonly hovered: string;
  readonly out: string;
  readonly in: string;
  readonly time: string;
}

export function statusParts(state: GameState, hovered: Lemming | null, hoveredCount: number, language: Language): StatusParts {
  return {
    hovered: hovered ? `${lemmingName(hovered, language)} ${hoveredCount}` : '',
    out: translate(language, 'status.out', { count: lemmingsOut(state) }),
    in: translate(language, 'status.in', { percent: percent(state.saved, state.level.lemmings) }),
    time: translate(language, 'status.time', formatTime(state.ticksLeft)),
  };
}
