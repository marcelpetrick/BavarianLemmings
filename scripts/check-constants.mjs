// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * check-constants.mjs: list every original-game constant that is still `unverified` (architecture.md 6.2).
 *
 * The list is the project's fidelity debt: each entry needs a documented DOS source before its
 * status may become `verified` (plan M6.123). Listing is informational; the script fails only when a
 * constant() call has no status or no source, which would hide a number without provenance.
 *
 * Usage:      node scripts/check-constants.mjs [--quiet]
 *               --quiet  print only the summary line
 * Exit codes: 0 = every constant has a status and a source, 1 = a constant lacks one
 */
import { readFileSync } from 'node:fs';

const file = 'src/sim/constants.ts';
const text = readFileSync(file, 'utf8');
const calls = [...text.matchAll(/constant\('(\w+)',([\s\S]*?)\}\)/g)];
const counts = { verified: 0, unverified: 0, design: 0 };
const problems = [];
const unverified = [];

for (const [, name, body] of calls) {
  const status = /status: '(\w+)'/.exec(body)?.[1];
  const hasSource = /source:/.test(body);
  if (!status || !(status in counts) || !hasSource) {
    problems.push(`${name}: missing status or source`);
    continue;
  }
  counts[status] += 1;
  if (status === 'unverified') unverified.push(name);
}

if (!process.argv.includes('--quiet')) for (const name of unverified) console.log(`unverified: ${name}`);
console.log(`${calls.length} constants: ${counts.verified} verified, ${counts.unverified} unverified, ${counts.design} design`);
if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
