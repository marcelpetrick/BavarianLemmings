// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Translations (vision I-01, I-02): English (default), German, Bavarian (ISO 639-3 `bar`).
 * Keys are flat. A key missing in a language falls back to English; a key missing everywhere
 * shows the key itself, so the gap is visible on screen and in tests.
 */
import bar from './locales/bar.json';
import de from './locales/de.json';
import en from './locales/en.json';

export const LANGUAGES = ['en', 'de', 'bar'] as const;
export type Language = (typeof LANGUAGES)[number];

/** Level names live in one file per rating and language (`levels/<rating>.<lang>.json`), merged here. */
const levelFiles = import.meta.glob<Record<string, string>>('./locales/levels/*.json', { eager: true, import: 'default' });

function levelTexts(language: Language): Record<string, string> {
  const texts: Record<string, string> = {};
  for (const [path, entries] of Object.entries(levelFiles)) if (path.endsWith(`.${language}.json`)) Object.assign(texts, entries);
  return texts;
}

const LOCALES: Record<Language, Readonly<Record<string, string>>> = {
  en: { ...en, ...levelTexts('en') },
  de: { ...de, ...levelTexts('de') },
  bar: { ...bar, ...levelTexts('bar') },
};

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/** Translate a key into a language, filling `{name}` placeholders from `params`. */
export function translate(language: Language, key: string, params: Readonly<Record<string, string | number>> = {}): string {
  const text = LOCALES[language][key] ?? LOCALES.en[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

/** All keys of a language, for the completeness check. */
export function keysOf(language: Language): string[] {
  return Object.keys(LOCALES[language]);
}

/** The language to start with: the browser's preference if we have it, else English. */
export function preferredLanguage(browserLanguages: readonly string[]): Language {
  for (const tag of browserLanguages) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLanguage(base)) return base;
  }
  return 'en';
}
