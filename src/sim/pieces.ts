// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The terrain piece library (vision V-07; docs/terrain-pieces.md): parametric pieces drawn by
 * code, all ours. A piece is a raster of hints (see texture.ts): 0 leaves the level pixel alone,
 * every other value makes the pixel solid and says how to colour it. Pieces are pure functions of
 * their size, seed and flip, so a level always builds the same mask (G-12).
 */
import { hash01, hash3, insidePolygon, roughenPolygon, turnCos, turnSin, type Point } from './geometry';
import { HINT_FIXED, HINT_NATURAL, cellular, darker, lighter } from './texture';
import { SLOT } from './terrain';

/** A rectangle of hints, row by row. */
export interface PieceRaster {
  readonly w: number;
  readonly h: number;
  readonly cells: Uint8Array;
}

class Raster implements PieceRaster {
  readonly cells: Uint8Array;

  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.cells = new Uint8Array(w * h);
  }

  set(x: number, y: number, hint: number): void {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.cells[y * this.w + x] = hint;
  }

  get(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return 0;
    return this.cells[y * this.w + x] ?? 0;
  }

  /** Call `paint` for every pixel; a non-zero result is written. */
  each(paint: (x: number, y: number) => number): void {
    for (let y = 0; y < this.h; y += 1) {
      for (let x = 0; x < this.w; x += 1) {
        const hint = paint(x, y);
        if (hint !== 0) this.set(x, y, hint);
      }
    }
  }
}

interface PieceDefinition {
  /** Default size in pixels, used when the level leaves out w or h. */
  readonly w: number;
  readonly h: number;
  readonly draw: (raster: Raster, seed: number) => void;
}

/** A face of a cylinder lit from the left: tone for position u in [0, 1) across it. */
function cylinder(u: number): number {
  if (u < 0.18) return SLOT.bodyLight;
  if (u < 0.3) return SLOT.highlight;
  if (u < 0.6) return SLOT.body;
  if (u < 0.85) return SLOT.bodyDark;
  return SLOT.shadow;
}

/** Craggy boulder: an angular, chipped outline; flat facets lit from the top left, a few cracks. */
function rock(r: Raster, seed: number): void {
  const count = 8 + (seed % 4);
  const rx = r.w / 2;
  const ry = r.h / 2;
  const corners: Point[] = [];
  for (let i = 0; i < count; i += 1) {
    const turns = (i + hash01(i, 5, seed) * 0.6) / count;
    const sin = turnSin(turns);
    // Radius pulled in by up to 25 %; the bottom half stays wide so the rock sits on the ground.
    const pull = 1 - 0.25 * hash01(i, 6, seed);
    const radius = sin > 0.3 ? Math.max(pull, 0.95) : pull;
    corners.push([rx + rx * radius * turnCos(turns), ry + ry * radius * sin]);
  }
  const outline = roughenPolygon(corners, 0.5, seed);
  const facetW = Math.max(6, Math.round(r.w / 3.5));
  const facetH = Math.max(5, Math.round(r.h / 3));
  r.each((x, y) => {
    if (!insidePolygon(outline, x + 0.5, y + 0.5)) return 0;
    const c = cellular(x, y, facetW, facetH, seed);
    const v = y / r.h;
    let tone: number = v < 0.3 ? SLOT.bodyLight : v < 0.7 ? SLOT.body : SLOT.bodyDark;
    if (c.d2 - c.d1 < 0.9) return c.id1 % 3 === 0 ? SLOT.deep : c.dy < 0 ? lighter(tone) : SLOT.shadow;
    // Each facet tilts towards or away from the light.
    const tilt = c.id1 % 3;
    if (tilt === 0) tone = lighter(tone);
    else if (tilt === 2) tone = darker(tone);
    const lean = (c.dx + c.dy) / (facetW + facetH);
    if (lean < -0.3) return lighter(tone);
    return tone;
  });
}

/** Fluted column: a capital (slab and cushion) on top, a fluted shaft, a stepped base. */
function pillar(r: Raster): void {
  const { w, h } = r;
  const inset = Math.max(1, Math.round(w / 8));
  const capital = Math.max(3, Math.round(h * 0.09));
  const base = Math.max(3, Math.round(h * 0.07));
  r.each((x, y) => {
    if (y < 2) return y === 0 ? SLOT.bodyLight : SLOT.body; // abacus slab
    if (y < capital) {
      const cushion = Math.round(((y - 2) * inset) / Math.max(1, capital - 2));
      if (x < cushion || x >= w - cushion) return 0;
      return y === capital - 1 ? SLOT.shadow : cylinder((x - cushion) / (w - 2 * cushion));
    }
    if (y >= h - 2) return y === h - 2 ? SLOT.bodyLight : SLOT.bodyDark; // plinth
    if (y >= h - base) {
      if (x < inset / 2 || x >= w - inset / 2) return 0;
      return y === h - base ? SLOT.bodyLight : cylinder(x / w);
    }
    if (x < inset || x >= w - inset) return 0;
    const u = (x - inset) / (w - 2 * inset);
    const flute = (x - inset) % 3;
    const tone = cylinder(u);
    if (flute === 2) return tone === SLOT.highlight ? SLOT.body : SLOT.shadow;
    // A carved ring a quarter down the shaft.
    const ring = y - capital === Math.round((h - capital - base) / 4);
    return ring ? SLOT.accent : tone;
  });
}

/** Brick wall: 8 × 4 px bricks in running bond with dark mortar; some bricks a shade darker. */
function brickWall(r: Raster): void {
  r.each((x, y) => {
    const row = Math.floor(y / 4);
    const shifted = x + (row % 2 === 0 ? 0 : 4);
    const by = y % 4;
    const bx = shifted % 8;
    if (by === 3 || bx === 7) return SLOT.deep;
    const dark = hash3(Math.floor(shifted / 8), row, 97) % 5 === 0;
    if (by === 0) return dark ? SLOT.body : SLOT.bodyLight;
    if (bx === 6) return SLOT.bodyDark;
    return dark ? SLOT.bodyDark : SLOT.body;
  });
}

/** Staircase rising to the right (flip: to the left): stone blocks, one per step and course. */
function steps(r: Raster): void {
  const { w, h } = r;
  const count = Math.max(1, Math.min(Math.floor(h / 4), Math.floor(w / 2)));
  const rise = h / count;
  const run = w / count;
  r.each((x, y) => {
    const step = Math.min(count - 1, Math.floor(x / run));
    const top = Math.round(h - (step + 1) * rise);
    if (y < top) return 0;
    const course = Math.floor((h - 1 - y) / rise);
    const blockLeft = Math.round(Math.floor(x / run) * run);
    const joint = Math.round((course + 1) * rise);
    if (h - y === joint && y !== top) return SLOT.deep;
    if (x === blockLeft && x !== 0) return SLOT.deep;
    if (x === blockLeft + 1 || h - y === joint - 1) return SLOT.bodyLight;
    return SLOT.body;
  });
}

/** Ramp: a solid wedge rising to the right (flip: to the left), in the style's own texture. */
function ramp(r: Raster): void {
  r.each((x, y) => (y >= Math.round(r.h - ((x + 1) * r.h) / r.w) ? HINT_NATURAL : 0));
}

/** Arch: a masonry wall with a round opening, voussoir stones and a keystone. */
function arch(r: Raster): void {
  const { w, h } = r;
  const pier = Math.max(4, Math.round(w * 0.2));
  const crown = Math.max(6, Math.round(h * 0.3));
  const rx = (w - 2 * pier) / 2;
  const ry = h - crown;
  const cx = w / 2;
  const ring = 5;
  const stones = Math.max(5, Math.round((rx + ry) / 4)) | 1;
  r.each((x, y) => {
    const dx = (x + 0.5 - cx) / rx;
    const dy = (y + 0.5 - h) / ry;
    const inner = dx * dx + dy * dy;
    if (inner < 1) return 0;
    const ox = (x + 0.5 - cx) / (rx + ring);
    const oy = (y + 0.5 - h) / (ry + ring);
    if (ox * ox + oy * oy < 1 && y < h) {
      // Voussoirs: the "diamond angle" picks the stone without trigonometry.
      const t = dx / (Math.abs(dx) + Math.abs(dy));
      const stone = Math.floor(((t + 1) / 2) * stones);
      const tNext = (dx + 1 / rx) / (Math.abs(dx + 1 / rx) + Math.abs(dy));
      if (Math.floor(((tNext + 1) / 2) * stones) !== stone) return SLOT.deep;
      if (stone === (stones - 1) / 2) return SLOT.accent;
      return inner < 1.25 ? SLOT.bodyLight : SLOT.body;
    }
    const row = Math.floor(y / 6);
    const shifted = x + (row % 2 === 0 ? 0 : 6);
    if (y % 6 === 5 || shifted % 12 === 11) return SLOT.deep;
    if (y % 6 === 0) return SLOT.bodyLight;
    return SLOT.bodyDark;
  });
}

/** Crystal cluster: 3 to 5 pointed hexagonal shards from one base, lit on the left. */
function crystal(r: Raster, seed: number): void {
  const { w, h } = r;
  const count = 3 + (seed % 3);
  const shards: { points: Point[]; ridgeX: (y: number) => number }[] = [];
  for (let i = 0; i < count; i += 1) {
    const centre = w * (0.2 + (0.6 * (i + 0.5)) / count) + (hash01(i, 1, seed) - 0.5) * w * 0.1;
    const half = Math.max(2, w * (0.09 + 0.06 * hash01(i, 2, seed)));
    // The middle shard is the tallest.
    const middle = 1 - Math.abs(i - (count - 1) / 2) / count;
    const height = h * (0.45 + 0.55 * middle * (0.75 + 0.25 * hash01(i, 3, seed)));
    const tilt = (centre - w / 2) * 0.5;
    const tipX = centre + tilt;
    const tipY = h - height;
    const shoulder = h - height * 0.72;
    const points: Point[] = [
      [centre - half, h],
      [centre - half + tilt * 0.75, shoulder],
      [tipX, tipY],
      [centre + half + tilt * 0.75, shoulder],
      [centre + half, h],
    ];
    shards.push({ points, ridgeX: (y) => centre + ((h - y) / height) * tilt });
  }
  // Back to front: the tallest shard first, the outer ones in front of it.
  const order = shards.map((_, i) => i).sort((a, b) => Math.abs(a - (count - 1) / 2) - Math.abs(b - (count - 1) / 2));
  for (const index of order) {
    const shard = shards[index];
    /* v8 ignore next -- the index comes from the same list */
    if (shard === undefined) continue;
    r.each((x, y) => {
      const cx = x + 0.5;
      const cy = y + 0.5;
      if (!insidePolygon(shard.points, cx, cy)) return 0;
      const edge = !insidePolygon(shard.points, cx - 1, cy) || !insidePolygon(shard.points, cx + 1, cy);
      const ridge = shard.ridgeX(cy);
      if (Math.abs(cx - ridge) < 0.6) return HINT_FIXED | SLOT.highlight;
      if (edge) return HINT_FIXED | (cx < ridge ? SLOT.accentLight : SLOT.deep);
      return HINT_FIXED | (cx < ridge ? SLOT.accentLight : SLOT.accent);
    });
  }
}

/** Girder: a riveted steel-look beam with flanges and round lightening holes in the web. */
function girder(r: Raster): void {
  const { w, h } = r;
  const flange = h >= 6 ? 2 : 1;
  const web = h - 2 * flange;
  const radius = (web - 1) / 2;
  const spacing = Math.max(4, web + 3);
  r.each((x, y) => {
    if (y < flange || y >= h - flange) {
      const top = y < flange;
      const rivet = x % 4 === 2 && (top ? y === flange - 1 : y === h - flange);
      if (rivet) return SLOT.highlight;
      return top ? (y === 0 ? SLOT.bodyLight : SLOT.body) : SLOT.bodyDark;
    }
    if (web >= 3 && x >= 2 && x < w - 2) {
      const hx = (x % spacing) - (spacing - 1) / 2;
      const hy = y - flange - (web - 1) / 2;
      const d = hx * hx + hy * hy;
      if (d <= radius * radius) return 0;
      if (d <= (radius + 1) * (radius + 1)) return hy < 0 ? SLOT.shadow : SLOT.bodyLight;
    }
    return SLOT.bodyDark;
  });
}

/** Stalactite: a tapering cone hanging from its top edge, with growth rings. */
function stalactite(r: Raster, seed: number): void {
  const { w, h } = r;
  r.each((x, y) => {
    const t = y / h;
    const half = (w / 2) * (1 - t) * (1 + 0.35 * t) + (hash01(y >> 2, 4, seed) - 0.5) * (1 - t) * 2;
    const centre = w / 2 + (hash01(0, 5, seed) - 0.5) * t * w * 0.3;
    const u = (x + 0.5 - (centre - half)) / (2 * half);
    if (u < 0 || u >= 1) return 0;
    if ((y + (seed % 5)) % 7 === 0) return SLOT.bodyDark;
    return cylinder(u);
  });
}

/** Stalagmite: a stalactite standing on the ground. */
function stalagmite(r: Raster, seed: number): void {
  const hanging = new Raster(r.w, r.h);
  stalactite(hanging, seed);
  r.each((x, y) => hanging.get(x, r.h - 1 - y));
}

/** Tuft: a bush of grass blades on a small mound, in the style's surface colours. */
function tuft(r: Raster, seed: number): void {
  const { w, h } = r;
  const mound = Math.max(2, Math.round(h / 3));
  r.each((x, y) => {
    const u = (x + 0.5) / w - 0.5;
    const moundTop = h - mound * (1 - 4 * u * u);
    if (y >= moundTop) return HINT_FIXED | (y >= h - 1 ? SLOT.topDark : SLOT.top);
    // Blades: every other column, taller in the middle, leaning outwards at the tips.
    const lean = u < 0 ? 1 : -1;
    const column = x + (y < h * 0.4 ? lean : 0);
    if (column % 2 !== seed % 2) return 0;
    const tall = h * (1 - 2.2 * u * u) * (0.6 + 0.4 * hash01(column, 6, seed));
    if (y < h - tall) return 0;
    return HINT_FIXED | (y < h - tall + 2 ? SLOT.topLight : SLOT.top);
  });
}

/** Slab: a dressed stone slab with bevelled edges and joints every 24 px. */
function slab(r: Raster): void {
  const { w, h } = r;
  r.each((x, y) => {
    if (y === 1) return SLOT.bodyLight;
    if (y === h - 2) return SLOT.bodyDark;
    if (x % 24 === 23 && x < w - 1) return SLOT.deep;
    if (x === 0 || x % 24 === 0) return SLOT.bodyLight;
    if (x === w - 1 || x % 24 === 22) return SLOT.bodyDark;
    return SLOT.body;
  });
}

/** Log: a round wooden beam with grain lines, a knot and end grain rings at both ends. */
function log(r: Raster, seed: number): void {
  const { w, h } = r;
  const knot = 6 + (seed % Math.max(1, w - 12));
  r.each((x, y) => {
    const v = (y + 0.5) / h;
    const end = Math.min(x, w - 1 - x);
    if (end < 2) {
      const ring = Math.floor(Math.abs(v - 0.5) * h + end) % 2;
      return ring === 0 ? SLOT.accentLight : SLOT.accent;
    }
    if (Math.abs(x - knot) <= 1 && Math.abs(v - 0.55) < 0.2) return SLOT.deep;
    const grain = hash3(Math.floor(x / 9), y, seed) % 3 === 0;
    const tone = v < 0.25 ? SLOT.bodyLight : v < 0.7 ? SLOT.body : SLOT.bodyDark;
    return grain ? (tone === SLOT.bodyLight ? SLOT.body : SLOT.shadow) : tone;
  });
}

/** Chain: hanging links, alternately seen face-on (ring with a hole) and edge-on (bar). */
function chain(r: Raster): void {
  const { w } = r;
  const linkH = 8;
  const half = (w - 1) / 2;
  r.each((x, y) => {
    const link = Math.floor(y / (linkH - 2));
    const ly = y - link * (linkH - 2);
    const dx = x - half;
    if (link % 2 === 0) {
      const ex = dx / (w / 2);
      const ey = (ly + 0.5 - linkH / 2) / (linkH / 2);
      const outer = ex * ex + ey * ey;
      if (outer > 1) return 0;
      const ix = dx / Math.max(0.5, w / 2 - 2);
      const iy = (ly + 0.5 - linkH / 2) / (linkH / 2 - 2);
      if (ix * ix + iy * iy < 1) return 0;
      return HINT_FIXED | (dx < 0 ? SLOT.accentLight : dx > 0.5 ? SLOT.deep : SLOT.accent);
    }
    if (Math.abs(dx) > 1) return 0;
    return HINT_FIXED | (dx < 0 ? SLOT.accentLight : SLOT.accent);
  });
}

export const PIECES: Readonly<Record<string, PieceDefinition>> = {
  rock: { w: 48, h: 32, draw: rock },
  pillar: { w: 16, h: 64, draw: pillar },
  brickWall: { w: 48, h: 32, draw: brickWall },
  steps: { w: 48, h: 32, draw: steps },
  ramp: { w: 48, h: 24, draw: ramp },
  arch: { w: 64, h: 40, draw: arch },
  crystal: { w: 40, h: 40, draw: crystal },
  girder: { w: 64, h: 8, draw: girder },
  stalactite: { w: 16, h: 40, draw: stalactite },
  stalagmite: { w: 16, h: 40, draw: stalagmite },
  tuft: { w: 16, h: 8, draw: tuft },
  slab: { w: 48, h: 8, draw: slab },
  log: { w: 48, h: 8, draw: log },
  chain: { w: 6, h: 40, draw: chain },
};

export const PIECE_NAMES: readonly string[] = Object.keys(PIECES);

/** Draw a piece at its size; `flip` mirrors it left to right. Throws on an unknown name. */
export function renderPiece(name: string, w: number | undefined, h: number | undefined, seed: number, flip: boolean): PieceRaster {
  const definition = PIECES[name];
  if (definition === undefined) throw new Error(`unknown piece ${name}`);
  const raster = new Raster(w ?? definition.w, h ?? definition.h);
  definition.draw(raster, seed);
  if (!flip) return raster;
  const mirrored = new Raster(raster.w, raster.h);
  mirrored.each((x, y) => raster.get(raster.w - 1 - x, y));
  return mirrored;
}
