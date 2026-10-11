// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { frame, frameAt, parseHexColor, rasterize, slotsUsed, validateAnimation, type Animation } from '../../src/render/pixelArt';

const twoByOne = (loop: boolean): Animation => ({
  width: 2,
  height: 1,
  anchorX: 0,
  anchorY: 0,
  loop,
  frames: [frame(['A.']), frame(['.A']), frame(['AA'])],
});

describe('frameAt()', () => {
  it('wraps a looping animation', () => {
    const animation = twoByOne(true);
    expect(frameAt(animation, 0)).toBe(animation.frames[0]);
    expect(frameAt(animation, 2)).toBe(animation.frames[2]);
    expect(frameAt(animation, 3)).toBe(animation.frames[0]);
    expect(frameAt(animation, 7)).toBe(animation.frames[1]);
  });

  it('holds the last frame of a one-shot animation', () => {
    const animation = twoByOne(false);
    expect(frameAt(animation, 1)).toBe(animation.frames[1]);
    expect(frameAt(animation, 99)).toBe(animation.frames[2]);
  });

  it('shows the first frame for negative and fractional ticks', () => {
    const animation = twoByOne(true);
    expect(frameAt(animation, -5)).toBe(animation.frames[0]);
    expect(frameAt(animation, 1.9)).toBe(animation.frames[1]);
  });

  it('rejects an animation without frames', () => {
    expect(() => frameAt({ ...twoByOne(true), frames: [] }, 0)).toThrow(/no frames/);
  });
});

describe('validateAnimation()', () => {
  it('accepts a well-formed animation', () => {
    expect(validateAnimation(twoByOne(true))).toEqual([]);
  });

  it('names every problem', () => {
    const broken: Animation = {
      width: 0,
      height: 1.5,
      anchorX: -1,
      anchorY: 9,
      loop: true,
      frames: [],
    };
    const problems = validateAnimation(broken);
    expect(problems).toHaveLength(5);
    expect(problems.join('\n')).toMatch(/width 0/);
    expect(problems.join('\n')).toMatch(/height 1.5/);
    expect(problems.join('\n')).toMatch(/anchorX -1/);
    expect(problems.join('\n')).toMatch(/anchorY 9/);
    expect(problems.join('\n')).toMatch(/no frames/);
  });

  it('finds a wrong row count and a wrong row length', () => {
    const animation: Animation = { ...twoByOne(true), frames: [frame(['A.', '..']), frame(['A'])] };
    expect(validateAnimation(animation)).toEqual(['frame 0: 2 rows, expected 1', 'frame 1 row 0: 1 pixels, expected 2']);
  });
});

describe('slotsUsed()', () => {
  it('lists the colour slots without the transparent one', () => {
    expect([...slotsUsed(frame(['AB.', '.CA']))].sort()).toEqual(['A', 'B', 'C']);
  });
});

describe('parseHexColor()', () => {
  it('reads #rrggbb', () => {
    expect(parseHexColor('#0a80fF')).toEqual([10, 128, 255]);
  });

  it('rejects other formats', () => {
    expect(() => parseHexColor('#fff')).toThrow(/#rrggbb/);
    expect(() => parseHexColor('red')).toThrow(/#rrggbb/);
  });
});

describe('rasterize()', () => {
  const palette = { A: '#ff0000', B: '#00ff00' };

  it('writes RGBA pixels row by row, transparent stays zero', () => {
    const pixels = rasterize(frame(['AB', '.A']), palette, false);
    expect([...pixels]).toEqual([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 0, 0, 255, 0, 0, 255]);
  });

  it('mirrors horizontally', () => {
    const pixels = rasterize(frame(['AB', '.A']), palette, true);
    expect([...pixels]).toEqual([0, 255, 0, 255, 255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 0, 0]);
  });

  it('throws on a slot missing from the palette', () => {
    expect(() => rasterize(frame(['AZ']), palette, false)).toThrow(/'Z'/);
  });

  it('throws on ragged rows', () => {
    expect(() => rasterize(frame(['AB', 'A']), palette, false)).toThrow(/row 1/);
  });

  it('returns an empty image for an empty frame', () => {
    expect(rasterize(frame([]), palette, false)).toHaveLength(0);
  });
});
