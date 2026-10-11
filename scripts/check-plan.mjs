// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * check-plan.mjs: every specification ID in vision.md is referenced by at least one plan.md task.
 *
 * An ID is a table row key like `G-01` or `L-01a` in vision.md section 3. Exempt are struck-through
 * IDs (`~~L-05~~`) and MAY items whose text says "Deferred" (plan.md, "How to use this file").
 *
 * Usage:      node scripts/check-plan.mjs [--summary]
 *               --summary  also print done/open task counts per milestone
 * Exit codes: 0 = every ID is covered, 1 = at least one ID has no task
 */
import { readFileSync } from 'node:fs';

const vision = readFileSync('vision.md', 'utf8');
const plan = readFileSync('plan.md', 'utf8');

const ids = [];
for (const line of vision.split('\n')) {
  const match = /^\| (~~)?([GLVCAPRIX]-\d{2}[a-z]?)(~~)? \| (.*)$/.exec(line);
  if (!match) continue;
  const struck = Boolean(match[1]);
  const deferred = /^MAY\b.*\bDeferred\b/.test(match[4]);
  if (!struck && !deferred) ids.push(match[2]);
}

const tasks = plan.split('\n').filter((line) => /^- \[[ x]\] /.test(line));
const missing = ids.filter((id) => !tasks.some((task) => new RegExp(`[(, ]${id}[,)]`).test(task)));

if (process.argv.includes('--summary')) {
  const perMilestone = new Map();
  for (const task of tasks) {
    const milestone = /M\d+/.exec(task)?.[0] ?? '?';
    const entry = perMilestone.get(milestone) ?? { done: 0, open: 0 };
    if (task.startsWith('- [x]')) entry.done += 1;
    else entry.open += 1;
    perMilestone.set(milestone, entry);
  }
  for (const [milestone, { done, open }] of perMilestone) console.log(`${milestone}: ${done} done, ${open} open`);
}

if (missing.length > 0) {
  console.error(`vision IDs without a plan task (${missing.length}): ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`plan check passed: ${ids.length} vision IDs, each referenced by a task`);
