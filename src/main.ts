// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Boot: read the settings, create the audio engine (silent until the first click or key, A-02)
 * and start the app. `?test` in the URL installs the end-to-end test hook (R-04).
 */
import { AudioEngine } from './audio/engine';
import { preferredLanguage } from './i18n';
import { MemoryStore, loadSettings, type KeyValueStore } from './persist/storage';
import { App } from './ui/app';

function browserStore(): KeyValueStore {
  try {
    return window.localStorage;
  } catch {
    return new MemoryStore();
  }
}

const root = document.getElementById('app');
if (root) {
  const store = browserStore();
  const settings = loadSettings(store, preferredLanguage(navigator.languages));
  const audio = new AudioEngine();
  audio.attachUnlockListeners();
  new App({ root, store, settings, audio, testHook: new URLSearchParams(window.location.search).has('test') });
}

// Offline play after the first visit (vision P-05); only in the production build, so the dev
// server never serves stale files.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  });
}
