// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { FONT } from '../../src/render/font';
import { LANGUAGES, isLanguage, keysOf, preferredLanguage, translate } from '../../src/i18n';

describe('i18n (I-01, I-02)', () => {
  it('has every key in every language', () => {
    const english = keysOf('en').sort();
    for (const language of LANGUAGES) expect(keysOf(language).sort(), language).toEqual(english);
  });

  it('renders every translated UI and level string without missing-character fallback', () => {
    for (const language of LANGUAGES) {
      for (const key of keysOf(language)) {
        for (const character of translate(language, key)) {
          expect(FONT.glyphs[character], `${language}:${key}: unsupported ${JSON.stringify(character)}`).toBeDefined();
        }
      }
    }
  });

  it('keeps the same interpolation parameters in every language', () => {
    const placeholders = (text: string): string[] => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]!).sort();
    for (const key of keysOf('en')) {
      for (const language of LANGUAGES) {
        expect(placeholders(translate(language, key)), `${language}:${key}`).toEqual(placeholders(translate('en', key)));
      }
    }
  });

  it('translates boolean setting values', () => {
    expect(translate('en', 'settings.on')).toBe('ON');
    expect(translate('en', 'settings.off')).toBe('OFF');
    expect(translate('de', 'settings.on')).toBe('AN');
    expect(translate('de', 'settings.off')).toBe('AUS');
    expect(translate('bar', 'settings.on')).toBe('O');
    expect(translate('bar', 'settings.off')).toBe('AUS');
  });

  it('translates with parameters and keeps unknown placeholders', () => {
    expect(translate('en', 'status.out', { count: 7 })).toBe('OUT 7');
    expect(translate('de', 'status.out', { count: 7 })).toBe('DRAUSSEN 7');
    expect(translate('bar', 'menu.play')).toBe('Spuin');
    expect(translate('en', 'status.out')).toBe('OUT {count}');
  });

  it('shows the key when it exists nowhere', () => {
    expect(translate('de', 'no.such.key')).toBe('no.such.key');
  });

  it('picks the browser language when supported', () => {
    expect(preferredLanguage(['de-AT', 'en'])).toBe('de');
    expect(preferredLanguage(['fr', 'bar'])).toBe('bar');
    expect(preferredLanguage(['fr'])).toBe('en');
    expect(isLanguage('en')).toBe(true);
    expect(isLanguage(3)).toBe(false);
  });
});
