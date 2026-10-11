// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The level format (vision L-03, architecture.md 8): a versioned, human-readable JSON record.
 *
 * Terrain is built from our own shapes, drawn in order (later shapes paint over earlier ones, erase
 * shapes cut holes). No original level data is read (vision X-02).
 */
import { LEMMING_CAP, LEVEL_HEIGHT, LEVEL_MAX_WIDTH, RELEASE_RATE_MAX, RELEASE_RATE_MIN, SKILL_COUNT_MAX } from './constants';
import { SKILLS, type SkillCounts } from './skills';
import {
  COLOR_STEEL,
  ONE_WAY_LEFT,
  ONE_WAY_RIGHT,
  SOLID,
  STEEL,
  createTerrain,
  erasePixel,
  flagsAt,
  setPixel,
  type Terrain,
} from './terrain';

export const LEVEL_FORMAT_VERSION = 1;

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export type TerrainShape =
  | (Rect & { readonly shape: 'rect' | 'ellipse'; readonly erase?: boolean })
  | { readonly shape: 'polygon'; readonly points: readonly (readonly [number, number])[]; readonly erase?: boolean };

export type LevelObject =
  | { readonly type: 'hatch' | 'exit'; readonly x: number; readonly y: number }
  | (Rect & { readonly type: 'water' })
  | (Rect & { readonly type: 'trap'; readonly kind: string });

export interface LevelData {
  readonly version: number;
  readonly id: string;
  /** i18n key of the level name (vision L-06). */
  readonly name: string;
  /** Which original level the puzzle recreates, in our words (plan assumptions, Q-D8). */
  readonly inspiredBy: string;
  readonly rating: 'fun' | 'tricky' | 'taxing' | 'mayhem' | 'test';
  readonly width: number;
  readonly height: number;
  readonly lemmings: number;
  readonly toSave: number;
  readonly releaseRate: number;
  readonly timeSeconds: number;
  readonly skills: SkillCounts;
  /** Terrain style; the theme decides its colours (vision V-07). */
  readonly style: string;
  /** Initial horizontal scroll position of the view, in level pixels. */
  readonly startX: number;
  readonly terrain: readonly TerrainShape[];
  readonly steel: readonly Rect[];
  readonly oneWay: readonly (Rect & { readonly dir: 'left' | 'right' })[];
  readonly objects: readonly LevelObject[];
}

const RATINGS = ['fun', 'tricky', 'taxing', 'mayhem', 'test'];

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isInt(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

function checkRect(value: Json, path: string, errors: string[]): void {
  for (const key of ['x', 'y'])
    if (!isInt(value[key], -LEVEL_MAX_WIDTH, LEVEL_MAX_WIDTH * 2)) errors.push(`${path}.${key}: integer expected`);
  for (const key of ['w', 'h']) if (!isInt(value[key], 1, LEVEL_MAX_WIDTH)) errors.push(`${path}.${key}: positive integer expected`);
}

function checkShape(shape: unknown, path: string, errors: string[]): void {
  if (!isObject(shape)) {
    errors.push(`${path}: object expected`);
    return;
  }
  if (shape.erase !== undefined && typeof shape.erase !== 'boolean') errors.push(`${path}.erase: boolean expected`);
  if (shape.shape === 'rect' || shape.shape === 'ellipse') {
    checkRect(shape, path, errors);
    return;
  }
  if (shape.shape !== 'polygon') {
    errors.push(`${path}.shape: rect, ellipse or polygon expected`);
    return;
  }
  const points = shape.points;
  if (!Array.isArray(points) || points.length < 3) {
    errors.push(`${path}.points: at least three points expected`);
    return;
  }
  for (const [j, point] of (points as unknown[]).entries()) {
    if (!Array.isArray(point) || point.length !== 2 || !point.every((n) => isInt(n, -LEVEL_MAX_WIDTH, LEVEL_MAX_WIDTH * 2))) {
      errors.push(`${path}.points[${j}]: [x, y] expected`);
    }
  }
}

/** Validate parsed JSON against the level format. Returns a list of errors; empty means valid. */
export function validateLevel(data: unknown): string[] {
  const errors: string[] = [];
  if (!isObject(data)) return ['level: object expected'];
  if (data.version !== LEVEL_FORMAT_VERSION) errors.push(`version: ${LEVEL_FORMAT_VERSION} expected`);
  for (const key of ['id', 'name', 'inspiredBy', 'style'])
    if (typeof data[key] !== 'string' || data[key] === '') errors.push(`${key}: text expected`);
  if (!RATINGS.includes(data.rating as string)) errors.push(`rating: one of ${RATINGS.join(', ')} expected`);
  if (!isInt(data.width, 320, LEVEL_MAX_WIDTH)) errors.push(`width: 320..${LEVEL_MAX_WIDTH} expected`);
  if (data.height !== LEVEL_HEIGHT) errors.push(`height: ${LEVEL_HEIGHT} expected`);
  if (!isInt(data.lemmings, 1, LEMMING_CAP)) errors.push(`lemmings: 1..${LEMMING_CAP} expected`);
  if (!isInt(data.toSave, 0, typeof data.lemmings === 'number' ? data.lemmings : LEMMING_CAP)) errors.push('toSave: 0..lemmings expected');
  if (!isInt(data.releaseRate, RELEASE_RATE_MIN, RELEASE_RATE_MAX)) errors.push('releaseRate: 1..99 expected');
  if (!isInt(data.timeSeconds, 1, 99 * 60)) errors.push('timeSeconds: 1..5940 expected');
  if (!isInt(data.startX, 0, LEVEL_MAX_WIDTH)) errors.push('startX: integer expected');
  if (isObject(data.skills)) {
    for (const skill of SKILLS)
      if (!isInt(data.skills[skill], 0, SKILL_COUNT_MAX)) errors.push(`skills.${skill}: 0..${SKILL_COUNT_MAX} expected`);
  } else errors.push('skills: object expected');
  const lists = ['terrain', 'steel', 'oneWay', 'objects'];
  for (const key of lists) if (!Array.isArray(data[key])) errors.push(`${key}: list expected`);
  if (errors.length > 0) return errors;

  for (const [i, shape] of (data.terrain as unknown[]).entries()) checkShape(shape, `terrain[${i}]`, errors);
  for (const [i, rect] of (data.steel as unknown[]).entries()) {
    if (isObject(rect)) checkRect(rect, `steel[${i}]`, errors);
    else errors.push(`steel[${i}]: object expected`);
  }
  for (const [i, rect] of (data.oneWay as unknown[]).entries()) {
    if (!isObject(rect)) {
      errors.push(`oneWay[${i}]: object expected`);
      continue;
    }
    checkRect(rect, `oneWay[${i}]`, errors);
    if (rect.dir !== 'left' && rect.dir !== 'right') errors.push(`oneWay[${i}].dir: left or right expected`);
  }
  let hatches = 0;
  let exits = 0;
  for (const [i, object] of (data.objects as unknown[]).entries()) {
    const path = `objects[${i}]`;
    if (!isObject(object)) {
      errors.push(`${path}: object expected`);
      continue;
    }
    if (object.type === 'hatch' || object.type === 'exit') {
      if (object.type === 'hatch') hatches += 1;
      else exits += 1;
      if (!isInt(object.x, 0, LEVEL_MAX_WIDTH) || !isInt(object.y, 0, LEVEL_HEIGHT))
        errors.push(`${path}: x and y inside the level expected`);
    } else if (object.type === 'water') {
      checkRect(object, path, errors);
    } else if (object.type === 'trap') {
      checkRect(object, path, errors);
      if (typeof object.kind !== 'string') errors.push(`${path}.kind: text expected`);
    } else {
      errors.push(`${path}.type: hatch, exit, water or trap expected`);
    }
  }
  if (hatches < 1) errors.push('objects: at least one hatch expected');
  if (exits < 1) errors.push('objects: at least one exit expected');
  return errors;
}

/** Validate and return the typed level, or throw with every error listed. */
export function parseLevel(data: unknown): LevelData {
  const errors = validateLevel(data);
  if (errors.length > 0) throw new Error(`invalid level: ${errors.join('; ')}`);
  return data as LevelData;
}

function insidePolygon(points: readonly (readonly [number, number])[], x: number, y: number): boolean {
  let inside = false;
  let previous = points[points.length - 1];
  for (const point of points) {
    if (previous === undefined) break;
    const [xi, yi] = point;
    const [xj, yj] = previous;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    previous = point;
  }
  return inside;
}

function shapeBounds(shape: TerrainShape): Rect {
  if (shape.shape !== 'polygon') return shape;
  const xs = shape.points.map((p) => p[0]);
  const ys = shape.points.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x + 1, h: Math.max(...ys) - y + 1 };
}

function shapeContains(shape: TerrainShape, x: number, y: number): boolean {
  if (shape.shape === 'rect') return true;
  if (shape.shape === 'polygon') return insidePolygon(shape.points, x + 0.5, y + 0.5);
  const rx = shape.w / 2;
  const ry = shape.h / 2;
  const dx = (x + 0.5 - (shape.x + rx)) / rx;
  const dy = (y + 0.5 - (shape.y + ry)) / ry;
  return dx * dx + dy * dy <= 1;
}

/**
 * Terrain shade for a pixel: a fixed pattern (not random, G-12) of slots 1..3, and slot 4 on top
 * edges so the surface reads as grass or rim in every theme.
 */
function terrainShade(x: number, y: number): number {
  const hash = Math.imul(x * 374761393 + y * 668265263, 1274126177) >>> 0;
  return 1 + ((hash >>> 13) % 3);
}

/** Build the terrain of a level from its shapes, steel areas and one-way areas. */
export function buildTerrain(level: LevelData): Terrain {
  const terrain = createTerrain(level.width, level.height);
  for (const shape of level.terrain) {
    const bounds = shapeBounds(shape);
    for (let y = bounds.y; y < bounds.y + bounds.h; y += 1) {
      for (let x = bounds.x; x < bounds.x + bounds.w; x += 1) {
        if (!shapeContains(shape, x, y)) continue;
        if (shape.erase === true) erasePixel(terrain, x, y);
        else setPixel(terrain, x, y, SOLID, terrainShade(x, y));
      }
    }
  }
  for (const rect of level.steel) {
    for (let y = rect.y; y < rect.y + rect.h; y += 1) {
      for (let x = rect.x; x < rect.x + rect.w; x += 1) setPixel(terrain, x, y, SOLID | STEEL, COLOR_STEEL + ((x + y) % 2));
    }
  }
  for (const rect of level.oneWay) {
    const flag = rect.dir === 'left' ? ONE_WAY_LEFT : ONE_WAY_RIGHT;
    for (let y = rect.y; y < rect.y + rect.h; y += 1) {
      for (let x = rect.x; x < rect.x + rect.w; x += 1) {
        const flags = flagsAt(terrain, x, y);
        if ((flags & SOLID) !== 0 && (flags & STEEL) === 0) terrain.mask[y * terrain.width + x] = flags | flag;
      }
    }
  }
  // Top edges get slot 4.
  for (let y = 1; y < terrain.height; y += 1) {
    for (let x = 0; x < terrain.width; x += 1) {
      const index = y * terrain.width + x;
      if ((terrain.mask[index] ?? 0) === SOLID && (terrain.mask[index - terrain.width] ?? 0) === 0) terrain.colors[index] = 4;
    }
  }
  return terrain;
}
