// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Settings and progress in the browser (vision L-02, architecture.md 9). Keys are versioned
 * (`bl.v1.settings`, `bl.v1.progress`). Progress is written only when a level is finished.
 * Everything goes through `KeyValueStore`, so tests use a plain map and a broken or full browser
 * storage never stops the game.
 */
import { isLanguage, type Language } from '../i18n';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class MemoryStore implements KeyValueStore {
  private readonly items = new Map<string, string>();
  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

export type ThemeId = 'classic' | 'bavarian';
export type LayoutChoice = 'auto' | 'classic' | 'touch';

export interface Settings {
  language: Language;
  theme: ThemeId;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  purist: boolean;
  layout: LayoutChoice;
  crt: boolean;
}

/** Per rating: the number of levels finished in order, so the next one is unlocked. */
export type Progress = Record<string, number>;

export const SETTINGS_KEY = 'bl.v1.settings';
export const PROGRESS_KEY = 'bl.v1.progress';

export function defaultSettings(language: Language): Settings {
  return { language, theme: 'bavarian', musicVolume: 0.6, sfxVolume: 0.8, muted: false, purist: false, layout: 'auto', crt: false };
}

function readJson(store: KeyValueStore, key: string): unknown {
  try {
    const text = store.getItem(key);
    return text === null ? null : (JSON.parse(text) as unknown);
  } catch {
    return null;
  }
}

function writeJson(store: KeyValueStore, key: string, value: unknown): boolean {
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function volume(value: unknown, fallback: number): number {
  return typeof value === 'number' && value >= 0 && value <= 1 ? value : fallback;
}

/** Load the settings; every missing or invalid field takes its default. */
export function loadSettings(store: KeyValueStore, fallbackLanguage: Language): Settings {
  const defaults = defaultSettings(fallbackLanguage);
  const raw = readJson(store, SETTINGS_KEY);
  if (typeof raw !== 'object' || raw === null) return defaults;
  const data = raw as Record<string, unknown>;
  return {
    language: isLanguage(data.language) ? data.language : defaults.language,
    theme: data.theme === 'classic' || data.theme === 'bavarian' ? data.theme : defaults.theme,
    musicVolume: volume(data.musicVolume, defaults.musicVolume),
    sfxVolume: volume(data.sfxVolume, defaults.sfxVolume),
    muted: data.muted === true,
    purist: data.purist === true,
    layout: data.layout === 'classic' || data.layout === 'touch' ? data.layout : 'auto',
    crt: data.crt === true,
  };
}

export function saveSettings(store: KeyValueStore, settings: Settings): boolean {
  return writeJson(store, SETTINGS_KEY, settings);
}

export function loadProgress(store: KeyValueStore): Progress {
  const raw = readJson(store, PROGRESS_KEY);
  const progress: Progress = {};
  if (typeof raw !== 'object' || raw === null) return progress;
  for (const [rating, count] of Object.entries(raw)) {
    if (typeof count === 'number' && Number.isInteger(count) && count >= 0) progress[rating] = count;
  }
  return progress;
}

/** Record that level `index` (0-based) of a rating was won; progress never goes backwards (L-02). */
export function recordWin(store: KeyValueStore, rating: string, index: number): Progress {
  const progress = loadProgress(store);
  progress[rating] = Math.max(progress[rating] ?? 0, index + 1);
  writeJson(store, PROGRESS_KEY, progress);
  return progress;
}

/** Whether level `index` of a rating is playable: the first one always, then one past the furthest won. */
export function isUnlocked(progress: Progress, rating: string, index: number): boolean {
  return index <= (progress[rating] ?? 0);
}
