// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import {
  MemoryStore,
  PROGRESS_KEY,
  SETTINGS_KEY,
  defaultSettings,
  isUnlocked,
  loadProgress,
  loadSettings,
  recordWin,
  saveSettings,
  type KeyValueStore,
} from '../../src/persist/storage';

const broken: KeyValueStore = {
  getItem: () => {
    throw new Error('denied');
  },
  setItem: () => {
    throw new Error('quota');
  },
};

describe('settings (R-05, C-05, A-02)', () => {
  it('round-trips and falls back to defaults', () => {
    const store = new MemoryStore();
    expect(loadSettings(store, 'de')).toEqual(defaultSettings('de'));
    const settings = {
      ...defaultSettings('en'),
      language: 'bar' as const,
      theme: 'bavarian' as const,
      muted: true,
      purist: true,
      layout: 'touch' as const,
      crt: true,
    };
    expect(saveSettings(store, settings)).toBe(true);
    expect(loadSettings(store, 'en')).toEqual(settings);
  });

  it('repairs invalid fields one by one', () => {
    const store = new MemoryStore();
    store.setItem(SETTINGS_KEY, JSON.stringify({ language: 'fr', theme: 'x', musicVolume: 3, sfxVolume: 0.1, layout: 'classic' }));
    expect(loadSettings(store, 'en')).toEqual({ ...defaultSettings('en'), sfxVolume: 0.1, layout: 'classic' });
    store.setItem(SETTINGS_KEY, '{broken');
    expect(loadSettings(store, 'en')).toEqual(defaultSettings('en'));
  });

  it('survives a storage that throws', () => {
    expect(loadSettings(broken, 'en')).toEqual(defaultSettings('en'));
    expect(saveSettings(broken, defaultSettings('en'))).toBe(false);
  });
});

describe('progress (L-02)', () => {
  it('unlocks the next level after a win and never goes backwards', () => {
    const store = new MemoryStore();
    expect(isUnlocked(loadProgress(store), 'fun', 0)).toBe(true);
    expect(isUnlocked(loadProgress(store), 'fun', 1)).toBe(false);
    recordWin(store, 'fun', 0);
    recordWin(store, 'fun', 4);
    const progress = recordWin(store, 'fun', 1);
    expect(progress).toEqual({ fun: 5 });
    expect(isUnlocked(progress, 'fun', 5)).toBe(true);
    expect(isUnlocked(progress, 'tricky', 1)).toBe(false);
  });

  it('ignores invalid stored values', () => {
    const store = new MemoryStore();
    store.setItem(PROGRESS_KEY, JSON.stringify({ fun: 3, tricky: -1, taxing: 'x', mayhem: 1.5 }));
    expect(loadProgress(store)).toEqual({ fun: 3 });
    store.setItem(PROGRESS_KEY, '7');
    expect(loadProgress(store)).toEqual({});
    expect(loadProgress(broken)).toEqual({});
  });
});
