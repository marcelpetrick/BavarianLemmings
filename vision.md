# BavarianLemmings: vision and specification

> Living document. Phase: **requirements engineering** (no code yet).
> Owner: Marcel Petrick. Last update: 2026-10-11.

## 1. Vision

BavarianLemmings is a faithful re-creation of **Lemmings** (DMA Design / Psygnosis, 1991) as it
looked, sounded and played on a **386 PC under DOS**. It runs natively in the browser (Firefox and
Chrome), built with web technology. It does not emulate, recompile or wrap the original binary.

Lemmings drop out of an entrance hatch and walk on without stopping. The player gives single
lemmings jobs (dig, block, build, bash, explode, and so on) that change the landscape, so that enough
of them reach the exit door before the time runs out.

The game has **two modes**:

1. **Classic mode:** look and feel of the DOS original, as close as we can legally get.
2. **Bavarian mode:** *to be defined by the owner* (see Q1).

## 2. Guiding principles

- **The DOS original is the reference.** Amiga, console and later ports (Lemmings 2, Oh No! More
  Lemmings, remakes) are not the reference. If a port differs from DOS, DOS wins.
- **Native web, no emulation.** No DOSBox/js-dos, no emulator, no WebAssembly build of the original
  executable.
- **Understandable by humans.** Every module, script and decision is documented and reviewed. Code is
  written to be read.
- **Verify facts before stating them.** Original-game details marked `[verify]` below are unconfirmed
  and must be checked (original manual, disassembly-based community documentation, a real DOS run)
  before they become a requirement.

## 3. Specification list

Wording: **MUST** is required for 1.0, **SHOULD** is wanted, **MAY** is optional.
IDs are stable. A removed item is struck through, never renumbered.

### 3.1 Gameplay (G)

| ID | Requirement |
|---|---|
| G-01 | MUST: lemmings spawn from an entrance hatch at a release rate between 1 and 99, which the player can change during play. The lower bound is the level's minimum rate. |
| G-02 | MUST: lemmings walk, turn at walls and steep slopes, step up small rises, and fall. A fall from too high kills the lemming ("splat"). `[verify: exact fall height in pixels]` |
| G-03 | MUST: the eight original skills: **Climber, Floater, Bomber, Blocker, Builder, Basher, Miner, Digger**, each limited to the per-level count. |
| G-04 | MUST: Climber and Floater are permanent abilities and can be combined ("athlete"). |
| G-05 | MUST: Bomber starts a 5-second countdown shown above the lemming, says "Oh no!", then explodes and removes terrain. |
| G-06 | MUST: Blocker stops and turns the other lemmings. It can only be freed by blowing it up, or by removing the ground beneath it. |
| G-07 | MUST: Builder lays 12 bricks of a staircase and shrugs when it runs out. Basher digs horizontally, Miner diagonally downwards, Digger vertically downwards. |
| G-08 | MUST: terrain types: normal (destructible), **steel** (indestructible), **one-way** areas (can only be bashed or mined in one direction). |
| G-09 | MUST: hazards: water/lava (drowning), traps (triggered animations that kill one lemming at a time), falling off the bottom of the level. |
| G-10 | MUST: level goal: save at least *N* % of *M* lemmings within a time limit. A result screen shows the percentage rescued against the percentage needed. |
| G-11 | MUST: pause, and **nuke** (Armageddon) for when the level is lost. Nuke needs a confirming second action. |
| G-12 | MUST: the game logic is deterministic: the same inputs on the same ticks give the same result. Needed for testing and replays. |
| G-13 | SHOULD: lemmings react exactly like the original in edge cases (builder hits the ceiling, basher hits steel, blocker on a crumbling edge, and so on). These cases are documented as test fixtures. |
| G-14 | MUST NOT (1.0): two-player mode (Amiga only, never on DOS). |

### 3.2 Levels and progression (L)

| ID | Requirement |
|---|---|
| L-01 | MUST: difficulty ratings **Fun, Tricky, Taxing, Mayhem** with 30 levels each, as in the original. The level content depends on Q2. |
| L-02 | MUST: level codes (passwords) to resume progress, plus local saving of progress in the browser. |
| L-03 | MUST: the level data format is documented, human-readable (for example JSON) and versioned. |
| L-04 | SHOULD: a level preview screen before play: name, number of lemmings, % to save, release rate, time, and a skill overview. |
| L-05 | MAY: a level editor. |

### 3.3 Look and feel (V)

| ID | Requirement |
|---|---|
| V-01 | MUST: logical resolution of **320×200** (VGA), scaled with integer factors and crisp pixels (no smoothing). The 4:3 aspect ratio of a CRT is available as an option. `[verify: the DOS version's VGA mode and its 16-colour limit]` |
| V-02 | MUST: indexed-colour look within the palette limits of the original. |
| V-03 | MUST: the original bottom panel layout: release rate −/+, eight skill buttons with counters, pause, nuke, minimap. A status line shows the lemming type under the cursor, OUT, IN and TIME. |
| V-04 | MUST: horizontal scrolling over levels that are wider than the screen. The minimap shows the viewport and can be clicked to jump. |
| V-05 | MUST: lemming animations in the original style and frame counts (walk, fall, float, climb, dig, and so on). `[verify: frame counts]` |
| V-06 | MUST: the original game speed. `[verify: logic tick rate of the DOS version]` |
| V-07 | MUST: the terrain styles of the original (dirt, fire, marble, pillar, crystal), shown as originals or as re-creations depending on Q2. `[verify: list]` |
| V-08 | SHOULD: a title screen and menus in the style of the original. |

### 3.4 Controls (C)

| ID | Requirement |
|---|---|
| C-01 | MUST: mouse control as in the original: select a skill in the panel, click a lemming to assign it, use the crosshair cursor. The cursor changes into a box when it is over a lemming. |
| C-02 | MUST: DOS keyboard shortcuts: **F1/F2** release rate, **F3 to F10** the skills in panel order, **F11** pause, **F12** nuke. `[verify: whether F1 is − or + in the retail version; the sources disagree]` |
| C-03 | MUST: keys for scrolling the view. `[verify: original keys]` |
| C-04 | SHOULD: when several lemmings overlap, the choice of which one gets the skill follows the original rules. `[verify]` |

### 3.5 Audio (A)

| ID | Requirement |
|---|---|
| A-01 | MUST: sound effects for the original events (hatch opening, "Let's go!", "Oh no!", splat, explosion, exit, and so on). |
| A-02 | MUST: background music per level with mute/volume controls. Browsers do not play audio before the user interacts with the page; this is handled cleanly. |
| A-03 | SHOULD: the sound character of a period sound card (AdLib/Sound Blaster). How depends on Q2. |

### 3.6 Platform and technology (P)

| ID | Requirement |
|---|---|
| P-01 | MUST: runs in the current stable **Firefox** and **Chrome** on desktop. Both are tested in CI (end-to-end). |
| P-02 | MUST: native web technology: HTML5 Canvas 2D (or WebGL only for scaling), Web Audio, TypeScript. No emulator. |
| P-03 | MUST: no backend. The build is static files that any web server can host (GitHub Pages and a Docker image, see AGENTS.md). |
| P-04 | MUST: steady frame rate on a mid-range laptop. Game logic is independent of the display refresh rate (60/120/144 Hz). |
| P-05 | SHOULD: works offline after the first load. |
| P-06 | MAY: touch/mobile support. Not a goal for 1.0. |

### 3.7 Architecture (R)

| ID | Requirement |
|---|---|
| R-01 | MUST: the game logic (simulation) is pure TypeScript with no DOM, canvas or audio access, so it can be unit-tested headlessly. |
| R-02 | MUST: rendering, input and audio are separate layers on top of the simulation. |
| R-03 | MUST: a fixed-tick simulation loop, decoupled from rendering. |
| R-04 | SHOULD: a test hook (`window.__bavarianLemmings` or similar) for end-to-end tests. |
| R-05 | MUST: a mode switch (Classic/Bavarian) as a theme/ruleset layer, not as a fork of the code. |

### 3.8 Legal and third-party code (X)

| ID | Requirement |
|---|---|
| X-01 | MUST: licence **GPL-3.0-or-later**, with SPDX headers in source files. |
| X-02 | MUST: the handling of the original Lemmings assets (graphics, levels, sounds, music, the name) is decided before implementation starts. See Q2. |
| X-03 | MUST: every piece of code or asset taken from a reference project has a checked licence, is attributed (`THIRD_PARTY.md` and a file header) and is GPL-compatible. |

### 3.9 Process and quality (Q)

Details are in [AGENTS.md](AGENTS.md). In short: atomic conventional commits, semver, a green
`localPipeline.sh` before every commit, coverage of at least 95 %, unit, integration and end-to-end
tests, GitHub Actions that mirror the local pipeline, a Docker image on GHCR, and a README with badges
and a real screenshot.

## 4. Out of scope (for now)

- Two-player mode, Lemmings 2/3, Oh No! More Lemmings content, Christmas Lemmings.
- Online features, accounts, leaderboards.
- Console-port features (SNES, Mega Drive, and so on).

## 5. Reference projects

The owner will supply these. Do not take code from a project before its licence is checked.

| Project | URL | Licence | What we may take | Checked |
|---|---|---|---|---|
| AlliumAssault (owner) | https://github.com/marcelpetrick/AlliumAssault | GPL-3.0-or-later | Toolchain, CI/Pages/Release workflows, README badges, REUSE setup | 2026-10-11 (README only) |
| myLastFmPlayer (owner) | https://github.com/marcelpetrick/myLastFmPlayer | `[check]` | README badge style | – |
| cullendula (owner) | `~/repos/cullendula` (outside the sandbox) | `[check]` | README badge style | – |
| *(more to come)* | | | | |

The AlliumAssault stack is TypeScript (strict), Vite, Vitest, Playwright, ESLint, Prettier, Stylelint,
markdownlint and REUSE, running on Node 24. It is static, with no backend. It is the default
template for this project unless the owner decides otherwise.

## 6. Open questions (owner decisions)

| # | Question | Status |
|---|---|---|
| Q1 | What is **Bavarian mode**? A reskin (Bavarian look, dialect voices, Weißwurst traps)? Other rules? Language? | open |
| Q2 | **Original assets and name:** recreate everything ourselves, load the player's own original DOS data files at runtime, or a mix of both? Do we keep "Lemmings" in the name? | open |
| Q3 | Levels: the 120 original layouts (rebuilt or loaded), our own levels, or both? | open |
| Q4 | Stack: TypeScript + Vite + Vitest + Playwright as in AlliumAssault, plain Canvas 2D without a game engine? | open |
| Q5 | Hosting: GitHub Pages in addition to the Docker image on GHCR? | open |
| Q6 | Branch: `main` (as AGENTS.md says) or the existing `master`? Remote repository URL? | open |
| Q7 | Fidelity of the details: pixel- and tick-exact (with disassembly-based community documentation as the source), or "feels like the original"? | open |
| Q8 | Language of the UI: English as in the original, German, Bavarian, or switchable? | open |
| Q9 | Audio: synthesised in the browser (as in AlliumAssault), our own samples, or the original files from the player's copy? | open |
| Q10 | Scope of 1.0: the minimum to call it done (number of levels, both modes, editor or not)? | open |

## 7. Decision log

| Date | Decision | Reason |
|---|---|---|
| 2026-10-11 | Reference is the DOS (386) version, not Amiga or consoles | Owner's request |
| 2026-10-11 | Native web technology, no emulation | Owner's request |
| 2026-10-11 | Firefox and Chrome are the target browsers | Owner's request |
| 2026-10-11 | GPL-3.0-or-later | Owner's working style (AGENTS.md) |

## 8. Status

| Date | Step | State |
|---|---|---|
| 2026-10-11 | Vision and specification list drafted | done |
| 2026-10-11 | AGENTS.md drafted from the owner's working style | done |
| – | Owner answers Q1–Q10 | waiting |
| – | Specification frozen, implementation plan written | open |

## 9. Resume here

- **State:** requirements phase. No code. Waiting for the owner's answers to Q1–Q10 (section 6).
- **Next:** put the answers into sections 3 and 7, mark the open `[verify]` items as checked or
  replaced, then write the implementation plan (milestones) into this document.
- **Check:** `git log --oneline` and `grep -n "verify\|open" vision.md`.

## Sources (fact check 2026-10-11)

- [Lemmings (video game), Wikipedia](https://en.wikipedia.org/wiki/Lemmings_(video_game))
- [DOS Days: Lemmings](https://www.dosdays.co.uk/topics/Games/game_lemmings.php): VGA, 320×200
- [Psygnosis demo README](https://discmaster.textfiles.com/file/11501/Gold%20Medal%20Software%20Volume%201%20(Gold%20Medal)%20(1994).iso/demos/lem93dem.arj/README.DOC): F1 to F12 layout
- [DOS Game Club forum: F3–F10 choose the type](https://dosgameclub.com/forums/topic/keyboard-shortcuts-f3-f10-chooses-type): F1/F2 in the opposite order
- [AlliumAssault README](https://github.com/marcelpetrick/AlliumAssault)
