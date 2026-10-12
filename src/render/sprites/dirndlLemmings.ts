// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The second Bavarian costume: blond hair, a blue bodice and skirt, a white blouse and apron.
 * Dress the existing poses so every action keeps its exact anchor, timing and frame geometry.
 * The renderer selects this sheet for even IDs; simulation data never contains a costume.
 */
import { frame, type PixelFrame } from '../pixelArt';
import { BAVARIAN_LEMMING_ANIMATIONS } from './bavarianLemmings';
import { LEMMING_ANIMATION_NAMES } from './lemmings';

function dress(pose: PixelFrame): PixelFrame {
  const faceRow = pose.rows.findIndex((row) => row.includes('S'));
  return frame(
    pose.rows.map((row, y) => {
      const pixels = Array.from(row.replaceAll('N', 'H').replaceAll('C', y < faceRow ? 'H' : 'D'));
      const clothes = Array.from(row).flatMap((slot, x) => (slot === 'B' ? [x] : []));
      // Sparse pixels at the feet remain brown shoes; larger bands become the skirt and apron.
      if (y >= pose.rows.length - 2 && clothes.length <= 2) return pixels.join('');
      for (const x of clothes) pixels[x] = 'D';
      if (clothes.length >= 3) {
        const first = row.indexOf('B');
        const last = row.lastIndexOf('B');
        pixels[Math.floor((first + last) / 2)] = 'W';
        if (pixels[first - 1] === '.') pixels[first - 1] = 'D';
        if (pixels[last + 1] === '.') pixels[last + 1] = 'D';
      }
      return pixels.join('');
    }),
  );
}

export const DIRNDL_LEMMING_ANIMATIONS = { ...BAVARIAN_LEMMING_ANIMATIONS };
for (const name of LEMMING_ANIMATION_NAMES) {
  const animation = BAVARIAN_LEMMING_ANIMATIONS[name];
  DIRNDL_LEMMING_ANIMATIONS[name] = { ...animation, frames: animation.frames.map(dress) };
}
