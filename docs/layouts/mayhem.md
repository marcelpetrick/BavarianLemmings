# Layout notes: Mayhem 01-30 (plan M6.132)

> Living document. Last update: 2026-10-12.
> Purpose: one traced layout per original Mayhem level, so that the round 2 rebuild
> (`assets/levels/mayhem/`) follows the original puzzle with our own shapes (vision L-01a, Q-C1).

## How these notes were made

1. Per level, the level page of the [Lemmings Wiki](https://lemmings.fandom.com/wiki/Mayhem) was
   read: numbers, skills, strategy text and the name of its level map image.
2. The level map image was downloaded into the session scratchpad only. It is not in the repository,
   it is not committed, and nothing was sampled from it (vision X-02).
3. The image was scaled up three times with a pixel grid (10 px ticks, lines every 20 px) and read
   by eye. Every box below is our estimate of the original geometry, rounded to about 5 px.
4. The text describes **what** stands **where**. Shapes, textures and colours are ours (vision
   L-01a). The images show the Amiga or DOS version; both share the layouts.
5. A value that no source confirms for the DOS version is marked `[verify]`.

## Terms and conventions

- **Map pixel**: one pixel of the reference image. Map pixels equal our level pixels (1:1). The
  reference images are cropped to the used area, so the level width is the image width.
- **Box**: `x 0-140, y 108-160` means the area from x 0 to x 140 and from y 0 at the top to y 160 at
  the bottom. y grows downwards. The level is 160 px high.
- **Hatch (x, y)**: the point where a lemming appears, just under the trapdoor opening.
- **Exit (x, y)**: the middle of the exit at floor level; the floor top is at y.
- **Element kinds** (terrain toolkit, plan M6.126): `rect`, `ellipse`, `polygon` (optionally
  rough), `blob` (noisy rock lump), and the pieces `rock`, `pillar`, `brickWall`, `steps`, `ramp`,
  `arch`, `crystal`, `girder`, `stalactite`, `stalagmite`, `tuft`, `slab`, `log`, `chain`. Areas:
  `steel`, `one-way left`, `one-way right`. Objects: `hatch`, `exit`, `water`, `trap` (squasher or
  fire).
- **Style**: dirt, fire, marble, pillar or crystal. The original "Egyptian" set maps to `pillar`
  (sand-coloured blocks and columns); the original "hell" set maps to `fire`.
- **Lemmings**: the DOS version allows at most 80 lemmings (vision G-15). A count of 100 in the
  Amiga original becomes 80 here, and the rescue percentage stays.
- **Decoration**: an element far from every route. It may be simplified or left out.
- **Confidence**: high = layout and route are clear from image and text; medium = layout clear,
  some details or the route are guessed; low = the route through the layout is our reading.

## Maps shared with other ratings

Many Mayhem levels reuse a map of an earlier rating with harder numbers. The integrator should keep
the shared terrain identical, or only change it where the numbers below demand.

| Mayhem | Same map as |
| --- | --- |
| 03 | Fun 24 |
| 04 | Fun 25 |
| 05 | Fun 28 |
| 06 | Tricky 09 |
| 07 | Fun 20 |
| 09 | Fun 29 |
| 11 | Fun 13, Tricky 02, Taxing 30 |
| 13 | Fun 26 |
| 15 | Tricky 10 |
| 19 | Tricky 11 |
| 20 | Fun 04 |
| 21 | Tricky 12 |
| 24 | Fun 30 |
| 25 | Tricky 13 |
| 26 | Fun 21 |
| 27 | Mayhem 16 without one small ledge |

## Summary of the numbers

Source: the Lemmings Wiki level pages (columns "Lem" and "Save" for the Amiga original, "DOS" for
the DOS differences the page lists). Times in minutes. Skill order: climber, floater, bomber,
blocker, builder, basher, miner, digger.

| No. | Name | Lem | Save | RR | Time | Skills | DOS notes | Style |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | Steel Works | 100 | 90 % | 15 | 8 | 0/5/10/5/30/0/0/5 | CD: 80, save 72 | dirt |
| 02 | The Boiler Room | 100 | 90 % | 30 | 6 | 10/5/10/10/30/0/0/0 | | fire |
| 03 | It's hero time! | 30 | 100 % | 99 | 1 | 1/1/1/1/1/1/1/1 | | marble |
| 04 | The Crossroads | 100 | 100 % | 99 | 1 | 0/0/10/0/0/10/0/0 | PC: 50, 80 %, 20 bashers | crystal |
| 05 | Down, along, up. In that order | 80 | 75 % | 80 | 5 | 2/2/10/10/5/1/0/5 | | fire |
| 06 | One way or another | 75 | 100 % | 50 | 4 | 0/0/10/0/15/0/5/5 | | dirt |
| 07 | Poles Apart | 50 | 90 % | 50 | 5 | 1/10/0/0/6/4/0/4 | | marble |
| 08 | Last one out is a rotten egg! | 100 | 90 % | 55 | 5 | 5/0/5/5/10/0/5/5 | 80, save 72 | fire |
| 09 | Curse of the Pharaohs | 100 | 99 % | 90 | 4 | 0/0/20/1/12/5/0/1 | | pillar |
| 10 | Pillars of Hercules | 75 | 66 % | 1 | 5 | 2/3/4/2/20/4/0/2 | | marble |
| 11 | We all fall down | 80 | 100 % | 1 | 3 | 0/0/0/0/0/0/0/80 | | fire |
| 12 | The Far Side | 75 | 100 % | 50 | 4 | 2/1/0/0/20/5/5/5 | | dirt |
| 13 | The Great Lemming Caper | 2 | 100 % | 50 | 5 | 1/1/2/2/2/10/10/10 | | pillar |
| 14 | Pea Soup | 80 | 93 % | 70 | 5 | 0/0/10/10/30/0/0/21 | | marble |
| 15 | The Fast Food Kitchen... | 100 | 96 % | 60 | 2 | 10 of each | PC: 80, 75 %, 3 min | fire |
| 16 | Just a Minute... | 50 | 100 % | 10 | 1 | 0/1/5/0/0/5/0/5 | | marble |
| 17 | Stepping Stones | 80 | 87 % | 50 | 4 | 5/2/0/2/10/5/5/5 | | marble |
| 18 | And then there were four.... | 100 | 90 % | 1 | 9 | 2/0/20/10/30/1/2/1 | 80, save 72 | dirt |
| 19 | Time to get up! | 50 | 92 % | 20 | 5 | 2/0/4/0/20/0/0/0 | | marble |
| 20 | No added colours or Lemmings | 50 | 100 % | 85 | 5 | 2/0/0/1/1/1/2/0 | | marble |
| 21 | With a twist of lemming please | 50 | 100 % | 1 | 5 | 1/50/0/0/4/1/0/1 | | marble |
| 22 | A BeastII of a level | 100 | 85 % | 75 | 5 | 10/10/10/10/15/10/10/10 | 80, save 68 | dirt |
| 23 | Going up....... | 100 | 80 % | 70 | 9 | 0/1/20/20/30/5/0/0 | | crystal |
| 24 | All or Nothing | 50 | 100 % | 99 | 1 | 0/0/0/0/0/3/0/0 | | fire |
| 25 | Have a nice day! | 100 | 90 % | 1 | 5 | 2/2/0/2/25/1/1/1 | | pillar |
| 26 | The Steel Mines of Kessel | 100 | 90 % | 50 | 8 | 0/0/10/10/10/0/0/0 | 80, 75 %, 20 each | dirt |
| 27 | Just a Minute (Part Two) | 50 | 100 % | 10 | 1 | 1/1/5/0/0/5/0/5 | | marble |
| 28 | Mind the step..... | 1 | 100 % | 1 | 7 | 0/0/0/0/25/10/0/15 | | marble |
| 29 | Save Me | 100 | 80 % | 50 | 5 | 0/0/0/6/15/2/0/2 | | pillar |
| 30 | Rendezvous at the Mountain | 80 | 75 % | 20 | 9 | 10/1/10/10/30/10/10/4 | | dirt |

Our recreations use 80 where the table says 100, and the DOS numbers where the page lists DOS
differences. All counts carry `[verify]` against a DOS source until one confirms them.

## Mayhem 01: Steel Works

- Reference: [File:Lemmings MayhemLevel1.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel1.png),
  level page [Steel Works](https://lemmings.fandom.com/wiki/Steel_Works).
- Width: 1016 px. Style: dirt, with many steel blocks.
- Numbers: 80 lemmings (DOS CD), save 90 % (72), RR 15, 8 minutes. Skills: floater 5, bomber 10,
  blocker 5, builder 30, digger 5.

Layout:

1. Left dirt mound: `blob` x 0-140, y 105-160, top near y 108 at x 55-90; small mound `blob`
   x 175-245, y 132-160.
2. Hatch trapdoor x 200-245, y 0-22. Hatch (215, 22).
3. Steel ledge under the hatch: `slab` x 172-268, y 74-96, **steel**. Lemmings land here.
4. Steel post down from the ledge's right end: x 244-268, y 74-160, **steel**.
5. Steel floor: x 244-470, y 144-160, **steel**. With the post it forms the "steel pit".
6. Hanging steel post: x 300-324, y 0-72, **steel**.
7. Steel stepped pyramid (`steps`, **steel**): x 365-413 y 72-96; x 355-425 y 96-120;
   x 343-437 y 120-144; x 330-450 y 144-160; small block x 450-473, y 142-160.
8. Dirt ceiling with roots: `blob` (rough underside) x 345-620, y 0-45; decoration.
9. Water: x 470-600, y 146-160.
10. Floating steel block: x 518-543, y 119-133, **steel**.
11. Hanging steel post: x 620-643, y 0-96, **steel**.
12. Steel floor right of the water: x 600-720, y 140-160, **steel**.
13. Steel fortress (`brickWall`, **steel**): top x 682-862 y 25-50; body x 690-870 y 50-96 with a
    protruding block x 678-700 y 72-96; lower part narrowing x 690-760 y 96-150.
14. Exit (838, 25) on the fortress top.
15. Right dirt mound: `blob` x 770-1016, y 118-160.

Solution idea: one floater lands and builds a step under the hatch so the drop is survivable; a
second floater goes ahead; blockers hold the crowd on the steel ledge. The leader zig-zags with
builders out of the steel pit, over the pyramid, bridges the water (mind the niche at x 450-470),
and zig-zags up the fortress via the protruding block to the exit. A bomber frees the right
blocker.

Notes: the hatch-to-ledge drop (about 52 px) must be just lethal in our engine, or the first
builder step loses its purpose. `[verify]` which grey blocks are steel; all are steel here.

Confidence: high (image clear, text matches).

## Mayhem 02: The Boiler Room

- Reference: [File:Lemmings MayhemLevel2.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel2.png),
  level page [The Boiler Room](https://lemmings.fandom.com/wiki/The_Boiler_Room).
- Width: 671 px. Style: fire.
- Numbers: 80 lemmings, save 90 % (72), RR 30, 6 minutes. Skills: climber 10, floater 5, bomber 10,
  blocker 10, builder 30.

Layout:

1. Left steel block (diamond plate): x 0-172, y 0-140, ragged left edge, **steel**.
2. Steel floor: x 0-400, y 140-160, **steel**; right end slanted (x 390-405).
3. Exit pillar: `pillar` x 195-215, y 62-145, with a crossbar `girder` x 170-262, y 62-68 and a
   short stub x 245-258, y 68-76. Exit (215, 62) on the crossbar (horned face in the original; our
   own exit art).
4. Steel wall: x 300-325, y 0-88, **steel**. Trap (fire, flame thrower) x 255-300, y 58-72,
   shooting left from the wall.
5. Platform under the wall: `slab` x 265-360, y 102-110, rough underside.
6. Ceiling: `blob` x 340-480, y 0-15.
7. Hatch trapdoor x 480-520, y 57-75. Hatch (495, 75).
8. Hatch platform: `slab` x 450-545, y 102-115. Lemmings land here.
9. Big rock mass: `blob` from x 480-590 at y 0 to x 545-650 at y 140, down to y 160; it closes the
   hatch platform on the right.
10. Spikes: `stalagmite` x 420-430, 452-462, 484-494, 515-525, all y 145-160. Below the hatch
    platform there is no floor: a fall there is deadly.
11. Crossed girders on the rock face x 590-670: decoration.

Solution idea: a builder bridges left from the hatch platform's left edge, a blocker holds the
crowd. The bridge reaches the platform under the steel wall, a second stair climbs left to the
exit crossbar. The flame thrower zone is passed by building up to the steel block, then block and
bomb. Bomb the start blocker, release at 99.

Confidence: medium (layout clear, the exact staircase targets are guessed).

## Mayhem 03: "It's hero time!"

- Reference: [File:Lemmings MayhemLevel3.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel3.png),
  level page [It's hero time!](https://lemmings.fandom.com/wiki/It%27s_hero_time!).
- Width: 596 px. Style: marble. Same map as Fun 24.
- Numbers: 30 lemmings, save 100 % (30), RR 99, 1 minute. Skills: one of each.

Layout:

1. Left column: `pillar` x 25-42, y 0-112.
2. Left rock mound: `blob` x 0-130, y 98-160, top at x 50-70.
3. Hatch trapdoor x 140-180, y 5-25. Hatch (152, 26).
4. Thin bar under the hatch: `girder` x 140-330, y 33-36. Lemmings land on it.
5. Second thin bar: `girder` x 190-260, y 59-62.
6. Small block with ramp: `ramp` x 222-237 rising right, block x 237-265, y 46-60, **one-way
   right** `[verify]` (red arrows in the original).
7. Brick block: `brickWall` x 265-395, y 59-97; its lower left edge is a diagonal from (255, 60) to
   (295, 97). Thin bar `girder` x 320-385, y 55-58 on top.
8. Acid pool on the block: water x 330-385, y 67-84 (the block below it is x 330-395, y 84-97).
9. Brick wall: x 385-400, y 41-97 `[verify]` steel.
10. Short post: x 122-126, y 87-112.
11. Long bridge: `girder` x 122-520, y 108-118, on `pillar` legs at x 145-160, 193-208, 240-255,
    288-303, 335-350, 383-398 (each y 118-160).
12. Hanging column: `pillar` x 446-462, y 0-82, with a small cap x 435-470, y 80-83.
13. Lower bridge: `girder` x 405-570, y 145-150. Exit (440, 145).
14. Right rock slope: `blob` x 525-575, y 117-160. Right column: `pillar` x 570-586, y 0-160.
15. Rubble along the bottom: `blob` y 150-160 under the bridges.

Solution idea (time is the puzzle): a miner from the last lemming cuts down from the thin bar
towards the bridge; it bashes through the one-way block. The first lemming gets climber and
floater. A builder turns the basher round. The athlete lands near the exit and digs into the lower
bridge, or the miner opens a path, so every lemming reaches the exit within 60 s.

Notes: the original needs a pause trick at the start; our time should give about 5 s of slack.

Confidence: medium (image clear; the order of skills is tight and needs a replay test).

## Mayhem 04: The Crossroads

- Reference: [File:Lemmings FunLevel25.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel25.png),
  level page [The Crossroads](https://lemmings.fandom.com/wiki/The_Crossroads).
- Width: 560 px. Style: crystal. Same map as Fun 25.
- Numbers (PC version): 50 lemmings, save 80 % (40), RR 99, 1 minute. Skills: bomber 10, basher 20.
  The Amiga original has 100 lemmings, 100 % and 10 bashers.

Layout:

1. Left crystal: `crystal` x 0-50, y 100-160.
2. Two pipes: `girder` x 48-148, y 140-146 and y 152-158.
3. Hatch trapdoor x 80-120, y 100-118. Hatch (100, 118).
4. Chain-link mesh, dense part: x 148-370, y 100-160. Sparse upper part: x 170-370, y 40-100, with a
   stepped left edge (x 140 at y 40, x 168 at y 70-100).
5. Thin diagonal bars: x 105-140 from (105, 70) to (140, 40); x 138-168 from (138, 68) to (168,
   100); x 178-210 from (178, 38) to (210, 8).
6. Spider web: `girder` strands radiating from (450, 85) over x 380-560, y 0-150; rim strands
   about 30 px apart.
7. Thin floor under the web: `girder` x 380-480, y 155-157. Exit (440, 155).

Solution idea: the crowd walks up the mesh; bashers cut a diagonal path through the sparse mesh
towards the web, then through the web strands down to the exit, all within one minute.

Notes: our lemmings cannot climb a see-through mesh. Build the mesh as `steps` of small solid
`girder` rungs (2-3 px high, 6-8 px apart in height), so walkers step up it, as Fun 25 round 1 did.
The 10 bombers are a red herring.

Confidence: medium (image clear; the mesh needs a walkable substitute).

## Mayhem 05: Down, along, up. In that order

- Reference: [File:Lemmings FunLevel28.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel28.png),
  level page [Down, along, up. In that order](https://lemmings.fandom.com/wiki/Down,_along,_up._In_that_order).
- Width: 1001 px. Style: fire. Same map as Fun 28.
- Numbers: 80 lemmings, save 75 % (60), RR 80, 5 minutes. Skills: climber 2, floater 2, bomber 10,
  blocker 10, builder 5, basher 1, digger 5.

Layout:

1. Hanging rock mass: `blob` x 0-260, y 0-125, an inverted triangle with its tip at (110, 125);
   `stalactite` at (185, 60-90).
2. Twisted column: `pillar` x 200-225, y 0-115, with a round foot.
3. Exit (283, 64) on the top `slab` x 268-293, y 65-70. Below it, floating `slab`s in a zig-zag:
   x 288-313 y 82-88; x 268-293 y 98-103; x 288-313 y 112-118; x 268-293 y 128-133.
4. Floor stones: `rock` x 55-80 y 140-160; x 190-212 y 140-160.
5. Fire pit: water (lava colours) x 212-272, y 147-160.
6. Long floor: `slab` x 272-610, y 144-160.
7. Stalactites: `stalactite` at x 320-330 (to y 30), 340-350 (40), 390-400 (35), 470-490 (35),
   500-510 (45).
8. Hanging columns: `pillar` x 375-390, y 0-35 and x 430-450, y 0-55, each with a cap.
9. Floating island: `pillar` capital x 415-460 y 50-75; `slab` x 395-480 y 75-85; `slab` x 395-480
   y 98-115. Traps (fire) x 400-430 and x 455-480, y 92-98. Decoration, away from the route.
10. Hatch trapdoor x 560-600, y 5-25. Hatch (575, 26).
11. Shelves under the hatch: four `slab`s x 555-605 at y 47-52, 67-72, 87-92, 107-112, with thin
    side posts x 557-560 and x 600-603, y 37-120. Each shelf is a closed box.
12. Fire pit: x 620-680, y 147-160. Floor stones: x 685-710 y 140-160; x 815-840 y 140-160.
13. Column with a round foot: `pillar` x 635-655, y 0-90.
14. Right rock mass: `blob` x 655-960, y 0-135.

Solution idea: an athlete (climber and floater) leaves the shelves to the left and walks the long
floor. Diggers open the shelves one after another so the crowd drops down. The athlete builds up
to the first floating slab; blockers on each slab's edge turn the next builder round; builders
climb the zig-zag of slabs up to the exit.

Confidence: medium (layout clear; the shelf posts and wall heights are estimates).

## Mayhem 06: One way or another

- Reference: [File:Lemmings TrickyLevel9.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel9.png),
  level page [One way or another](https://lemmings.fandom.com/wiki/One_way_or_another).
- Width: 949 px. Style: dirt. Same map as Tricky 09.
- Numbers: 75 lemmings, save 100 % (75), RR 50, 4 minutes. Skills: bomber 10, builder 15, miner 5,
  digger 5.

Layout:

1. Dirt ceiling with vines: `blob` x 90-905, y 0-20, `tuft`s hanging.
2. Left trunk of earth: `rock` x 40-90, y 0-160, widening to x 15-95 below y 100; grey stones on it
   (decoration). Steel block x 0-15, y 140-160, **steel**.
3. Ground: rolling `blob` with grass x 90-262, y 135-160.
4. One-way mound: `stalagmite` x 185-210, y 105-160, **one-way left** (yellow arrows).
5. Chasm x 262-318 (no floor).
6. Ground x 318-665, y 133-160, with a hump at x 470-530 (top y 138). Exit (500, 138).
7. Gap x 665-705. Grass mound `blob` x 705-820, y 145-160. Gap x 820-840.
8. Big dirt rock: `rock` x 840-910, y 65-160. Steel x 890-949, y 140-160, **steel**.
9. Steel beam: x 140-285, y 68-90, **steel**; gap x 285-308; beam x 308-730, y 68-90, **steel**.
10. Hatch trapdoor x 475-515, y 20-40. Hatch (493, 42). Lemmings land on the beam.
11. Steel pit on the right: step down to x 715-830, y 93-115; walls x 790-830, y 68-90 and block
    x 805-855, y 45-68; all **steel**.
12. One-way stalactite: `stalactite` x 725-770, y 0-65, **one-way left**, above the pit.

Solution idea: right-walkers end in the steel pit. One lemming is turned round (builder, then
miner) and bridges the steel gap at x 285, walks to the beam's left end, and builds a ramp towards
the earth trunk so the drop to the ground is safe. It builds over the one-way mound (no bashers)
and bridges the chasm. Meanwhile builders free the crowd from the steel pit; all walk left over the
beam to the exit.

Confidence: medium (one-way directions are read from arrow shapes; `[verify]`).

## Mayhem 07: Poles Apart

- Reference: [File:Lemmings FunLevel20.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel20.png),
  level page [Poles Apart](https://lemmings.fandom.com/wiki/Poles_Apart).
- Width: 1272 px (the rock pile x 1135-1272 is decoration; the level may end at x 820).
  Style: marble. Same map as Fun 20.
- Numbers: 50 lemmings, save 90 % (45), RR 50, 5 minutes. Skills: climber 1, floater 10, builder 6,
  basher 4, digger 4.

Layout:

1. Left column: `pillar` x 15-32, y 0-160, crossbar x 0-48, y 77-92 (decoration).
2. Thin background poles x 213-304, y 0-160: decoration, leave out or draw without collision.
3. Column: `pillar` x 315-330, y 0-160, with collars at y 0-8, 60-68, 118-125.
4. Ledge `slab` x 315-380, y 118-123, on legs x 360-375, y 123-160. Trap (squasher) at x 350-370,
   y 100-118 (the original's trap; acid omitted from the image `[verify]`).
5. Marble brick under the hatch: `slab` x 345-392, y 72-87. Hatch trapdoor x 355-395, y 32-55.
   Hatch (365, 56).
6. Staircase down to the right: `steps` from (415, 72) to (490, 108), steps 15 px wide and 8 px
   high.
7. Bridge deck: `slab` x 470-660, y 105-112, on `pillar`s x 480-495, 528-543, 576-591, 624-640
   (y 112-160).
8. Seven poles on the deck: `pillar` 5 px wide at x 495, 523, 543, 571, 591, 618, 640, each
   y 60-105.
9. Exit platform: inverted triangle `polygon` x 680-750, y 105-140, apex (713, 140), on diagonal
   `girder` struts x 660-800, y 105-160. Exit (713, 104).
10. Top pipe: `girder` x 410-790, y 0-15. Right column: `pillar` x 785-795, y 0-160. Strut
    x 745-790, y 140-145.
11. Acid along the bottom: water y 150-160 where no terrain stands `[verify]`.

Solution idea: a builder at the edge of the hatch brick saves most of the crowd from walking back
into the acid; a digger at the stairs stops left-walkers. The climber climbs pole 1, digs it down
from the top and builds on to the next pole; poles 3 and 5 likewise; bashers take the last two
poles and the two left standing; the last builder bridges the gap x 660-680 to the exit platform.

Confidence: medium (terrain clear; the acid is not in the image).

## Mayhem 08: "Last one out is a rotten egg!"

- Reference: [File:Lemmings MayhemLevel8.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel8.png),
  level page [Last one out is a rotten egg!](https://lemmings.fandom.com/wiki/Last_one_out_is_a_rotten_egg!).
- Width: 668 px. Style: fire.
- Numbers: 80 lemmings (DOS), save 90 % (72), RR 55, 5 minutes. Skills: climber 5, bomber 5,
  blocker 5, builder 10, miner 5, digger 5.

Layout:

1. Small block left: `rock` x 0-25, y 140-160.
2. Hatch trapdoor x 140-180, y 68-90. Hatch (145, 90).
3. Start platform: `slab` x 118-243, y 117-125, dripping underside to y 135. It is thick enough
   for a turn-round tunnel.
4. One-way block: `brickWall` x 318-368, y 16-123, **one-way left** (red arrows pointing left).
5. Wall foot under the block: x 316-330, y 123-160; notch x 330-340, y 123-140.
6. Floor: `slab` x 330-660, y 150-160.
7. Steel plates: x 398-425, y 0-123, and x 425-448, y 0-25, **steel**. Thin vertical bars x 425-448,
   y 25-120 (decoration or thin terrain).
8. Big rock: `blob` x 445-650, y 0-160 with a cave x 455-560, y 95-150 open to the floor.
9. Exit (515, 150) inside the cave.

Solution idea: a blocker stops left-walkers; the next lemming builds up to the right from the
platform's edge until it meets the one-way block; it climbs and digs at the block's right edge into
the gap between block and steel; builders and a miner make a tunnel from the left that ends above
the stairs, so the crowd can follow; the gap leads down to the floor and the exit cave.

Confidence: low (layout clear; the route through the one-way block is our reading of the text).

## Mayhem 09: Curse of the Pharaohs

- Reference: [File:Lemmings FunLevel29.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel29.png),
  level page [Curse of the Pharaohs](https://lemmings.fandom.com/wiki/Curse_of_the_Pharaohs).
- Width: 736 px. Style: pillar (Egyptian). Same map as Fun 29.
- Numbers: 80 lemmings, save 99 % (79), RR 90, 4 minutes. Skills: bomber 20, blocker 1, builder 12,
  basher 5, digger 1.

Layout:

1. Exit (25, 60) on the wooden beam `log` x 0-72, y 60-68.
2. Steel posts (**steel**): x 0-12 y 68-160; x 50-63 y 68-135; x 98-112 y 15-95; x 138-150 y 15-60;
   x 192-205 y 15-95; x 258-270 y 0-42; x 312-325 y 0-110; x 78-90 y 123-147; x 178-190 y 123-147;
   x 272-285 y 123-160.
3. Wooden beams (`log`): x 95-228 y 7-15; x 205-330 y 43-50; x 90-115 y 62-70; x 128-228 y 62-70;
   x 63-295 y 115-122 (runs through the pyramid).
4. Broken stairs (`steps`, thin): x 15-50 from (50, 70) down to (15, 160); x 110-150 y 18-45;
   x 155-190 y 18-62; x 228-245 y 62-75; x 275-330 from (275, 105) down to (330, 160).
5. Pyramid: `polygon` apex (150, 40), base x 30-270 at y 160.
6. Stair pyramid: `steps` x 340-430, y 122-160 with a block x 380-400, y 122-160.
7. Stone block pile: `brickWall` x 433-475, y 78-160 (blocks 20 px).
8. Column cluster: `pillar`s x 475-510, y 98-160. Wooden pole `log` x 530-537, y 87-150.
9. Fallen column: `pillar` lying x 550-610, y 102-135 with scroll ends. Lemmings land on top.
10. Hatch trapdoor x 560-600, y 60-80. Hatch (575, 80).
11. Steel blocks: x 510-555, x 585-612, x 690-736, all y 137-160, **steel**.
12. Water: x 555-585 and x 612-690, y 147-160.

Solution idea: a blocker at the fallen column's right edge; bashers through the block pile, the
columns and the big obstacle before the broken stairs; the crowd falls into the stair gap; builders
lead up to the wooden beam; a basher crosses the pyramid under the steel; zig-zag builders reach
the exit beam.

Confidence: medium (image clear; the beam heights are estimates).

## Mayhem 10: Pillars of Hercules

- Reference: [File:Lemmings MayhemLevel10.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel10.png),
  level page [Pillars of Hercules](https://lemmings.fandom.com/wiki/Pillars_of_Hercules).
- Width: 671 px. Style: marble. Two exits.
- Numbers: 75 lemmings, save 66 % (50), RR 1, 5 minutes. Skills: climber 2, floater 3, bomber 4,
  blocker 2, builder 20, basher 4, digger 2.

Layout (nearly mirror-symmetric about x 335):

1. Ceiling: `brickWall` x 105-280 y 0-17 and x 135-280 y 17-35; slope `polygon` x 280-315,
   y 0-35; mirror: slope x 355-390, blocks x 390-540 y 0-35 and x 540-585 y 0-20.
2. Hatch trapdoor x 315-355, y 8-30. Hatch (335, 32).
3. Two thin poles under the hatch: x 318-322 and x 350-354, y 42-122, with short arms at y 42-44
   (x 305-322 and x 350-368) and at y 81-83. The lemmings fall between them.
4. Central block: `brickWall` x 300-370, y 120-160. The fall from the hatch to it is deadly.
5. Left basin: walls x 160-305, y 120-160; acid (water) x 190-300, y 128-150. Thin poles with caps:
   x 210 (cap x 203-220, y 98-102), x 245 (cap x 237-253, y 88-92).
6. Right basin: walls x 365-505, y 120-160; acid x 370-475, y 128-150; thin pole x 423 (cap
   x 415-430, y 112-117); thin grids over it x 365-410 and x 425-480, y 115-122.
7. Stairs outwards: `steps` from (160, 122) down to (0, 160), and from (505, 122) down to
   (671, 160).
8. Left exit pillar: `pillar` x 40-55, y 60-145, capital x 25-72 y 55-62, base x 25-72 y 140-160.
   Exit (48, 55).
9. Right exit pillar: `pillar` x 610-625, same heights. Exit (618, 55).

Solution idea: a floater lands and builds a zig-zag under the hatch until the drop is survivable;
more floaters reduce losses. A climber leaves over a pole, digs through the two thin grids, lands
beside the acid, and builds to the pole caps and on up to an exit pillar. Then release at 99 and
bash the wall to free the crowd.

Confidence: medium (image clear; how the shaft is closed at the bottom is a guess).

## Mayhem 11: We all fall down

- Reference: [File:Lemmings FunLevel13.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel13.png),
  level page [We all fall down (Mayhem)](https://lemmings.fandom.com/wiki/We_all_fall_down_(Mayhem)).
- Width: 1525 px (x 1010-1525 is decoration; the level may end at x 1010). Style: fire.
  Same map as Fun 13, Tricky 02, Taxing 30.
- Numbers: 80 lemmings, save 100 % (80), RR 1, 3 minutes. Skills: digger 80.

Layout:

1. Left rock mass: `blob` x 0-230, y 0-160, its left edge slanting from (60, 0) to (0, 160).
   Ledge `slab` x 225-315, y 108-118.
2. Hatch trapdoor x 330-370, y 12-32. Hatch (345, 34).
3. Upper slab: `slab` x 325-900, y 54-60, on a twisted `pillar` x 340-355, y 60-160.
4. Lower slab: `slab` x 390-965, y 120-128, on thin legs x 410-415 and x 935-942, y 128-160.
5. Exit (950, 120) at the lower slab's right end.
6. Stalactites along the ceiling, y 0-40: `stalactite` at x 240, 285, 340, 415, 480, 525, 605,
   725, 790, 845, 950.
7. Right decoration: rock lump x 1010-1100, y 0-95 on a twisted column x 1065-1080; floor
   x 1070-1525, y 140-160; columns x 1195-1210 and x 1335-1350, y 20-145; ceiling y 0-25.

Solution idea: the drop from the upper slab to the lower slab (66 px) is deadly. Each digger at the
slab edge shaves a few pixels, so the drop becomes survivable; the crowd follows the digger down.
80 lemmings need tight, fast digging at the edge.

Notes: Fun 13 round 1 found that each lemming digs its own hole in our engine. Keep that
simplification and check the replay.

Confidence: high.

## Mayhem 12: The Far Side

- Reference: [File:Lemmings MayhemLevel12.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel12.png),
  level page [The Far Side](https://lemmings.fandom.com/wiki/The_Far_Side).
- Width: 554 px. Style: dirt.
- Numbers: 75 lemmings, save 100 % (75), RR 50, 4 minutes. Skills: climber 2, floater 1,
  builder 20, basher 5, miner 5, digger 5.

Layout:

1. Upper left beam: steel plates x 0-205, y 48-72, **steel**, with dirt patches (`blob` with grass)
   x 0-80 y 45-85 and x 112-150 y 47-90 (the dirt parts are diggable).
2. Hatch trapdoor x 235-275, y 20-42. Hatch (250, 42).
3. Middle beam: x 185-400, y 72-95, **steel**. Lemmings land on it. The upper beam's end
   (x 185-205, y 48-72) forms the pit's left wall.
4. Steel wall: x 280-303, y 0-120, **steel**; cap x 265-320, y 0-13, **steel**. The pit is x 205-280.
5. Exit (322, 72) on the beam right of the steel wall.
6. Floating dirt island: `blob` x 30-100, y 97-150, with steel plates x 30-52 and x 77-100,
   y 97-120, **steel**; dirt x 52-77 between them.
7. Small dirt lump: x 85-105, y 150-160.
8. Dirt hill: `blob` rising from (175, 160) to (280, 110), then x 303-470 at y 108-115, falling
   to (480, 160). Steel block x 280-303, y 135-160, **steel**. Grey roots in the hill: decoration.
9. Gap in the steel wall: y 120-135 (dirt only), the way through.
10. Hanging dirt: `blob` x 420-500, y 0-120 with grey stones; ceiling `blob` x 330-554, y 0-30.

Solution idea: a climber leaves the pit to the left; a builder starts the ramp that will later
hold the crowd. The climber digs through the dirt between steel plates, bashes under the left
plate, lands on the island, digs again, turns, and bashes through the gap under the steel wall.
From the end of the bash tunnel it builds stairs up to the exit beam; then the crowd's ramp is
finished and all walk round.

Confidence: medium (layout clear; the island and dirt patches are the route and need care).

## Mayhem 13: The Great Lemming Caper

- Reference: [File:Lemmings FunLevel26.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel26.png),
  level page [The Great Lemming Caper](https://lemmings.fandom.com/wiki/The_Great_Lemming_Caper).
- Width: 895 px. Style: pillar (Egyptian). Same map as Fun 26.
- Numbers: 2 lemmings, save 100 % (2), RR 50, 5 minutes. Skills: climber 1, floater 1, bomber 2,
  blocker 2, builder 2, basher 10, miner 10, digger 10.

Layout:

1. Left block rubble: `brickWall` blocks 20 px, x 0-290, y 100-160 (rows at y 100, 120, 140) and
   one block x 40-60, y 82-100. Broken column stump x 35-70, y 145-160.
2. Big twisted column: `pillar` x 182-215, y 0-160.
3. Hanging column: `pillar` x 265-298, y 0-38.
4. Sand pyramid: `polygon` apex (337, 75), base x 255-415 at y 160.
5. Hanging column with capital: `pillar` x 395-425, y 0-65, capital x 380-430, y 60-73.
6. Broken column: `pillar` x 380-405, y 87-150; lying column `pillar` x 405-470, y 110-125.
7. Hatch trapdoor x 465-505, y 8-30. Hatch (480, 30).
8. Block tower: `brickWall` x 470-510, y 50-130 (four blocks). Lemmings land on top.
9. Middle structure: overhang x 535-615 y 70-90; post x 555-595 y 90-160; ledge x 595-640
   y 110-130.
10. Right block wall: x 640-735 y 50-70; x 670-712 y 70-150; base x 680-730 y 150-160.
11. Floor: `slab` x 470-680, y 150-160.
12. Exit slab: `slab` x 712-880, y 98-118, on a `pillar` capital x 740-790, y 118-160. Exit
    (765, 98).
13. Diamond rock: `polygon` x 790-880, y 80-160; decoration stairs and a hanging lamp
    x 780-885 (leave out).
14. Drapes along the top x 510-720, y 0-22: decoration.

Solution idea: the first lemming builds from the tower's edge to the middle structure; the second
gets a floater (and a miner to stall it if needed). The lower lemming bashes the middle wall; the
upper one drops down the ledge and builds against the right wall; the lower one climbs and both
meet the exit slab. Bombers are a red herring.

Confidence: medium (image clear; the two-lemming choreography needs a replay test).

## Mayhem 14: Pea Soup

- Reference: [File:Lemmings MayhemLevel14.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel14.png),
  level page [Pea Soup](https://lemmings.fandom.com/wiki/Pea_Soup).
- Width: 692 px. Style: marble.
- Numbers: 80 lemmings, save 93 % (75), RR 70, 5 minutes. Skills: bomber 10, blocker 10,
  builder 30, digger 21.

Layout:

1. Floor: `slab` x 0-692, y 150-160. Steps at both ends: `steps` x 0-48, y 140-160 and
   x 640-692, y 145-160.
2. Hatch trapdoor x 62-102, y 97-118. Hatch (70, 120). Lemmings land on the floor.
3. Bowl, left rim: `brickWall` x 180-195, y 100-125; inner steps down: x 195-210 y 108-133,
   x 210-225 y 115-138, x 225-240 y 120-142, x 240-252 y 122-145.
4. Bowl bottom: `brickWall` x 252-445, y 125-148. Right side mirrors the left: steps x 445-490,
   rim x 490-505, y 100-125.
5. Soup: water (green) x 195-490, y 105-125.
6. Peas: four small `blob`s floating on the soup: x 255-268 y 101-106; x 283-298 y 101-106;
   x 393-407 y 98-106; x 425-438 y 100-106.
7. Exit (597, 145) on a small base `slab` x 573-620, y 145-150.

Solution idea: a builder starts right under the hatch and bridges up to the left rim; a digger
breaks the first ramp behind it so the crowd waits. From the rim the builder lands on each pea and
starts a new stair from there, so the bridge stays low enough; overshoot is corrected with a
digger. After the far rim, the broken ramp at the start is repaired and the crowd crosses.

Confidence: high.

## Mayhem 15: "The Fast Food Kitchen..."

- Reference: [File:Lemmings TrickyLevel10.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel10.png),
  level page [The Fast Food Kitchen...](https://lemmings.fandom.com/wiki/The_Fast_Food_Kitchen...).
- Width: 882 px. Style: fire. Same map as Tricky 10. Two hatches.
- Numbers (PC version): 80 lemmings, save 75 % (60), RR 60, 3 minutes. Skills: 10 of each. The
  Amiga original has 100, 96 %, 2 minutes.

Layout (mirror-symmetric about x 440):

1. Chains: `chain` x 0-25, y 0-160 and x 855-882, y 0-160 (the bottom link rests on a block
   y 140-160).
2. Left island: `slab` x 97-350, y 100-130, spiky top, dripping underside.
3. Left rock blob: `blob` x 180-245, y 60-115, on the island.
4. Left hatch trapdoor x 115-155, y 52-75. Hatch (125, 76).
5. Exit pillar: `brickWall` x 425-450, y 68-160. Exit (445, 67) on top.
6. Side pillars: `brickWall` x 380-405 and x 475-500, y 82-160.
7. Right island: `slab` x 520-760, y 100-130. Right rock blob: `blob` x 635-690, y 65-120.
8. Right hatch trapdoor x 705-745, y 60-80. Hatch (720, 80).

Solution idea: blockers at the outer island ends; one lemming per side bashes through its rock
blob, a blocker goes behind it; both trailblazers build from the inner island ends up to the exit
pillar at the same time (time is short); then the inner blockers are bombed.

Confidence: high.

## Mayhem 16: "Just a Minute..."

- Reference: [File:Lemmings MayhemLevel16.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel16.png),
  level page [Just a Minute...](https://lemmings.fandom.com/wiki/Just_a_Minute...).
- Width: 514 px. Style: marble.
- Numbers: 50 lemmings, save 100 % (50), RR 10, 1 minute. Skills: floater 1, bomber 5, basher 5,
  digger 5.

Layout:

1. Left rock mound: `blob` x 0-155, y 85-160. Column with capital: `pillar` x 50-65, y 55-160,
   capital x 35-80, y 35-58.
2. Hatch trapdoor x 145-185, y 45-65. Hatch (160, 66).
3. Main platform: `slab` x 95-200, y 97-103. Trap (squasher; a spinner in the original) at
   x 95-120, y 82-97 on its left end.
4. Under the platform: posts `pillar` x 110-125 y 103-135 and x 158-175 y 103-160; small ledges
   `slab` x 142-158 y 112-118 and x 174-190 y 112-120 (the niche where the crowd gathers).
5. Big brick block: `brickWall` x 190-385, y 63-160; lighter triangles at its top corners
   x 190-225 and x 355-385, y 63-100; lighter slab x 215-385, y 128-160 `[verify]` steel.
6. Exit slab: `slab` x 380-480, y 112-118, on posts x 395-410 and x 445-460, y 118-160. Exit
   (400, 112). Trap (squasher) x 440-460, y 100-112.
7. Right column with balcony: `pillar` x 475-495, y 0-160; balcony x 460-514, y 70-100.
8. Top decoration: triangles x 125-200 y 0-18, x 235-265 y 0-33, x 290-325 y 0-33; pipes y 5-20.

Solution idea: lemming 1 bashes into the block, then digs down; lemming 2 digs through the thin
platform beside the block into the niche; the crowd gathers in the niche. Lemming 1 bashes again
at niche depth towards the exit; a last basher opens the niche wall so the crowd catches up just
in time.

Confidence: high (image clear; the 60-s timing needs a replay test).

## Mayhem 17: Stepping Stones

- Reference: [File:Lemmings MayhemLevel17.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel17.png),
  level page [Stepping Stones](https://lemmings.fandom.com/wiki/Stepping_Stones).
- Width: 669 px. Style: marble.
- Numbers: 80 lemmings, save 87 % (70), RR 50, 4 minutes. Skills: climber 5, floater 2, blocker 2,
  builder 10, basher 5, miner 5, digger 5.

Layout:

1. Left columns: `pillar` x 15-32 and x 63-80, y 0-160, crossbar x 0-95, y 73-88.
2. Left wall: `brickWall` x 95-110, y 0-160. Ceiling: `slab` x 95-570, y 0-15.
3. Hatch trapdoor x 115-155, y 23-45. Hatch (125, 46).
4. Start platform: `brickWall` `polygon` (110, 68), (225, 68), stepped down-left to (140, 160),
   (110, 160). The right edge steps back 8-10 px every 10 px of height.
5. Stepping stones: two tiny `rect` blocks x 293-297 and x 370-374, y 68-76.
6. Exit platform: `brickWall` `polygon` (445, 68), (570, 68), (570, 160), (552, 160), with a
   diagonal underside from (450, 70) to (552, 160). Exit (515, 68).
7. Right wall: `brickWall` x 555-570, y 0-160. Right columns: `pillar` x 585-600 and x 633-650,
   y 0-160, crossbar x 570-669, y 75-88.
8. Rock mound: `blob` x 355-395, y 140-160 (decoration; a fall there is deadly).

Solution idea: the first lemming builds from the platform's last block; a blocker holds the crowd.
Three builders reach the first stone, three the second, three more the exit platform. The blocker
is freed by digging and bashing under its feet; the last builder stops the basher.

Confidence: high.

## Mayhem 18: "And then there were four...."

- Reference: [File:Lemmings MayhemLevel18.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel18.png),
  level page [And then there were four....](https://lemmings.fandom.com/wiki/And_then_there_were_four....).
- Width: 865 px. Style: dirt. Four hatches.
- Numbers: 80 lemmings (DOS), save 90 % (72), RR 1, 9 minutes. Skills: climber 2, bomber 20,
  blocker 10, builder 30, basher 1, miner 2, digger 1.

Layout (nearly mirror-symmetric about x 430):

1. Steel cross: post x 415-442, y 0-50 and y 105-160; upper beam x 300-560, y 49-62; lower beam
   x 340-545, y 92-105; all **steel**.
2. Hatches: upper left trapdoor x 365-405 y 0-20, hatch (370, 22); upper right x 455-495, hatch
   (468, 22); lower left x 365-405 y 108-130, hatch (370, 130); lower right x 455-495, hatch
   (468, 130).
3. Exit (430, 92) on the lower beam, between the hatches. Small steel blocks on the lower beam
   x 385-397 and x 465-480, y 85-92, **steel**.
4. Bottom floor: x 340-540, y 154-160, **steel**.
5. Left side: steel x 300-320 y 49-75, x 300-315 y 92-120; upper beam continues left x 75-265,
   y 49-62, **steel**, with a dirt mass under it `blob` x 75-260, y 62-100; steel post x 255-268,
   y 62-123.
6. Left water: x 278-330, y 147-160, between steel x 255-278 (y 137-155) and x 330-340 (y 147-160).
7. Left hill: `blob` x 0-280, y 22-160, a big rock x 5-75 rising to y 22; `chain` of beads
   x 45-85, y 27-60 (decoration).
8. Right side: upper beam continues as dirt `blob` x 555-790, y 45-75; steel drop x 530-545,
   y 105-130.
9. Right water: x 545-595, y 147-160, between steel x 528-545 and x 593-615 (y 137-160).
10. Right dirt mass: `blob` x 590-865, y 85-160 with an overhang; dirt tower `rock` x 820-865,
    y 22-160.

Solution idea: each hatch is its own puzzle. Upper left: a blocker. Upper right: a miner and a
blocker; a trailblazer builds over the gap and the steel block to the exit. Lower right: a climber
builds a ramp across the water and turns back. Lower left: a climber zig-zags up to the exit
height. Finally the blockers are bombed.

Confidence: medium (image clear; the right half is dense and our boxes are coarse).

## Mayhem 19: "Time to get up!"

- Reference: [File:Lemmings TrickyLevel11.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel11.png),
  level page [Time to get up!](https://lemmings.fandom.com/wiki/Time_to_get_up!).
- Width: 512 px. Style: marble. Same map as Tricky 11.
- Numbers: 50 lemmings, save 92 % (46), RR 20, 5 minutes. Skills: climber 2, bomber 4, builder 20.

Layout:

1. Left columns: `pillar` x 0-30, y 0-160 (wall).
2. Ceiling: `slab` x 30-290, y 0-5; rough rock `blob` x 30-120, y 0-60 and x 225-290, y 0-25.
3. Hanging triangle: `polygon` x 55-92, y 25-60, with two struts (decoration).
4. Floor: `slab` x 50-290, y 155-160, made of blocks. Gap x 30-50 at the left: a pit.
5. Hatch trapdoor x 242-282, y 108-130. Hatch (255, 130).
6. Brick mass: `brickWall` x 290-512, y 0-160, hollowed as follows:
   - dead-end tunnel x 302-375, y 48-68 (open to the left wall face at x 290-302 `[verify]`);
   - thin wall x 375-380, y 48-68 between tunnel and exit room;
   - exit room x 380-460, y 20-68. Exit (435, 68);
   - arched cavity x 302-470, y 85-160 (arch from (300, 100) up to (380, 85) down to (470, 120)),
     acid (water) x 300-460, y 142-160, brick posts x 312-325 and x 465-475, y 120-160.

Solution idea: two climbers scale the brick face up to the tunnel and bomb it open; a builder
guards the left pit. Two ramps are built from the floor blocks, one above the other, so the crowd
reaches the tunnel without falling; a last bomber opens the thin wall to the exit room.

Confidence: medium (the tunnel opening on the brick face is a guess).

## Mayhem 20: No added colours or Lemmings

- Reference: [File:Now use miners and climbers.png](https://lemmings.fandom.com/wiki/File:Now_use_miners_and_climbers.png),
  level page [No added colours or Lemmings](https://lemmings.fandom.com/wiki/No_added_colours_or_Lemmings).
- Width: 564 px. Style: marble. Same map as Fun 04.
- Numbers: 50 lemmings, save 100 % (50), RR 85, 5 minutes `[verify]` (the page also lists it as a
  60-second level). Skills: climber 2, blocker 1, builder 1, basher 1, miner 2.

Layout:

1. Ceiling: `slab` x 15-520, y 0-7, with hanging triangles `polygon` x 15-60 and x 455-505,
   y 0-22.
2. Hatch trapdoor x 205-245, y 12-25. Hatch (225, 26).
3. Upper slab: `slab` x 95-335, y 60-77. Lemmings land on it.
4. Columns: `pillar` x 100-135, y 7-160 (through the slab); short `pillar`s x 150-182 and
   x 295-327, y 7-60, standing on the slab (the second one is the wall to bash).
5. Lower beam: `girder` x 135-430, y 113-128.
6. Exit tower: `brickWall` x 355-415, y 48-113, hollow inside (crossed braces x 370-400,
   y 62-113). Exit (380, 48) on top.
7. Right column: `pillar` x 420-452, y 7-160.
8. Rock mounds: `blob` x 0-65, y 125-160 and x 465-564, y 120-160 (decoration).

Solution idea: the second lemming blocks. The first bashes through the right post, drops to the
lower beam, and builds up to the exit tower from the very edge so it turns round; release at 99.
A climber leaves the crowd, the trailblazer mines under the blocker to free it, and the climber
mines through the end of the bridge so the last lemmings drop in. Every skill is used.

Confidence: high.

## Mayhem 21: With a twist of lemming please

- Reference: [File:Lemmings TrickyLevel12.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel12.png),
  level page [With a twist of lemming please](https://lemmings.fandom.com/wiki/With_a_twist_of_lemming_please).
- Width: 541 px. Style: marble. Same map as Tricky 12.
- Numbers: 50 lemmings, save 100 % (50), RR 1, 5 minutes. Skills: climber 1, floater 50,
  builder 4, basher 1, digger 1.

Layout:

1. Left rock: `blob` x 0-110, y 50-160 (top near x 60); ceiling rock `blob` x 5-95, y 0-45.
2. Hatch trapdoor x 110-150, y 0-22. Hatch (118, 24).
3. Shaft: left column `pillar` x 108-125, y 30-145; right column `pillar` x 140-155, y 33-160;
   crossbar x 108-155, y 80-97. The drop from the hatch into the shaft is deadly without a floater.
4. Shaft floor: `slab` x 110-155, y 145-160. The left column's ledge stops left-walkers.
5. Brick block: `brickWall` x 155-345, y 33-97, and x 155-220, y 97-128; vertical shaft x 220-237,
   y 55-128 under a striped cap x 218-240, y 47-52.
6. Pedestals: `slab` x 240-290 y 115-122 on `pillar` x 255-270; `slab` x 297-340 y 122-128 on
   `pillar` x 310-325.
7. Rubble along the bottom: `blob` x 155-541, y 145-160.
8. Exit pedestal: `pillar` x 360-405, y 113-160, top `slab` x 345-410. Exit (390, 113).
9. Right rock mound: `blob` x 400-541, y 90-160 (top x 450); hanging rock `blob` x 390-520,
   y 0-80; ceiling rock x 165-541, y 0-5.

Solution idea: every lemming needs a floater (raise the rate between them). A climber climbs the
right column onto the brick block and digs into the shaft so the hole connects to the shaft on its
right; builders bridge the pedestals to the exit; a basher opens the way from the shaft floor so
all walk out.

Confidence: low (the shaft geometry and the route are our reading).

## Mayhem 22: A BeastII of a level

- Reference: [File:Lemmings MayhemLevel22.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel22.png),
  level page [A BeastII of a level](https://lemmings.fandom.com/wiki/A_BeastII_of_a_level).
- Width: 873 px. Style: dirt (the original uses special graphics from Shadow of the Beast II; we
  draw our own dark forest: no tribute art, no tribute music).
- Numbers: 80 lemmings (DOS), save 85 % (68), RR 75, 5 minutes. Skills: climber 10, floater 10,
  bomber 10, blocker 10, builder 15, basher 10, miner 10, digger 10.

Layout:

1. Hatch trapdoor x 20-60, y 68-90. Hatch (30, 92).
2. Left ground: `blob` x 0-90, y 128-160; rocky outcrop `rock` x 90-170, y 97-160 (top x 135-170).
3. Grave cross on the outcrop: two `log`s x 140-160, y 68-100 (an obstacle to bash).
4. Low ground: sparse `tuft`s x 160-300, y 150-160 (a fall there is deadly).
5. Chandeliers (`chain` from the ceiling plus a candle holder `girder`): chain x 210, holder
   x 200-230 y 98-120; chain x 262, holder x 250-280 y 98-120; chain x 435, holder x 420-455
   y 63-88; chain x 563, holder x 545-580 y 33-48.
6. Hollow tree trunk: `rock` x 300-410, y 70-160, hollow x 340-385, y 100-160.
7. Bridge: `log` deck x 520-665, y 128-140, posts x 555-575 and x 650-670, y 98-130; end rocks
   `rock` x 465-520 y 125-160 and x 670-690 y 118-160.
8. Tree: trunk `pillar` x 700-740, y 40-130; canopy `blob` x 600-780, y 0-65.
9. Right ground: `blob` x 680-873, y 128-160, sloping down to the right. Exit (775, 128).
10. Ceiling: rough `blob` x 0-640, y 0-15.

Solution idea: one lemming goes right; two blockers hold the crowd. The leader builds up to the
chandeliers and bashes through chains and candles; it bashes the hollow trunk (mind the holes),
builds to the bridge, digs a little and bashes on to the exit. The blockers are bombed or mined
free.

Confidence: low (special graphics; the walkable surfaces are our reading).

## Mayhem 23: "Going up......."

- Reference: [File:Lemmings MayhemLevel23.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel23.png),
  level page [Going up...](https://lemmings.fandom.com/wiki/Going_up...).
- Width: 1101 px. Style: crystal.
- Numbers: 80 lemmings, save 80 % (64), RR 70, 9 minutes. Skills: floater 1, bomber 20,
  blocker 20, builder 30, basher 5.

Layout:

1. Exit (75, 145) on the floor pipe `girder` x 25-400, y 145-152. Ball joint `ellipse` x 0-30,
   y 135-160.
2. Grid: `girder` mesh x 145-310, y 110-160 and x 310-385, y 120-152 (walkable as thin rungs).
3. Pipe frame: joints `ellipse` at (305, 100), (350, 50), (395, 105), each about 20 px; pipes
   `girder` between them; vertical pipes x 300-310, y 100-150 and x 390-397, y 105-160.
4. Trap (squasher; the original's ball zapper) hanging at x 340-360, y 0-20 above the frame.
5. Steel blocks: x 285-310, y 135-160 and x 690-735, y 135-160, **steel**.
6. Crystal mass: `crystal` `polygon` above the diagonal from (380, 0) to (840, 155), filling
   x 380-840 up to y 0; right wall of stacked spheres `ellipse` x 790-830, y 0-160.
7. Hatch frame: two hexagon rings `girder` x 880-975, y 112-140 and y 140-160. Hatch trapdoor
   x 900-935, y 117-135. Hatch (915, 136). Lemmings land on the middle bar y 140.
8. Rails: two thin parallel `girder` lines from (960, 112) up to (1101, 0).

Solution idea: a blocker by the hatch; the first lemming bashes from the wall's edge, then builds;
it climbs a zig-zag under the crystal's diagonal underside, bashes through the crystal mass to the
left, and floats down onto the pipe frame. It builds by the trap sphere to turn, then bashes the
sphere, so the crowd crosses the grid to the exit.

Confidence: low (where the crowd walks between hatch and crystal is our reading).

## Mayhem 24: All or Nothing

- Reference: [File:Lemmings FunLevel30.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel30.png),
  level page [All or Nothing](https://lemmings.fandom.com/wiki/All_or_Nothing).
- Width: 465 px. Style: fire. Same map as Fun 30.
- Numbers: 50 lemmings, save 100 % (50), RR 99, 1 minute. Skills: basher 3.

Layout:

1. Twisted column: `pillar` x 80-97, y 0-90. Fire cage: `slab` x 65-110 y 90-95 and y 135-140, bars
   x 65-70 and x 105-110; trap (fire) inside x 75-100, y 118-128.
2. Fork structure: `girder` x 100-175, y 10-65 with a trap (fire) x 125-150, y 40-48 (decoration).
3. Ceiling: rough `blob` x 50-300, y 0-5.
4. Hatch trapdoor x 220-260, y 12-35. Hatch (225, 38).
5. Central brick pillar: `brickWall` x 215-240, y 52-160.
6. Top ledge: `slab` x 215-290, y 52-58, with a short post x 236-246, y 40-52 on it.
7. Middle ledge: `slab` x 140-215, y 88-95, with a short post x 205-212, y 75-88.
8. Lower ledge: `slab` x 240-290, y 125-130, with a short post x 240-247, y 112-125.
9. Exit floor: `slab` x 155-225, y 145-160. Exit (195, 145).
10. Right rock: `blob` x 290-465, y 0-145; brick base x 350-430, y 140-160. Block x 0-25,
    y 145-160.

Solution idea (our reading `[verify]`): the crowd is held in a cell at the top. Three bashes in
alternating direction (left, right, left) each open one cell wall; the crowd drops one ledge at a
time and reaches the exit floor. The puzzle is picking a lemming that faces the right way at
RR 99.

Notes: for our recreation, close each cell so that only the bash opens it: top cell x 215-290
(post on the left, rock on the right), then the middle ledge (pillar on the right), then the lower
ledge (pillar on the left). Check every fall height against our splat distance.

Confidence: low (cell walls and the bash order are our reading).

## Mayhem 25: "Have a nice day!"

- Reference: [File:Lemmings TrickyLevel13.png](https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel13.png),
  level page [Have a nice day!](https://lemmings.fandom.com/wiki/Have_a_nice_day!).
- Width: 1572 px; the puzzle uses x 500-910 only. Recommended: crop to x 480-960 (shift all boxes
  by -480, width 480) and keep a few pipe loops as decoration. Style: pillar (Egyptian). Same map
  as Tricky 13.
- Numbers: 80 lemmings, save 90 % (72), RR 1, 5 minutes. Skills: climber 2, floater 2, blocker 2,
  builder 25, basher 1, miner 1, digger 1.

Layout (uncropped coordinates):

1. Golden pipe loops x 0-500 and x 920-1572: `arch` and `girder` decoration, far from the route.
2. Top rock lumps: `blob` x 505-560 y 0-20, x 640-655 y 0-12, x 710-830 y 0-20.
3. Hatch trapdoor x 570-610, y 40-62. Hatch (585, 62).
4. Wooden frame left: `log` post x 528-535, y 70-110; beam x 528-570, y 108-115; crossed struts
   x 525-570 and x 575-605, y 115-160.
5. Steel blocks (**steel**): x 553-567 y 85-108; x 580-603 y 85-108 (lemmings land here);
   x 610-625 y 37-83 (steel wall right of the hatch); x 622-635 y 105-160; x 662-675 y 105-160;
   x 680-693 y 37-83; x 680-715 y 105-118; x 735-750 y 105-128; x 780-810 y 152-160;
   x 810-835 y 140-160.
6. Wooden beams (`log`): x 693-712 y 37-43; x 707-805 y 73-80; x 715-735 y 108-115; post
   x 745-750 y 128-155; floor x 690-748 y 155-160.
7. Exit platform: `log` x 815-895, y 90-105, reached by a wooden `steps` stair from (810, 155) up
   to (835, 105). Exit (853, 90).
8. Water along the bottom wherever there is no terrain, y 150-160 `[verify]`.

Solution idea: the first lemming builds right to seal the gap beside the landing block; a blocker
at the block's left edge keeps lemmings out of the water. An athlete crosses the steel wall,
builds to the next steel wall, turns, and builds back so that a zig-zag grows; a second athlete
bridges the gap to the exit platform. When the stairs are done, release at 99 and dig or mine the
bridge that holds the crowd.

Confidence: low (dense small blocks; the route is our reading of the text).

## Mayhem 26: The Steel Mines of Kessel

- Reference: [File:Lemmings FunLevel21.png](https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel21.png),
  level page [The Steel Mines of Kessel](https://lemmings.fandom.com/wiki/The_Steel_Mines_of_Kessel).
- Width: 1159 px. Style: dirt. Same map as Fun 21.
- Numbers (DOS): 80 lemmings, save 75 % (60), RR 50, 8 minutes. Skills: bomber 20, blocker 20,
  builder 20. The Amiga original has 100, 90 % and 10 of each.

Layout:

1. Hatch trapdoor x 62-102, y 40-62. Hatch (70, 62).
2. Grassy slope: `blob` from (0, 160) up to (60, 105), (100, 80), peak (160, 57). Trap (squasher;
   a bear trap in the original) x 55-70, y 88-100, left of the landing point.
3. Thin dirt arch: from the peak (160, 57) down to (210, 95), (240, 115), then (330, 100);
   thickness about 15 px. Under it chamber 1, x 100-300, y 100-145.
4. Water pools with steel stones: steel x 63-87 y 140-160; water x 87-135 y 147-160; steel
   x 135-158 y 140-160; steel x 278-300 y 145-160; water x 300-340 y 147-160; steel x 343-375
   y 143-160. All steel is **steel**.
5. Thick ceiling: `blob` x 120-930, y 0-45.
6. Dirt column with grey stones: `rock` x 320-370, y 40-125 (stones are decoration, not steel
   `[verify]`). Tongue `blob` x 370-450, y 85-105.
7. Tongue from the right: `blob` x 485-560, y 78-95. Central mound `blob` x 540-640, y 100-160.
8. Big lump: `blob` x 680-920, y 0-130 (grey spiral stones at x 740-800, y 40-75: decoration).
9. Floor: `blob` x 155-300 and x 370-960, y 140-160, uneven; steel stone x 755-775, y 148-160.
10. Log bridge: `log`s x 950-1025, y 140-150 over water x 965-1025, y 150-160.
11. Exit mound: `blob` x 1030-1159, y 140-160. Exit (1070, 140).

Solution idea: blockers hold most of the crowd near the hatch. A small team works through the
chambers: block and bomb on the thin arch to drop into the chamber below, block off the water,
block and blow the thin walls between chambers, build over the second pool and the chasm, and
build over the trap. Then the start blocker is bombed and the rate raised to 99.

Confidence: low (complex dirt shapes; chamber walls are approximate).

## Mayhem 27: Just a Minute (Part Two)

- Reference: [File:Lemmings-Mayhem-Level27.png](https://lemmings.fandom.com/wiki/File:Lemmings-Mayhem-Level27.png),
  level page [Just a Minute (Part Two)](https://lemmings.fandom.com/wiki/Just_a_Minute_(Part_Two)).
- Width: 514 px. Style: marble.
- Numbers: 50 lemmings, save 100 % (50), RR 10, 1 minute. Skills: climber 1, floater 1, bomber 5,
  basher 5, digger 5.

Layout: identical to Mayhem 16 except one element. A pixel comparison of the two reference images
shows that the small ledge `slab` x 174-190, y 112-120 under the main platform is missing. All other
boxes of Mayhem 16 apply unchanged.

Solution idea: the first lemming climbs over the obstacle (the brick block's top) and digs just
before the second triangle; at exit height it bashes towards the exit. The second lemming bashes,
leaving a thin wall so lemmings do not fall off, then digs and bashes so its tunnel meets the
first one. A third basher stalls the crowd. Release at 99.

Confidence: high (layout); medium (route).

## Mayhem 28: "Mind the step....."

- Reference: [File:Lemmings MayhemLevel28.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel28.png),
  level page [Mind the step.....](https://lemmings.fandom.com/wiki/Mind_the_step.....).
- Width: 1210 px. Style: marble.
- Numbers: 1 lemming, save 100 % (1), RR 1, 7 minutes. Skills: builder 25, basher 10, digger 15.

Layout:

1. Far left decoration: `ramp` and block x 0-65, y 120-160.
2. Acid: water x 260-320, y 142-160, between brick blocks x 235-260 and x 320-340, y 137-160.
3. Slope: `polygon` x 325-360, y 120-160.
4. Exit platform: `slab` x 345-520, y 120-160; small `steps` x 395-420, y 110-120; raised part
   x 420-520, y 105-120. Exit (378, 120).
5. Thin column with capital: `pillar` x 505-520, y 0-110, capital y 20-40.
6. Domes: upper half-`ellipse` x 520-710, y 0-60 and lower half-`ellipse` x 520-710, y 90-160,
   each with a central strip x 595-610 `[verify]` steel.
7. Trap (squasher; the thumper of the original) x 590-620, y 60-65, between the domes.
8. Thin column: `pillar` x 708-722, y 0-160.
9. Brick `steps` (marble bricks), three diagonals:
   - upper mass: inverted staircase from x 710-930 at y 0 down to a point near (790, 80);
   - middle diagonal: from (700, 115) up to (790, 75);
   - lower diagonal: from (760, 160) up to (920, 95).
10. Dark brick wall: `brickWall` x 895-910, y 0-72 `[verify]` steel at the top of the level.
11. Start slab: `slab` x 895-1060, y 72-88, with rising `steps` x 950-1060, y 60-72; a long brick
    `ramp` from (1040, 60) up to (1210, 0).
12. Hatch trapdoor x 948-988, y 20-42. Hatch (960, 44).
13. Under the start slab: `steps` x 910-1000, y 88-100 on `pillar`s x 940-955 and x 980-995,
    y 100-160.
14. Small posts on the right: caps `rect` 8x5 px on thin poles at x 1043, 1070, 1095, 1122, 1148,
    1177 (cap y 140-145, pole to y 160); floating blocks x 1110-1118, 1135-1143, 1162-1170,
    y 84-88; post x 1188-1200, y 105-160 with cap y 105-112.

Solution idea: the single lemming bashes at the step end, builds along the posts to the rightmost
one, turns round (dig, then build into the wall), builds back to the leftmost post, gains height,
bashes through the posts and the wall, builds up the middle steps (several times, as it bumps its
head), bashes the wall, builds over the trap, builds again and bashes into the exit room.

Confidence: medium (layout clear; the order of posts and steps is the text's).

## Mayhem 29: Save Me

- Reference: [File:Lemmings MayhemLevel29.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel29.png),
  level page [Save Me](https://lemmings.fandom.com/wiki/Save_Me).
- Width: 1584 px (decorative stone mazes x 0-260 and x 1390-1584 may be simplified). Style: pillar
  (Egyptian).
- Numbers: 80 lemmings, save 80 % (64), RR 50, 5 minutes. Skills: blocker 6, builder 15, basher 2,
  digger 2.

Layout:

1. Left stone maze: `brickWall` pipe shapes x 0-260, y 0-160 (decoration).
2. Golden pipe: `girder` x 290-530, y 0-28, with knobs (decoration).
3. Exit stack, all **steel**: top beam x 320-560, y 57-70; middle platform x 320-390, y 99-112;
   bottom platform x 320-392, y 140-155. Exit (345, 140). Water to the left and below `[verify]`.
4. Wooden stair `steps` from (555, 42) down to (590, 65).
5. Column with capital: `pillar` x 585-615, y 75-160, capital x 570-620, y 67-80, steel base
   x 585-608, y 140-160. Broken column: `pillar` x 625-650, y 68-160.
6. Wooden stair `steps` from (650, 82) down to (705, 115).
7. Arcade: `slab` x 690-830, y 117-137, on `pillar`s x 690-705, 750-765, 820-835 (y 137-160);
   wooden post x 790-797, y 143-160. Wooden stair `steps` from (830, 117) down to (870, 152).
8. Ceiling stone: `polygon` x 680-910, y 0-20. Hanging ladder x 845-870, y 10-80 with a block
   x 840-882, y 67-87.
9. Low floor: `slab` x 860-975, y 152-160.
10. Broken columns: `pillar` x 930-960 y 0-25; x 970-995 y 0-105; x 970-995 y 125-160 (a gap at
    y 105-125). Steel x 980-1000, y 140-160, **steel**.
11. Upper right beam: x 1020-1270, y 57-70, **steel**.
12. Hatch trapdoor x 1195-1235, y 88-110. Hatch (1205, 110).
13. Landing block: x 1190-1250, y 140-155, **steel**.
14. Ceiling stones: `blob` x 1085-1350, y 0-20. Right stone maze x 1390-1584 (decoration).

Solution idea: a builder starts on the landing block and keeps building left; blockers stand at
both block edges; a digger makes a hole the crowd can follow. A stair ends over a larger steel
block; a lemming builds to the broken column, bashes, digs and bashes so the drop to the low floor
is safe. After the long walk over the arcade and stairs to the top beam, two builders and blockers
on the middle and bottom steel platforms break the falls to the exit.

Confidence: low (long route; the connection from the column to the top beam is our reading).

## Mayhem 30: Rendezvous at the Mountain

- Reference: [File:Lemmings MayhemLevel30.png](https://lemmings.fandom.com/wiki/File:Lemmings_MayhemLevel30.png),
  level page [Rendezvous at the Mountain](https://lemmings.fandom.com/wiki/Rendezvous_at_the_Mountain).
- Width: 1584 px. Style: dirt. Two hatches.
- Numbers: 80 lemmings, save 75 % (60), RR 20, 9 minutes. Skills: climber 10, floater 1, bomber 10,
  blocker 10, builder 30, basher 10, miner 10, digger 4.

Layout:

1. Left hatch trapdoor x 20-60, y 72-95. Hatch (25, 96).
2. Left rock post: `rock` x 0-25, y 92-160. Low ground: `blob` x 25-200, y 145-160. Trap
   (squasher; the original's rock crusher) on the ground near x 110-140, y 135-145 `[verify]`.
3. Big overhang: `blob` x 60-280, y 0-130, with a hollow cave x 150-200, y 65-120; grass on its
   right side x 230-290, y 15-85.
4. Thin rock bridge: `blob` x 200-280, y 137-145; rock posts x 280-300, y 128-160.
5. Tall rock: `rock` x 300-410, y 20-160 (peak x 350).
6. Island: `blob` x 450-545, y 137-160. Trap (squasher; a bear trap) x 475-495, y 135-140; a well
   x 515-530, y 135-150 (decoration).
7. Arch of two dirt posts: `rock` x 580-610 and x 660-680, y 50-160, joined by a `log` bridge
   x 585-670, y 52-62. Cross on the right post x 670-680, y 40-55 (the sign obstacle). Steel
   x 600-615 and x 660-675, y 140-160, **steel**; water x 615-660, y 147-160.
8. Exit mountain: `blob` x 690-890, y 25-160, peak near x 800. Exit (793, 30).
9. Grass bridge: `blob` x 860-935, y 75-85, gravestone x 875-895, y 65-78; right post `rock`
   x 890-930, y 75-160. Steel x 873-888 and x 900-935, y 140-160, **steel**; water x 888-900 and
   x 935-1030, y 147-160; steel x 1035-1050, y 137-160, **steel**.
10. Rock spires: `rock` x 1040-1150, y 90-160.
11. Ground: `blob` x 1140-1584, y 145-160. Trap (squasher; ten-ton weight) x 1150-1175,
    y 140-148, with its warning sign x 1145-1170, y 105-128 (decoration). Sign post x 1200-1210,
    y 145-155 (decoration).
12. Stone arch: left post `rock` x 1250-1280, y 70-160, **one-way right**; arch top x 1270-1350,
    y 50-80; right post x 1340-1370, y 55-160.
13. Right hatch trapdoor x 1540-1580, y 80-100. Hatch (1550, 100).

Solution idea: right group: a blocker; one lemming bashes the arch's right post, builds once for
height, and a block-and-blow team blasts the one-way left post. A trailblazer builds over the
ten-ton trap, on to the rock spires, over the water to the grass bridge, and up to the exit. Left
group: a blocker; the trailblazer builds over the rock crusher, bashes through the overhang,
builds to the log bridge, mines before the cross, and reaches the exit mountain. Bomb the blockers
and release at 99.

Confidence: medium (image clear; trap positions and the left route are partly guessed).

## Confidence overview

| No. | Confidence | Reference |
| --- | --- | --- |
| 01 | high | MayhemLevel1 |
| 02 | medium | MayhemLevel2 |
| 03 | medium | MayhemLevel3 (= Fun 24) |
| 04 | medium | FunLevel25 |
| 05 | medium | FunLevel28 |
| 06 | medium | TrickyLevel9 |
| 07 | medium | FunLevel20 |
| 08 | low | MayhemLevel8 |
| 09 | medium | FunLevel29 |
| 10 | medium | MayhemLevel10 |
| 11 | high | FunLevel13 |
| 12 | medium | MayhemLevel12 |
| 13 | medium | FunLevel26 |
| 14 | high | MayhemLevel14 |
| 15 | high | TrickyLevel10 |
| 16 | high | MayhemLevel16 |
| 17 | high | MayhemLevel17 |
| 18 | medium | MayhemLevel18 |
| 19 | medium | TrickyLevel11 |
| 20 | high | Now use miners and climbers (= Fun 04) |
| 21 | low | TrickyLevel12 |
| 22 | low | MayhemLevel22 |
| 23 | low | MayhemLevel23 |
| 24 | low | FunLevel30 |
| 25 | low | TrickyLevel13 |
| 26 | low | FunLevel21 |
| 27 | high | Mayhem-Level27 (pixel diff to 16) |
| 28 | medium | MayhemLevel28 |
| 29 | low | MayhemLevel29 |
| 30 | medium | MayhemLevel30 |

## Resume here

- State: phase A done. Every Mayhem level has a traced layout, numbers and a solution idea. No
  level JSON was written yet.
- Check: `npx markdownlint-cli2 docs/layouts/mayhem.md`.
- Next (phase B, plan M6.132):
  1. Build each level in `assets/levels/mayhem/` with the toolkit pieces named above.
  2. Render it with the level preview tool (plan M6.127) and compare by eye with the reference.
  3. Write a replay for each level that proves the solution idea in our engine.
  4. Record every simplification in `docs/levels-reference.md`.
- Restart: to look at a reference again, open the "Reference" link of the level; download the image
  to a scratch directory outside the repository only.
