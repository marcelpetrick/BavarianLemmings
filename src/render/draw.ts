// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Canvas primitives shared by every screen: cached sprite frames, bitmap text, the terrain image
 * and the backdrop. Browser-only (canvas); covered by the end-to-end tests.
 */
import { LEVEL_HEIGHT } from '../sim/constants';
import type { Terrain } from '../sim/terrain';
import { FONT, glyphFor, measureText } from './font';
import type { TerrainColors } from './palettes';
import { frameAt, parseHexColor, rasterize, type Animation, type Palette, type PixelFrame } from './pixelArt';

export type Context = CanvasRenderingContext2D;

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function context(canvas: HTMLCanvasElement): Context {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas is not available');
  ctx.imageSmoothingEnabled = false;
  return ctx;
}

export function context2d(canvas: HTMLCanvasElement): Context {
  return context(canvas);
}

/** Sprite frames rasterised once per palette and direction. */
export class SpriteCache {
  private readonly frames = new WeakMap<PixelFrame, HTMLCanvasElement[]>();

  constructor(private readonly palette: Palette) {}

  frame(frame: PixelFrame, mirror: boolean): HTMLCanvasElement {
    let pair = this.frames.get(frame);
    if (!pair) {
      pair = [];
      this.frames.set(frame, pair);
    }
    const index = mirror ? 1 : 0;
    const cached = pair[index];
    if (cached) return cached;
    const width = frame.rows[0]?.length ?? 0;
    const canvas = createCanvas(width, frame.rows.length);
    context(canvas).putImageData(
      new ImageData(rasterize(frame, this.palette, mirror) as Uint8ClampedArray<ArrayBuffer>, width, frame.rows.length),
      0,
      0,
    );
    pair[index] = canvas;
    return canvas;
  }

  /** Draw the animation frame for `tick` with its anchor at (x, y). */
  draw(ctx: Context, animation: Animation, tick: number, x: number, y: number, mirror = false): void {
    const image = this.frame(frameAt(animation, tick), mirror);
    const anchorX = mirror ? animation.width - 1 - animation.anchorX : animation.anchorX;
    ctx.drawImage(image, Math.round(x - anchorX), Math.round(y - animation.anchorY));
  }
}

/** Bitmap text in the project font, cached per colour. */
export class TextRenderer {
  private readonly glyphs = new Map<string, HTMLCanvasElement>();

  private glyph(char: string, color: string): HTMLCanvasElement {
    const key = `${color}${char}`;
    const cached = this.glyphs.get(key);
    if (cached) return cached;
    const rows = glyphFor(char);
    const canvas = createCanvas(FONT.width, FONT.height);
    const ctx = context(canvas);
    ctx.fillStyle = color;
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x += 1) if (row.charAt(x) === '#') ctx.fillRect(x, y, 1, 1);
    });
    this.glyphs.set(key, canvas);
    return canvas;
  }

  draw(ctx: Context, text: string, x: number, y: number, color: string): void {
    let cursor = Math.round(x);
    for (const char of text) {
      ctx.drawImage(this.glyph(char, color), cursor, Math.round(y));
      cursor += FONT.width;
    }
  }

  centred(ctx: Context, text: string, centreX: number, y: number, color: string): void {
    this.draw(ctx, text, centreX - Math.floor(measureText(text) / 2), y, color);
  }
}

/** The whole level's terrain as an image, rebuilt when the terrain changed. */
export class TerrainLayer {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: Context;
  private readonly image: ImageData;
  private colorKey = '';

  constructor(width: number) {
    this.canvas = createCanvas(width, LEVEL_HEIGHT);
    this.ctx = context(this.canvas);
    this.image = this.ctx.createImageData(width, LEVEL_HEIGHT);
  }

  update(terrain: Terrain, colors: TerrainColors): void {
    const key = Object.values(colors).join();
    if (!terrain.dirty && key === this.colorKey) return;
    this.colorKey = key;
    terrain.dirty = false;
    const rgb = [[0, 0, 0], ...Object.values(colors).map((c) => parseHexColor(c))];
    const data = this.image.data;
    for (let i = 0; i < terrain.colors.length; i += 1) {
      const slot = terrain.mask[i] === 0 ? 0 : (terrain.colors[i] ?? 0);
      const color = rgb[slot] ?? rgb[1];
      const o = i * 4;
      data[o] = color?.[0] ?? 0;
      data[o + 1] = color?.[1] ?? 0;
      data[o + 2] = color?.[2] ?? 0;
      data[o + 3] = slot === 0 ? 0 : 255;
    }
    this.ctx.putImageData(this.image, 0, 0);
  }
}

/** Alpine backdrop for the Bavarian theme: sky, two mountain ranges with snow, drawn once. */
export function mountainBackdrop(width: number): HTMLCanvasElement {
  const canvas = createCanvas(width, LEVEL_HEIGHT);
  const ctx = context(canvas);
  const sky = ctx.createLinearGradient(0, 0, 0, LEVEL_HEIGHT);
  sky.addColorStop(0, '#2a74c8');
  sky.addColorStop(1, '#bcdcf4');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, LEVEL_HEIGHT);
  const ranges = [
    { base: 70, amp: 34, k: [0.011, 0.027, 0.053], color: '#7a8aa8', snow: 18 },
    { base: 100, amp: 26, k: [0.017, 0.041, 0.071], color: '#4a5a78', snow: 10 },
  ];
  for (const range of ranges) {
    for (let x = 0; x < width; x += 1) {
      const [a, b, c] = range.k as [number, number, number];
      const top = Math.round(
        range.base - range.amp * (0.55 * Math.sin(x * a) + 0.3 * Math.sin(x * b + 1.3) + 0.15 * Math.sin(x * c + 2.1)),
      );
      ctx.fillStyle = range.color;
      ctx.fillRect(x, top, 1, LEVEL_HEIGHT - top);
      const snowLine = range.base - range.amp * 0.35;
      if (top < snowLine) {
        ctx.fillStyle = '#f4f8ff';
        ctx.fillRect(x, top, 1, Math.min(range.snow, snowLine - top));
      }
    }
  }
  return canvas;
}
