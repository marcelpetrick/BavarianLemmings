// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { FALLBACK_CHARACTER, FONT, GLYPH_WIDTH, glyphFor, measureText } from '../../src/render/font';

const REQUIRED = [...Array.from({ length: 95 }, (_, index) => String.fromCharCode(32 + index)), ...Array.from('ÄÖÜäöüß€°×−…')];

describe('FONT', () => {
  it('has a 6 × 8 cell', () => {
    expect([FONT.width, FONT.height]).toEqual([6, 8]);
  });

  it('covers printable ASCII and the German and special characters', () => {
    for (const character of REQUIRED) expect(FONT.glyphs, `missing ${JSON.stringify(character)}`).toHaveProperty([character]);
  });

  it('draws every glyph 5 wide and 8 tall with only # and .', () => {
    for (const [character, rows] of Object.entries(FONT.glyphs)) {
      expect(rows, character).toHaveLength(FONT.height);
      for (const row of rows) expect(row, character).toMatch(new RegExp(`^[#.]{${GLYPH_WIDTH}}$`));
    }
  });

  it('gives every character except space some ink, and distinct glyphs to distinct letters', () => {
    for (const [character, rows] of Object.entries(FONT.glyphs)) {
      expect(rows.join('').includes('#'), character).toBe(character !== ' ');
    }
    const letters = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789ÄÖÜäöüß');
    expect(new Set(letters.map((letter) => FONT.glyphs[letter]!.join(''))).size).toBe(letters.length);
  });
});

describe('glyphFor()', () => {
  it('returns the glyph of a known character', () => {
    expect(glyphFor('A')).toBe(FONT.glyphs.A);
    expect(glyphFor('ß')).toBe(FONT.glyphs['ß']);
  });

  it('falls back to ? for an unknown character', () => {
    expect(glyphFor('☃')).toBe(FONT.glyphs[FALLBACK_CHARACTER]);
  });
});

describe('measureText()', () => {
  it('is 6 pixels per character, counting code points', () => {
    expect(measureText('')).toBe(0);
    expect(measureText('OUT 12')).toBe(36);
    expect(measureText('Grüß')).toBe(24);
  });
});
