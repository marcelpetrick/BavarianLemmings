# Layout notes: Tricky 01-30 (plan M6.130)

> Living document. Last update: 2026-10-12.
> Purpose: one traced layout per original Tricky level, so that phase B can rebuild each level
> with our own terrain toolkit (vision L-01a, owner decision Q-C1).
> Status: phase A done (research and notes). Phase B (level JSON) has not started.

## How to read this document

- **Reference image.** Each level names the full-level map on the Lemmings Wiki that was viewed.
  The images were downloaded to a session scratch folder only. They are not in the repository,
  they are not shipped, and no pixel of them is sampled (vision X-02).
- **Coordinates.** Level pixels, origin top left, x grows to the right, y grows downwards. The
  level is 160 px high. The reference maps are 1:1 with our native resolution.
- **Width.** The width of the reference map, cropped to the terrain. Use it as the level width.
- **Boxes.** `x 100-200, y 120-160` is a box from x = 100 to x = 200 and y = 120 to y = 160.
  All boxes are traced by eye from a 2x grid overlay; expect an error of about 3 px.
- **Hatch.** `hatch (x, y)` is the spawn point: the centre of the trapdoor, at its lower edge.
  This matches `objects[].type = "hatch"` in the level JSON.
- **Exit.** `exit (x, y)` is the centre of the doorway at floor level. This matches
  `objects[].type = "exit"`.
- **Element kinds.** Only the kinds of the terrain toolkit (plan M6.126) are used: `rect`,
  `ellipse`, `polygon` (optionally rough), `blob`, and the pieces `rock`, `pillar`, `brickWall`,
  `steps`, `ramp`, `arch`, `crystal`, `girder`, `stalactite`, `stalagmite`, `tuft`, `slab`, `log`,
  `chain`. Plus `steel` areas, `one-way` areas, and the objects `hatch`, `exit`, `water`, and
  `trap` (squasher or fire).
- **Decor.** Elements marked *decor* do not touch the solution path. Phase B may simplify them.
- **Numbers.** "R" is [levels-reference.md](../levels-reference.md). "W" is the Lemmings Wiki
  infobox; it mostly gives the Amiga numbers (often 100 lemmings instead of 80). Skill counts come
  from W, because R has none. Values that disagree or are missing are marked `[verify]`.
- **Confidence.** high: full-level map of the PC or Amiga version, solution checked against the
  map. medium: map is clear but a hazard object (water, trap) is not drawn on it, or the solution
  is only partly visible. low: the map may be from another version or is incomplete.

## Sources

| Key | Source | Used for | Read |
| --- | --- | --- | --- |
| W | [Lemmings Wiki (Fandom)](https://lemmings.fandom.com/wiki/Tricky), one page per level, read through the MediaWiki API | Map images, infobox numbers, strategy | 2026-10-12 |
| R | [docs/levels-reference.md](../levels-reference.md) | Lemmings, save, release rate, time, key idea | 2026-10-12 |

Ten Tricky levels reuse a Fun map with other numbers and skills (W names the map file). Those
are noted per level; phase B can share the traced geometry with the Fun rating agent.

## Overview

| No. | Name | Width (px) | Style | Map | Confidence |
| --- | --- | --- | --- | --- | --- |
| 01 | This should be a doddle! | 924 | dirt | own | high |
| 02 | We all fall down | 1525 | fire | Fun 13 | high |
| 03 | A ladder would be handy | 705 | dirt | own | high |
| 04 | Here's one I prepared earlier | 1486 | dirt | own | high |
| 05 | Careless clicking costs lives | 1165 | crystal | own | high |
| 06 | Lemmingology | 1224 | fire | own | high |
| 07 | Been there, seen it, done it | 1086 | pillar | own | medium |
| 08 | Lemming sanctuary in sight | 396 | fire | own | medium |
| 09 | They just keep on coming | 949 | dirt | own | high |
| 10 | There's a lot of them about | 882 | fire | own | high |
| 11 | Lemmings in the attic | 512 | marble | own | medium |
| 12 | Bitter Lemming | 541 | marble | own | medium |
| 13 | Lemming Drops | 1572 | pillar | own | medium |
| 14 | MENACING !! | 960 | fire | own | low |
| 15 | Ozone friendly Lemmings | 510 | dirt | Fun 1 | high |
| 16 | Luvly Jubly | 848 | crystal | Fun 5 | high |
| 17 | Diet Lemmingaid | 770 | fire | Fun 6 | high |
| 18 | It's Lemmingentry Watson | 446 | pillar | Fun 2 | high |
| 19 | Postcard from Lemmingland | 1054 | marble | Fun 7 | high |
| 20 | One way digging to freedom | 785 | fire | own | high |
| 21 | All the 6's | 390 | fire | own | high |
| 22 | Turn around young lemmings! | 1571 | pillar | Fun 8 | high |
| 23 | From The Boundary Line | 320 | pillar | Fun 12 | medium |
| 24 | Tightrope City | 824 | marble | own | high |
| 25 | Cascade | 1259 | pillar | own | medium |
| 26 | I have a cunning plan | 320 | marble | Fun 9 | high |
| 27 | The Island of the Wicker people | 1584 | dirt | own | medium |
| 28 | Lost something? | 1584 | dirt | own | medium |
| 29 | Rainbow Island | 1132 | marble | own | high |
| 30 | The Crankshaft | 950 | pillar | Fun 14 | high |

## Tricky 01: "This should be a doddle!"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel1.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel1.png) on [This should be a doddle!](https://lemmings.fandom.com/wiki/This_should_be_a_doddle!) |
| Width, style | 924 px, dirt |
| Numbers | 80 lemmings, save 50 % (40), release rate 50, 4 min (R; W: 100 lemmings, save 50) |
| Skills | 10 of each skill (W) |

Terrain elements:

- Cave ceiling: rough polygon x 0-924, y 0-12, with moss `tuft`s hanging to y 35 (decor).
- Left wall: rough polygon x 0-55, y 0-160; the inner face is at x 50-55.
- Left floor: rough polygon x 55-385, top y 124, bottom y 160. Its right end slopes down from
  (340, 128) to (385, 160).
- Gap: x 385-410, open to the bottom of the level (falling out kills).
- Right floor: rough polygon x 410-850. It rises from (410, 160) to (450, 128), stays at y 126-130
  to x 700, forms a mound to y 115 at x 745, and falls to y 145 at x 840.
- Stone to bash: `rock` x 605-645, y 74-130, standing on the right floor.
- Right wall: rough polygon x 855-924, y 0-160 (a thick column joined to the ceiling).

Objects: hatch (113, 78); exit (755, 117) on the mound.

Solution idea: the second lemming blocks near the hatch (optional). The first one builds over the
gap at x 385, bashes the stone, and walks to the exit. Bomb or free the blocker.

## Tricky 02: "We all fall down"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel13.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel13.png) on [We all fall down (Tricky)](https://lemmings.fandom.com/wiki/We_all_fall_down_(Tricky)) |
| Width, style | 1525 px, fire |
| Numbers | 40 lemmings, save 100 % (40), release rate 1, 3 min (R; W agrees on 40/40 and 3 min) |
| Skills | digger 40, all others 0 (W) |
| Map | Same map as Fun 13 (W) |

Terrain elements:

- Rock mass left: rough polygon (0, 150), (75, 0), (230, 0), (230, 160), (0, 160). Its left face
  is a diagonal slope.
- Short ledge: `slab` x 225-315, y 106-114, with a rough underside to y 120.
- Upper girder: `girder` x 325-900, y 53-58. The hatch stands above it.
- Twisted support: `pillar` x 340-358, y 58-160, with a capital x 335-365, y 55-75.
- Lower girder: `girder` x 390-965, y 120-128, on two thin legs `rect` x 410-418 and x 938-946,
  y 128-160.
- Ceiling: rough polygon x 230-1525, y 0-10, with `stalactite`s at x 280 (to y 38), x 470 (to
  y 30), x 615 (to y 38), x 950 (to y 36) (decor).
- Right part (decor): `stalactite` rock cone x 1020-1100, y 0-90; `pillar` x 1065-1085, y 90-160;
  ceiling x 1100-1525, y 0-25; floor x 1085-1525, y 140-160; twisted `pillar`s at x 1190-1210 and
  x 1330-1350, y 20-140.

Objects: hatch (348, 30); exit (955, 120) at the right end of the lower girder.

Solution idea: the drop from the upper girder (y 53) to the lower girder (y 120) is just above the
safe fall height. Every lemming digs its own hole through the upper girder, so that it falls from
less high. With release rate 1 there is time for one digger per lemming.

Note: our fall limit decides whether 67 px is fatal. Phase B must keep the girder distance just
above our limit, and the dig must make it safe.

## Tricky 03: "A ladder would be handy"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel3.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel3.png) on [A ladder would be handy](https://lemmings.fandom.com/wiki/A_ladder_would_be_handy) |
| Width, style | 705 px, dirt |
| Numbers | 80 lemmings, save 50 % (40), release rate 50, 6 min (R; W: 100, save 50) |
| Skills | climber 20, floater 20, bomber 20, blocker 20, builder 40, basher 20, miner 20, digger 20 (W) |

Terrain elements:

- Left pit floor: rough polygon x 0-92, y 142-160.
- Ribcage (decor, but solid): three `arch` pieces in bone grey, x 10-80, y 115-150.
- Big mound: rough polygon (92, 160), (92, 80), (150, 35), (260, 33), (295, 45), (290, 75),
  (280, 160). The left face is vertical from y 80 to y 160; the top is rounded.
- Water: x 278-460, y 145-160.
- Log bridge: two rows of `log`s, x 278-355 and x 380-460, y 136-146. The gap x 355-380 must be
  bridged.
- Right plateau: rough polygon x 460-705, top y 45 (flat), down to y 160.

Objects: hatch (158, 20) on top of the mound; exit (655, 45) on the right plateau.

Solution idea: walking right off the mound is fatal (drop to the logs). A blocker near the hatch
sends the crowd left; they slide down the left face into the ribcage pit. A basher cuts through the
foot of the mound to the log bridge. A builder closes the log gap, and a long ramp of builders
climbs the right plateau face (y 136 to y 45) to the exit. Free the blocker with a miner.

## Tricky 04: "Here's one I prepared earlier"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel4.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel4.png) on [Here's one I prepared earlier](https://lemmings.fandom.com/wiki/Here%27s_one_I_prepared_earlier) |
| Width, style | 1486 px, dirt (riveted stone blocks and orange rock spires) |
| Numbers | 80 lemmings, save 20 % (16), release rate 55, 8 min (R; W DOS: save 16/80) |
| Skills | 40 of each skill (W) |

Terrain elements:

- Steel block A: `steel` + `brickWall` x 90-372, y 88-160; tower x 100-162, y 16-88 (steel).
- Rock mountain 1: `rock` spire x 195-375, y 40-160, peak (305, 40), in front of block A.
- Gap: x 372-400, open to the bottom.
- Steel block B: `steel` + `brickWall` x 400-880, y 88-160. Its right end is cut diagonally from
  (880, 88) down to (820, 160).
- Rock mountain 2: `rock` x 465-585, y 5-88, peak (545, 5), standing on block B. Lemmings walk
  over it without skills.
- Moss mound: `tuft` x 590-610, y 78-90.
- One-way rock: `rock` x 712-755, y 16-88, with a `one-way` area left over the same box.
- Moss pile: `tuft` x 860-880, y 78-88; a moss slope (rough polygon) from (880, 88) to (905, 120).
- Rock spire: `rock` x 900-935, y 105-160.
- Small island: `rock` x 968-1005, y 142-160.
- Rock stub: `rock` x 1052-1080, y 134-160.
- Exit hill: rough polygon x 1100-1305, top y 110 at x 1180-1220, down to y 160 at both ends.
- Right spires (decor): `rock` x 1300-1330, y 118-160; `rock` x 1435-1486, y 84-160; `rock`
  x 0-48, y 108-160; `rock` x 610-650, y 120-160 in front of block B.

Objects: hatch (428, 38); exit (1200, 112).

Solution idea: a blocker stops the crowd before the one-way rock (the floor is steel, so it is
bombed later). A climber gets over the one-way rock, builds against the moss pile to turn round,
and bashes the one-way rock from the right (leftwards, the allowed direction). Then it walks right
over the moss slope and builds ramps: from the slope to the small island, from the island to the
rock stub, and on to the exit hill. Bomb the blocker and raise the release rate.

## Tricky 05: "Careless clicking costs lives"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel5.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel5.png) on [Careless clicking costs lives](https://lemmings.fandom.com/wiki/Careless_clicking_costs_lives) |
| Width, style | 1165 px, crystal |
| Numbers | 80 lemmings, save 20 % (16), release rate 20, 5 min (R; W DOS: save 16/80) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Crystal heap (decor): rough polygon of `crystal` pieces, (0, 160), (50, 130), (100, 80),
  (160, 30), (220, 2), (300, 10), (340, 40), (375, 100), (375, 160).
- A-frame: `girder` diagonal from (395, 160) up to (570, 0), 10 px thick; a second `girder` from
  (520, 70) down to (600, 160).
- Ball arch 1 (decor): `chain` of spheres in an `arch` x 410-510, y 58-160, on `crystal` feet
  x 410-440 and x 480-510, y 128-160.
- Small block: `crystal` x 505-530, y 60-90.
- Chain-link floor: `girder` lattice x 545-990, y 90-150 (top at y 90). This is the walkway.
- Ball arch 2: `chain` of spheres in an `arch` x 660-780, crown (720, 75), feet at y 160. Lemmings
  walk over its crown.
- Top bar: `slab` x 810-980, y 0-22, with a `crystal` pyramid at each end.
- Four hanging balls: `chain` from y 22 down to y 95 at x 842, 877, 913 and 950; each ends in an
  `ellipse` of 28 x 28 px, y 97-125. The balls block the walkway.
- Crystal arch: `arch` of `crystal` x 1040-1105, y 82-160.
- Exit tower: `slab` x 1115-1165, y 80-102, on a `pillar` x 1130-1150, y 102-160.

Objects: hatch (568, 75); exit (1140, 80) on top of the exit tower.

Solution idea: the second lemming blocks on the crown of ball arch 2. The first one bashes through
the hanging balls (builders where it drops between them). At the end of the lattice (x 990) it
builds a ramp up to the exit tower. Then free the blocker with a basher.

## Tricky 06: "Lemmingology"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel6.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel6.png) on [Lemmingology](https://lemmings.fandom.com/wiki/Lemmingology) |
| Width, style | 1224 px, fire |
| Numbers | 5 lemmings, save 80 % (4), release rate 50 `[verify]` (W: 20), 5 min (R, W) |
| Skills | 20 of each skill (W) `[verify]`; needed: climber, floater, builder |

Terrain elements:

- Ceiling: rough polygon x 0-1224, y 0-8, with `stalactite`s (decor).
- Left swing (decor): rough `slab` x 80-335, y 95-120, hung on two `chain`s at x 112 and x 302,
  y 0-95.
- Left hourglass: `stalactite` x 350-400, y 0-68, with a joint `rect` x 372-400, y 62-72;
  `stalagmite` x 345-410, y 95-160, with a joint `rect` x 372-400, y 85-95.
- Flame jet: a fire `trap` x 405-450, y 98-112, pointing right from the hourglass `[verify]` (the
  map shows a flame; W does not mention a trap).
- U-platform 1 (`brickWall`): lips x 410-435 and x 462-487, y 74-86; bottom x 425-475, y 86-92.
- U-platform 2: lips x 483-508 and x 533-560, y 90-100; bottom x 495-545, y 100-108.
- U-platform 3: lips x 575-600 and x 625-650, y 77-83; bottom x 587-637, y 83-90.
- U-platform 4: lips x 640-665 and x 690-715, y 142-152; bottom x 652-702, y 152-160.
- Exit ledge: `slab` x 728-802, y 135-140.
- Right hourglass: `stalactite` x 815-870, y 0-72; `stalagmite` x 800-885, y 85-160.
- Right swing (decor): rough `slab` x 895-1145, y 95-118, on `chain`s at x 925 and x 1110.

Objects: hatch (447, 50) above U-platform 1; exit (765, 135).

Solution idea: every lemming becomes an athlete (climber and floater) while it walks right. It
climbs the lips of the U-platforms. A builder at the right edge of U2 reaches U3; floating down
lands on U4; a builder at the right edge of U4 reaches the exit ledge.

## Tricky 07: "Been there, seen it, done it"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel7.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel7.png) on [Been there, seen it, done it](https://lemmings.fandom.com/wiki/Been_there,_seen_it,_done_it) |
| Width, style | 1086 px, pillar |
| Numbers | 75 lemmings, save 73 % (55), release rate 20, 5 min (R; W agrees) |
| Skills | 20 of each skill (W); needed: blocker, builder, digger, basher or miner |

Terrain elements:

- Bent pipe (decor, solid): `pillar` x 0-35, y 40-160, joined by an `arch` (inverted U, x 0-105,
  y 30-100) to a `pillar` x 72-105, y 0-75.
- Ceiling: `slab` of `brickWall` x 112-840, y 0-10.
- Exit plinth: `slab` x 65-230, y 142-160.
- Column staircase (each `pillar` with a capital 8 px wider on each side, capital 10 px high):

| Column | Shaft x | Top y |
| --- | --- | --- |
| 1 | 235-285 | 50 |
| 2 | 295-345 | 62 |
| 3 | 355-405 | 75 |
| 4 | 413-463 | 85 |
| 5 | 472-522 | 100 |
| 6 | 533-583 | 113 |
| 7 | 590-640 | 128 |

- All columns reach y 160; the gaps between them are open to the bottom.
- Broken column hanging (decor): `stalactite`-like `pillar` x 735-780, y 10-42.
- Broken columns (decor): `pillar` x 795-830, y 37-160; `pillar` x 1050-1086, y 83-160.
- Water: x 640-1086, y 148-160 `[verify]` (W says a lemming near the water must block; the map
  does not draw the water object).

Objects: hatch (615, 95) above column 7; exit (135, 142) on the plinth.

Solution idea: the first lemming blocks at the right edge of column 7. The second builds up from
the left edge of each column to the next higher one; a second blocker holds the crowd behind it.
At column 1 it digs halfway down, then bashes or mines out to the left and builds a last bridge
down to the exit plinth. Bomb the blockers.

## Tricky 08: "Lemming sanctuary in sight"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel8.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel8.png) on [Lemming sanctuary in sight](https://lemmings.fandom.com/wiki/Lemming_sanctuary_in_sight) |
| Width, style | 396 px, fire |
| Numbers | 80 lemmings, save 60 % (48), release rate 40, 8 min (R; W agrees) |
| Skills | blocker 20, builder 50, all others 0 (W) |

Terrain elements (all floors are thin `girder`s, 2 px high):

- Exit ledge: `girder` x 52-90, y 51-53; a stub wall `rect` x 88-90, y 40-52.
- Floor 1 (top): `girder` x 90-253, y 40-42.
- Floor 2: `girder` x 107-339, y 62-64.
- Floor 3: `girder` x 56-311, y 86-88.
- Floor 4: `girder` x 117-343, y 110-112.
- Bottom floor: `girder` x 53-174 and x 200-341, y 136-138. The gap x 174-200 is over lava.
- Posts: `brickWall` x 93-107, x 160-174, x 200-214, x 273-287, y 138-160.
- Side walls: `rect` x 51-53, y 52-138 (left); `rect` x 346-348, y 0-150 (right).
- Rock lumps (decor): `blob` x 0-52, y 133-160; `blob` x 348-396, y 133-160.
- Lava: water object in fire style, x 53-346, y 150-160 `[verify]` (W names molten lava; the map
  does not draw it).

Objects: hatch (322, 132) at the right end of the bottom floor; exit (68, 51) at the top left.

Solution idea: a builder bridges the lava gap at x 174-200 on the bottom floor; a blocker behind
it holds the crowd. The builder then zig-zags up: a ramp from each floor to the floor above, turning
at the side walls, up to floor 1 and the exit ledge. A last ramp over the blocker frees the crowd;
nuke or bomb the blocker.

## Tricky 09: "They just keep on coming"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel9.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel9.png) on [They just keep on coming](https://lemmings.fandom.com/wiki/They_just_keep_on_coming) |
| Width, style | 949 px, dirt (with steel) |
| Numbers | 75 lemmings, save 93 % (70), release rate 50, 5 min (R; W agrees) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Ceiling: rough polygon x 90-910, y 0-12, moss `tuft`s to y 30 (decor).
- Tree trunk: rough polygon x 45-90, y 0-110, widening to x 15-100 at y 160; a `chain` of grey
  stones on its face (decor).
- Steel corner: `steel` x 0-20, y 138-160.
- Left ground: rough polygon x 90-300, top y 128-140 (gently uneven), bottom y 160.
- One-way rock: `rock` x 185-212, y 105-135, `one-way` right.
- Chasm: x 300-318, open to the bottom.
- Middle ground: rough polygon x 318-670, top y 132-140 (a low mound to y 128 at x 505).
- Small gap: x 670-700. Ground x 700-835, top y 145.
- Steel floor 1: `steel` `slab` x 140-283, y 68-92.
- Steel floor 2: `steel` `slab` x 308-740, y 68-92. The gap x 283-308 lies between the two.
- Steel stairs (right): `steel` x 715-830, y 92-116; `steel` x 788-835, y 68-92; `steel` x 812-860,
  y 44-68.
- Hanging one-way rock (decor): `stalactite` x 735-770, y 10-65, `one-way` left.
- Rock spire: `rock` x 860-920, y 62-160; `steel` x 900-949, y 140-160.

Objects: hatch (502, 40) above steel floor 2; exit (505, 128) on the middle mound.

Solution idea: two blockers on steel floor 2 hold the crowd. The scout builds over the steel gap at
x 283-308 and builds a short ramp so the drop to the left ground is safe. It walks left to the
trunk, turns, bashes the one-way rock rightwards, and builds over the chasm at x 300-318 to the
exit. Bomb the left blocker; the crowd follows the same path. Then bomb the second blocker.

## Tricky 10: "There's a lot of them about"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel10.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel10.png) on [There's a lot of them about](https://lemmings.fandom.com/wiki/There%27s_a_lot_of_them_about) |
| Width, style | 882 px, fire |
| Numbers | 80 lemmings, save 92 % (74) `[verify]` (W: 94/100), release rate 60, 8 min (R) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Left chain (decor): `chain` x 0-25, y 0-135, on a `rect` block x 0-25, y 135-160.
- Left platform: rough `slab` x 97-352, y 108-125 (spiky top at y 105).
- Left rock: `blob` x 183-240, y 58-110, on the left platform.
- Pillars of `brickWall`: x 377-401, y 81-160; x 427-451, y 67-160 (exit pillar); x 477-501,
  y 81-160.
- Right platform: rough `slab` x 527-765, y 108-125.
- Right rock: `blob` x 628-690, y 62-110, on the right platform.
- Right chain (decor): `chain` x 858-882, y 0-135, on a `rect` x 858-882, y 135-160.

Objects: hatch 1 (137, 70); hatch 2 (729, 80); exit (440, 67) on the middle pillar.

Solution idea: both hatches release walkers to the right. A blocker at the right edge of the
right platform turns the right crowd; a blocker near the left edge of the left platform turns the
left crowd. A basher on each side cuts through the rock (the right one bashes leftwards). Each
side builds from the platform edge to the outer pillar, then from the outer pillar to the exit
pillar. Bomb the blockers.

## Tricky 11: "Lemmings in the attic"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel11.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel11.png) on [Lemmings in the attic](https://lemmings.fandom.com/wiki/Lemmings_in_the_attic) |
| Width, style | 512 px, marble |
| Numbers | 50 lemmings, save 84 % (42), release rate 20, 8 min (R; W agrees) |
| Skills | builder 50, all others 20 (W) |

Terrain elements:

- Left column: `pillar` x 0-30, y 0-160.
- Attic ceiling: `slab` x 30-288, y 0-5.
- Top-left corner: `blob` x 30-120, y 0-60, rounded; an arrow-shaped `polygon` x 55-90, y 20-60
  (decor).
- Top-right corner: `blob` x 230-288, y 0-25.
- Attic floor: `slab` x 50-288, y 155-160, made of tiles. The gap x 30-50 at the far left is open.
- Brick house: `brickWall` x 288-512, y 0-160, with these holes cut out:
  - Window 1: x 298-382, y 50-68 (empty room).
  - Window 2: x 388-468, y 18-68 (the exit room).
  - Arch opening: `arch` x 305-490, y 82-125; the hole under it is x 322-472, y 95-160.
- Acid pool: water x 322-472, y 140-160, under the arch.

Objects: hatch (262, 128); exit (440, 68) in window 2.

Solution idea: a blocker before the gap at the far left. A builder starts from the second floor
tile from the left and ramps up to the house wall at the height of window 1 (about four ramps). A
second builder, or a basher hole in the ramp, keeps falling walkers safe. Bash through the house
wall into window 1, then through the wall between window 1 and window 2. Bomb the blocker.

## Tricky 12: "Bitter Lemming"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel12.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel12.png) on [Bitter Lemming](https://lemmings.fandom.com/wiki/Bitter_Lemming) |
| Width, style | 541 px, marble |
| Numbers | 50 lemmings, save 80 % (40), release rate 1, 8 min (R; W: release rate missing) |
| Skills | climber 50, floater 50, bomber 20, blocker 20, builder 20, basher 20, miner 20, digger 20 (W) |

Terrain elements:

- Hatch shaft: `pillar` x 108-125, y 30-160 and `pillar` x 140-157, y 33-160; crossbar `slab`
  x 108-157, y 80-96; bottom `slab` x 108-157, y 145-160. The shaft between the pillars is
  x 125-140.
- Brick block: `brickWall` x 157-348, y 33-95, and x 157-220, y 95-128 (lower left part). A slot
  x 220-236, y 45-95 is cut out.
- Pillar 1: `pillar` x 255-272, y 120-160, with a `slab` top x 240-287, y 113-120.
- Pillar 2: `pillar` x 312-330, y 128-160, with a `slab` top x 297-345, y 121-128.
- Exit pillar: `pillar` x 383-400, y 120-160, with a `slab` top x 367-412, y 112-120.
- Rock lumps: `blob` x 10-108, y 50-160 (peak (60, 50)); `blob` x 400-541, y 92-160.
- Ceiling: `blob` x 0-90, y 0-45; rough `slab` x 165-541, y 0-8; `stalactite` blob x 400-530,
  y 0-78.
- Floor rubble: rough polygon x 155-400, y 145-160.

Objects: hatch (131, 20) above the shaft; exit (390, 113) on the exit pillar.

Solution idea (R, W): every lemming needs a floater for the drop into the shaft. The athletes
climb out over the brick block and float down to the floor rubble. One lemming mines down to the
floor, bashers clear the pillar feet, builders reach the top of the middle pillar, a blocker turns
the crowd, and a last builder reaches the exit pillar `[verify]` (the W strategy is vague about
the order).

## Tricky 13: "Lemming Drops"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel13.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel13.png) on [Lemming Drops](https://lemmings.fandom.com/wiki/Lemming_Drops) |
| Width, style | 1572 px, pillar (golden pipes, wood, steel) |
| Numbers | 80 lemmings, save 70 % (56), release rate 1, 8 min (R; W: 70/100) |
| Skills | builder 50, all others 20 (W) |

Terrain elements (the puzzle area is x 520-900):

- Wooden L: `rect` post x 528-535, y 68-115; `log` plank x 528-566, y 108-115; a crossed `steps`
  trestle x 535-560, y 115-160.
- Steel blocks: `steel` x 553-567, y 84-108; `steel` x 580-602, y 84-108 with a trestle below
  x 580-605, y 108-160.
- Steel wall right of the hatch: `steel` x 617-630, y 36-82.
- Steel column: `steel` x 628-641, y 104-160.
- Steel post: `steel` x 680-693, y 36-82, with a `log` x 693-714, y 36-42.
- Floating plank: `log` x 707-807, y 73-79.
- Steel box: `steel` x 668-682, y 104-160; `steel` x 668-726, y 104-118; `steel` x 744-757,
  y 104-118; wooden post `rect` x 748-756, y 118-155; plank `log` x 695-757, y 155-160.
- Ready-made stairs: `steps` from (785, 150) up to (820, 105).
- Steel feet: `steel` x 772-810, y 152-160; `steel` x 812-836, y 138-160.
- Exit platform: `log` x 817-897, y 88-103.
- Ceiling rocks (decor): inverted `blob`s x 505-560, y 0-10; x 645-690, y 0-8; x 710-830, y 0-15.
- Pipe work (decor, solid): left x 0-460 and right x 935-1572, golden pipes in loops made of
  `pillar` and `arch` pieces, with diagonal `steps` between them. Keep them clear of the puzzle.
- Water: x 520-900, y 150-160 `[verify]` (W says a lemming may fall into water; not drawn).

Objects: hatch (588, 58); exit (857, 88).

Solution idea: a builder seals the gap between the hatch block and the steel wall; a blocker at
the left edge holds the crowd. Athletes climb the steel wall and drop onto the steel posts; builders
turn them at walls and zig-zag upwards; one athlete reaches the floating plank and builds from its
right edge to the exit platform. Further ramps lead the crowd up.

## Tricky 14: "MENACING !!"

| Fact | Value |
| --- | --- |
| Reference | [File:A_Menacing_Level.png](https://lemmings.fandom.com/wiki/File:A_Menacing_Level.png) on [MENACING !!](https://lemmings.fandom.com/wiki/MENACING_!!) |
| Width, style | 960 px, fire (the original uses a gory special set; fire is the closest) |
| Numbers | 80 lemmings, save 88 % (70), release rate 50, 6 min (W; R has `[verify]`) |
| Skills | climber 10, floater 10, bomber 15, blocker 10, builder 15, basher 15, miner 15, digger 15 (W) `[verify]` |

The reference image may not be the PC version (the hatch is drawn oddly). Confidence low.

Terrain elements:

- Ceiling: rough polygon x 0-960, y 0-25, with drips down to y 60 (decor).
- Hanging pieces (decor): tentacles `chain` x 95-135, y 15-65 and x 840-880, y 15-70; a hand
  `polygon` x 215-275, y 10-55; `blob`s x 297-325, y 35-72; x 495-510, y 45-68; x 592-655,
  y 50-80.
- Left floor: rough `chain` of snakes x 5-570, y 143-160.
- Hand: `polygon` x 135-195, y 92-150, rising from the floor (bash).
- Skull: `ellipse` x 210-300, y 108-160, with a snake `chain` x 270-295, y 110-145 (bash).
- Ribcage: `arch` pieces x 455-510, y 108-150 (bash).
- Chasm: x 570-662, open to the bottom.
- Right floor: rough `chain` of snakes x 662-955, y 143-160.
- Exit island: `blob` x 730-795, y 84-110 (floating).
- Tentacles (decor): `chain` x 805-855, y 107-150 on the right floor.

Objects: hatch (55, 100); exit (765, 84) on the exit island.

Solution idea: a blocker left of the hatch. A basher cuts through the hand, the skull and the
ribcage. A builder bridges the chasm (start close to the edge, but not touching the snake tail);
a second blocker holds the crowd. On the right floor, builders ramp up to the exit island; the
builder count is just enough.

## Tricky 15: "Ozone friendly Lemmings"

| Fact | Value |
| --- | --- |
| Reference | [File:Just Dig!.png](https://lemmings.fandom.com/wiki/File:Just_Dig!.png) on [Ozone friendly Lemmings](https://lemmings.fandom.com/wiki/Ozone_friendly_Lemmings) |
| Width, style | 510 px, dirt |
| Numbers | 10 lemmings, save 60 % (6), release rate 50, 5 min (R; W agrees) |
| Skills | bomber 5, all others 0 (W) |
| Map | Same map as Fun 1 (W) |

Terrain elements:

- Ceiling: rough polygon x 20-470, y 0-15, moss `tuft`s (decor).
- Left mass: rough polygon x 20-155, y 0-110 (narrow waist x 60-130 at y 100), joined to the
  bottom-left lump x 0-135, y 110-160.
- Upper shelf: rough `slab` x 155-400, top y 75, underside y 100, with a rounded right end.
- Hanging column: rough polygon x 330-400, y 0-80, joined to the right end of the upper shelf.
- Right pillar: rough polygon x 420-465, y 0-130, widening to x 400-510 at y 130-160.
- Lower floor: rough polygon x 135-400, top y 125, bottom y 160; continues x 400-500 at
  y 140-160.

Objects: hatch (217, 50) above the upper shelf; exit (362, 128) on the lower floor.

Solution idea: the lemmings walk to and fro on the upper shelf. Four bombers explode at the same
spot; each blast deepens one pit until it holds the rest. The last bombers blow the pit through the
25 px shelf, and the survivors drop to the lower floor and the exit.

## Tricky 16: "Luvly Jubly"

| Fact | Value |
| --- | --- |
| Reference | [File:You need bashers this time.png](https://lemmings.fandom.com/wiki/File:You_need_bashers_this_time.png) on [Luvly Jubly](https://lemmings.fandom.com/wiki/Luvly_Jubly) |
| Width, style | 848 px, crystal |
| Numbers | 50 lemmings, save 80 % (40), release rate 76, 5 min (R; W agrees) |
| Skills | bomber 10, basher 1, miner 1, all others 0 (W) |
| Map | Same map as Fun 5 (W) |

Terrain elements:

- Ceiling crystals: rough polygon x 15-220, y 0-25.
- Tall crystal (decor): `crystal` x 62-112, y 28-110, leaning.
- Crystal rubble: `blob` x 40-140, y 100-160.
- Lower floor: `slab` x 140-305, y 145-160, with small `crystal`s x 180-210, y 128-160 and
  x 255-280, y 123-160.
- Silver bar: `girder` x 105-330, y 76-92 (the walkway); a vertical bar `rect` x 250-262, y 0-76.
- Crystal mass: `blob` x 300-440, y 0-160 (top part x 300-440 to y 65, then x 300-415).
- Diagonal bar: `girder` from (390, 80) down to (430, 118); `crystal` block x 428-460, y 115-147.
- Exit floor: `girder` x 460-775, y 130-147.
- Chain-link mesh: `girder` lattice triangles, x 475-600, y 80-130 and x 535-720, y 35-130; an
  inverted lattice x 435-590, y 0-55.
- Y-frame (decor): `girder`s from (720, 0) and (840, 0) to a sphere `ellipse` centre (765, 55),
  30 px; `rect` x 760-772, y 70-115; `crystal` block x 750-782, y 115-147.

Objects: hatch (145, 40) above the silver bar; exit (622, 130) inside the mesh area.

Solution idea: the first lemming mines into the silver bar and, once deep inside, bashes through
the crystal mass into the mesh area. The rest follow. Bombers, timed halfway up the mesh and moved
step by step to the right, carve a tunnel to the exit. Avoid vertical holes that drop walkers.

## Tricky 17: "Diet Lemmingaid"

| Fact | Value |
| --- | --- |
| Reference | [File:Blockers and bombers.png](https://lemmings.fandom.com/wiki/File:Blockers_and_bombers.png) on [Diet Lemmingaid](https://lemmings.fandom.com/wiki/Diet_Lemmingaid) |
| Width, style | 770 px, fire |
| Numbers | 50 lemmings, save 96 % (48), release rate 50, 5 min (R; W agrees) |
| Skills | bomber 2, all others 0 (W) |
| Map | Same map as Fun 6 (W) |

Terrain elements:

- Rubble left (decor): `brickWall` heap x 15-105, y 92-160, stepped.
- Base: `brickWall` x 175-450, y 92-128; lower step x 450-550, y 104-128. Rough red drips below
  (decor).
- Left block: `brickWall` x 175-225, y 56-92.
- Thin bar: `rect` x 225-350, y 67-70. The lemmings land on it.
- Middle block: `brickWall` x 350-400, y 56-80. The gap under it (y 80-92) lets walkers pass.
- Twisted pillars: `pillar` x 193-210, y 0-56; x 368-385, y 0-56; x 440-458, y 0-38.
- Thin wall: `rect` x 448-450, y 48-92, hanging from the right trap.
- Ceiling: rough polygon x 180-570, y 0-12.
- Rubble right (decor): `brickWall` heap x 680-770, y 64-160, sloping right.

Objects: hatch (255, 32) above the thin bar; exit (495, 104) on the lower step; fire `trap` (flame
thrower) x 355-395, y 22-48, on the middle pillar, pointing left; trap box x 435-460, y 33-48
(decor).

Solution idea: the first lemming is a bomber and blows a hole in the thin bar; the crowd drops to
the base. A second bomber, armed when it walks under the flame-thrower pillar, explodes at the thin
wall and opens the way to the exit.

## Tricky 18: "It's Lemmingentry Watson"

| Fact | Value |
| --- | --- |
| Reference | [File:FloatersLevel.png](https://lemmings.fandom.com/wiki/File:FloatersLevel.png) on [It's Lemmingentry Watson](https://lemmings.fandom.com/wiki/It%27s_Lemmingentry_Watson) |
| Width, style | 446 px, pillar |
| Numbers | 10 lemmings, save 90 % (9), release rate 50, 5 min (R; W agrees) |
| Skills | floater 1, bomber 1, builder 2, digger 1, all others 0 (W) |
| Map | Same map as Fun 2 (W) |

Terrain elements:

- Floor: `slab` x 30-440, y 148-160.
- Ruined wall left: `brickWall` blocks x 25-62, y 68-85; x 0-70, y 88-108; x 25-65, y 108-128;
  x 30-70, y 128-148.
- Column 1: `pillar` x 88-122, y 52-148, capital x 80-133, y 45-56.
- Column 2: `pillar` x 135-170, y 63-148, capital x 127-180, y 57-68.
- Column 3: `pillar` x 182-216, y 76-148, capital x 173-225, y 69-80.
- Ceiling (decor): `blob` x 165-446, y 0-25, an inverted triangle to y 55 at x 270-400; broken
  `pillar` x 232-265, y 0-48; a U-shaped pipe `arch` x 305-370, y 5-63.
- Ruined wall right: `brickWall` x 372-412, y 90-148.

Objects: hatch (105, 28) above column 1; exit (345, 148) on the floor.

Solution idea: the walkers step down the capitals from column 1 to column 3. The drop from
column 3 (y 69) to the floor is fatal. The first lemming digs at the right edge of column 3,
leaving one pixel of capital, so the others turn round. The one walker that gets past the hole gets
the floater. Then the digger becomes a bomber and blows the column open.

## Tricky 19: "Postcard from Lemmingland"

| Fact | Value |
| --- | --- |
| Reference | [File:You_need_builders.png](https://lemmings.fandom.com/wiki/File:You_need_builders.png) on [Postcard from Lemmingland](https://lemmings.fandom.com/wiki/Postcard_from_Lemmingland) |
| Width, style | 1054 px, marble |
| Numbers | 50 lemmings, save 100 % (50), release rate 50, 5 min (R; W agrees) |
| Skills | climber 10, floater 10, builder 1, basher 1, miner 1, digger 1, others 0 (W) |
| Map | Same map as Fun 7 (W) |

Terrain elements:

- Rock lumps: `blob` x 10-60, y 125-160; `blob` x 975-1054, y 108-160.
- Acid pools: water x 55-175 and x 860-975, y 140-160.
- Marble pillars: `pillar` x 173-190 and x 845-862, y 35-160.
- Capitals (inverted `crystal` triangles): x 147-218, x 372-442, x 595-665, x 818-890, y 0-37.
- Garlands (decor): `arch`es of brick, hanging between the capitals, lowest point y 38.
- Brick floor (`brickWall`, rubble below y 130):
  - x 190-422, top y 128.
  - x 422-525, top y 116 (a 12 px step at x 422).
  - `steps` x 525-575 from y 116 up to y 96.
  - x 575-674, top y 96.
  - Notch (pit) x 674-690, y 96-122, cut out.
  - x 690-845, top y 96.

Objects: hatch (235, 92); exit (782, 96).

Solution idea: the second lemming bashes at the 12 px step and the crowd follows its tunnel. A
climber climbs the step, walks towards the exit, digs a little, and builds once to turn round. Then
it mines leftwards down to meet the basher's tunnel, so the crowd walks up the mined slope to the
exit. The miner timing is the hard part. The climber also needs a floater if it goes over the
left pillar.

## Tricky 20: "One way digging to freedom"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel20.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel20.png) on [One-way digging to freedom](https://lemmings.fandom.com/wiki/One-way_digging_to_freedom) |
| Width, style | 785 px, fire |
| Numbers | 80 lemmings, save 95 % (76), release rate 60, 4 min (R; W DOS: 76/80) |
| Skills | climber 3, floater 3, bomber 6, blocker 2, builder 2, basher 4, miner 2, digger 2 (W) |

Terrain elements:

- Ceiling: rough polygon x 0-785, y 0-12.
- Graffiti "EXIT ->" (decor, solid): rough `polygon` letters x 195-340, y 35-70.
- Bridge deck: `brickWall` `slab` x 92-740, y 124-130.
- Deck piers: `brickWall` x 115-155, 180-230, 255-305, 330-380, 405-455, 480-530, 555-605,
  630-680, 705-740, each y 130-160. The pits between the piers leave the deck only 6 px thick.
- Twisted column: `pillar` x 265-290, y 80-124 (bash).
- One-way wall: `brickWall` x 405-453, y 53-124, `one-way` left.
- Fire pillar: twisted `pillar` x 20-50, y 108-160.

Objects: hatch (133, 88); exit (725, 124); fire `trap` x 55-105, y 140-155 (flame from the fire
pillar, left of the deck).

Solution idea: block the left edge of the deck. Bash through the twisted column. Two athletes
climb the one-way wall. The leader blocks on solid deck (above a pier, not above a pit); the second
turns at it and bashes the one-way wall leftwards. Bomb the right blocker.

## Tricky 21: "All the 6's"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel21.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel21.png) on [All the 6's](https://lemmings.fandom.com/wiki/All_the_6%27s) |
| Width, style | 390 px, fire |
| Numbers | 66 lemmings, save 67 % (44), release rate 66, 6 min (W; R has `[verify]`) |
| Skills | 66 of each skill (W) |

Terrain elements: three giant digits "6", each a thick rough stroke (about 22 px).

| Digit | Box | Stem (left stroke) | Bowl outer ellipse | Bowl hole |
| --- | --- | --- | --- | --- |
| 6 one | x 0-118, y 3-148 | x 0-30, y 20-130, hook to (55, 3)-(55, 35) | centre (72, 100), 47 x 45 | x 52-90, y 75-112 |
| 6 two | x 150-268, y 2-150 | x 150-180, y 20-130, hook to (205, 3) | centre (210, 100), 58 x 48 | x 205-245, y 70-115 |
| 6 three | x 280-390, y 2-148 | x 280-310, y 20-130, hook to (335, 3) | centre (345, 100), 45 x 45 | x 335-370, y 65-115 |

- Build each digit as a rough `polygon` stem with an `ellipse` bowl minus an `ellipse` hole (or a
  ring of `blob`s). The bowl floor inside each hole is at about y 112.

Objects: hatch (59, 96) inside the bowl of the first 6; exit (345, 115) inside the bowl of the
third 6.

Solution idea: the second lemming blocks. The first bashes the right wall of bowl one, builds a
bridge across to the second 6, bashes into and out of its bowl, builds to the third 6 and bashes
into its bowl. A miner frees the blocker.

## Tricky 22: "Turn around young lemmings!"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel8.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel8.png) on [Turn around young lemmings!](https://lemmings.fandom.com/wiki/Turn_around_young_lemmings!) |
| Width, style | 1571 px, pillar |
| Numbers | 80 lemmings, save 90 % (72), release rate 88, 5 min (R; W agrees) |
| Skills | floater 1, bomber 15, builder 20, basher 1, all others 0 (W) |
| Map | Same map as Fun 8 (W) |

Terrain elements:

- Walkway: `slab` (brick) x 500-835, y 100-120.
- Stub: `slab` x 860-920, y 100-120, with a block `rect` x 882-900, y 80-100. Gap x 835-860.
- Ball column: `pillar` x 932-962, y 108-160, topped by an `ellipse` ball x 932-962, y 88-115.
- Ceiling bricks (decor): `slab` pieces along y 0-25 across the whole width.
- Left decor: statues of stacked `rock`s on wooden `steps` trestles, x 5-100, x 180-225,
  x 340-390, y 30-160; columns `pillar` x 130-162, x 248-278, x 295-325, x 405-437, y 0-160, with
  `ellipse` balls.
- Right decor: `pillar`s x 1048-1080 and x 1095-1125, x 1290-1325, y 0-160; ruins of `arch`es
  and capitals x 1160-1280, y 52-160 and x 1370-1490, y 32-160.

Objects: hatch (570, 56); exit (540, 100) at the left end of the walkway.

Solution idea: the walkers head right and fall off the end of the walkway. Two bombers, the
second armed a moment later, blow a pit into the walkway right of the hatch. The pit must be deep
enough to trap walkers but must not go through. A builder in the pit ramps out to the left, so the
crowd walks to the exit.

## Tricky 23: "From The Boundary Line"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel12.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel12.png) on [From The Boundary Line](https://lemmings.fandom.com/wiki/From_The_Boundary_Line) |
| Width, style | 320 px, pillar |
| Numbers | 80 lemmings, save 60 % (48), release rate 99, 5 min (R; W agrees) |
| Skills | climber 10, floater 10, builder 1, basher 2, miner 1, digger 1, others 0 (W) |
| Map | Same map as Fun 12 (W). The map is a single screen; it may be the whole level. |

Terrain elements:

- Left block: `brickWall` (rough stone) x 0-82, y 120-160, with a slanted right face from (100,
  120) to (82, 150).
- Ready-made stairs: `steps` from (90, 120) up to (130, 105).
- Wide wall: `brickWall` x 130-190, y 37-160 (bash at the height of the stairs).
- Bottom trestles (decor): `steps` x 95-140 and x 185-230, y 140-160.
- Pit: x 190-218, floor y 150.
- Right floor: `brickWall` x 218-320, y 120-160.
- Hanging frame left (decor): `slab` x 5-110, y 28-48; `pillar` x 48-68, y 0-58; `steel` x 12-50,
  y 0-28 and x 90-105, y 12-28.
- Hanging frame right (decor): `pillar` x 250-275, y 0-45; frame `slab` x 228-318, y 35-80;
  `steel` x 233-248, y 20-35 and x 290-305, y 5-35.

Objects: hatch (25, 96); exit (300, 120) on the right floor.

Solution idea: as soon as the first lemming touches the wide wall it bashes. Walkers that turn
fall off the left boundary (no blockers). The bashed tunnel drops the crowd into the pit. A climber
gets out onto the right floor, digs a little, builds once to turn round, and mines down to the left
to open the pit. A race against the release rate of 99.

## Tricky 24: "Tightrope City"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel24.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel24.png) on [Tightrope City](https://lemmings.fandom.com/wiki/Tightrope_City) |
| Width, style | 824 px, marble |
| Numbers | 80 lemmings, save 94 % (75) `[verify]` (W: 93 %), release rate 85, 2 min (R) |
| Skills | builder 3, all others 5 (W) |

Terrain elements:

- Tightrope: `girder` x 108-636, y 94-98 (4 px thick).
- Exit ledge: `slab` x 649-683, y 75-80.

Objects: hatch (135, 55); exit (666, 77) on the exit ledge.

Solution idea: the first lemming walks right and builds a ramp up to the exit ledge (two
builders). The second lemming blocks; another blocker stands left of the hatch near x 115. With
the last builder, a lemming walking right builds over the right blocker. Bomb both blockers. The
rope is too thin for bombers to be useful. Time is short.

## Tricky 25: "Cascade"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel25.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel25.png) on [Cascade](https://lemmings.fandom.com/wiki/Cascade) |
| Width, style | 1259 px, pillar |
| Numbers | 80 lemmings, save 13 % (10), release rate 99, 5 min (R; W: 10/100) |
| Skills | climber 1, floater 10, bomber 5, builder 10, basher 1, miner 1, digger 5, blocker 0 (W) |

Terrain elements:

- Steel steps (left): `steel` x 0-95, y 136-160; x 95-120, y 112-160; x 120-143, y 90-160.
- Water: x 143-243, y 145-160.
- One-way column: `pillar` x 243-275, y 0-160, `one-way` right over x 243-275, y 60-160.
- Hanging broken columns (decor): `pillar` x 290-325, y 0-80; x 340-372, y 0-60; x 385-420,
  y 0-15.
- Hatch floor: `slab` x 322-405, y 157-160 (thin).
- Long stairs: `steps` from (405, 157) up to (515, 15), one step per 4 px.
- Short slab: `slab` x 500-545, y 150-160.
- Short stairs: `steps` from (540, 150) up to (600, 80).
- Column 1: `pillar` x 608-640, y 0-160, with capital ledges x 600-640, y 50-60 and y 78-88.
- Column 2: `pillar` x 670-700, y 0-160.
- Exit platform: `slab` x 710-835, y 105-123.
- Broken stumps (decor): `pillar` x 727-760 and x 778-810, y 140-160.
- Spiral (decor): `ellipse` rings x 840-905, y 0-35.
- Right ruin (decor): stone `brickWall` x 1000-1030, y 64-160; horizontal pipe `pillar` x 1030-1135,
  y 78-112, crossed by `pillar` x 1070-1085, y 0-160; `steel` x 1135-1180, y 72-160; `rock` slope
  x 1180-1259 from y 80 to y 160; `rock` x 963-1000, y 112-160.

Objects: hatch (355, 131) near the bottom; exit (771, 105) on the exit platform.

Solution idea: the crowd climbs the long stairs and falls off the top to its death; only ten
floaters survive. The first floater lands near the short stairs, builds at the edge of the
column 1 ledge up to a wall, bashes through the columns, and builds one last bridge to the exit
platform. Nine more floaters, taken from the end of the line, follow its path.

## Tricky 26: "I have a cunning plan"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel9.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel9.png) on [I have a cunning plan](https://lemmings.fandom.com/wiki/I_have_a_cunning_plan) |
| Width, style | 320 px, marble |
| Numbers | 80 lemmings, save 100 % (80), release rate 99, 5 min (R; W agrees) |
| Skills | climber 2, floater 2, bomber 5, blocker 10, builder 20, basher 2, miner 2, digger 2 (W) |
| Map | Same map as Fun 9 (W) |

Terrain elements:

- Corner wedges (decor): `polygon` triangles x 0-35, y 0-35; x 285-320, y 0-35; x 0-35,
  y 125-160; x 285-320, y 125-160.
- Floor: `slab` x 50-278, y 123-128.
- Column: `pillar` x 150-168, y 68-123, with a T-top `slab` x 135-182, y 63-68.

Objects: hatch (88, 100); exit (235, 123); three squasher `trap`s (spinners): x 55-72, y 105-123
(left end of the floor); x 150-168, y 45-63 (on the T-top); x 263-280, y 105-123 (right end).

Solution idea: the walkers turn at the column and walk into the left spinner. At once, builders on
the second to fifth lemming lay short ramps that act as walls, turning the walkers back. The first
lemming bashes the column; a second basher right behind it keeps the tunnel open. Every lemming
must be saved.

## Tricky 27: "The Island of the Wicker people"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel27.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel27.png) on [The Island of the Wicker people](https://lemmings.fandom.com/wiki/The_Island_of_the_Wicker_people) |
| Width, style | 1584 px, dirt (with steel) |
| Numbers | 80 lemmings, save 90 % (72), release rate 60, 5 min (R; W agrees) |
| Skills | climber 5, bomber 5, blocker 5, builder 5, basher 5, miner 5, digger 5, floater 0 (W) |

Terrain elements:

- Hatch island: `blob` x 570-700, top y 22 (x 600-700), left slope from (570, 42), with a hanging
  `stalactite` x 590-625, y 80-110 and root `chain`s (decor).
- Main island: rough polygon (578, 160), (600, 140), (640, 123), (700, 120), (750, 100),
  (800, 90), (860, 88), (1030, 75), (1070, 75), (1110, 100), (1115, 160).
- One-way spires: `rock`s x 760-790, y 60-100; x 800-830, y 12-100; x 840-860, y 48-100; one
  `one-way` area left over x 755-875, y 12-100.
- Steel chain: `steel` `chain` diagonal x 815-840, y 75-160, inside the island.
- Exit stand: `steel` x 905-930, y 0-55; x 912-945, y 45-62; x 945-990, y 48-78.
- Graveyard islets (decor): `blob` x 0-85, y 138-160; `blob` x 220-395, y 128-160 with a hut;
  `blob` x 1515-1584, y 115-160; grave crosses as small `rect`s.
- Water: around the main island, x 0-1584, y 150-160 `[verify]` (W mentions water on the left;
  the map does not draw it).

Objects: hatch (616, 18) on the hatch island; exit (953, 48) on the steel stand.

Solution idea: the first lemming digs at once and mines out of the hatch island when the pit
holds the crowd. On the main island a blocker on the left keeps walkers out of the water. Three
climbers cross the one-way spires. The first blocks near the right edge. The third builds up to the
exit. The second mines down a little and bashes leftwards through the one-way spires (mining first
keeps the tunnel low enough for the walkers). Bomb all blockers.

## Tricky 28: "Lost something?"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel28.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel28.png) on [Lost something?](https://lemmings.fandom.com/wiki/Lost_something%3F) |
| Width, style | 1584 px, dirt (with steel) |
| Numbers | 80 lemmings, save 90 % (72), release rate 70, 5 min (R; W DOS: 72/80) |
| Skills | 10 of each skill (W) |

Terrain elements:

- Rock spires left (decor): `rock` x 0-130, y 36-160; `rock` x 180-222, y 105-160.
- Big mound: rough polygon (445, 160), (500, 118), (540, 85), (560, 82), (640, 90), (670, 100),
  (670, 160).
- Bridge: `log` x 670-735, y 117-123, with moss `tuft`s.
- Water: x 675-715, y 145-160, under the bridge.
- Mound 2: rough polygon x 712-970, top y 100-110, right slope to (1000, 160).
- Hidden-exit rock: `blob` x 805-880, y 0-75, standing on a `steel` `slab` x 805-878, y 75-88.
- Right spire: `rock` x 940-1010, y 3-75, on a `steel` `slab` x 943-1015, y 72-85.
- Lattice (decor): `chain` of balls, a diagonal from (900, 110) to (945, 75), and an X-lattice
  x 930-1060, y 75-160.
- Right decor: `rock` x 1310-1360, y 100-160; grassy slope `polygon` x 1370-1584 from y 160 up to
  y 20, with grave crosses.

Objects: hatch (680, 98) above the bridge; exit (842, 75) hidden inside the rock, standing on
the steel slab `[verify]` (the map shows no exit; W says it is inside this rock).

Solution idea: the exit is invisible. A builder on the rise of mound 2 near the bridge ramps up to
the steel slab under the rock, then bashes into the rock to the exit. Walkers going left would fall
into the water: miners or a basher in the big mound turn them, and a builder leads them back.

## Tricky 29: "Rainbow Island"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings TrickyLevel29.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel29.png) on [Rainbow Island](https://lemmings.fandom.com/wiki/Rainbow_Island) |
| Width, style | 1132 px, marble |
| Numbers | 80 lemmings, save 99 % (79), release rate 70, 4 min (R; W agrees) |
| Skills | 10 of each skill (W) |

Terrain elements: a pyramid of brick `arch`es, each about 185 px wide and 12 px thick.

| Row | Arch spans (x) | Crown y | Feet y |
| --- | --- | --- | --- |
| 1 (top) | 355-540, 540-730 | 10 | 45 |
| 2 | 272-460, 460-645, 645-830 | 48 | 82 |
| 3 | 183-370, 370-555, 555-740, 740-925 | 85 | 120 |
| 4 (bottom) | 90-275, 275-460, 460-650, 650-835, 835-1025 | 120 | 160 |

- Left rail (decor): `girder` with rough `blob` edge, diagonal from (0, 160) to (178, 0).
- Right rail (decor): the same, from (965, 0) to (1132, 160).
- Exit base: `brickWall` x 1025-1085, y 150-160.

Objects: hatches (126, 103), (206, 60), (302, 23); exit (1053, 152); squasher `trap`s
(spinners), each about 20 x 18 px, centred at (263, 125), (455, 125), (550, 92), (535, 18),
(727, 87), (758, 37), (903, 80).

Solution idea: the spinners mark the right path. Dig or bash at the left part of the highest arch;
bash under the highest spinner. Between the second and third arch, dig and switch to a miner
halfway down (digging all the way is a fatal drop). Two more bashers open the way to the exit. A
digger at the start saves everyone; with a basher start, a blocker left of the bottom hatch is
needed.

## Tricky 30: "The Crankshaft"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel14.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel14.png) on [The Crankshaft](https://lemmings.fandom.com/wiki/The_Crankshaft) |
| Width, style | 950 px, pillar |
| Numbers | 80 lemmings, save 90 % (72), release rate 20, 4 min (R; W agrees) |
| Skills | 10 of each skill except basher 0 (W) |
| Map | Same map as Fun 14 (W) |

Terrain elements:

- Columns with broken tops: `pillar` x 205-240, x 343-378, x 467-500, x 600-635, x 722-757, each
  y 22-152.
- Beams (horizontal `pillar`s, 33 px thick), alternating high and low:

| Beam | x | y |
| --- | --- | --- |
| 1 | 72-205 | 60-93 |
| 2 | 240-343 | 103-137 |
| 3 | 378-467 | 60-93 |
| 4 | 500-600 | 103-137 |
| 5 | 635-722 | 60-93 |
| 6 | 757-895 | 103-137 |

- Scroll ends: `rock` x 65-78, y 50-105 (left of beam 1); `rock` x 890-905, y 93-150 (right of
  beam 6).
- Rubble bases: `blob`s x 0-55, 180-265, 325-393, 450-522, 580-650, 705-778, 890-950, y 142-160.
- Water: x 55-180, 265-325, 393-450, 522-580, 650-705, 778-890, y 145-160.

Objects: hatch (110, 30) above beam 1; exit (865, 103) on beam 6.

Solution idea: the first four lemmings become athletes. The fifth mines through column 1. The
sixth mines down while walking left and builds when the tunnel is deep enough, which makes a safe
turning point. Athletes mine through each further column; the next athlete turns at the hole and
mines a step down so the crowd can follow. Raise the release rate; the clock is short.

## Resume here

- State: phase A done. All 30 Tricky levels have a traced layout, numbers, skills and a solution
  idea. Phase B (level JSON in `assets/levels/tricky/`, replays, locale names) has not started.
- Open `[verify]` items: Tricky 06 (release rate, skill counts, flame trap), 07 and 08 and 13 and
  27 (water and lava not drawn on the maps), 10 and 24 (save target), 12 (solution order),
  14 (whole level; the image may be another version), 28 (exact exit position).
- Check: `npx markdownlint-cli2 docs/layouts/tricky.md`.
- Restart: fetch the wiki pages again with the MediaWiki API (`action=parse&prop=wikitext`),
  follow the `next` links from "This should be a doddle!", and download the map files named above
  into a scratch folder outside the repository. Never commit them.
- Next: phase B builds each level with the toolkit (plan M6.126), compares it with the reference
  side by side using the preview tool (plan M6.127), and records a solving replay per level.
