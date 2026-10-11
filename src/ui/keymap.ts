// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Keyboard commands (vision C-02, C-03, C-05). The DOS layout: F1/F2 release rate, F3–F10 the skills
 * in panel order, F11 pause, F12 nuke. Browsers keep some F-keys for themselves (F11 full screen,
 * F12 developer tools), so every command also has a plain key.
 * `[verify]` whether F1 is − or + in the retail DOS version (plan M6.124); we use F1 = −.
 */
import { SKILLS, type Skill } from '../sim/skills';

export type Command =
  | { readonly type: 'releaseRate'; readonly delta: number }
  | { readonly type: 'selectSkill'; readonly skill: Skill }
  | { readonly type: 'pause' }
  | { readonly type: 'nuke' }
  | { readonly type: 'scroll'; readonly direction: -1 | 1 }
  | { readonly type: 'fastForward' }
  | { readonly type: 'restart' }
  | { readonly type: 'frameStep' }
  | { readonly type: 'zoom' }
  | { readonly type: 'menu' };

/** Commands that the DOS original lacked; the Purist setting switches them off (vision C-05). */
export const CONVENIENCE_COMMANDS: readonly Command['type'][] = ['fastForward', 'restart', 'frameStep', 'zoom'];

export function commandForKey(key: string): Command | null {
  const fKey = /^F(\d{1,2})$/.exec(key);
  if (fKey) {
    const number = Number(fKey[1]);
    if (number === 1) return { type: 'releaseRate', delta: -1 };
    if (number === 2) return { type: 'releaseRate', delta: 1 };
    const skill = SKILLS[number - 3];
    if (skill) return { type: 'selectSkill', skill };
    if (number === 11) return { type: 'pause' };
    if (number === 12) return { type: 'nuke' };
    return null;
  }
  const digit = /^[1-8]$/.test(key) ? SKILLS[Number(key) - 1] : undefined;
  if (digit) return { type: 'selectSkill', skill: digit };
  switch (key.length === 1 ? key.toLowerCase() : key) {
    case '-':
      return { type: 'releaseRate', delta: -1 };
    case '+':
    case '=':
      return { type: 'releaseRate', delta: 1 };
    case 'p':
    case ' ':
      return { type: 'pause' };
    case 'n':
      return { type: 'nuke' };
    case 'ArrowLeft':
    case 'a':
      return { type: 'scroll', direction: -1 };
    case 'ArrowRight':
    case 'd':
      return { type: 'scroll', direction: 1 };
    case 'f':
      return { type: 'fastForward' };
    case 'r':
      return { type: 'restart' };
    case '.':
      return { type: 'frameStep' };
    case 'z':
      return { type: 'zoom' };
    case 'Escape':
      return { type: 'menu' };
    default:
      return null;
  }
}
