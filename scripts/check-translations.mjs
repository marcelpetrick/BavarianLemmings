// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * check-translations.mjs: every translation key exists in every language (vision I-02), and every
 * key written literally in the code (`translate(language, 'some.key')`, `t('some.key')`) exists.
 *
 * Keys that the code builds at run time (`action.${name}`, `level.${id}.name`, `rating.${id}`) are
 * covered by the language comparison and by the unit tests of their users.
 *
 * Usage:      node scripts/check-translations.mjs
 * Exit codes: 0 = complete, 1 = a key is missing somewhere
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const languages = ['en', 'de', 'bar'];
const locales = Object.fromEntries(languages.map((l) => [l, JSON.parse(readFileSync(`src/i18n/locales/${l}.json`, 'utf8'))]));
const problems = [];
const allKeys = new Set(languages.flatMap((l) => Object.keys(locales[l])));

for (const key of allKeys) {
  for (const language of languages) {
    const text = locales[language][key];
    if (typeof text !== 'string' || text.trim() === '') problems.push(`${language}: missing or empty "${key}"`);
  }
}

const sources = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', 'src/*.ts', 'src/**/*.ts'], {
  encoding: 'utf8',
})
  .split('\n')
  .filter(Boolean);
for (const file of sources) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/\b(?:t|translate)\((?:[\w.]+,\s*)?'([a-z][\w-]*(?:\.[\w-]+)+)'/g)) {
    if (!(match[1] in locales.en)) problems.push(`${file}: key "${match[1]}" is not in en.json`);
  }
}

if (problems.length > 0) {
  console.error(`translation check failed (${problems.length}):\n${problems.map((p) => `  - ${p}`).join('\n')}`);
  process.exit(1);
}
console.log(`translation check passed: ${allKeys.size} keys in ${languages.length} languages`);
