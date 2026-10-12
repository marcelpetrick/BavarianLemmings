// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { afterEach, describe, expect, it, vi } from 'vitest';
import { Debris } from '../../src/render/debris';
import type { TextRenderer } from '../../src/render/draw';
import { PlayfieldRenderer } from '../../src/render/playfield';
import { explode } from '../../src/sim/actions/bombing';
import { BAVARIAN_THEME, CLASSIC_THEME, lemmingAnimation } from '../../src/theme/themes';
import { lemmingAt, stateWith, terrainFromArt } from '../sim/helpers';

// These drawing resources require a browser. Explosion reactions only use the pure debris engine.
vi.mock('../../src/render/draw', () => ({
  SpriteCache: class {
    draw = vi.fn();
  },
  TerrainLayer: class {
    update = vi.fn();
  },
  mountainBackdrop: () => null,
}));

afterEach(() => vi.restoreAllMocks());

describe('explosion costume pixels', () => {
  for (const theme of [CLASSIC_THEME, BAVARIAN_THEME]) {
    for (const id of [0, 1]) {
      it(`${theme.id} ID ${id} bursts into the costume that was drawn`, () => {
        const lemming = lemmingAt(12, 8, 'ohNo', 1, id);
        const state = stateWith(terrainFromArt(['....................']), [lemming]);
        explode(state, lemming);
        expect(state.events[0]?.lemmingId).toBe(id);
        const burst = vi.spyOn(Debris.prototype, 'burst');
        const renderer = new PlayfieldRenderer(theme, 320, {} as TextRenderer);
        renderer.react(state.events);
        const sprite = lemmingAnimation(theme, 'ohNo', id);
        expect(burst).toHaveBeenCalledExactlyOnceWith(
          sprite.frames.at(-1),
          sprite.anchorX,
          sprite.anchorY,
          theme.spritePalette,
          lemming.x,
          lemming.y,
        );
      });
    }
  }

  it('ignores other events and preserves the primary costume fallback for anonymous events', () => {
    const burst = vi.spyOn(Debris.prototype, 'burst');
    const renderer = new PlayfieldRenderer(BAVARIAN_THEME, 320, {} as TextRenderer);
    renderer.react([
      { type: 'spawn', x: 10, y: 20 },
      { type: 'explode', x: 10, y: 20 },
    ]);
    const sprite = BAVARIAN_THEME.lemmings.ohNo;
    expect(burst).toHaveBeenCalledExactlyOnceWith(
      sprite.frames.at(-1),
      sprite.anchorX,
      sprite.anchorY,
      BAVARIAN_THEME.spritePalette,
      10,
      20,
    );
  });
});
