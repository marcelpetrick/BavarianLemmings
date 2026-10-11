// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { frame, type Animation } from '../pixelArt';

/**
 * Panel button icons (vision V-03), 16 × 16 pixels, one frame each, anchor at the top-left.
 * The skill icons show a lemming pose from `lemmings.ts`; the others are symbols. Drawn by us.
 */
export type IconName =
  | 'climber'
  | 'floater'
  | 'bomber'
  | 'blocker'
  | 'builder'
  | 'basher'
  | 'miner'
  | 'digger'
  | 'pause'
  | 'nuke'
  | 'releaseMinus'
  | 'releasePlus'
  | 'fastForward'
  | 'restart';

/** The eight skills, in panel order. */
export const SKILL_ICON_NAMES = [
  'climber',
  'floater',
  'bomber',
  'blocker',
  'builder',
  'basher',
  'miner',
  'digger',
] as const satisfies readonly IconName[];

export const ICONS: Readonly<Record<IconName, Animation>> = {
  /** Climber: a lemming on a wall. */
  climber: {
    width: 16,
    height: 16,
    anchorX: 0,
    anchorY: 0,
    loop: false,
    frames: [
      frame([
        '................',
        '................',
        '.........S......',
        '..........S.....',
        '......HHHCB.....',
        '.....HHHHSB.....',
        '.....HHSSSB.....',
        '......SSS.B.....',
        '......BBBB......',
        '.....BBBB.......',
        '.....BBBB.......',
        '......BBBB......',
        '........C.B.....',
        '.........C......',
        '................',
        '................',
      ]),
    ],
  },
  /** Floater: a lemming under an open umbrella. */
  floater: {
    width: 16,
    height: 16,
    anchorX: 0,
    anchorY: 0,
    loop: false,
    frames: [
      frame([
        '........T.......',
        '......WWRR......',
        '....RWWWRRRW....',
        '..RRRWWWRRRWWW..',
        '..R.RW.WR.RW.W..',
        '........T.......',
        '......HHH.......',
        '.....HHHHS......',
        '.....HHSSS......',
        '......SSB.......',
        '......BBB.......',
        '.....BBBB.......',
        '....SBBBB.......',
        '......BBB.......',
        '......CB........',
        '......CB........',
      ]),
    ],
  },
  /** Bomber: a round bomb with a burning fuse. */
  bomber: {
    width: 16,
    height: 16,
    anchorX: 0,
    anchorY: 0,
    loop: false,
    frames: [
      frame([
        '..........YOY...',
        '..........PT.R..',
        '.........P..Y...',
        '......GGP.......',
        '......GGG.......',
        '....GGGGGGG.....',
        '...GGGWGGGGG....',
        '...GGWGGGGGG....',
        '..GGGWGGGGGGG...',
        '..GGGGGGGGGGG...',
        '..GGGGGGGGGGG...',
        '...GGGGGGGGG....',
        '...GGGGGGGGG....',
        '....GGGGGGG.....',
        '......GGG.......',
        '................',
      ]),
    ],
  },
  /** Blocker: arms out, feet apart. */
  blocker: {
    width: 16,
    height: 16,
    anchorX: 0,
    anchorY: 0,
    loop: false,
    frames: [
      frame([
        '................',
        '................',
        '................',
        '.......HHH......',
        '......HHHHH.....',
        '......HSSSH.....',
        '.......SSS......',
        '.......BBB......',
        '...SCCBBBBBBS...',
        '......BBBB......',
        '.......BBB......',
        '......C..B......',
        '.....C....B.....',
        '................',
        '................',
        '................',
      ]),
    ],
  },
  /** Builder: laying a brick. */
  builder: {
    width: 16,
    height: 16,
    anchorX: 0,
    anchorY: 0,
    loop: false,
    frames: [
      frame([
        '................',
        '................',
        '................',
        '................',
        '.....HHH........',
        '....HHHHS.......',
        '....HHSSS.......',
        '.....SSS........',
        '....BBB.........',
        '...BBBB.........',
        '....BBB...STT...',
        '...C...B........',
        '................',
        '................',
        '................',
        '................',
      ]),
    ],
  },
  /** Basher: a punch forward. */
  basher: {
    width: 16,
    height: 16,
    anchorX: 0,
    anchorY: 0,
    loop: false,
    frames: [
      frame([
        '................',
        '................',
        '................',
        '.....HHH........',
        '....HHHHS.......',
        '....HHSSS.......',
        '.....SSS........',
        '.....BBB........',
        '....BBBBBBBBS...',
        '...SBBBB........',
        '.....BBB........',
        '....C.B.........',
        '...C...B........',
        '................',
        '................',
        '................',
      ]),
    ],
  },
  /** Miner: the pickaxe strikes down and forward. */
  miner: {
    width: 16,
    height: 16,
    anchorX: 0,
    anchorY: 0,
    loop: false,
    frames: [
      frame([
        '................',
        '................',
        '................',
        '.....HHH........',
        '....HHHHS.......',
        '....HHSSS.......',
        '.....SSS........',
        '....BBBB........',
        '...BBBB.ST..T...',
        '....BBB...TTY...',
        '....C.B.....T...',
        '...C...B...Y....',
        '................',
        '................',
        '................',
        '................',
      ]),
    ],
  },
  /** Digger: the shovel pushed into the ground. */
  digger: {
    width: 16,
    height: 16,
    anchorX: 0,
    anchorY: 0,
    loop: false,
    frames: [
      frame([
        '................',
        '................',
        '................',
        '......HHH.......',
        '.....HHHHH......',
        '.....HSSSH......',
        '......SSS.......',
        '......BTB.......',
        '.....CSTB.......',
        '......BTS.......',
        '.....C.TB.......',
        '.....C.TB.......',
        '................',
        '................',
        '................',
        '................',
      ]),
    ],
  },
  /** Pause: two paw prints. */
  pause: {
    width: 16,
    height: 16,
    anchorX: 0,
    anchorY: 0,
    loop: false,
    frames: [
      frame([
        '................',
        '................',
        '..........W.W...',
        '..........W.W...',
        '........W.....W.',
        '........W.....W.',
        '...W.W...WWWWW..',
        '...W.W...WWWWW..',
        '.W.....W.WWWWW..',
        '.W.....W..WWW...',
        '..WWWWW.........',
        '..WWWWW.........',
        '..WWWWW.........',
        '...WWW..........',
        '................',
        '................',
      ]),
    ],
  },
  /** Nuke: a mushroom cloud. */
  nuke: {
    width: 16,
    height: 16,
    anchorX: 0,
    anchorY: 0,
    loop: false,
    frames: [
      frame([
        '................',
        '.....RRRRRR.....',
        '...RROOOOOORR...',
        '...ROOOYYOOOR...',
        '..RROYYYYYYORR..',
        '..ROOYYYYYYOOR..',
        '..RROYYYYYYORR..',
        '...RRRRRRRRRR...',
        '......OYOO......',
        '......OYOO......',
        '......OYOO......',
        '......OYOO......',
        '......OYOO......',
        '...RRRRRRRRRR...',
        '..OOOOOOOOOOOO..',
        '.RRRRRRRRRRRRRR.',
      ]),
    ],
  },
  /** Release rate down. */
  releaseMinus: {
    width: 16,
    height: 16,
    anchorX: 0,
    anchorY: 0,
    loop: false,
    frames: [
      frame([
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '...WWWWWWWWWW...',
        '...WWWWWWWWWW...',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
      ]),
    ],
  },
  /** Release rate up. */
  releasePlus: {
    width: 16,
    height: 16,
    anchorX: 0,
    anchorY: 0,
    loop: false,
    frames: [
      frame([
        '................',
        '................',
        '................',
        '.......WW.......',
        '.......WW.......',
        '.......WW.......',
        '.......WW.......',
        '...WWWWWWWWWW...',
        '...WWWWWWWWWW...',
        '.......WW.......',
        '.......WW.......',
        '.......WW.......',
        '.......WW.......',
        '................',
        '................',
        '................',
      ]),
    ],
  },
  /** Fast forward: two arrow heads. */
  fastForward: {
    width: 16,
    height: 16,
    anchorX: 0,
    anchorY: 0,
    loop: false,
    frames: [
      frame([
        '................',
        '................',
        '................',
        '..W.....W.......',
        '..WW....WW......',
        '..WWW...WWW.....',
        '..WWWW..WWWW....',
        '..WWWWWWWWWWWW..',
        '..WWWWWWWWWWWW..',
        '..WWWW..WWWW....',
        '..WWW...WWW.....',
        '..WW....WW......',
        '..W.....W.......',
        '................',
        '................',
        '................',
      ]),
    ],
  },
  /** Restart the level: a circular arrow. */
  restart: {
    width: 16,
    height: 16,
    anchorX: 0,
    anchorY: 0,
    loop: false,
    frames: [
      frame([
        '................',
        '................',
        '................',
        '.....WWWW.......',
        '....WWWWW.......',
        '...WWW....WWWWWW',
        '...WW......WWWW.',
        '..WWW......WWW..',
        '..WW........WW..',
        '..WWW......WWW..',
        '...WW......WW...',
        '...WWW....WWW...',
        '....WWWWWWWW....',
        '.....WWWWWW.....',
        '................',
        '................',
      ]),
    ],
  },
};
