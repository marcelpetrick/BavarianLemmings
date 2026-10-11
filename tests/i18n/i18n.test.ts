// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { LANGUAGES, isLanguage, keysOf, preferredLanguage, translate } from '../../src/i18n';

describe('i18n (I-01, I-02)', () => {
  it('has every key in every language', () => {
    const english = keysOf('en').sort();
    for (const language of LANGUAGES) expect(keysOf(language).sort(), language).toEqual(english);
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
