// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The pixel-art format: every sprite is plain TypeScript data, drawn by us (no original material).
 *
 * A *frame* is a list of strings, one string per pixel row and one character per pixel. The
 * character `.` is transparent. Every other character is a semantic colour *slot* (for example `H`
 * hair, `B` clothes) that a theme's palette maps to a real colour, so one drawing serves every theme.
 */

/** One picture of an animation. `rows[y][x]` is the colour slot of pixel (x, y). */
export interface PixelFrame {
  readonly rows: readonly string[];
}

/** A sequence of equally sized frames with an anchor point. */
export interface Animation {
  /** Frame width in pixels. */
  readonly width: number;
  /** Frame height in pixels. */
  readonly height: number;
  /** X of the anchor pixel inside the frame; the renderer places this pixel at the entity's position. */
  readonly anchorX: number;
  /** Y of the anchor pixel inside the frame. */
  readonly anchorY: number;
  readonly frames: readonly PixelFrame[];
  /** true: the animation repeats; false: it stops on its last frame. */
  readonly loop: boolean;
}

/** Colour slot character to CSS colour `#rrggbb`. The transparent slot `.` is never looked up. */
export type Palette = Readonly<Record<string, string>>;

/** The colour slot that is always transparent. */
export const TRANSPARENT = '.';

/** Wrap pixel rows into a frame; keeps the sprite data files short. */
export function frame(rows: readonly string[]): PixelFrame {
  return { rows };
}

/**
 * The frame shown `tick` ticks after the animation started (one frame per tick).
 * A looping animation wraps around; a one-shot animation holds its last frame.
 * Negative ticks show the first frame.
 */
export function frameAt(animation: Animation, tick: number): PixelFrame {
  const count = animation.frames.length;
  if (count === 0) throw new Error('animation has no frames');
  const step = Math.max(0, Math.floor(tick));
  const index = animation.loop ? step % count : Math.min(step, count - 1);
  const frame = animation.frames[index];
  /* v8 ignore next -- the index is always in range; this guard only satisfies noUncheckedIndexedAccess */
  if (frame === undefined) throw new Error(`frame ${index} missing`);
  return frame;
}

/** Every problem of an animation as a readable message; an empty list means it is valid. */
export function validateAnimation(animation: Animation): string[] {
  const problems: string[] = [];
  const { width, height, anchorX, anchorY, frames } = animation;
  if (!Number.isInteger(width) || width < 1) problems.push(`width ${width} is not a positive integer`);
  if (!Number.isInteger(height) || height < 1) problems.push(`height ${height} is not a positive integer`);
  if (!Number.isInteger(anchorX) || anchorX < 0 || anchorX >= width) problems.push(`anchorX ${anchorX} is outside the frame`);
  if (!Number.isInteger(anchorY) || anchorY < 0 || anchorY >= height) problems.push(`anchorY ${anchorY} is outside the frame`);
  if (frames.length === 0) problems.push('no frames');
  frames.forEach((frame, frameIndex) => {
    if (frame.rows.length !== height) problems.push(`frame ${frameIndex}: ${frame.rows.length} rows, expected ${height}`);
    frame.rows.forEach((row, rowIndex) => {
      if (row.length !== width) problems.push(`frame ${frameIndex} row ${rowIndex}: ${row.length} pixels, expected ${width}`);
    });
  });
  return problems;
}

/** The set of colour slots a frame uses, without the transparent slot. */
export function slotsUsed(frame: PixelFrame): Set<string> {
  const slots = new Set<string>();
  for (const row of frame.rows) for (const slot of row) if (slot !== TRANSPARENT) slots.add(slot);
  return slots;
}

/** `#rrggbb` to its three channel values. Throws on any other format. */
export function parseHexColor(color: string): [number, number, number] {
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) throw new Error(`colour ${color} is not #rrggbb`);
  return [Number.parseInt(color.slice(1, 3), 16), Number.parseInt(color.slice(3, 5), 16), Number.parseInt(color.slice(5, 7), 16)];
}

/**
 * RGBA pixels (width × height × 4 bytes, row by row) of a frame in a palette, ready for `ImageData`.
 * `mirror` flips the frame horizontally: sprites face right, the renderer mirrors them for left.
 * Throws when the frame uses a slot the palette does not define.
 */
export function rasterize(frame: PixelFrame, palette: Palette, mirror: boolean): Uint8ClampedArray {
  const height = frame.rows.length;
  const width = frame.rows[0]?.length ?? 0;
  const pixels = new Uint8ClampedArray(width * height * 4);
  const cache = new Map<string, [number, number, number]>();
  frame.rows.forEach((row, y) => {
    if (row.length !== width) throw new Error(`row ${y} has ${row.length} pixels, expected ${width}`);
    for (let x = 0; x < width; x += 1) {
      const slot = row.charAt(x);
      if (slot === TRANSPARENT) continue;
      let rgb = cache.get(slot);
      if (rgb === undefined) {
        const color = palette[slot];
        if (color === undefined) throw new Error(`colour slot '${slot}' is missing from the palette`);
        rgb = parseHexColor(color);
        cache.set(slot, rgb);
      }
      const targetX = mirror ? width - 1 - x : x;
      const offset = (y * width + targetX) * 4;
      pixels[offset] = rgb[0];
      pixels[offset + 1] = rgb[1];
      pixels[offset + 2] = rgb[2];
      pixels[offset + 3] = 255;
    }
  });
  return pixels;
}
