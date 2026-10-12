# Layout notes: Fun 01-30 (plan M6.129)

> Living document. Last update: 2026-10-12.
> Purpose: one traced layout per original Fun level, so that phase B can rebuild each level with
> our own terrain toolkit (vision L-01a, owner decision Q-C1).
> Status: phase A done (research and notes). Phase B (level JSON) has not started.

## How to read this document

- **Reference image.** Each level names the full-level map on the Lemmings Wiki that was viewed.
  The images were downloaded to a session scratch folder only. They are not in the repository,
  they are not shipped, and no pixel of them is sampled (vision X-02).
- **Coordinates.** Level pixels, origin top left, x grows to the right, y grows downwards. The
  level is 160 px high. The reference maps are 1:1 with our native resolution.
- **Width.** The width of the reference map, cropped to the terrain. Use it as the level width.
- **Boxes.** `x 100-200, y 120-160` is a box from x = 100 to x = 200 and y = 120 to y = 160.
  All boxes are traced by eye from a 3x grid overlay (20 px grid); expect an error of about 3 px.
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
  infobox; it mostly gives the Amiga numbers (often 100 lemmings instead of 80). Our levels hold
  at most 80 lemmings (vision G-15); a W count above 80 is capped and the save target is scaled.
  Skill counts come from W, because R has none. Values that disagree or are missing are marked
  `[verify]`.
- **Confidence.** high: full-level map, solution checked against the map. medium: map is clear,
  but a hazard (water, trap, fall height) or the solution path is only partly visible. low: the
  map leaves the puzzle mechanics open; phase B must invent part of it.

## Sources

| Key | Source | Used for | Read |
| --- | --- | --- | --- |
| W | [Lemmings Wiki (Fandom)](https://lemmings.fandom.com/wiki/Fun), one page per level, read through the MediaWiki API | Map images, infobox numbers, strategy | 2026-10-12 |
| R | [docs/levels-reference.md](../levels-reference.md) | Lemmings, save, release rate, time, key idea | 2026-10-12 |

Several Tricky and Taxing levels reuse a Fun map (see `tricky.md`). The traced geometry here and
there must agree; Fun 13 was traced by both agents.

## Overview

| No. | Name | Width (px) | Style | Confidence |
| --- | --- | --- | --- | --- |
| 01 | Just dig! | 510 | dirt | high |
| 02 | Only floaters can survive this | 446 | pillar | high |
| 03 | Tailor-made for blockers | 437 | pillar | high |
| 04 | Now use miners and climbers | 564 | marble | medium |
| 05 | You need bashers this time | 848 | crystal | high |
| 06 | A task for blockers and bombers | 770 | fire | high |
| 07 | Builders will help you here | 1054 | marble | high |
| 08 | Not as complicated as it looks | 1571 | pillar | high |
| 09 | As long as you try your best | 320 | marble | medium |
| 10 | Smile if you love lemmings | 1448 | pillar | medium |
| 11 | Keep your hair on Mr. Lemming | 312 | marble | high |
| 12 | Patience | 320 | pillar | high |
| 13 | We all fall down | 1525 | fire | high |
| 14 | Origins and Lemmings | 950 | pillar | high |
| 15 | Don't let your eyes deceive you | 1227 | pillar | high |
| 16 | Don't do anything too hasty | 741 | fire | high |
| 17 | Easy when you know how | 520 | marble | medium |
| 18 | Let's block and blow | 517 | fire | high |
| 19 | Take good care of my Lemmings | 1473 | marble | medium |
| 20 | We are now at LEMCON ONE | 1272 | marble | high |
| 21 | You Live and Lem | 1159 | dirt | medium |
| 22 | A Beast of a level | 958 | dirt | high |
| 23 | I've lost that Lemming feeling | 1584 | crystal | low |
| 24 | Konbanwa Lemming san | 596 | marble | medium |
| 25 | Lemmings Lemmings everywhere | 560 | crystal | medium |
| 26 | Nightmare on Lem street | 895 | pillar | high |
| 27 | Let's be careful out there | 1388 | marble | medium |
| 28 | If only they could fly | 1001 | fire | high |
| 29 | worra lorra lemmings | 736 | pillar | high |
| 30 | Lock up your Lemmings | 465 | fire | low |

Style mapping: the original earth cave is `dirt`, the hell set is `fire`, the pink stone set is
`marble`, the golden Greek set is `pillar`, the blue ice set is `crystal`. Fun 22 (forest) uses
`dirt`, Fun 23 (blue diagonal tiles) uses `crystal`.

## Fun 01: "Just dig!"

| Fact | Value |
| --- | --- |
| Reference | [File:Just Dig!.png](https://lemmings.fandom.com/wiki/File:Just_Dig!.png) on [Just dig!](https://lemmings.fandom.com/wiki/Just_dig!) |
| Width, style | 510 px, dirt |
| Numbers | 10 lemmings, save 10 % (1), release rate 50, 5 min (R and W agree) |
| Skills | digger 10, all others 0 (W) |

Terrain elements:

- Cave ceiling: rough polygon x 0-470, y 0-10, with moss `tuft`s hanging to y 35 at x 160-330
  (decor) and root `stalactite`s at x 30, x 300 (decor).
- Left rock mass: `blob` x 50-155, y 0-160, joined to the ceiling. A hollow opens to the left
  edge at x 0-50, y 10-110 (decor).
- Lower left lump: `blob` x 0-60, y 100-160.
- Middle shelf: rough polygon x 150-325, top y 76-80 with grass `tuft`s, bottom y 105. It joins
  the left mass at x 150 and the right mass at x 320.
- Right rock mass: `blob` x 320-470, y 0-90, joined to the ceiling; its lower face bulges to
  y 90 at x 330-400.
- Right column: rough polygon x 420-470, y 0-160, widening to x 410-510 at y 140-160.
- Floor: rough polygon x 0-510, top y 130-134 with grass `tuft`s, bottom y 160.

Objects: hatch (215, 42); exit (360, 130).

Solution idea: the lemmings land on the middle shelf and bounce between the two rock masses. One
digger cuts through the 25 px shelf; everyone follows to the floor and walks right to the exit.

## Fun 02: "Only floaters can survive this"

| Fact | Value |
| --- | --- |
| Reference | [File:Only floaters can survive.png](https://lemmings.fandom.com/wiki/File:Only_floaters_can_survive.png) on [Only floaters can survive this](https://lemmings.fandom.com/wiki/Only_floaters_can_survive_this) |
| Width, style | 446 px, pillar |
| Numbers | 10 lemmings, save 10 % (1), release rate 50, 5 min (R and W agree) |
| Skills | floater 10, all others 0 (W) |

Terrain elements:

- Pillar A: `pillar` shaft x 90-123, y 55-150, capital x 80-133, y 45-58.
- Pillar B: `pillar` shaft x 135-170, y 68-150, capital x 125-180, y 57-70.
- Pillar C: `pillar` shaft x 182-215, y 80-150, capital x 172-225, y 70-82.
- Floor: `slab` x 30-420, y 148-160.
- Left ruin: `brickWall` blocks, stacked x 0-70, y 68-150 (decor; it bounds the floor on the left).
- Right ruin: `brickWall` x 375-420, y 92-160 (bounds the floor on the right).
- Broken ceiling: rough polygon x 165-390, y 0-45 with a hanging capital and an `arch` fragment
  x 305-390, y 0-60 (decor).

Objects: hatch (105, 12); exit (345, 148).

Solution idea: the crowd lands on pillar A and steps down to B and C. From C (y 70) to the floor
(y 148) is a fatal 78 px drop. Every lemming gets a floater.

## Fun 03: "Tailor-made for blockers"

| Fact | Value |
| --- | --- |
| Reference | [File:Tailor made for blockers.png](https://lemmings.fandom.com/wiki/File:Tailor_made_for_blockers.png) on [Tailor-made for blockers](https://lemmings.fandom.com/wiki/Tailor-made_for_blockers) |
| Width, style | 437 px, pillar |
| Numbers | 50 lemmings, save 10 % (5), release rate 50, 5 min (R and W agree) |
| Skills | blocker 10, all others 0 (W) |

Terrain elements (all ledges are 2 px `girder`s):

- Ledge A: `girder` x 137-315, y 38-40 (under the hatch).
- Ledge B: `girder` x 65-178, y 58-60.
- Ledge C: `girder` x 36-100, y 78-80. Ledge D: `girder` x 146-274, y 78-80.
- Ledge E: `girder` x 76-200, y 98-100.
- Ledge F: `girder` x 53-181, y 118-120.
- Floor left: `slab` x 90-263, y 153-160, with a scroll end x 88-100, y 143-160.
- Floor right: `slab` x 295-437, y 153-160, scroll end x 425-437. Gap x 263-295 (fall out).
- Left column: `pillar` x 5-25, y 0-160 (decor). Right column: `pillar` x 335-367, y 0-150.
- Ceiling ornaments: `slab`s and inverted triangles x 40-300, y 0-22 (decor).

Objects: hatch (155, 12); exit (145, 153).

Solution idea: lemmings zig-zag down the ledges. Drops between ledges are 20 px. Blockers at the
ledge ends turn the crowd so that it reaches the floor near the exit instead of the gap or the
left void. The first blocker stands right of the hatch, the second at the left end of ledge B
or C, the third on the floor right of the exit.

## Fun 04: "Now use miners and climbers"

| Fact | Value |
| --- | --- |
| Reference | [File:Now use miners and climbers.png](https://lemmings.fandom.com/wiki/File:Now_use_miners_and_climbers.png) on [Now use miners and climbers](https://lemmings.fandom.com/wiki/Now_use_miners_and_climbers) |
| Width, style | 564 px, marble |
| Numbers | 10 lemmings, save 100 % (10), release rate 1, 5 min (R; W: release rate missing `[verify]`) |
| Skills | climber 10, miner 1, all others 0 (W) |

Terrain elements:

- Ceiling bar: `slab` x 0-460, y 0-6.
- Left column: `pillar` x 103-135, y 0-160 (passes through the upper beam).
- Hanging columns: `pillar` x 150-182, y 6-60 and x 295-327, y 6-60 (decor; above the beam).
- Upper beam: `slab` x 95-335, y 60-75 (segmented). Phase B: extend it to x 355 so that it meets
  the tower; otherwise the miner is not needed `[verify]`.
- Lower beam: `slab` x 135-425, y 112-127.
- Brick tower: `brickWall` x 355-370, y 48-112, topped by a platform `slab` x 355-420, y 48-56.
- Cross bracing: two crossing `girder`s x 370-427, y 65-112 (decor).
- Right column: `pillar` x 427-460, y 0-160.
- Rubble: `blob` x 0-65, y 125-160 and x 470-560, y 120-160 (decor).

Objects: hatch (225, 22); exit (385, 48) on the tower platform.

Solution idea: one miner digs diagonally through the upper beam onto the lower beam. The lemmings
walk right to the brick tower and climb it to the exit on top. All ten need the climber skill.

## Fun 05: "You need bashers this time"

| Fact | Value |
| --- | --- |
| Reference | [File:You need bashers this time.png](https://lemmings.fandom.com/wiki/File:You_need_bashers_this_time.png) on [You need bashers this time](https://lemmings.fandom.com/wiki/You_need_bashers_this_time) |
| Width, style | 848 px, crystal |
| Numbers | 50 lemmings, save 20 % (10), release rate 50, 5 min (R; W: save 5 of 50 `[verify]`) |
| Skills | basher 50, all others 0 (W) |

Terrain elements:

- Ceiling: rough polygon x 0-560, y 0-25 (ice rock).
- Big crystal: `crystal` x 62-112, y 28-110, at the left end of the pipe (turns walkers).
- Upper pipe: `slab` x 105-330, y 75-92 (a metal pipe; lemmings land on it).
- Vertical pipe: `rect` x 250-265, y 0-75 (decor).
- First wall: `blob` of ice rock x 295-420, y 0-160, with its face at x 330 where the pipe enters.
- Slide: diagonal pipe `ramp` from (400, 90) down to (440, 128).
- Lower left ground: `blob` x 40-140, y 105-160, snow floor x 140-300, y 145-160, small `crystal`s
  x 180-210, y 128-160 and x 255-280, y 123-160 (decor).
- Second wall: block `rect` x 430-460, y 115-147.
- Lower pipe: `slab` x 460-765, y 130-147.
- Mesh: a lattice of thin `girder`s forming a pyramid x 475-735, y 22-130, and a smaller pyramid
  x 475-570, y 82-130. The exit stands inside the big pyramid.
- Upper mesh: inverted triangles x 435-585, y 0-70 (decor).
- Right end: block `rect` x 765-795, y 115-147; ball joint `ellipse` x 765-795, y 40-70 on a pipe
  x 775-790, y 70-115; diagonal pipes x 715-848, y 0-45 (decor).

Objects: hatch (145, 38); exit (623, 130).

Solution idea: bash through the first wall from the upper pipe, slide down to the lower level,
bash the block and then the mesh in front of the exit. Bash low in the mesh to save cells.

## Fun 06: "A task for blockers and bombers"

| Fact | Value |
| --- | --- |
| Reference | [File:Blockers and bombers.png](https://lemmings.fandom.com/wiki/File:Blockers_and_bombers.png) on [A task for blockers and bombers](https://lemmings.fandom.com/wiki/A_task_for_blockers_and_bombers) |
| Width, style | 770 px, fire |
| Numbers | 50 lemmings, save 20 % (10), release rate 50, 5 min (R and W agree) |
| Skills | bomber 5, blocker 5, all others 0 (W) |

Terrain elements:

- Ceiling: rough polygon x 175-570, y 0-15 with small `stalactite`s (decor).
- Left block: `brickWall` x 175-225, y 56-128.
- Thin rail: `girder` x 225-350, y 69-71 between the two blocks (the lemmings land on it).
- Right block: `brickWall` x 350-400, y 56-80.
- Lower floor: `brickWall` x 225-450, y 92-128, then a step down to `brickWall` x 450-550,
  y 104-128. A dripping red underside to y 138 (decor).
- Thin wall: `rect` x 448-452, y 40-104 (a post beside the exit; the blocker stands at it).
- Twisted columns: `pillar` x 193-210, y 0-56; x 368-385, y 0-56 with a grille x 352-395,
  y 22-46; x 440-460, y 0-50 (decor).
- Rubble: `blob` x 0-110, y 95-160 and x 670-740, y 65-160 (decor).

Objects: hatch (255, 27); exit (495, 104).

Solution idea: bomb a lemming on the rail; the hole drops the crowd 22 px onto the lower floor.
The first lemming at the post becomes a blocker and is bombed to blast the post away.

## Fun 07: "Builders will help you here"

| Fact | Value |
| --- | --- |
| Reference | [File:You need builders.png](https://lemmings.fandom.com/wiki/File:You_need_builders.png) on [Builders will help you here](https://lemmings.fandom.com/wiki/Builders_will_help_you_here) |
| Width, style | 1054 px, marble |
| Numbers | 50 lemmings, save 50 % (25), release rate 50, 5 min (R and W agree) |
| Skills | builder 20, all others 0 (W) |

Terrain elements:

- Columns: `pillar` x 173-190, y 0-160 and x 845-862, y 0-160, each with an inverted triangle
  capital 50 px wide, y 0-38.
- Garlands: `chain` sagging between the capitals, y 10-40 (decor).
- Floor: `brickWall` x 190-420, top y 128, bottom y 160, over a `blob` base (decor).
- Raised step: `brickWall` x 422-525, top y 116 (12 px high: too high to walk up).
- Stairs: `steps` from (525, 116) to (575, 96), five 4 px risers.
- Plateau: `brickWall` x 575-674, top y 96.
- Pit: x 674-690, floor at y 128.
- Exit plateau: `brickWall` x 690-845, top y 96.
- Acid: `water` x 60-175, y 140-160 and x 862-975, y 140-160.
- Rubble: `blob` x 0-60, y 125-160 and x 975-1054, y 115-160 (decor).

Objects: hatch (235, 88); exit (782, 96).

Solution idea: build onto the raised step at x 422, walk up the stairs, and build a bridge over
the pit at x 674. Builders can also wall in the crowd.

## Fun 08: "Not as complicated as it looks"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel8.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel8.png) on [Not as complicated as it looks](https://lemmings.fandom.com/wiki/Not_as_complicated_as_it_looks) |
| Width, style | 1571 px, pillar |
| Numbers | 80 lemmings, save 95 % (76), release rate 88, 5 min (R; W: 100 lemmings, save 95, capped) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Main platform: `slab` x 500-835, y 100-120 (segmented blocks).
- Gap: x 835-860, open to the bottom.
- Right block: `slab` x 860-900, y 100-120, with a block x 882-900, y 82-100 (decor).
- Top band: `slab`s and blocks hanging from y 0 to y 30 along the whole width (decor).
- Columns with octagonal collars: `pillar` x 135-160, x 250-275, x 300-320, x 410-430, x 495-520,
  x 1050-1070, x 1100-1120, x 1300-1320, each y 0-160 or shorter (decor).
- Ruins: block stacks on wooden trestles x 30-100, y 30-160; x 175-225, y 40-160; x 345-385,
  y 50-160; arches and capitals x 1200-1571, y 40-160 (decor; none touch the platform).

Objects: hatch (575, 45); exit (540, 100).

Solution idea: the crowd lands right of the exit and walks right towards the gap. One blocker
right after the hatch turns everybody left into the exit.

## Fun 09: "As long as you try your best"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel9.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel9.png) on [As long as you try your best](https://lemmings.fandom.com/wiki/As_long_as_you_try_your_best) |
| Width, style | 320 px, marble |
| Numbers | 80 lemmings, save 90 % (72), release rate 99, 5 min (R; W: 100 lemmings, save 90, capped) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Frame: thin `slab` border along the top, y 0-3 (decor).
- Corner wedges: `polygon` triangles x 0-35 and x 285-320 at y 0-35 and y 125-160 (decor).
- Floor: `girder` x 50-280, y 123-130. Both ends are open; the fall goes out of the level.
- Central column: `pillar` x 150-167, y 63-123, with a capital `slab` x 135-183, y 63-70 and an
  urn on top (decor).
- Urns: small `rock`s x 57-72 and x 262-280, y 113-123. Phase B: keep them off the floor ends,
  so that walkers can fall off (the puzzle needs open ends) `[verify]`.

Objects: hatch (80, 88); exit (233, 123).

Solution idea: the column turns the crowd back to the left floor end, where it falls out. A
blocker under the hatch holds the crowd; a basher opens the column.

## Fun 10: "Smile if you love lemmings"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel10.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel10.png) on [Smile if you love Lemmings](https://lemmings.fandom.com/wiki/Smile_if_you_love_Lemmings) |
| Width, style | 1448 px, pillar |
| Numbers | 20 lemmings, save 50 % (10), release rate 50, 5 min (R and W agree) |
| Skills | 20 of each skill (W) |

Terrain elements (the puzzle sits at x 650-870):

- Landing stack: `slab` blocks x 763-805, y 45-125 (four stacked blocks, below the hatch).
- Left eye: blocks x 700-720, y 45-65 and x 700-743, y 65-85 (an L shape).
- Right eye: blocks x 838-857, y 85-105 and x 815-857, y 105-125 (an L shape).
- Exit floor: `slab` x 680-843, y 150-160.
- Steel walls: `steel` x 655-678, y 143-160 and x 843-866, y 143-160 (they hold the floor).
- More steel: `steel` x 512-535, y 143-160 and x 985-1008, y 143-160 (decor).
- Ruins left: broken `pillar`s x 0-35, x 55-90, x 225-260, an `arch` x 320-390, y 90-145, a log
  beam x 518-620, y 5-40, a stepped `rock` ramp x 435-530, y 105-160 (decor).
- Ruins right: logs and brick stacks x 880-1100, y 0-160; a block pyramid x 1220-1448,
  y 82-160 (decor).

Objects: hatch (780, 25); exit (720, 150).

Solution idea: the crowd lands on the stack top (y 45) and falls 105 px to the exit floor. The
first lemming floats down and blocks between the exit and the right steel; the others float.
For all 20: dig into the stack and mine out low.

## Fun 11: "Keep your hair on Mr. Lemming"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel11.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel11.png) on [Keep your hair on Mr. Lemming](https://lemmings.fandom.com/wiki/Keep_your_hair_on_Mr._Lemming) |
| Width, style | 312 px, marble |
| Numbers | 60 lemmings, save 83 % (50), release rate 50, 5 min (W; R says 50 lemmings `[verify]`) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Frame: `slab` ceiling x 0-312, y 0-5; side walls x 0-5 and x 305-312, y 0-160; corner braces
  `girder`s x 5-30, y 5-30 and x 282-307, y 5-30 (decor).
- Floor: riveted `slab` x 0-312, y 136-160.
- Mound: stepped `rect`s x 96-144, y 55-62; x 80-160, y 62-70; x 72-168, y 70-136.
- One-way: `one-way` left over the whole mound x 72-168, y 55-136 (red arrows pointing left).

Objects: hatch (40, 92); exit (282, 136).

Solution idea: the crowd walks right into the mound and cannot bash it. Two climber-floaters go
over. The first blocks in front of the exit; the second turns, bashes left through the mound
(the allowed direction) to the crowd. Bomb the blocker.

## Fun 12: "Patience"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel12.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel12.png) on [Patience](https://lemmings.fandom.com/wiki/Patience) |
| Width, style | 320 px, pillar |
| Numbers | 80 lemmings, save 50 % (40), release rate 99, 5 min (R and W agree) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Left floor: `rock` blocks x 0-80, y 120-160, with a slope x 80-100 from y 120 to y 140.
- Wooden stairs: `steps` from (93, 125) up to (130, 103).
- Central wall: `brickWall` x 130-190, y 37-160 (large sandstone blocks).
- Pit: x 190-220, floor at y 145 (an arched base `arch` x 180-220, y 140-160).
- Pit left: an arched base `arch` x 100-130, y 145-160.
- Right floor: `slab` x 218-320, y 120-160.
- Upper left shelf: `slab` x 5-110, y 28-45 with `steel` blocks x 10-45, y 0-28 and a vase
  `pillar` x 45-65, y 0-60 (decor).
- Upper right shelf: `slab` x 225-310, y 40-75 with `steel` blocks x 230-245, y 22-40 and
  x 285-300, y 5-40 and a vase `pillar` x 250-280, y 0-50 (decor).

Objects: hatch (20, 90); exit (298, 120).

Solution idea: bash the central wall from the top of the stairs. A blocker at the left floor
edge keeps the crowd in. The basher drops into the pit and builds out to the right floor.

## Fun 13: "We all fall down"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel13.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel13.png) on [We all fall down (Fun)](https://lemmings.fandom.com/wiki/We_all_fall_down_(Fun)) |
| Width, style | 1525 px, fire |
| Numbers | 20 lemmings, save 100 % (20), release rate 1, 3 min (R; W agrees on 20/20 and 3 min) |
| Skills | digger 20, all others 0 (W) |
| Map | Same map as Tricky 02 (see `tricky.md`; keep the geometry identical) |

Terrain elements:

- Rock mass left: rough polygon (0, 150), (75, 0), (230, 0), (230, 160), (0, 160).
- Short ledge: `slab` x 225-315, y 106-114, with a rough underside to y 120.
- Upper girder: `girder` x 325-900, y 53-58. The hatch stands above it.
- Twisted support: `pillar` x 340-358, y 58-160, capital x 335-365, y 55-75.
- Lower girder: `girder` x 390-965, y 120-128, on a thin leg `rect` x 938-946, y 128-160.
- Ceiling: rough polygon x 230-1525, y 0-10, with `stalactite`s at x 280, x 470, x 625, x 720,
  x 950 (to y 30-45) (decor).
- Right rock: `blob` x 1020-1100, y 0-90 hanging from the ceiling, on a twisted `pillar`
  x 1065-1080, y 90-160 (decor).
- Right floor: rough polygon x 1080-1525, y 140-160; twisted `pillar`s x 1200-1210 and
  x 1330-1345, y 20-140 (decor).

Objects: hatch (345, 22); exit (955, 120).

Solution idea: the drop from the upper girder (y 55) to the lower girder (y 120) is 65 px and
kills. Each lemming digs through the 5 px girder, so its fall starts lower and is survivable.

## Fun 14: "Origins and Lemmings"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel14.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel14.png) on [Origins and Lemmings](https://lemmings.fandom.com/wiki/Origins_and_Lemmings) |
| Width, style | 950 px, pillar |
| Numbers | 80 lemmings, save 75 % (60), release rate 20, 6 min (W; R has `[verify]` for all) |
| Skills | 20 of each skill (W) |
| Map | Same map as Tricky 30 (see `tricky.md`) |

Terrain elements:

- Water: `water` x 0-950, y 145-160, with rock bases `blob` under each pillar and at both ends.
- Beam 1 (high): `log` x 70-205, y 60-95, scroll end `rock` x 65-78, y 50-105.
- Pillar 1: `pillar` x 205-238, y 25-150.
- Beam 2 (low): `log` x 238-345, y 103-135.
- Pillar 2: `pillar` x 343-377, y 25-150.
- Beam 3 (high): `log` x 377-468, y 60-95.
- Pillar 3: `pillar` x 467-500, y 25-150.
- Beam 4 (low): `log` x 500-600, y 103-135.
- Pillar 4: `pillar` x 599-632, y 25-150.
- Beam 5 (high): `log` x 632-722, y 60-95.
- Pillar 5: `pillar` x 722-755, y 25-150.
- Beam 6 (low): `log` x 755-892, y 103-135, scroll end `rock` x 892-905, y 95-150.

Objects: hatch (100, 22); exit (865, 103).

Solution idea: bash pillar 1 from the high beam and drop 43 px to the low beam. Build up the
43 px to the level of the next high beam and bash pillar 2 from the stairs. Repeat for pillars 3
and 4. Bash pillar 5 and drop onto the exit beam.

## Fun 15: "Don't let your eyes deceive you"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel15.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel15.png) on [Don't let your eyes deceive you](https://lemmings.fandom.com/wiki/Don't_let_your_eyes_deceive_you) |
| Width, style | 1227 px, pillar |
| Numbers | 80 lemmings, save 80 % (64), release rate 40, 8 min (W: 100 lemmings, save 80, capped; R `[verify]`) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Ceiling: `slab` x 0-1210, y 0-7.
- Start column: `pillar` shaft x 45-80, y 80-140, capital x 37-90, y 72-80, base x 37-90,
  y 136-145.
- Rocks: `rock` x 90-110, y 100-145 and x 110-130, y 122-145 (steps down from the column).
- Floor: rough polygon x 15-815, y 143-160 (the left end slopes down to x 15).
- Pillar A: `pillar` x 363-400, y 45-143, with wooden `steps` x 335-363 up to y 108 (decor).
- Pillar B: `pillar` x 468-503, y 33-143, `steps` on both sides x 440-468 and x 503-535 (decor).
- Pillar C: `pillar` x 576-611, y 25-143, `steps` on both sides x 545-576 and x 611-645 (decor).
- Pit: x 815-905, open to the bottom.
- Right floor: rough polygon x 905-1227, y 143-160.
- Broken stairway: `steps` from (970, 143) up to (1012, 105); a gap x 1012-1045; `steps` from
  (1045, 100) up to (1083, 64).
- Scaffold: wooden `slab`s x 1085-1180, y 63-68 (top, exit), y 85-90, y 105-110, y 130-135 on
  posts `rect` x 1085-1092, x 1120-1127, x 1173-1180, y 63-148.
- Trap: `trap` squasher at (1055, 145), the hanging rope frame x 1048-1062, y 107-148.

Objects: hatch (50, 30); exit (1150, 63).

Solution idea: the first lemming bashes pillars A, B and C; the second blocks. The scout bridges
the pit at x 815 and the stairway gap at x 1012, climbs to the scaffold, and the blocker is
bombed. The trap sits under the stairway gap: whoever falls there dies.

## Fun 16: "Don't do anything too hasty"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel16.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel16.png) on [Don't do anything too hasty](https://lemmings.fandom.com/wiki/Don't_do_anything_too_hasty) |
| Width, style | 741 px, fire |
| Numbers | 80 lemmings, save 62 % (50), release rate 50 `[verify]`, 8 min (W; R `[verify]` for all) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Start slab: `brickWall` x 147-343, y 130-148, on three bracket `rock`s at x 155, x 245, x 320
  reaching y 160 (decor).
- Exit perch: `girder` x 497-570, y 68-73 on a twisted `pillar` x 523-545, y 73-130.
- Exit base: `brickWall` x 485-585, y 130-160.
- Spikes: `stalagmite`s x 0-25, y 122-160; x 370-385, x 410-430, x 445-460, x 475-490,
  y 132-160; x 715-741, y 120-160. A lemming that walks off the start slab dies.
- Graffiti: a red scrawl "HEAVEN ->" x 195-415, y 40-80 (decor; may be omitted).

Objects: hatch (200, 105); exit (535, 68).

Solution idea: the first lemming builds a long staircase from the right end of the start slab up
to the exit perch (62 px rise over about 155 px). Blockers at both slab ends hold the crowd and
are bombed at the end.

## Fun 17: "Easy when you know how"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel17.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel17.png) on [Easy when you know how](https://lemmings.fandom.com/wiki/Easy_when_you_know_how) |
| Width, style | 520 px, marble |
| Numbers | 50 lemmings, save 40 % (20), release rate 99, 5 min (R and W agree) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Main block: `brickWall` x 82-312, y 90-140, and a riveted `slab` x 312-360, y 88-140.
- Columns: four `pillar`s x 135-152, x 200-217, x 265-282, x 330-347, y 0-82, each on a stepped
  base x (column - 15)-(column + 33), y 75-90 (15 px high: walkers turn at it).
- Side columns: `pillar` x 40-55 and x 455-472, y 0-145, each with a cross `slab` 48 px wide at
  y 46-62 (decor).
- Bottom floor: `slab` x 0-520, y 155-160, with base mounds `rock` x 8-100, y 140-160 and
  x 420-505, y 140-160.
- Traps: `trap` squashers along the bottom passage at x 140, x 210, x 280 (y 155). They are not
  drawn on the map (R names them) `[verify]`.

Objects: hatches (115, 42), (180, 42), (245, 42), (310, 42); exit (435, 140).

Solution idea: each hatch drops into a compartment between two column bases. Bash the base of
the far right column; the lemmings fall 65 px off the block end, so they need floaters. A
floater blocks beside the exit side; another builds up to the wall. Bomb the blockers.

## Fun 18: "Let's block and blow"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel18.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel18.png) on [Let's block and blow](https://lemmings.fandom.com/wiki/Let%27s_block_and_blow) |
| Width, style | 517 px, fire |
| Numbers | 70 lemmings, save 71 % (50), release rate 80, 5 min (R and W agree) |
| Skills | bomber 20, blocker 20, all others 0 (W) |

Terrain elements:

- Entry path: `brickWall` x 0-95, y 41-50, with `steps` x 18-43 (y 37), x 43-68 (y 31), x 68-95
  (y 25).
- Left tower: `brickWall` x 95-118, y 18-145.
- Right tower: `brickWall` x 352-377, y 18-125.
- Floors: 2 px `girder`s x 118-352 at y 28, y 50, y 78, y 98, y 118; bottom `girder` x 118-507,
  y 148.
- Dividers (thin posts `rect`, 2 px wide): x 190 and x 243 (y 28-50); x 215 and x 296 (y 50-78);
  x 245 (y 78-98); x 207 (y 98-118); x 300 (y 118-148).
- Fire: `trap` fire pits on the floors: y 50 at x 136-166 and x 264-295; y 78 at x 168-198;
  y 98 at x 280-311; y 118 at x 168-198; y 148 at x 264-295.

Objects: hatch (30, 8); exit (490, 148).

Solution idea: the crowd walks onto the top girder between the towers. A blocker over a
compartment without fire is bombed; the hole drops the crowd one floor. Repeat floor by floor,
always next to the dividers, until the bottom girder leads right to the exit.

## Fun 19: "Take good care of my Lemmings"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel19.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel19.png) on [Take good care of my Lemmings](https://lemmings.fandom.com/wiki/Take_good_care_of_my_Lemmings) |
| Width, style | 1473 px, marble |
| Numbers | 80 lemmings, save 70 % (56), release rate 20, 5 min (W: 100 lemmings, save 70, capped; R `[verify]`) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Humps: five thick `arch`es (band 12 px) with their tops at y 122 and feet at y 160: hump A
  x 330-540, B x 540-725, C x 725-910, D x 910-1095 (filled with `brickWall`), E x 1095-1285.
  Where two humps meet, the valley is at y 150-160 (a fall there kills).
- Exit platform: `slab` x 1320-1465, y 83-100 on a `pillar` x 1385-1400, y 100-160 and thin posts
  x 1335-1340 and x 1445-1450, y 100-160.
- Left wall: `brickWall` x 245-310, y 0-160, with a lattice of `girder`s x 100-245, y 0-160
  (decor) and a `blob` x 0-100, y 115-160.
- Ceiling: inverted triangles and blocks x 300-960, y 0-50, a bar x 640-720, y 15-30 (decor);
  stepped `slab`s x 960-1200, y 0-15 (decor).
- Hanging rock: `blob` x 1220-1300, y 0-60 (decor).

Objects: hatch (435, 85); exit (1395, 83).

Solution idea: two blockers on hump A hold the crowd. The scout builds over each valley between
the humps and finally builds up from hump E to the exit platform (40 px rise).

## Fun 20: "We are now at LEMCON ONE"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel20.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel20.png) on [We are now at LEMCON ONE](https://lemmings.fandom.com/wiki/We_are_now_at_LEMCON_ONE) |
| Width, style | 1272 px, marble |
| Numbers | 50 lemmings, save 80 % (40) (W; R says 60 % `[verify]`), release rate 10, 5 min |
| Skills | 20 of each skill (W) |

Terrain elements:

- Start ledge: `slab` x 352-400, y 72-88.
- Gap: x 400-412, open to the bottom.
- Stairs down: `steps` from (412, 72) down to (500, 103), five steps.
- Pole floor: `slab` x 475-660, y 103-110, on four `pillar`s x 485-500, x 535-550, x 580-595,
  x 625-640, y 110-160.
- Seven poles: `rect`s 5 px wide, y 60-103, at x 500, x 528, x 548, x 576, x 596, x 623, x 643.
- Gap: x 660-676, open to the bottom.
- Exit block: inverted triangle `polygon` (676, 103), (750, 103), (713, 140), with diagonal
  struts to y 160 (decor).
- Left frame: `pillar` x 315-330, y 0-160 with cross bars y 60-65 and y 117-122; a bar
  x 330-365, y 118-122 and a `pillar` x 365-380, y 117-160 with an urn (decor).
- Ceiling pipe: `slab` x 418-680, y 3-15, railing x 680-780, y 0-15 (decor).
- Right column: `pillar` x 780-795, y 0-160, crossbars (decor).
- Thin poles far left: `rect`s x 213-225, x 235-245, x 283-288, x 302-304, y 0-160; a column
  x 15-32 with a cross (decor). Rubble `blob` x 1115-1272, y 125-160 (decor).

Objects: hatch (360, 45); exit (713, 103).

Solution idea: blockers on both sides of the start ledge (away from the ramp). The first lemming
bridges the gap at x 400, walks down the stairs, bashes the seven poles, and bridges the gap at
x 660. Bomb the right blocker.

## Fun 21: "You Live and Lem"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel21.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel21.png) on [You Live and Lem](https://lemmings.fandom.com/wiki/You_Live_and_Lem) |
| Width, style | 1159 px, dirt |
| Numbers | 80 lemmings, save 60 % (48), release rate 50, 8 min (W: 100 lemmings, save 60, capped; R `[verify]`) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Hill: grassy rough polygon rising from (15, 145) to the top (165, 52), falling to (200, 100);
  bottom y 160. Grass `tuft`s along the top.
- Cave rock: a large `blob` x 120-930, y 0-130 with a hollow chamber x 400-600, y 40-140. Its
  lower edge reaches y 100-130 with hanging roots and moss (decor).
- Inner walls: the rock between the hill and the chamber (x 200-400, thick) and a second wall
  x 600-700, y 60-150 (bash it).
- Chamber floor: rough polygon x 400-950, y 140-160.
- Water: `water` x 85-135 and x 300-340, y 145-160, each between `steel` blocks x 62-85,
  x 135-160, x 278-300, x 340-390, y 140-160.
- Fossil spirals: grey `rock` swirls x 325-365, y 5-100 and x 750-800, y 40-75 (decor).
- Right slope: rough polygon x 800-930, y 0-125 (descends to the right).
- Last pool: `water` x 960-1040, y 145-160, bridged by round `log`s at y 140-148.
- Exit mound: `blob` x 1040-1120, y 133-160. `steel` block x 760-785, y 145-160 (decor).
- Trap: `trap` squasher (a bear trap) at (585, 145) on the chamber floor.

Objects: hatch (80, 50); exit (1075, 135).

Solution idea: the second lemming blocks at the hilltop. The first mines through the thick wall
to the right down to ground level, bashes the second wall, and builds over the bear trap. Then
bomb or undercut the blocker.

## Fun 22: "A Beast of a level"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel22.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel22.png) on [A Beast of a level](https://lemmings.fandom.com/wiki/A_Beast_of_a_level) |
| Width, style | 958 px, dirt (the original is a forest) |
| Numbers | 80 lemmings, save 80 % (64), release rate 50 (W; R says 80 `[verify]`), 5 min |
| Skills | 20 of each skill (W) |

Terrain elements:

- Ground: grassy rough polygon x 10-930, top y 130, bottom y 160 (rounded left end at x 10),
  with a stone wall pattern (decor).
- Tree 1: trunk `pillar` x 160-195, y 70-130; crown `blob` x 105-235, y 0-90.
- Trees 2-3: trunks x 285-335 and x 340-400, y 40-130; crowns `blob` x 230-420, y 0-80.
- Trees 4-7: trunks x 420-460, x 510-545, x 560-600, x 625-660, y 30-130; crowns `blob`
  x 400-700, y 0-70. A stump `rock` x 425-450, y 115-130.
- Cliff: hedge `blob` x 710-958, top y 68, vertical face at x 710 (62 px high).
- Exit trees: trunk x 755-800, y 0-68 left of the exit; trunk x 870-920, y 0-68.

Objects: hatch (40, 90); exit (790, 68).

Solution idea: a blocker left of the hatch stops the crowd from walking off the left end. The
scout bashes through the trunks to the cliff, builds a zig-zag up the 62 px face, and bashes the
last trunk to the exit.

## Fun 23: "I've lost that Lemming feeling"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel23.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel23.png) on [I've lost that Lemming feeling](https://lemmings.fandom.com/wiki/I%27ve_lost_that_Lemming_feeling) |
| Width, style | 1584 px, crystal (blue diagonal tiles) |
| Numbers | 80 lemmings, save 25 % (20), release rate 50, 8 min (W; R `[verify]`) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Tile mass: a solid rough polygon covering x 50-1584, y 0-160, with these openings:
  - Hatch chamber x 610-1000, y 40-125 (the left face is a zig-zag at x 600-650).
  - Vertical shaft x 1000-1018, y 0-160 (open).
  - Diagonal slits (about 12 px wide, 45 degrees) in x 50-600 and in x 1050-1584 (bash through
    them; small hollow spaces).
- Chamber floor: tile top y 125 x 610-775 and y 123 x 815-990.
- Lava pit: `trap` fire x 775-810, y 145-160 between `steel` blocks x 750-775 and x 810-833,
  y 135-160.
- Upper exit ledge: `steel` x 0-50, y 55-75. Lower exit ledge: `steel` x 0-50, y 143-160.
- Fire traps: `trap` fire at (1085, 105), (1125, 70), (1185, 110) inside the right slits.
- Graffiti: red "EXIT" with an "X" at x 180-265, y 15-100; x 480-570, y 65-130; x 1425-1500,
  y 30-100 (decor; the last one marks a hidden exit in the original).

Objects: hatch (735, 80); exits (20, 55) and (20, 143).

Solution idea: block the lava pit side. A basher works left through the tile mass, re-bashing in
each hollow, mines onto a ridge and builds under the fire to the left wall, then bashes to the
exit. Only 20 of 80 need to be saved. The mechanics of the slits are not fully visible: low
confidence, phase B designs the hollows.

## Fun 24: "Konbanwa Lemming san"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel24.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel24.png) on [Konbanwa Lemming San](https://lemmings.fandom.com/wiki/Konbanwa_Lemming_San) |
| Width, style | 596 px, marble |
| Numbers | 30 lemmings, save 66 % (20), release rate 99, 5 min (R and W agree) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Top girder: `girder` x 140-330, y 33-35 (under the hatch).
- Second girder: `girder` x 190-260, y 59-61, ending at a slanted block `polygon` x 222-268,
  y 46-61 with red arrows: `one-way` right x 222-268, y 46-61.
- Block: `brickWall` x 260-335, y 59-95 with a diagonal underside x 260-295.
- Acid: `water` (green) x 335-395, y 63-83, held by a wall `rect` x 395-410, y 40-95; a girder
  over it x 327-395, y 55-57.
- Walkway: `girder` x 123-523, y 108-113 on `pillar`s at x 140, x 190, x 240, x 290, x 340, x 390,
  x 440, x 490 (each 15 px wide, y 113-160); a post x 123-127, y 85-113 at the left end.
- Lower floor: `girder` x 5-547, y 143-150 over rubble `blob`s (decor).
- Columns: `pillar` x 25-40, y 0-110; x 455-470, y 0-80; x 577-592, y 0-160.
- Trap: `trap` squasher hanging under the column x 455-470 at y 80-85, triggering on the walkway
  at x 460.
- Rubble: `blob` x 0-120, y 95-160 and x 545-596, y 115-160.

Objects: hatch (165, 12); exit (440, 143).

Solution idea: dig through the top girder onto the second girder near the one-way block, dig
again onto the walkway, walk right and dig a third time before the squasher, down to the lower
floor next to the exit. Lemmings that walk on are lost; 20 of 30 suffice.

## Fun 25: "Lemmings Lemmings everywhere"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel25.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel25.png) on [Lemmings Lemmings everywhere](https://lemmings.fandom.com/wiki/Lemmings_Lemmings_everywhere) |
| Width, style | 560 px, crystal |
| Numbers | 80 lemmings, save 50 % (40), release rate 99, 5 min (W: 100 lemmings, save 50, capped; R agrees on 50 %) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Left crystal: `crystal` x 0-50, y 100-160.
- Start pipe: `slab` x 45-148, y 140-157.
- Mesh: a lattice of thin diagonal `girder`s (X pattern, 8 px cells) filling x 148-385,
  y 100-160; x 168-385, y 65-100; x 138-385, y 40-65 (top edge at y 30-40 for x 300-385).
- Ice sticks: thin `girder`s from (105, 70) to (135, 40), from (138, 70) to (168, 100), and from
  (178, 40) to (210, 7) (decor).
- Right frame: `crystal` sliver x 380-400, y 40-150.
- Spider web: thin `girder` strands, a spiral of four rings and eight spokes, centre (460, 85),
  spanning x 400-560, y 5-145.
- Exit floor: `girder` x 400-480, y 157-160.

Objects: hatch (95, 105); exit (445, 145).

Solution idea: the crowd walks into the mesh. Bash and mine through the lattice, keeping the
lemmings in the bigger cells, until the leftmost outer chamber of the web. Stay low; bash through
the bottom of the chamber to the exit.

## Fun 26: "Nightmare on Lem street"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel26.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel26.png) on [Nightmare on Lem Street](https://lemmings.fandom.com/wiki/Nightmare_on_Lem_Street) |
| Width, style | 895 px, pillar |
| Numbers | 2 lemmings, save 100 % (2), release rate 30, 5 min (R and W agree) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Tower A: `slab` blocks x 478-520, y 50-130 (four stacked blocks).
- T-block B: bar `slab` x 542-625, y 70-90; stem x 562-603, y 90-150; side block x 603-645,
  y 110-130.
- T-block C: bar `slab` x 650-735, y 50-70; stem x 670-713, y 70-150.
- Floor: `slab` x 478-730, y 150-160 (a fall from the towers onto it kills).
- Exit platform: `slab` x 713-800, y 97-117 on a capital x 745-800, y 117-125 and a `pillar`
  x 755-790, y 125-160.
- Diamond rock: `polygon` (800, 120), (845, 78), (893, 105), (845, 160) with a `trap` squasher
  (rope trap) at (845, 85) (off the path).
- Left: a pyramid `polygon` (250, 160), (338, 75), (400, 160); a log `log` x 410-478, y 110-125;
  block rubble x 0-290, y 85-160; a column with collars `pillar` x 182-215, y 0-160 (decor).
- Ceiling drapes: `arch`es hanging from y 0 to y 20 x 515-775 (decor).

Objects: hatch (515, 20); exit (765, 97).

Solution idea: only two lemmings, both must live. The first builds from tower A across the gap
x 520-542 to T-block B; then from B up across the gap x 625-650 to T-block C (20 px higher).
From C both drop 47 px to the exit platform.

## Fun 27: "Let's be careful out there"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel27.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel27.png) on [Let's be careful out there](https://lemmings.fandom.com/wiki/Let%27s_be_careful_out_there) |
| Width, style | 1388 px, marble |
| Numbers | 50 lemmings, save 50 % (25), release rate 1 (R; W missing), 5 min |
| Skills | 20 of each skill (W) |

Terrain elements:

- Start beam: `slab` x 400-580, y 74-82.
- Supports: `pillar` x 413-428, y 82-160; a T-block x 462-510, y 82-95 on a `pillar` x 480-493,
  y 95-160.
- Roof: `slab` x 420-640, y 23-33; left end stepped down to x 380-420, y 30-60; right side
  stepped `steps` down from (640, 33) to (770, 95).
- Left structure: stepped `slab`s x 290-400, y 40-85 on `pillar`s x 293-310, y 50-145 and
  x 348-365, y 85-160; rubble `blob` x 230-400, y 105-160.
- Lower floor: `slab` x 525-718, y 150-160.
- Right stairs: `steps` from (730, 145) up to (800, 100); a `pillar` x 755-770, y 140-160; a
  block x 800-810, y 100-160.
- Acid: `water` x 810-920, y 145-160.
- Mushroom rock: `blob` x 910-950, y 100-125 on a stem `rect` x 925-930, y 125-143 and a block
  x 920-945, y 143-160; rubble `blob` x 945-1095, y 125-160.
- Far right: `pillar`s x 1270-1290, y 55-160 and x 1365-1388, y 75-160 with capitals (decor).
- Far left: a lamp post, a bent `girder` from (20, 75) over (48, 48) to (75, 75) and down to
  y 160; a `blob` x 0-40, y 70-90 (decor).

Objects: hatch (490, 45); exit (660, 150).

Solution idea: the drop from the start beam (y 74) to the exit floor (y 150) kills. Block right
of the hatch before the edge; build over the gap to the left, block again, build up onto the
roof, walk right down the roof steps, block before the acid, and build left over the last gap to
the exit floor. Raise the release rate to 99 at the end.

## Fun 28: "If only they could fly"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel28.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel28.png) on [If only they could fly](https://lemmings.fandom.com/wiki/If_only_they_could_fly) |
| Width, style | 1001 px, fire |
| Numbers | 80 lemmings, save 60 % (48), release rate 80, 5 min (W: 100 lemmings, save 60, capped) |
| Skills | 30 of each skill (W) |

Terrain elements:

- Ladder: rungs `slab` x 560-610, 5 px thick, at y 45, y 65, y 85, y 105; rails `rect`
  x 563-566 and x 603-606, y 35-120.
- Floor: `brickWall` x 275-615, y 147-160.
- Lava: `trap` fire x 228-275 and x 628-685, y 147-160.
- Blocks: `steel` x 188-228, y 140-160; x 615-628 and x 685-710, y 140-160; x 818-840,
  y 140-160.
- Exit zig-zag: short `girder`s x 267-292 at y 63, y 96, y 128 and x 287-312 at y 80, y 112;
  the exit stands on the top one.
- Fire platform: `brickWall` x 400-480, y 75-110 with a fire `trap` x 405-480, y 90-100 and a
  grille x 415-465, y 45-75 (decor).
- Rock ceilings: `blob` x 5-260, y 0-110 and x 660-960, y 0-140, with `stalactite`s along
  y 0-45.
- Twisted columns: `pillar` x 200-222, y 0-115; x 433-450, y 0-55; x 638-655, y 0-90.

Objects: hatch (580, 12); exit (280, 63).

Solution idea: the first lemming, a climber and floater, heads left. Under the fire platform it
builds a long ramp up to the exit zig-zag. Meanwhile the crowd digs through each rung down to
the floor. When the ramp is done, the crowd follows. All can be saved.

## Fun 29: "worra lorra lemmings"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel29.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel29.png) on [Worra lorra Lemmings](https://lemmings.fandom.com/wiki/Worra_lorra_Lemmings) |
| Width, style | 736 px, pillar |
| Numbers | 80 lemmings, save 60 % (48), release rate 90, 8 min (W: 100 lemmings, save 60, capped; R `[verify]`) |
| Skills | 30 of each skill (W) |

Terrain elements:

- Start log: `log` x 555-615, y 100-135, scroll end `rock` x 550-565, y 92-140.
- Water: `water` x 563-590, x 618-688, y 148-160, between `steel` blocks x 515-560, x 590-618,
  x 688-736, y 138-160.
- Post: `rect` x 530-537, y 85-140.
- Broken column: `pillar` x 475-510, y 100-160.
- Block stack: `rock`s x 450-470, y 77-95; x 433-453, y 95-115; x 440-470, y 115-160.
- Broken stairs: `steps` x 400-430, from (400, 122) down to (430, 160).
- Mound: `blob` x 270-400, y 120-160.
- Pyramid: `polygon` (30, 160), (150, 40), (270, 160), in sandstone blocks.
- Timber frame: beams `slab` x 95-228, y 7-15; x 205-327, y 43-50; x 87-228, y 61-68;
  x 63-295, y 115-123. Riveted `steel` posts x 0-12, y 68-160; x 50-62, y 68-145; x 98-110,
  y 15-90; x 137-150, y 15-50; x 190-203, y 15-90; x 258-270, y 0-40; x 312-325, y 0-105. Wooden
  `steps` hang between the beams (decor).
- Exit ledge: `slab` x 0-72, y 63-70.

Objects: hatch (570, 70); exit (25, 63).

Solution idea: the first lemming blocks at the right end of the log so nobody falls into the
water. The others bash left through the block stack and the broken stairs, build up to the long
beam (y 115), bash through the pyramid, and build a zig-zag up to the exit ledge.

## Fun 30: "Lock up your Lemmings"

| Fact | Value |
| --- | --- |
| Reference | [File:Lemmings FunLevel30.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel30.png) on [Lock up your Lemmings](https://lemmings.fandom.com/wiki/Lock_up_your_Lemmings) |
| Width, style | 465 px, fire |
| Numbers | 60 lemmings, save 66 % (40), release rate 10, 5 min (W; R says 70 lemmings `[verify]`) |
| Skills | 20 of each skill (W) |

Terrain elements:

- Central tower: `brickWall` x 215-240, y 52-160.
- Cell 1 (top): `girder` x 240-290, y 52-57, with a lock post `rect` x 235-248, y 40-52 at its
  left end (12 px high: walkers turn).
- Cell 2 (left): `girder` x 140-215, y 88-93, with a lock post `rect` x 208-213, y 75-88.
- Cell 3 (right): `girder` x 240-290, y 128-133, with a lock post `rect` x 242-248, y 113-128.
- Exit floor: `brickWall` x 153-215, y 148-160 (a step x 153-165, y 145-148).
- Fire cage: `rect` frame x 63-112, y 90-143 (top bar y 90-97, bottom bar y 135-143) with a fire
  `trap` x 70-105, y 120-135.
- Fire shelf: `girder` x 100-172, y 50-55 with a fire `trap` x 120-152, y 40-50 and hanging
  hooks x 100-125 and x 147-170, y 10-65 (decor).
- Twisted column: `pillar` x 80-98, y 0-90.
- Right rock: `blob` x 300-465, y 0-150; a block `steel` x 360-385, y 148-160; left block
  `rect` x 0-25, y 145-160.

Objects: hatch (240, 20); exit (190, 148).

Solution idea: the crowd lands in cell 1. Bash left through the lock post; the lemming crosses
the tower top and drops into cell 2. Dig a few steps left of the post; the 55 px fall onto the
exit floor is survivable. A basher may face the wrong way (50 %); then barricade with a blocker
or builder. The exact purpose of cell 3 is not visible on the map: low confidence.

## Resume here

- State: phase A done. All 30 Fun levels have a traced layout, numbers, skills and a solution
  idea. Phase B (level JSON in `assets/levels/fun/`, replays) has not started.
- Open `[verify]` items: Fun 04 (upper beam length decides whether the miner is needed),
  05 and 11 and 20 and 22 and 30 (R and W disagree on save, lemmings or release rate), 09 (urns
  at the floor ends), 16 (release rate), 17 (traps not drawn), 23 and 30 (mechanics partly
  invisible; low confidence).
- Check: `npx markdownlint-cli2 docs/layouts/fun.md`.
- Restart: fetch the wiki pages again with the MediaWiki API (`action=parse&prop=wikitext`) and
  download the map files named above with `curl` and a `Referer: https://lemmings.fandom.com/`
  header into a scratch folder outside the repository. The CDN may return WebP; convert to PNG.
  Never commit them.
- Next: phase B builds each level with the toolkit (plan M6.126), compares it with the reference
  side by side using the preview tool (plan M6.127), and records a solving replay per level.
