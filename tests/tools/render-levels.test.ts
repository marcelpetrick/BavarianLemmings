// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Level preview tool (plan M6.127): renders levels to PNG files in plain node, so a level builder
 * can compare a layout side by side with its reference screenshot. Opt-in; a normal test run skips it.
 *
 * Usage:
 *   npm run levels:preview                          every level  -> .tools/level-previews/<id>.png
 *   BL_LEVEL=fun-05 npm run levels:preview          one level (any id prefix: BL_LEVEL=fun-1)
 *   BL_SCALE=3 BL_GRID=40 npm run levels:preview    enlarged 3 ×, guide lines every 40 px
 *   BL_THEME=bavarian npm run levels:preview        Bavarian colours and sprites
 *
 * Every preview run also writes contact-sheet-<theme>.png, with labelled whole-level views.
 * The plain black inspection background keeps collision silhouettes legible in either theme.
 * These are inspection renders; use npm run screenshots for the running browser UI.
 *   BL_RENDER_PIECES=1 npx vitest run tests/tools   the piece gallery -> docs/terrain-pieces.png
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ALL_LEVELS } from '../../src/levels';
import { TERRAIN_STYLES } from '../../src/render/palettes';
import { buildTerrain, type LevelData, type TerrainShape } from '../../src/sim/level';
import { PIECE_NAMES, PIECES } from '../../src/sim/pieces';
import { themeById } from '../../src/theme/themes';
import { Picture, drawTerrain, levelPicture } from './levelImage';
import { encodePng } from './png';

const env = process.env;
const theme = themeById(env.BL_THEME === 'bavarian' ? 'bavarian' : 'classic');
const scale = Math.max(1, Math.min(8, Number(env.BL_SCALE ?? '1') || 1));
const grid = Math.max(0, Number(env.BL_GRID ?? '0') || 0);

describe.skipIf(env.BL_RENDER_LEVELS !== '1')('level previews (BL_RENDER_LEVELS=1)', () => {
  const filter = env.BL_LEVEL ?? '';
  const levels = ALL_LEVELS.filter((level) => level.id.startsWith(filter) && (level.rating !== 'test' || filter.startsWith('test')));

  it(`renders ${levels.length} level(s) to .tools/level-previews/`, () => {
    expect(levels.length, `no level id starts with "${filter}"`).toBeGreaterThan(0);
    mkdirSync('.tools/level-previews', { recursive: true });
    const columns = Math.min(3, levels.length);
    const cellWidth = Math.max(...levels.map((level) => level.width));
    const cellHeight = Math.max(...levels.map((level) => level.height)) + 16;
    const contact = new Picture(columns * cellWidth, Math.ceil(levels.length / columns) * cellHeight);
    for (const [index, level] of levels.entries()) {
      const preview = levelPicture(level, buildTerrain(level), theme, grid);
      const picture = preview.scaled(scale);
      const column = index % columns;
      const row = Math.floor(index / columns);
      contact.text(level.id, column * cellWidth + 4, row * cellHeight + 4, '#f8f8f8');
      contact.blit(preview.data, preview.width, preview.height, column * cellWidth, row * cellHeight + 16);
      const path = `.tools/level-previews/${level.id}${theme.id === 'classic' ? '' : `-${theme.id}`}.png`;
      writeFileSync(path, encodePng(picture.width, picture.height, picture.data));
      console.log(`wrote ${path}`);
    }
    const sheet = contact.scaled(scale);
    writeFileSync(`.tools/level-previews/contact-sheet-${theme.id}.png`, encodePng(sheet.width, sheet.height, sheet.data));
  });
});

/** The gallery's extra entries next to the pieces: blob and craggy polygon, at fixed seeds. */
function galleryShapes(x: number, cell: number): { label: string; shape: TerrainShape }[] {
  const p = x + cell;
  return [
    { label: 'blob', shape: { shape: 'blob', x: x + 4, y: 28, w: cell - 8, h: 44, rough: 0.6, seed: 7 } },
    {
      label: 'polygon',
      shape: {
        shape: 'polygon',
        points: [
          [p + 4, 72],
          [p + 20, 26],
          [p + 44, 34],
          [p + cell - 6, 72],
        ],
        rough: 1,
        seed: 3,
      },
    },
  ];
}

describe.skipIf(env.BL_RENDER_PIECES !== '1')('piece gallery (BL_RENDER_PIECES=1)', () => {
  it('renders every shape and piece in every terrain style to docs/terrain-pieces.png', () => {
    const cell = 72;
    const rowHeight = 76;
    const columns = PIECE_NAMES.length + 2;
    const header = 12;
    const picture = new Picture(80 + columns * cell, header + TERRAIN_STYLES.length * rowHeight);
    TERRAIN_STYLES.forEach((style, row) => {
      const top = header + row * rowHeight;
      picture.text(style, 4, top + 34, '#f8f8f8');
      const terrain: TerrainShape[] = [];
      PIECE_NAMES.forEach((name, column) => {
        const definition = PIECES[name];
        if (definition === undefined) return;
        const x = 80 + column * cell;
        const w = Math.min(definition.w, cell - 8);
        terrain.push({ shape: 'piece', piece: name, x: x + Math.floor((cell - w) / 2), y: rowHeight - 4 - definition.h, w, seed: 5 });
        if (row === 0) picture.text(name.slice(0, 11), x + 2, 2, '#f8a020');
      });
      galleryShapes(80 + PIECE_NAMES.length * cell, cell).forEach(({ label, shape }, index) => {
        terrain.push(shape);
        if (row === 0) picture.text(label, 80 + (PIECE_NAMES.length + index) * cell + 2, 2, '#f8a020');
      });
      const level = { width: picture.width, height: rowHeight, style, terrain, steel: [], oneWay: [] } as unknown as LevelData;
      drawTerrain(picture, buildTerrain(level), theme, style, 0, top);
    });
    const out = picture.scaled(scale);
    writeFileSync('docs/terrain-pieces.png', encodePng(out.width, out.height, out.data));
  });
});
