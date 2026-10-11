// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/** The eight skills, in the order of the panel buttons and of the F3–F10 keys (vision G-03, C-02). */
export const SKILLS = ['climber', 'floater', 'bomber', 'blocker', 'builder', 'basher', 'miner', 'digger'] as const;
export type Skill = (typeof SKILLS)[number];
export type SkillCounts = Record<Skill, number>;

export function isSkill(value: unknown): value is Skill {
  return typeof value === 'string' && (SKILLS as readonly string[]).includes(value);
}
