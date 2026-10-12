# Layout notes: Taxing 01-30 (plan M6.131)

> Living document. Last update: 2026-10-12.
> Purpose: one traced layout per original Taxing level, so that phase B can build our own
> recreation of each level with the terrain toolkit (vision L-01a, owner decision Q-C1).

## How these notes were made

1. One full-level map image of the DOS version per level was viewed on the Lemmings Wiki
   (lemmings.fandom.com). The URL is in each section.
2. The images were kept in a private scratch folder, viewed by eye, and never added to the
   repository (vision X-02). Nothing was traced automatically into a level file.
3. Each image was overlaid with a 20 px grid. Every box below was read from that grid by eye.
   Boxes are accurate to about ±5 px.
4. The terrain is described with our own element kinds only (see "Element kinds"). The shapes are
   ours; only the puzzle geometry follows the original.
5. Numbers (lemmings, save, release rate, time) come from
   [levels-reference.md](../levels-reference.md). Skill counts come from the wiki page of each
   level. A value that the sources do not agree on is marked `[verify]`.

## Conventions

- **Coordinates** are map pixels. x runs from 0 (left edge) to the right; y runs from 0 (top) to
  160 (bottom). One map pixel is one pixel of our level at native resolution.
- **Width** is the width of the map image. The level width in phase B is the same value.
- **Box** `x a-b, y c-d` means the element covers x from a to b and y from c to d.
- **Hatch (x, y)**: x is the centre of the hatch, y is the bottom of its opening. This is where
  the lemmings appear.
- **Exit (x, y)**: x is the centre of the exit, y is the floor it stands on.
- **Fatal fall**: a fall of more than about 60 px kills a lemming. Falling off the bottom edge
  (y 160) always kills.
- **Save** is given in percent and as the count of lemmings (rounded up).

## Element kinds

| Kind | Meaning |
| --- | --- |
| rect, ellipse, polygon | Plain shapes; a polygon may be marked rough (noisy edge). |
| blob | A noisy rock lump inside the given box. |
| rock, pillar, brickWall, steps, ramp, arch, crystal, girder | Toolkit pieces. |
| stalactite, stalagmite, tuft, slab, log, chain | Toolkit pieces. |
| steel | A steel area (no skill digs through it). |
| one-way left / one-way right | A one-way area: only a basher or miner facing that way digs it. |
| hatch, exit | Objects; see the conventions for the point. |
| water | Deadly liquid (water, lava or acid in the original). |
| trap squasher, trap fire | A triggered trap that kills one lemming per cycle. |

## Overview

| No. | Original name | Width (px) | Style | Lemmings | Save | RR | Time (min) | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | If at first you don't succeed.. | 1227 | pillar | 80 | 99 % (80) | 40 | 4 | high |
| 02 | Watch out, there's traps about | 1058 | dirt | 80 | 80 % (64) | 70 | 5 | high |
| 03 | Heaven can wait (we hope!!!!) | 741 | fire | 80 | 100 % (80) | 1 | 2 | high |
| 04 | Lend a helping hand.... | 786 | pillar | 40 | 75 % (30) | 50 | 7 | medium |
| 05 | The Prison! | 360 | fire | 60 | 75 % (45) | 50 | 5 | high |
| 06 | Compression Method 1 | 520 | marble | 50 | 60 % (30) | 99 | 3 | medium |
| 07 | Every Lemming for himself!!! | 1486 | dirt | 80 | 98 % (79) | 55 | 3 | high |
| 08 | The Art Gallery | 1165 | crystal | 80 | 100 % (80) | 20 | 4 | medium |
| 09 | Perseverance | 1448 | pillar | 20 | 100 % (20) | 50 | 4 | high |
| 10 | Izzie Wizzie lemmings get busy | 1224 | fire | 5 | 100 % (5) | 50 | 5 | high |
| 11 | The ascending pillar scenario | 1086 | pillar | 50 | 100 % (50) | 20 | 4 | high |
| 12 | Livin' On The Edge | 952 | fire | 10 | 80 % (8) | 1 | 5 | high |
| 13 | Upsidedown World | 757 | dirt | 80 | 98 % (79) | 40 | 6 | medium |
| 14 | Hunt the Nessy.... | 1423 | dirt | 80 | 95 % (76) | 30 | 8 | high |
| 15 | What an AWESOME level | 939 | dirt | 80 | 80 % (64) | 50 | 6 | low |
| 16 | Mary Poppins' land | 711 | fire | 80 | 96 % (77) | 50 | 3 | high |
| 17 | X marks the spot | 1584 | fire | 80 | 90 % (72) | 50 | 7 | low |
| 18 | Tribute to M.C.Escher | 312 | marble | 75 | 87 % (65) | 50 | 5 | high |
| 19 | Bomboozal | 517 | fire | 80 `[verify]` | 91 % | 80 | 2 | high |
| 20 | Walk the web rope | 1576 | crystal | 80 `[verify]` | 88 % | 50 | 5 | medium |
| 21 | Feel the heat! | 354 | fire | 20 | 100 % (20) | 70 | 2 | high |
| 22 | Come on over to my place | 1388 | marble | 50 | 80 % (40) | 1 | 5 | medium |
| 23 | King of the castle | 396 | fire | 80 | 95 % (76) | 40 | 5 | high |
| 24 | Take a running jump..... | 1224 | fire | 80 | 98 % (79) | 50 | 3 | medium |
| 25 | Follow the leader... | 1473 | marble | 80 | 90 % (72) | 20 | 4 | high |
| 26 | Triple Trouble | 359 | fire | 80 | 98 % (79) | 80 | 5 | high |
| 27 | Call in the bomb squad | 604 | pillar | 80 | 60 % (48) | 10 | 5 | high |
| 28 | POOR WEE CREATURES! | 1098 | crystal | 80 | 70 % (56) | 1 | 5 | medium |
| 29 | How do I dig up the way? | 705 | dirt | 80 | 95 % (76) | 80 | 4 | high |
| 30 | We all fall down | 1525 | fire | 60 | 100 % (60) | 1 | 3 | high |

Confidence means how sure the traced geometry is: **high** = simple shapes, every box read from
the grid; **medium** = some organic or overlapping shapes, the puzzle-relevant boxes are sure;
**low** = organic special artwork, only the walkable outline is sure.

Skill order in every skills line: climber, floater, bomber, blocker, builder, basher, miner,
digger.

## 01 "If at first you don't succeed.."

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel15.png> (same map as Fun 15).
- Width 1227 px. Style pillar.
- Lemmings 80, save 99 % (80), RR 40, time 4 min.
- Skills: 2, 2, 2, 2, 8, 2, 2, 2.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Ceiling | slab | x 0-1227, y 0-8 | Thin brick ceiling over the whole map. |
| Ground left | rect (rough top) | x 15-810, y 142-160 | Slopes in at x 15-25. |
| Pit | gap | x 810-905 | No terrain; fatal. |
| Ground right | rect (rough top) | x 905-1227, y 145-160 | Left edge slopes x 905-920. |
| Hatch | hatch | (62, 38) | Box x 43-82, y 17-38. |
| Decor column | pillar | x 38-90, y 73-142 | Capital x 38-90, y 73-86. |
| Blocks | rect | x 91-110, y 100-142; x 111-130, y 122-142 | Two low cracked blocks. |
| Column 1 | pillar (broken top) | x 367-400, y 45-140 | |
| Column 2 | pillar (broken top) | x 468-502, y 33-140 | |
| Column 3 | pillar (broken top) | x 577-610, y 24-140 | |
| Stairs at each column | steps | rise from (col.left - 32, 142) to (col.left, 108); fall from (col.right, 108) to (col.right + 40, 142) | Thin wooden steps on both sides of each column. |
| Stairs before frame | steps | x 965-1010, rising from y 142 to y 108 | Ends in mid-air. |
| Stairs to frame top | steps | x 1045-1083, rising from y 95 to y 62 | Ends at the frame top. |
| Wooden frame | girder (4 posts, 4 beams) | x 1085-1180, y 62-145 | Beams at y 62, 85, 108, 128. |
| Exit | exit | (1152, 62) | On the frame top. |
| Rope trap | trap squasher | x 1048-1062, y 107-145 | Next to the stairs. |

Solution idea: bash the first two columns and mine the third, without breaking the stairs. Bridge
the pit and the gaps between the stairs with builders. A blocker on the bottom step holds the
crowd; bomb it at the end.

## 02 "Watch out, there's traps about"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TaxingLevel2.png>
- Width 1058 px. Style dirt.
- Lemmings 80, save 80 % (64), RR 70, time 5 min. Two hatches.
- Skills: 10, 5, 5, 10, 10, 5, 5, 5.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Ceiling | blob band + stalactite tufts | x 0-1000, y 0-12 | Moss tufts hang to y 30. |
| Left trunk | pillar (rock) | x 35-75, y 0-150 | Base blob x 10-100, y 148-160. |
| Exit mound | blob | x 85-218, y 97-155 | Rounded rock lump. |
| Exit | exit | (138, 97) | On the mound. |
| Ground | blob band | x 220-1058, y 142-160 | Grass top. |
| Rock finger | rock | x 365-405, y 95-145 | Stands on the ground. |
| Upper rock mass | blob | x 428-915, y 45-110 | Long island under both hatches. |
| Pool frame | steel | x 505-528, y 40-85; x 588-610, y 40-85; x 528-588, y 65-85 | U-shaped steel tub. |
| Pool | water | x 528-588, y 55-65 | Inside the steel tub. |
| Hatch 1 | hatch | (456, 30) | Box x 437-475, y 7-30. |
| Hatch 2 | hatch | (648, 30) | Box x 628-667, y 7-30. |
| Squasher | trap squasher | trigger x 835-860, y 40-45 | "10 tons" weight hangs at x 836-860, y 8-25. |
| Hidden trap 1 | trap squasher | x 305-318, y 138-142 | Small trap on the ground. `[verify]` kind |
| Hidden trap 2 | trap squasher | x 755-768, y 42-46 | Small trap on the island. `[verify]` kind |
| Plant | trap squasher | x 462-498, y 122-155 | Green plant thing on the ground. `[verify]` trap or decor |
| Coils | chain | x 790-855, y 118-150 | Grey coils; trap area "to the right". `[verify]` |
| Right wall | blob | x 950-1058, y 0-160 | Widens downwards. |

Solution idea: the first lemming from each hatch mines down. Blockers keep the crowd out of the
pool, off the left end and out of the trapped area. Mine left from the steel tub so the left group
drops onto the rock finger, then bash through it to the exit.

## 03 "Heaven can wait (we hope!!!!)"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel16.png> (same map as Fun 16).
- Width 741 px. Style fire.
- Lemmings 80, save 100 % (80), RR 1, time 2 min.
- Skills: 30, 30, 30, 0, 30, 30, 30, 30.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Start platform | brickWall | x 147-342, y 128-145 | Three small supports below to y 160. |
| Hatch | hatch | (200, 118) | Box x 182-220, y 97-118. |
| Sign "HEAVEN ->" | polygon (letters) | x 195-415, y 40-75 | Terrain letters; solid. |
| Tower base | brickWall | x 485-585, y 130-160 | |
| Tower column | pillar (twisted) | x 520-548, y 74-130 | |
| Tower top | slab | x 497-570, y 68-74 | |
| Exit | exit | (537, 68) | Devil-head exit on the tower top. |
| Spikes | stalagmite | x 0-22, x 370-390, x 410-430, x 445-462, x 475-488, x 718-741; y 120-160 | Decor spikes; the floor is missing, a fall is fatal. |

Solution idea: the first lemming builds from the right edge of the platform up to the tower top.
Two miners dig a holding pit in the platform and builders seal it. Everyone must be saved, so no
lemming may walk off an edge.

## 04 "Lend a helping hand...."

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TaxingLevel4.png>
- Width 786 px. Style pillar.
- Lemmings 40, save 75 % (30), RR 50, time 7 min. Two hatches.
- Skills: 0, 0, 5, 4, 20, 2, 2, 2.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Left decor | pillar x 3 + brickWall | pillars x 0-32, x 95-125 (y 60-160), x 45-80 (y 0-100); bricks x 22-105, y 100-160 | Decor only. |
| Low log | log | x 187-252, y 130-160 | |
| Short pillar | pillar | x 213-245, y 50-135 | |
| Chamber left wall | pillar | x 250-285, y 0-145 | |
| Wooden beam | slab | x 270-340, y 8-16 | |
| Chamber floor | brickWall | x 250-545, y 140-160 | |
| Left steel lining | steel | x 270-285, y 90-140 | |
| Central block | brickWall | x 310-510, y 37-100 | Lower part is steel, see next row. |
| Central steel | steel | x 310-470, y 55-100 | Steel underside of the block. |
| Divider | steel | x 395-408, y 60-140 | Splits the chamber into a left and a right room. |
| Block top beam | slab | x 370-510, y 25-37 | |
| Exit | exit | (400, 25) | On top of the central block. |
| Hatch left | hatch | (370, 120) | Box x 350-390, y 100-120. |
| Hatch right | hatch | (435, 120) | Box x 415-455, y 100-120. |
| Right steel lining | steel | x 500-513, y 90-145 | |
| Right column | pillar | x 508-535, y 0-145 | Wooden rungs x 485-510 at y 47, 62, 78 (slab, 4 px). |
| Pin trap left | trap squasher | x 282-290, y 75-90 | `[verify]` position |
| Pin trap right | trap squasher | x 490-497, y 108-140 | |
| Outer pillar | pillar | x 538-568, y 50-160 | |
| Right decor | pillar x 3 + brickWall | mirror of the left decor, x 660-786 | Decor only. |

Solution idea: mine out of the left room and bash under the divider to join the right room. A
builder stairs up the narrow space between the pin traps to the top of the central block. Bomb the
blockers at the end. The DOS version has no water here.

## 05 "The Prison!"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TaxingLevel5.png>
- Width 360 px. Style fire.
- Lemmings 60, save 75 % (45), RR 50, time 5 min.
- Skills: 0, 0, 5, 4, 20, 10, 0, 3.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Ceiling rubble | blob | x 0-210, y 0-30 | |
| Twisted column | pillar (twisted) | x 28-45, y 25-120 | |
| Start platform | brickWall | x 22-122, y 123-160 | |
| Hatch | hatch | (87, 82) | Box x 67-107, y 60-82. |
| Bars 1 | pillar (fluted) | x 172-192, y 0-160 | The prison bars. |
| Flame-thrower block | steel | x 167-192, y 48-98 | |
| Flame thrower 1 | trap fire | x 195-250, y 50-62 | Fires to the right. |
| Flame thrower 2 | trap fire | x 195-250, y 83-95 | Fires to the right. |
| Small stairs | steps | x 188-215, y 108-140 | Descend to the right. |
| Bars 2 | pillar (fluted) | x 262-277, y 0-148 | |
| Upper shelf | brickWall | x 260-360, y 60-85 | |
| Upper exit | exit | (312, 60) | |
| Lower floor | brickWall | x 255-357, y 145-160 | |
| Lower exit | exit | (312, 145) | |
| Right column | pillar (twisted) | x 335-352, y 0-145 | |

Solution idea: a blocker before the drop, then one lemming builds left and then right to gain
height above the flame throwers. It bashes through each set of bars and builds on to the upper
exit. Bomb the blocker at the end.

## 06 "Compression Method 1"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel17.png> (same map as Fun 17).
- Width 520 px. Style marble.
- Lemmings 50, save 60 % (30), RR 99, time 3 min. Four hatches.
- Skills: 0, 0, 3, 3, 0, 5, 0, 1.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Left column | pillar | x 40-55, y 0-145 | Cross piece x 25-70, y 46-62; base x 5-100, y 140-160. |
| Floor | slab | x 0-520, y 152-160 | The corridor floor. |
| Big block | brickWall | x 82-360, y 90-142 | Stepped left edge x 82-95, y 115-142. |
| Block steel end | steel | x 313-360, y 88-142 | `[verify]` steel |
| Columns on block | pillar | x 135-152, x 200-217, x 265-280, x 330-345; y 0-90 | Capitals y 78-95. |
| Hatches | hatch | (112, 58), (175, 58), (240, 58), (303, 58) | Each box 40 x 21, top y 37. |
| Corridor traps | trap squasher | in the corridor x 0-520, y 142-152 | Hidden thumper traps; `[verify]` count and x. |
| Exit base | brickWall | x 405-480, y 140-152 | |
| Exit | exit | (435, 140) | |
| Right column | pillar | x 455-470, y 0-140 | Cross piece x 440-488, y 46-62. |
| Right steps | steps | x 480-520, y 140-160 | Descend to the right. |

Solution idea: a blocker on the rim of the block collects the crowd at the left wall. Bomb it so
the compressed crowd walks the trap corridor as one group; each trap takes only one lemming per
cycle.

## 07 "Every Lemming for himself!!!"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel4.png> (same map as
  Tricky 4).
- Width 1486 px. Style dirt.
- Lemmings 80, save 98 % (79), RR 55, time 3 min.
- Skills: 1, 0, 5, 1, 6, 1, 0, 0.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Left rock | rock | x 0-48, y 100-160 | |
| Stone tower | brickWall | x 100-162, y 15-88 | |
| Stone slab 1 | brickWall | x 90-370, y 88-160 | |
| Mountain | blob | x 195-370, y 40-160 | Peak at (300, 40). |
| Crack | gap | x 370-398, y 88-160 | |
| Stone slab 2 | brickWall | x 398-885, y 88-150 | Bottom right tapers from x 860 to x 885. |
| Hatch | hatch | (428, 40) | Box x 408-448, y 20-40. |
| Peak | blob | x 465-585, y 5-88 | Peak at (540, 5). |
| One-way mound | one-way left | x 712-757, y 18-88 | Arrows point left. |
| Rock in slab | rock | x 620-655, y 105-160 | |
| Slime pile | blob | x 862-880, y 78-90 | Turn-around point. |
| Slime slope | ramp | from (885, 90) down to (900, 120) | Thin. |
| Stepping rocks | rock | x 898-935, y 105-160; x 968-1005, y 140-160; x 1053-1083, y 135-160 | |
| Exit hill | blob | x 1100-1300, y 110-160 | Top at y 110 near x 1150-1250. |
| Exit | exit | (1200, 110) | |
| Right rock | rock | x 1430-1486, y 82-160 | |

Solution idea: a climber walks over the one-way mound to the slime pile and turns back with a
builder. It bashes the mound from the right (left-facing). A blocker holds the crowd meanwhile.
Six builders bridge the stepping rocks to the exit hill, starting only after each summit.

## 08 "The Art Gallery"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel5.png> (same map as
  Tricky 5).
- Width 1165 px. Style crystal.
- Lemmings 80, save 100 % (80), RR 20, time 4 min.
- Skills: 10, 10, 10, 0, 10, 10, 0, 0.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Crystal heap | crystal (many) | x 0-375, y 8-160 | Mountain, top x 200-330 at y 8-25. |
| Long rod | girder (diagonal) | from (390, 160) to (570, 0), 6 px thick | |
| Short rod | girder (diagonal) | from (520, 85) to (590, 160), 6 px thick | `[verify]` |
| Crystal blocks | crystal | x 410-435, y 130-160; x 480-510, y 128-160; x 500-530, y 60-90 | |
| Ring of spheres 1 | arch (balls) | x 415-505, y 60-150 | Hollow ring. |
| Hatch | hatch | (566, 77) | Box x 546-586, y 57-77. |
| Mesh floor | rect (lattice) | x 545-985, y 90-150 | Chain-link floor. |
| Ring of spheres 2 | arch (balls) | x 662-785, y 70-160 | |
| Top beam | girder | x 810-985, y 0-25 | Corner blocks at both ends. |
| Hanging globes | chain + ellipse | x 840, 878, 915, 952; chain y 25-95; ball d 25, y 95-120 | Four globes. |
| Small crystals | crystal | x 1045-1105, y 85-160 | |
| Exit pillar | pillar (T) | x 1115-1160, y 80-160 | |
| Exit | exit | (1138, 80) | On the T-pillar. |

Solution idea: a basher plus builder at the first ring holds the crowd. The lead lemming bashes
through the four globes, then builds from the far edge of the mesh to the exit pillar. Finally
bash the ring so the crowd follows.

## 09 "Perseverance"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel10.png> (same map as Fun 10).
- Width 1448 px. Style pillar.
- Lemmings 20, save 100 % (20), RR 50, time 4 min.
- Skills: 2, 1, 1, 2, 2, 1, 1, 2.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Far-left columns | pillar | x 0-30, x 35-65, y 0-160 | Decor. |
| Short column | pillar | x 225-255, y 95-160 | Decor. |
| Arc pillar | arch | x 320-390, y 90-160 | Decor. |
| Rock column | rock | x 490-530, y 0-160 | Slope x 437-490, y 105-160. |
| Steel 1 | steel | x 512-535, y 145-160 | |
| Beam 1 | pillar (lying) | x 520-660, y 5-40 | |
| Broken column | pillar | x 553-585, y 40-60 and y 80-160 | Gap y 60-80. |
| Column 2 | pillar | x 625-660, y 0-115 | |
| Top beams | slab | x 660-890, y 0-20 | |
| Steel 2 | steel | x 655-678, y 142-160 | |
| Exit floor | brickWall | x 678-843, y 145-160 | |
| Exit | exit | (722, 145) | |
| L-block | brickWall | x 700-720, y 45-65; x 700-743, y 65-85 | |
| Tall block | brickWall | x 763-805, y 45-125 | The hatch drops onto it. |
| Reverse-L block | brickWall | x 838-857, y 85-105; x 816-857, y 105-125 | |
| Hatch | hatch | (785, 28) | Box x 765-805, y 3-28. |
| Steel 3 | steel | x 843-866, y 142-160 | |
| Column 3 | pillar | x 890-925, y 0-70 | |
| Beam 2 | pillar (lying) | x 925-1055, y 5-40 | |
| Column 4 | pillar | x 930-960, y 82-160 | |
| Steel 4 | steel | x 983-1006, y 142-160 | |
| Inverted stairs | steps | x 965-1035, y 40-85 | V shape, decor. |
| Block pyramid | brickWall | x 985-1105, y 40-160 | |
| Column 5 | pillar | x 1083-1100, y 0-160 | |
| Far-right pyramid | brickWall | x 1220-1448, y 80-160 | Decor. |

Solution idea: the first lemming digs into the tall block. The second floats down and mines a
shallow dip near steel 3 to turn back. Raise the release rate so nobody falls too far; the dug
tunnel turns the right-walkers back to the exit.

## 10 "Izzie Wizzie lemmings get busy"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel6.png> (same map as
  Tricky 6).
- Width 1224 px. Style fire.
- Lemmings 5, save 100 % (5), RR 50, time 5 min.
- Skills: 0, 0, 5, 5, 15, 5, 5, 5.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Ceiling | slab + stalactite | x 0-1224, y 0-10 | Stalactites to y 35. |
| Left swing | chain x 2 + slab (rough) | chains x 100-120, x 293-313 (y 0-100); slab x 80-333, y 95-120 | Decor. |
| Left spire top | stalactite | x 350-410, y 0-75 | |
| Left spire bottom | stalagmite | x 350-410, y 88-160 | Flame thrower at its right side. |
| Flame thrower | trap fire | x 405-450, y 98-108 | Fires to the right. |
| Hatch | hatch | (447, 55) | Box x 427-467, y 32-55. |
| U-pit 1 | brickWall (U) | walls x 410-435, x 462-487 (y 73-85); floor x 423-473, y 85-92 | |
| U-pit 2 | brickWall (U) | walls x 483-508, x 533-558 (y 90-102); floor x 496-545, y 102-108 | |
| U-pit 3 | brickWall (U) | walls x 575-600, x 623-648 (y 77-88); floor x 587-636, y 88-95 | |
| U-pit 4 | brickWall (U) | walls x 640-665, x 690-715 (y 142-153); floor x 652-700, y 153-160 | |
| Exit slab | slab | x 728-800, y 135-140 | |
| Exit | exit | (765, 135) | |
| Right spire top | stalactite | x 810-850, y 0-75 | |
| Right spire bottom | stalagmite | x 800-880, y 88-160 | |
| Right swing | chain x 2 + slab (rough) | chains x 915-935, x 1100-1120 (y 0-95); slab x 895-1145, y 92-118 | Decor. |

Solution idea: build out of each U-pit. Start the second ramp at the very edge before the pit.
Bash the right wall of U-pit 3 so the lemming drops safely into U-pit 4, then build to the exit.
Builders free the others.

## 11 "The ascending pillar scenario"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel7.png> (same map as
  Tricky 7).
- Width 1086 px. Style pillar.
- Lemmings 50, save 100 % (50), RR 20, time 4 min.
- Skills: 2, 1, 0, 0, 20, 5, 5, 5.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Ceiling | slab | x 112-868, y 0-10 | |
| Bent pipe | pillar (bent) | x 0-105, y 0-95 | J-shaped; joins the left wall. |
| Left wall | pillar | x 0-38, y 40-160 | |
| Exit slab | brickWall | x 65-230, y 140-160 | |
| Exit | exit | (133, 140) | |
| Pillars 1-7 | pillar (capital) | x 237-283 (top 50), 295-343 (62), 355-403 (75), 412-460 (87), 472-520 (100), 533-580 (115), 592-642 (128); all to y 160 | Descend to the right. |
| Hatch | hatch | (614, 98) | Box x 595-633, y 77-98. Drops onto pillar 7. |
| Broken pillar | pillar | x 750-780, y 8-45 | Hangs from the ceiling. |
| Tall pillar | pillar | x 800-830, y 38-160 | |
| Right pillar | pillar | x 1052-1086, y 85-160 | |
| Sea | water | x 0-1086, y 155-160 | Amiga has water; the DOS map shows none. `[verify]` |

Solution idea: two diggers in pillar 7 form a holding pit; builders stop them. A climber scales
the pillars to pillar 1, building where needed. It digs and mines out of pillar 1 and builds over
the gap to the exit slab. A miner releases the pit.

## 12 "Livin' On The Edge"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TaxingLevel12.png>
- Width 952 px. Style fire.
- Lemmings 10, save 80 % (8), RR 1, time 5 min.
- Skills: 10, 10, 10, 2, 10, 10, 10, 10.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Ceiling | blob band | x 110-860, y 0-40 | Thick part x 260-370. |
| Left zigzag | brickWall (blocks) | x 0-90, y 20-160 | Stacked offset blocks; decor. |
| Spindle column | pillar (diamond) | x 143-193, y 28-160 | |
| Arm | slab | x 157-245, y 52-65 | Ends in a flame-thrower nozzle. |
| Flame thrower | trap fire | x 255-305, y 50-62 | Fires to the right. |
| Hanging column | brickWall | x 207-232, y 10-65 | |
| Hatch | hatch | (285, 100) | Box x 265-305, y 80-100. |
| Start block | brickWall | x 262-312, y 128-160 | |
| Brick column | brickWall | x 340-363, y 35-160 | Must be bashed. |
| Pillar 1 | pillar (twisted) | x 390-415, y 102-160 | |
| Pillar 2 | pillar (twisted) | x 440-465, y 92-160 | |
| Pillar 3 | pillar (twisted) | x 489-514, y 80-160 | |
| Pillar 4 | pillar (twisted) | x 537-562, y 68-160 | |
| Exit block | brickWall | x 584-635, y 56-90 | |
| Exit | exit | (617, 56) | |
| Rock wedge | polygon (rough) | (585, 56), (640, 56), (720, 160), (610, 160) | Slopes down to the right. |
| Spike | stalagmite | x 660-680, y 42-75 | |
| Fire cages | rect | x 403-440, y 35-58; x 498-536, y 20-40 | Hang from the ceiling; decor. |
| Hanging pipes | chain | x 725-800, y 0-105 | Decor. |
| Right blocks | brickWall | x 900-952, y 100-160 | Decor. |

Solution idea: blockers on both sides of the start block. One lemming builds from the edge, bashes
the brick column and builds from pillar to pillar to the exit block. A miner then releases the
crowd past the right blocker.

## 13 "Upsidedown World"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TaxingLevel13.png>
- Width 757 px. Style dirt (the rock is drawn upside down: grass on the underside).
- Lemmings 80, save 98 % (79) (wiki: 99 %) `[verify]`, RR 40, time 6 min.
- Skills: 1, 0, 10, 1, 2, 3, 4, 2.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Hatch | hatch | (720, 85) | Box x 700-740, y 62-85. |
| Right band | blob | x 535-757, y 103-145 | Top y 103 at x 600, y 120 at x 700-757. |
| One-way mountain | one-way right | x 545-595, y 40-100 | Arrows point right; peak (580, 40). |
| Mountain base | blob | x 540-600, y 100-130 | Not one-way. |
| Rope bridge | chain (X) | x 455-565, y 105-150 | Two crossed ropes. |
| Rope balls | log | x 490-540, y 145-155 | Four balls under the X. |
| Mountain 2 | blob | x 400-495, y 30-120 | Peak (460, 30). |
| Band left | blob | x 140-490, y 120-152 | Top near y 125 at x 300. |
| Bear trap | trap squasher | (350, 125) | |
| Small mountain | blob | x 215-260, y 75-145 | |
| One-way column | one-way right | x 140-192, y 15-140 | Arrows point right. |
| Exit band | blob | x 0-140, y 95-125 | |
| Exit | exit | (33, 97) | |
| Ceiling | blob | x 345-685, y 0-25 | Hanging rock x 362-395, y 0-70. |

Solution idea: a blocker at the right. Bash under the arrow line of the first mountain or mine
near its base. Mine and bash under the bear trap. A climber scales the one-way column, turns at a
root, then mines and bashes back to the crowd.

## 14 "Hunt the Nessy...."

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TaxingLevel14.png>
- Width 1423 px. Style dirt.
- Lemmings 80, save 95 % (76), RR 30, time 8 min.
- Skills: 0, 0, 10, 10, 30, 2, 1, 1.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Hatch | hatch | (38, 85) | Box x 18-58, y 65-85. |
| Hump 1 | blob | x 0-145, y 113-160 | Grass top. |
| Spike 1 | rock | x 175-215, y 120-160 | |
| Hump 2 | blob | x 250-410, y 113-160 | |
| Spike 2 | rock | x 435-478, y 117-160 | |
| Hump 3 | blob | x 515-660, y 117-160 | |
| Spike 3 | rock | x 680-725, y 117-160 | |
| Hump 4 | blob | x 755-910, y 110-160 | |
| Neck | pillar (rock) | x 995-1045, y 20-160 | |
| Head | blob | x 995-1112, y 20-75 | Snout points right to (1112, 50). |
| Spike 4 | rock | x 1085-1130, y 115-160 | |
| Rock | rock | x 1197-1240, y 95-160 | |
| Rope | chain (diagonal) | from (1230, 110) to (1260, 140) | |
| Well | trap squasher | x 1297-1310, y 103-118 | `[verify]` trap or decor |
| Exit hill | blob | x 1245-1423, y 85-160 | |
| Exit | exit | (1385, 90) | |

Solution idea: two blockers hold the crowd. One lemming builds two ramps per gap along the humps
to the neck. It bashes into the neck, digs down to the fin height and bashes again. More builders
reach the exit hill.

## 15 "What an AWESOME level"

- Reference: <https://lemmings.fandom.com/wiki/File:What_an_Awesome_Level.png>
- Width 939 px (the image is 163 px high; subtract 2 from every y). Style dirt (the original uses
  special artwork; we draw our own creatures).
- Lemmings 80, save 80 % (64), RR 50, time 6 min.
- Skills: 20 of each.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Hatch | hatch | (55, 15) | Box x 35-75, y 3-15. |
| Left creature body | blob (chain of lumps) | x 5-160, y 50-110 | Walkable back, rising from x 5 (y 72) to x 150 (y 50). |
| Left creature head | blob | x 150-270, y 15-140 | Face; must be bashed. |
| Middle tail | blob (chain) | x 285-345, y 45-105 | Rises to the upper left. |
| Middle body | blob (chain, loops) | x 280-560, y 75-160 | Loops leave holes. |
| Arch body | blob (chain) | x 540-780, y 28-160 | Hump top x 600-700 at y 28. |
| Right creature head | blob | x 790-939, y 10-160 | |
| Exit | exit | (888, 15) | On the right head. |
| Stars | rect (1-3 px) | scattered over the sky | Tiny solid dots; they turn lemmings. |

Solution idea: bash through the first head and leave a blocker inside. Build along the bodies,
starting at the top of a spike to clear the stars. Build again between the first two spikes of the
right creature to the exit.

## 16 "Mary Poppins' land"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TaxingLevel16.png>
- Width 711 px. Style fire.
- Lemmings 80, save 96 % (77) (reference table: 95 %) `[verify]`, RR 50, time 3 min.
- Skills: 0, 4, 3, 3, 20, 0, 0, 0.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Hatch | hatch | (52, 22) | Box x 32-72, y 3-22. |
| Pipe | chain | x 0-25, y 0-25 | Decor. |
| Upper ledge | brickWall | x 0-95, y 25-60 | |
| Ledge edge | steel | x 70-95, y 25-40; x 70-85, y 40-60 | |
| Twisted column | pillar (twisted) | x 65-82, y 60-160 | |
| Floor | brickWall | x 82-260, y 148-160 | |
| Spike mountain | polygon | (150, 148), (197, 25), (197, 148) | Steep red wedge. |
| Mountain wall | steel | x 197-212, y 25-148 | |
| Pool rim left | steel | x 260-275, y 142-160 | |
| Lava pool | water | x 275-332, y 150-160 | |
| Pool rim right | steel | x 332-345, y 142-160 | |
| Craggy land | blob | x 330-711, y 120-158 | |
| Exit | exit | (562, 120) | |
| Chain | chain | x 642-665, y 0-125 | Decor. |

Solution idea: two floaters. A blocker at the steel edge. One floater turns on the mountain and
builds back to the ledge. The other turns in the craggy land and builds from the pool rim back to
the wall. Bomb the blocker.

## 17 "X marks the spot"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel23.png> (same map as Fun 23).
- Width 1584 px. Style fire (blue lattice blocks).
- Lemmings 80, save 90 % (72), RR 50, time 7 min.
- Skills: 5, 0, 5, 0, 20, 5, 6, 0.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Left mass | brickWall (lattice) | x 50-1000, y 0-160 | Solid, cut by diagonal slits (next row). |
| Diagonal slits | polygon (erase) | about 20 slits, each 12 px wide, running from upper left to lower right, mostly x 290-470 and x 1100-1350 | Pockets in the mass; trace by eye in phase B. |
| Vertical shafts | polygon (erase, zigzag) | x 50-60 (y 0-160), x 100-115 (y 0-140), x 150-170 (y 50-160) | |
| Shaft flame thrower | trap fire | (165, 92) | In the third shaft. |
| Exit 1 | exit | (22, 55) | Steel block x 0-50, y 55-80. |
| Exit 2 | exit | (22, 145) | Steel block x 0-50, y 145-160. |
| Chamber | polygon (erase) | x 615-760, y 40-125 | Jagged right edge to x 1000 between y 40-125. |
| Top shaft | polygon (erase) | x 762-795, y 0-40 | |
| Lava shaft | polygon (erase) | x 772-808, y 125-160 | |
| Lava | water | x 775-810, y 148-160 | |
| Lava rims | steel | x 750-775, y 135-160; x 808-832, y 135-160 | |
| Hatch | hatch | (647, 90) | Box x 627-667, y 68-90. |
| Decoy writing | polygon (letters) | "EXIT" x 180-270, y 15-45 and X x 220-240, y 80-105; "EXIT" x 480-565, y 70-100 and X x 520-540, y 110-130; "EXIT" x 1425-1535, y 30-65 and X x 1470-1490, y 75-100 | Painted on the wall; not exits. |
| Gap | gap | x 1000-1015, y 0-160 | |
| Right mass | brickWall (lattice) | x 1015-1584, y 0-160 | With diagonal slits; small flames at (1150, 70), (1110, 108), (1190, 108) `[verify]` traps |

Solution idea: two miners make turn-round pits so that nobody walks into the lava. A left-walker
bashes through the wall; a second builds a ramp behind it so no one follows. Mine past the shaft
flame thrower, then bash on to the lower left exit. A miner frees the crowd.

## 18 "Tribute to M.C.Escher"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel11.png> (same map as Fun 11).
- Width 312 px. Style marble.
- Lemmings 75, save 87 % (65), RR 50, time 5 min.
- Skills: 0, 1, 15, 0, 15, 1, 0, 0.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Frame top | slab | x 0-312, y 0-5 | |
| Frame sides | slab | x 0-5 and x 307-312, y 0-136 | Diagonal corner braces at both top corners. |
| Floor | steel | x 0-312, y 136-160 | Riveted; `[verify]` steel |
| One-way block | one-way left | x 72-168, y 67-136; top steps x 80-160, y 60-67 and x 96-144, y 55-60 | Arrows point left. |
| Hatch | hatch | (40, 95) | Box x 18-60, y 72-95. |
| Exit | exit | (282, 136) | Box x 265-300, y 112-136. |

Solution idea: build left from the block's side; a bomber cuts the bottom of the ramp. On top,
float down, build against the right wall to turn, then bash the one-way block from the right.

## 19 "Bomboozal"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel18.png> (same map as Fun 18).
- Width 517 px. Style fire.
- Lemmings 80 (wiki: 70) `[verify]`, save 91 % (73; wiki 64 of 70), RR 80, time 2 min.
- Skills: 0, 0, 15, 0, 0, 0, 0, 0.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Hatch | hatch | (30, 22) | Box x 10-50, y 0-22. |
| Ledge | slab | x 0-95, y 42-50 | |
| Stairs | steps | x 18-95, rising from y 42 to y 25 | Lead up to the column top. |
| Left column | brickWall | x 95-118, y 20-145 | |
| Right column | brickWall | x 352-377, y 18-125 | |
| Floors | girder (2 px) | x 118-352 at y 30, 50, 78, 98, 118; x 118-517 at y 145 | |
| Separators | girder (vertical, 2 px) | x 188 and x 243 (y 30-50); x 215 and x 296 (y 50-78); x 245 (y 78-98); x 207 (y 98-118); x 302 (y 118-145) | |
| Fire pits | trap fire | x 137-167, y 40-50; x 265-295, y 40-50; x 168-200, y 68-78; x 280-312, y 88-98; x 168-200, y 108-118; x 265-295, y 135-145 | |
| Exit | exit | (497, 140) | Slab x 470-508, y 140-145. |

Solution idea: no blockers. Time each bomber so that its blast opens the floor beyond a fire pit
or a separator. Five bombers open a path down to the bottom floor.

## 20 "Walk the web rope"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TaxingLevel20.png>
- Width 1576 px. Style crystal.
- Lemmings 80 (wiki: 90) `[verify]`, save 88 % (71), RR 50, time 5 min.
- Skills: 20 of each.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Hatch | hatch | (208, 118) | Box x 188-228, y 97-118. |
| Web 1 | girder (thin, 2-3 px) | centre (318, 55); octagon rings at radius 10, 25, 45, 70 | Eight spokes. |
| Web 1 spokes | girder (thin) | to (232, 0), (373, 3), (400, 104), (205, 160), (385, 160) | The lower-left spoke runs under the hatch. |
| Web rope | girder (thin, 2 px) | x 400-1095, y 104 | |
| Web 2 | girder (thin) | centre (1168, 60); same rings | Spokes to (1100, 104), (1260, 0), (1265, 155). |
| Exit slab | slab | x 1260-1325, y 155-160 | |
| Exit | exit | (1293, 155) | |
| Stars | rect (1-3 px) | scattered | Tiny solid dots. |

Solution idea: a blocker under the hatch. A climber digs and builds along the strands towards
the web centre, then bashes or mines through the strands to the rope. Bash through web 2 to the
exit.

## 21 "Feel the heat!"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TaxingLevel21.png>
- Width 354 px. Style fire.
- Lemmings 20, save 100 % (20), RR 70, time 2 min.
- Skills: 3, 3, 3, 3, 4, 3, 3, 3.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Left column | pillar (twisted) | x 5-22, y 0-160 | |
| Hatch | hatch | (45, 95) | Box x 25-65, y 72-95. |
| Arm ledge | girder | x 0-75, y 122-137 | |
| Brick block | brickWall | x 75-125, y 93-160 | |
| Steel block | steel | x 125-150, y 95-160 | |
| Flame thrower left | trap fire | x 160-200, y 98-108 | Fires to the right. |
| Exit rubble | blob | x 200-245, y 115-125 | |
| Exit | exit | (220, 115) | |
| Floor | blob | x 150-295, y 125-160 | |
| Flame thrower right | trap fire | x 235-290, y 98-108 | Fires to the left. |
| Right block | steel | x 295-320, y 95-160 | `[verify]` steel |
| Chain | chain | x 330-354, y 0-160 | Decor. |

Solution idea: two climbers. One builds from the right edge of the steel block so the stairs end
between the two flames, over the exit. The other mines down through the brick block to free the
crowd.

## 22 "Come on over to my place"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel27.png> (same map as Fun 27).
- Width 1388 px. Style marble.
- Lemmings 50, save 80 % (40) (DOS; Amiga 100 %), RR 1, time 5 min (DOS; Amiga 3 min).
- Skills: 0, 2, 0, 1, 10, 1, 1, 2.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Lamp post | girder + rect | post x 72-78, y 50-160; arm to x 0-38, y 72-92 | Decor. |
| Rubble mound | blob | x 230-350, y 100-160 | |
| Columns | pillar | x 292-310, y 45-140; x 347-363, y 80-160 | |
| Roof stairs left | steps | from (300, 45) rising to (440, 25) | Brick steps. |
| Roof beam | slab | x 440-640, y 25-32 | |
| Roof stairs right | steps | from (640, 25) falling to (770, 92) | |
| Hatch | hatch | (484, 58) | Box x 464-504, y 36-58. |
| Start shelf | slab | x 380-580, y 74-80 | |
| Steel pillar | steel | x 462-510, y 82-95; x 478-492, y 95-150 | Under the shelf. |
| Pillar | pillar | x 410-428, y 80-160 | |
| Mound | blob | x 445-505, y 135-160 | |
| Exit floor | brickWall | x 527-718, y 152-160 | |
| Exit | exit | (662, 152) | |
| Right stairs | steps | x 732-800, rising from y 137 to y 100 | |
| Stair column | pillar | x 788-800, y 100-160 | |
| Acid pool | water | x 812-920, y 143-160 | |
| Pool rims | steel | x 800-812, y 138-160; x 920-943, y 138-160 | `[verify]` steel |
| Hammer post | rect | x 925-935, y 120-140; head x 910-950, y 102-125 | |
| Rubble | blob | x 940-1095, y 122-160 | |
| Right pillars | pillar | x 1260-1308, y 52-160; x 1355-1388, y 72-160 | Decor. |

Solution idea: a floater digs before the exit and builds to turn. It builds left to the steel
pillar for a safe drop. A builder seals the left edge of the shelf. A digger plus builder makes a
turn-round pit; a miner under the blocker releases it.

## 23 "King of the castle"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel8.png> (same map as
  Tricky 8).
- Width 396 px. Style fire.
- Lemmings 80, save 95 % (76), RR 40, time 5 min.
- Skills: 0, 0, 0, 0, 20, 0, 0, 0.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Exit | exit | (62, 55) | Box x 45-85, y 5-55. |
| Exit ledge | girder | x 50-90, y 55-57 | Riser x 88-90, y 42-57. |
| Floor 5 | girder | x 88-252, y 42-44 | |
| Floor 4 | girder | x 107-338, y 66-68 | |
| Floor 3 | girder | x 55-310, y 90-92 | |
| Floor 2 | girder | x 117-342, y 115-117 | |
| Floor 1 | girder | x 52-173 and x 200-345, y 140-142 | Gap x 173-200. |
| Left wall | girder (vertical) | x 50-53, y 55-140 | |
| Right wall | girder (vertical) | x 345-348, y 0-140 | |
| Hatch | hatch | (322, 138) | Box x 302-342, y 116-138. |
| Supports | brickWall | x 93-107, x 160-173, x 200-213, x 273-287; y 142-160 | |
| Lava | water | x 53-345, y 150-160 | `[verify]` extent |
| Rubble | blob | x 0-52, y 135-160; x 345-396, y 135-160 | |

Solution idea: only builders. Seal the floor gap, stall the crowd with builders, and stair up from
floor to floor in a zigzag to the exit ledge.

## 24 "Take a running jump....."

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TaxingLevel24.png>
- Width 1224 px. Style fire.
- Lemmings 80, save 98 % (79) (wiki: 99 %) `[verify]`, RR 50, time 3 min.
- Skills: 0, 0, 0, 0, 30, 0, 0, 0.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Lattice heap | crystal (blue) | x 0-145, y 105-160 | Decor. |
| Chain | chain | x 225-245, y 0-80 | Decor. |
| Hatch | hatch | (330, 65) | Box x 308-348, y 43-65. |
| Start block | brickWall | x 222-372, y 80-160 | |
| Bridge beam | slab | x 372-515, y 80-88 | Over the lava pool. |
| Lava 1 | water | x 372-515, y 145-160 | |
| Sign "DEATH ->" | polygon (letters) | x 360-540, y 15-45 | Terrain letters. |
| Brick block | brickWall | x 515-565, y 80-160 | |
| Spike wedge | polygon | (548, 80), (565, 40), (565, 80) | |
| Tall column | steel | x 565-590, y 40-160 | `[verify]` steel |
| Upper beam 1 | slab | x 607-735, y 37-47 | |
| Rock mass | blob | x 680-760, y 37-125 | |
| Exit blocks | steel | x 590-665, y 125-160 | |
| Exit | exit | (612, 125) | |
| Chain link | chain | x 665-720, y 135-150 | |
| Brick block 2 | brickWall | x 722-800, y 125-160 | |
| Lava 2 | water | x 820-900, y 148-160 | |
| Rubble ledge | blob | x 820-900, y 120-145 | Over lava 2. |
| Upper beam 2 | slab | x 808-900, y 37-45 | |
| Sloping rock | polygon (rough) | x 900-1050, y 30-110 | Falls to the right. |
| Lattice stairs | crystal (blue, diagonal) | x 940-1080, y 95-160 | Crude stairway with a 1 px slot. |
| Brick wall | brickWall | x 1030-1224, y 0-160 | Painted letters "MAD DAM DMA"; spike x 1030-1045, y 15-45. |

Solution idea: builders slow the crowd while the leader builds over the gap. Seal the 1 px slot
in the lattice stairs so lemmings turn back to the exit. One more builder crosses the exit blocks.
The exact way from the start block up to the upper beams is `[verify]`.

## 25 "Follow the leader..."

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel19.png> (same map as Fun 19).
- Width 1473 px. Style marble.
- Lemmings 80, save 90 % (72), RR 20, time 4 min.
- Skills: 0, 0, 10, 0, 7, 5, 0, 0.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Left rubble | blob | x 0-120, y 112-160 | |
| Lattice frame | girder (diagonal grid) | x 100-245, y 0-160 | Decor ladder. |
| Rubble 2 | blob | x 150-245, y 130-160 | |
| Brick tower | brickWall | x 245-310, y 0-160 | |
| Truss ceiling | girder (triangles) | x 310-960, y 0-45 | Pipe x 640-715, y 15-30. |
| Hanging rod | girder | x 505-510, y 15-72 | |
| Ceiling right | blob | x 960-1225, y 0-15 | |
| Hanging rock | rock | x 1220-1290, y 0-60 | |
| Hatch | hatch | (433, 97) | Box x 413-453, y 75-97. |
| Arch 1 | arch (ring, 15 px thick) | x 350-535, top y 122, base y 160 | Hollow; centre post x 443, y 135-160. |
| Arch 2 | arch (ring) | x 538-722, top y 122 | Hollow; centre post x 628. |
| Arch 3 | arch (filled) | x 724-908, top y 122 | |
| Arch 4 | arch (filled) | x 910-1095, top y 122 | |
| Arch 5 | arch (filled) | x 1097-1285, top y 122 | |
| Exit slab | slab | x 1320-1465, y 83-100 | |
| Exit column | pillar | x 1385-1410, y 100-160 | Thin posts x 1335 and x 1447. |
| Exit | exit | (1397, 83) | |

Solution idea: no blockers. A basher in an arch, stopped by a builder, makes a pit that holds the
crowd. The leader builds from the end of the last arch up to the exit slab. A last builder lets
the crowd out of the pit.

## 26 "Triple Trouble"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TaxingLevel26.png>
- Width 359 px. Style fire.
- Lemmings 80, save 98 % (79) (wiki: 99 %) `[verify]`, RR 80, time 5 min. Three hatches.
- Skills: 10 of each.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Ceiling | blob band | x 0-359, y 0-10 | |
| Left column | pillar (twisted) | x 8-25, y 20-150 | |
| Right column | pillar (twisted) | x 318-335, y 20-150 | |
| Left floor | brickWall | x 8-68, y 148-160 | |
| Left steel | steel | x 68-92, y 135-160 | |
| Right steel | steel | x 260-285, y 135-160 | |
| Right floor | brickWall | x 285-335, y 148-160 | |
| Hatch top | hatch | (178, 25) | Box x 158-197, y 0-25. |
| Hatch left | hatch | (48, 123) | Box x 28-68, y 100-123. |
| Hatch right | hatch | (288, 123) | Box x 268-308, y 100-123. |
| Centre ring | blob (ring) | x 115-225, y 35-115 | Hollow; inner space x 155-200, y 50-95. |
| Exit | exit | (175, 95) | Inside the ring. |
| Fire cone | polygon + trap fire | cone x 282-312, y 40-85; fire x 282-312, y 30-40 | `[verify]` trap or decor |
| Small stairs | steps | x 308-318, y 50-62 | Decor. |

Solution idea: dig the top group into the ring. Climbers from both side basins climb the steel
and build towards the ring. A miner inside tunnels out and down to meet the stairs.

## 27 "Call in the bomb squad"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TaxingLevel27.png>
- Width 604 px. Style pillar.
- Lemmings 80, save 60 % (48), RR 10, time 5 min.
- Skills: 0, 0, 10, 10, 10, 0, 0, 0.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Steel frame left | steel | x 0-13, y 5-53; x 0-123, y 40-53; x 110-123, y 15-53 | |
| Steel top bar | steel | x 110-492, y 15-28 | |
| Steel frame right | steel | x 480-493, y 28-53; x 480-604, y 40-53; x 590-604, y 5-53 | |
| Steel post | steel | x 590-604, y 142-160 | |
| Upper slab | brickWall | x 113-492, y 65-85 | 20 px thick; must be blown through. |
| Exit | exit | (400, 65) | On the upper slab. |
| Hatch | hatch | (230, 110) | Box x 210-250, y 88-110. |
| Lower slab | brickWall | x 218-345, y 125-145 | |
| Mound | brickWall | x 282-323, y 105-125 | Steps x 270-282 and x 323-335, y 108-125. |

Solution idea: two blockers hold the crowd on the lower slab. A builder stairs up from the mound
to the underside of the upper slab; turn it into a blocker and bomb it. Repeat until the slab is
cut. One builder bridges the last dent.

## 28 "POOR WEE CREATURES!"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TaxingLevel28.png>
- Width 1098 px. Style crystal.
- Lemmings 80, save 70 % (56), RR 1, time 5 min.
- Skills: 1, 1, 4, 4, 8, 3, 1, 0.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Floating slab 1 | slab | x 172-247, y 16-21 | Above the hatch. |
| Hatch | hatch | (225, 50) | Box x 205-245, y 28-50. |
| Crystal ridge | crystal (many) + blob | x 0-185, y 18-160 | Rises from bottom left to (140, 18). |
| Crystal blocks | crystal | x 150-183, y 50-80; x 183-215, y 67-97 | |
| Silver bar | girder (L) | vertical x 255-268, y 28-160; top x 255-358, y 28-45 | |
| Metal sphere | ellipse | x 355-385, y 20-50 | |
| Floating slab 2 | slab | x 287-350, y 0-8 | |
| Pool | water | x 277-322, y 148-160 | Steel rims x 262-277 and x 322-337, y 148-160. |
| Crystal stump | crystal | x 210-250, y 140-160 | |
| Crystal cluster | crystal (many) | x 350-500, y 20-160 | Tall crystal x 450-500, y 45-160; hanging x 405-455, y 0-50. |
| Ceiling crystals | crystal + blob | x 490-780, y 0-40 | |
| Floor crystals | crystal (many) | x 460-660, y 125-160 | |
| Mesh hill | polygon (lattice) | (660, 160), (720, 75), (860, 75), (860, 160) | Chain-link. |
| Beam trap | trap squasher | x 770-785, y 72-75 | Antimatter beam in the original. |
| Exit | exit | (815, 75) | |
| Crystal | crystal | x 840-880, y 50-160 | |
| Right heaps | blob | x 880-990, y 75-160; x 890-1080, y 0-85 | |
| Small steel | steel | x 655-665, y 145-160; x 860-870, y 145-160 | |

Solution idea: one athlete (climber and floater). It climbs to the sphere and turns with a
builder, bashes past a crystal and builds to the silver bar so the crowd stops falling. It climbs
the bar, bashes the crystal, crosses the mesh and covers the beam trap with a builder.

## 29 "How do I dig up the way?"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_TrickyLevel3.png> (same map as
  Tricky 3).
- Width 705 px. Style dirt.
- Lemmings 80, save 95 % (76), RR 80, time 4 min.
- Skills: 10, 10, 10, 10, 5, 10, 10, 10.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Hatch | hatch | (157, 20) | Box x 137-177, y 0-20. |
| Left hill | blob | x 90-295, y 33-150 | Top y 33 at x 150-230; left slope from (90, 75); cliff at x 290. |
| Coils | chain | x 12-78, y 115-150 | Decor. |
| Ground | blob band | x 0-290, y 145-160 | |
| Log bridge | log | x 280-358 and x 380-460, y 135-145 | Gap x 358-380. |
| Water | water | x 280-460, y 145-160 | |
| Right cliff | blob | x 460-705, y 45-160 | Top y 45. |
| Exit | exit | (655, 48) | Box x 640-670, y 30-48. |

Solution idea: a digger holds the crowd; a miner later lets it out. Two floaters drop to the
bridge and build up the cliff; one seals the bridge gap. A climber digs at the exit, turns with a
builder and mines a path for the crowd.

## 30 "We all fall down"

- Reference: <https://lemmings.fandom.com/wiki/File:Lemmings_FunLevel13.png> (same map as Fun 13).
- Width 1525 px. Style fire.
- Lemmings 60, save 100 % (60), RR 1, time 3 min.
- Skills: 0, 0, 0, 0, 0, 0, 0, 60.

| Element | Kind | Box / position | Notes |
| --- | --- | --- | --- |
| Left rock | blob | x 70-240, y 0-160; widens to x 0-240 below y 100 | |
| Rock ledge | slab (rough) | x 225-315, y 105-118 | |
| Ceiling | blob band + stalactite | x 70-1440, y 0-15 | Stalactites to y 35. |
| Hanging cone | stalactite | x 1025-1105, y 0-95 | |
| Hatch | hatch | (348, 32) | Box x 328-368, y 10-32. |
| Upper girder | slab | x 327-900, y 55-60 | |
| Left column | pillar (twisted) | x 342-360, y 60-160 | |
| Lower girder | slab | x 390-965, y 120-128 | |
| Posts | girder | x 408-415 and x 938-945, y 128-160 | |
| Exit | exit | (957, 120) | Box x 935-978, y 70-120. |
| Right columns | pillar (twisted) | x 1065-1085, y 85-160; x 1190-1210, y 15-140; x 1328-1348, y 15-140 | |
| Right floor | blob band | x 1080-1525, y 138-160 | |

Solution idea: only diggers. Dig holes through the upper girder close to each other so the
lemmings drop in short steps (the full 60 px drop is fatal). Raise the release rate early; time
is short.

## Sources

| Key | Source | Used for | Date |
| --- | --- | --- | --- |
| W | [Lemmings Wiki](https://lemmings.fandom.com/wiki/Taxing), level pages and DOS map images | Layout, skill counts, solution ideas, DOS save values | 2026-10-12 |
| R | [levels-reference.md](../levels-reference.md) | Lemmings, save, RR, time | 2026-10-11 |

## Resume here

- State: phase A done. All 30 Taxing layouts are traced. No level JSON is written yet.
- Check: `npx markdownlint-cli2 docs/layouts/taxing.md`.
- Next (phase B):
  1. Wait for the terrain toolkit (plan M6.126) and the preview tool (plan M6.127).
  2. Build `assets/levels/taxing/<nn>-<slug>.json` from each section, best confidence first.
  3. Render each level with the preview tool and compare it side by side with the reference.
  4. Resolve every `[verify]` item while building; record the decision in this file.
