# BavarianLemmings: architecture

> Living document. It answers **how** the game is built. [vision.md](vision.md) says **what**,
> [plan.md](plan.md) lists the tasks. Owner: Marcel Petrick. Last update: 2026-10-11.

## 1. Decision rule (written before the candidates were scored)

The stack is already decided (vision P-02): TypeScript strict, Vite, Canvas 2D, Web Audio, Vitest,
Playwright, no game engine, no emulator. This document decides the **structure inside that stack**.

### 1.1 Hard gates

A candidate that fails one gate is out, whatever its other merits.

| Gate | Source |
| --- | --- |
| H1: the simulation is pure TypeScript, no DOM, canvas, audio or timers. It runs headless in Vitest. | R-01, R-02 |
| H2: the simulation is deterministic: same level, same seed, same input ticks give the same result, byte for byte. | G-12 |
| H3: terrain is destructible per pixel (digger holes, basher tunnels, builder bricks, bomber craters, steel, one-way). | G-07, G-08 |
| H4: the playfield is a pixel-exact 320×200 logical image, scaled by an integer factor. The control panel can be replaced by a touch layout without touching the simulation. | V-01, V-03, C-06 |
| H5: the fixed simulation tick is independent of the display refresh rate. | R-03, P-04 |
| H6: 95 % test coverage is reachable: every piece of logic can be driven from a test without a browser. | AGENTS.md |
| H7: end-to-end tests run in Firefox and Chrome on GitHub Actions. | P-01 |
| H8: the build is static files that work on GitHub Pages, which cannot set custom HTTP headers, and from a plain nginx container. | P-03 |
| H9: themes (Classic, Bavarian) and languages (EN, DE, Bavarian) are data, loaded at runtime, not code branches. | R-05, I-01 |

### 1.2 Soft criteria (score 1 to 5, higher is better)

| Criterion | What it measures |
| --- | --- |
| S1 Simplicity | Number of concepts a new reader must learn before changing a lemming behaviour. |
| S2 Debuggability | Can a failing replay be stepped frame by frame, with the state inspectable as plain data? |
| S3 Performance headroom | 80 lemmings (DOS cap, `[verify]`) on a 1584×160 terrain (`[verify]`), 60 to 144 Hz display, mid-range laptop and a tablet, without dropped frames. |
| S4 Theme and layout swap cost | How much work is a new theme or a new control layout? |
| S5 Fidelity | How naturally can original behaviours (pixel checks under the feet, brick geometry, one-way flags) be expressed? |

Tie rule: equal totals go to the candidate with the higher S1 (simplicity), because the owner's
first requirement for the code is that humans understand it.

## 2. Candidates

All four share the decided stack. They differ in four design axes: terrain representation, where
the simulation runs, how the state is modelled, and how the screen is composed.

### 2.1 Candidate A: pixel mask, main thread, plain data + pure functions, two canvases

- **Terrain:** one `Uint8Array` of 1584×160 (`[verify]`) flags per pixel: `SOLID`, `STEEL`,
  `ONE_WAY_LEFT`, `ONE_WAY_RIGHT`. A second buffer holds the visible terrain colours (an indexed
  palette image). Digging clears flags and colour pixels; building sets them.
- **Simulation:** runs on the main thread inside `requestAnimationFrame`, with an accumulator
  that executes whole ticks at the fixed tick rate. Lemmings are plain objects in an array; each
  tick is a pure function `step(state, inputs) → state'` operating on a mutable copy.
- **State:** one `GameState` record (lemmings, terrain, counters, RNG seed, tick number). Skills
  are a `switch` over a `LemmingAction` enum, mirroring how the original and its community remakes
  describe behaviour.
- **Screen:** canvas 1 is the 320×160 playfield (drawn from the terrain image and sprites), canvas 2
  is the control panel (classic 320×40, or the touch layout). Both are CSS-scaled with
  `image-rendering: pixelated` by an integer factor computed from the viewport.

### 2.2 Candidate B: pixel mask, simulation in a Web Worker, message-passing

Same terrain and state model as A, but the simulation lives in a Web Worker. Inputs are posted to the
worker; the worker posts back a render snapshot per tick (or shares memory).

- Shared memory (`SharedArrayBuffer`) needs cross-origin isolation (COOP/COEP headers). GitHub Pages
  cannot set headers. The service-worker workaround (`coi-serviceworker`) exists but adds a
  moving part on every page load, and it is exactly the kind of hidden mechanism the owner does not
  want. Without shared memory, the 1584×160 terrain (about 250 KB) must be transferred or diffed
  every tick.
- Debugging crosses a thread boundary: breakpoints and the test hook need marshalling.

### 2.3 Candidate C: tile map terrain, main thread, class-per-lemming state machines

- **Terrain:** a grid of 8×8 (or 16×16) tiles, each a solid or an empty tile; destruction replaces
  tiles.
- **State:** each lemming is a class with its own finite state machine; each skill is a subclass.
- **Screen:** one canvas, panel drawn into the same image.

The tile map is simpler to render and to collide with, but a digger hole, a basher tunnel and a
builder's brick are not tile-shaped. The original's feel comes from per-pixel terrain. This candidate
fails H3.

### 2.4 Candidate D: pixel mask, main thread, ECS (entity component system), one canvas

Same terrain as A. Lemmings, traps, hatches and exits are entities with components (position,
skill, animation, timer); systems iterate over components per tick. One canvas holds playfield and
panel.

- ECS shines with many heterogeneous entities and systems. Lemmings has one dominant entity type
  (80 lemmings) and a handful of objects; the generality buys little here.
- One canvas couples the panel to the playfield, which makes the touch layout (H4) a special case
  inside the renderer instead of a different panel component.

### 2.5 Excluded up front

- Game engines (Phaser, PixiJS, Excalibur) and emulators (js-dos, Emscripten builds): excluded by
  P-02 and by the "no emulation" principle. Not scored.

## 3. Scoring

| | A: mask + main + plain data | B: worker | C: tiles + classes | D: ECS |
| --- | --- | --- | --- | --- |
| H1 pure sim | pass | pass | pass | pass |
| H2 deterministic | pass | pass | pass | pass |
| H3 per-pixel terrain | pass | pass | **fail** | pass |
| H4 swappable panel | pass | pass | weak (one canvas) | weak (one canvas) |
| H5 fixed tick | pass | pass | pass | pass |
| H6 95 % coverage | pass | pass (worker glue is hard to cover) | pass | pass |
| H7 e2e in both browsers | pass | pass | pass | pass |
| H8 static on Pages | pass | **fail with shared memory**, pass with copies | pass | pass |
| H9 themes as data | pass | pass | pass | pass |
| S1 simplicity | 5 | 3 | 4 | 2 |
| S2 debuggability | 5 | 2 | 3 | 3 |
| S3 performance headroom | 4 | 4 | 5 | 4 |
| S4 swap cost | 5 | 5 | 3 | 3 |
| S5 fidelity | 5 | 5 | 1 | 5 |
| **Total (soft)** | **24** | 19 | out (H3) | 17 |

Performance note for S3: the whole simulation of the original ran on a 386. One tick of 80 lemmings
against a byte array is far below one millisecond in a modern JavaScript engine. The costly part is
drawing, and that is identical in A, B and D. The worker in B buys nothing that we need.

## 4. Decision

**Candidate A.** Per-pixel terrain mask, simulation on the main thread, plain data and pure
functions, two canvases (playfield and panel). Reasons: it passes every gate, it has the highest
simplicity and debuggability scores, and the panel-as-separate-canvas makes the touch layout a
different panel, not a special case.

Revisit trigger: if a profile on a real tablet shows the simulation (not the drawing) taking more than
4 ms per tick, re-score B. Record the measurement in the decision log of vision.md.

## 5. Module map

```text
src/
  sim/            pure simulation (H1). No imports from render/, input/, audio/, ui/.
    constants.ts      every original-game number, each with a source field (section 6)
    terrain.ts        pixel mask + colour image, dig/build/explode primitives
    lemming.ts        LemmingState record and the per-tick behaviour switch
    skills/           one file per skill: walker, faller, climber, floater, bomber, blocker,
                      builder, basher, miner, digger (+ splatter, drowner, exiter, ohnoer)
    objects.ts        hatch, exit, traps, water, one-way arrows
    level.ts          Level record, loader and validator for the JSON format (section 8)
    game.ts           GameState, step(state, inputs), win/lose evaluation, nuke
    rng.ts            seeded PRNG (xorshift32), the only randomness in the simulation
    replay.ts         InputEvent log + replay runner (tests, debugging, future "watch replay")
  render/
    playfield.ts      draws terrain image, objects, lemmings, selection box, countdowns
    panel/            classic.ts (320×40 original layout), touch.ts (large buttons), shared.ts
    scaler.ts         integer scale factor, letterboxing, CRT 4:3 option
    sprites.ts        sprite sheet loader (per theme), animation frame lookup
    font.ts           bitmap font renderer (per theme)
  input/
    pointer.ts        Pointer Events → game intents (select lemming, press button, scroll)
    keyboard.ts       F1–F12, scroll keys, conveniences
    touchGestures.ts  press-aim-release, two-finger scroll, pinch (vision 3.4.1)
    intents.ts        the Intent union: the only thing the sim receives from input
  audio/
    engine.ts         Web Audio graph, unlock on first gesture, master/music/sfx volume
    fm.ts             small 2-operator FM synth (AdLib-like) driven by note data
    sfx.ts            sound effect definitions (synthesised) and trigger mapping from sim events
    music.ts          song player: note data per theme and level, loop points
  theme/
    manifest.ts       Theme type and loader (section 7); themes/classic/, themes/bavarian/
  i18n/
    index.ts          t(key), language switch, fallback to EN; locales/en.json, de.json, bar.json
  persist/
    storage.ts        versioned localStorage keys: settings, progress (section 9)
  ui/
    screens/          title, levelSelect, preview, play, result, settings, credits
    app.ts            screen router, the game loop (rAF + tick accumulator), the test hook
  main.ts             boot: load theme + locale + settings, start app
assets/
  themes/classic/     sprites, terrain pieces, backgrounds, music data, sfx data (ours)
  themes/bavarian/
  levels/             fun/*.json, tricky/*.json, taxing/*.json, mayhem/*.json
```

Dependency rule, checked by ESLint import boundaries: `sim/` imports nothing from the other
folders. `render/`, `audio/`, `input/` import `sim/` types only. `ui/` wires them together.

## 6. The simulation

### 6.1 Tick loop

```text
every animation frame:
  now = performance.now()
  accumulator += now - last; last = now
  while accumulator >= TICK_MS:
    inputs = intentQueue.drain()          // intents are stamped with the tick they apply to
    state = step(state, inputs)           // pure, deterministic
    replayLog.append(tick, inputs)
    accumulator -= TICK_MS
  render(state, alpha = accumulator / TICK_MS)   // no interpolation in Purist mode
```

`TICK_MS` is derived from `TICKS_PER_SECOND` in `constants.ts` (`[verify]`: the DOS logic rate;
community engines use about 17 updates per second). Fast-forward multiplies the number of ticks per
frame; pause sets it to zero; frame step executes exactly one.

### 6.2 Constants with provenance

Every number that comes from the original game is declared once, with its source and status:

```ts
export const SPLAT_FALL_HEIGHT = constant(63, {
  unit: 'px',
  status: 'unverified',        // 'unverified' | 'verified'
  source: 'community engine documentation, to be checked (plan task V-xx)',
});
```

A pipeline step lists every `unverified` constant, so the fidelity debt is visible. Verifying a
constant means citing a behaviour description or a measurement, never pasting code (X-03, X-05).

### 6.3 Terrain

- `mask: Uint8Array(width × height)`, bit flags `SOLID=1`, `STEEL=2`, `ONE_WAY_L=4`, `ONE_WAY_R=8`.
- `pixels: Uint8Array(width × height)`, palette index per pixel (0 = transparent).
- Primitives: `isSolid(x, y)`, `clearRect`, `clearMask(shape)`, `setBrick(x, y, dir)`. Each primitive
  respects steel (never cleared) and one-way (cleared only in the allowed direction).
- The renderer keeps an `ImageData` of the visible slice and redraws only dirty rows.

### 6.4 Lemming behaviour

Each lemming is a record: position, direction, action, frame, counters (fall distance, bricks left,
bomber countdown), permanent flags (climber, floater). `step` iterates the lemmings in spawn order
(the original's order matters for blocker interactions and for determinism). Each action is a function
`(lemming, terrain, state) → void` in `skills/`. Skill assignment is an intent carrying the tick, the
lemming id and the skill; the sim validates it (count left, the lemming's current action allows it).

### 6.5 Randomness

Only two things are random in the original: the initial walking direction out of some hatches and
the `[verify]` trap timings. The sim uses one xorshift32 seeded from the level; the seed is part of
the replay.

## 7. Themes

A theme is a folder with a `theme.json` manifest and assets, all ours:

```json
{
  "version": 1,
  "id": "bavarian",
  "name": { "key": "theme.bavarian.name" },
  "palette": ["#000000", "#ffffff", "#0066b3", "..."],
  "sprites": { "lemmings": "lemmings.png", "objects": "objects.png", "panel": "panel.png" },
  "terrainStyles": { "dirt": "styles/alm.png", "..." : "..." },
  "backgrounds": { "default": "mountains.png" },
  "font": "font.png",
  "music": { "default": "music/laendler1.json" },
  "sfx": "sfx.json",
  "ratingNames": ["rating.gmiatlich", "rating.zach", "rating.hundsgemein", "rating.saupreiss"]
}
```

Rules: both themes use **identical sprite sheet geometry** (frame sizes, counts, anchor points), so
the simulation is theme-blind (V-10). A pipeline check compares the two sheets' dimensions. The
theme is chosen in settings and remembered; switching it reloads assets, never the game code.

## 8. Level format

`assets/levels/<rating>/<nn>-<slug>.json`:

```json
{
  "version": 1,
  "id": "fun-01",
  "name": { "key": "level.fun-01.name" },
  "inspiredBy": "Fun 1 (original), recreated from memory",
  "width": 1584,
  "height": 160,
  "start": { "x": 100 },
  "lemmings": 10,
  "toSave": 1,
  "releaseRate": 50,
  "timeSeconds": 300,
  "skills": { "climber": 0, "floater": 0, "bomber": 0, "blocker": 0,
              "builder": 0, "basher": 0, "miner": 0, "digger": 10 },
  "style": "dirt",
  "terrain": [ { "piece": "dirt/block-01", "x": 120, "y": 80, "flip": false, "erase": false } ],
  "steel": [ { "x": 0, "y": 0, "w": 32, "h": 16 } ],
  "oneWay": [ { "x": 0, "y": 0, "w": 32, "h": 16, "dir": "right" } ],
  "objects": [ { "type": "hatch", "x": 200, "y": 20 }, { "type": "exit", "x": 1200, "y": 120 } ]
}
```

Terrain is composed from our own hand-drawn pieces, like the original's level format did with its
own; the piece names are ours. A JSON schema validates every level in the pipeline, and a
"solvability" test runs a recorded replay for each shipped level (the replay is the proof that the
level is solvable, and it is the regression test for the simulation).

## 9. Persistence

`localStorage` keys are versioned: `bl.v1.settings`, `bl.v1.progress`. Progress is written only on
level completion (L-02): `{ "classic": { "fun": 7 }, ... }` meaning the next unlocked level. A
migration function per version bump. Everything is behind one `Storage` interface with an in-memory
implementation for tests.

## 10. Languages

`src/i18n/locales/{en,de,bar}.json` (ISO 639-3 `bar` = Bavarian). Flat keys. `t(key, params)` falls
back to EN and logs a missing key once. `scripts/check-translations.mjs` fails the pipeline if any key
is missing in any language or unused in the code.

## 11. Input and the touch layout

All pointer input arrives as Pointer Events in `input/pointer.ts`, which converts them into intents
(`selectSkill`, `assign(lemmingId)`, `scroll(dx)`, `releaseRate(±)`, `pause`, `nuke`, `fastForward`).
Mouse: click assigns. Touch: `touchGestures.ts` implements press-aim-release (vision 3.4.1, pending
Q-D1). The panel layout is chosen by `(pointer: coarse)` with a settings override (pending Q-D3).

## 12. Audio

Web Audio only, no audio files: `fm.ts` is a two-operator FM voice bank (sine/square carriers with
simple envelopes) that gives the AdLib character; music is note data (JSON) per theme; sound effects
are short synthesised recipes. Voice lines ("Let's go!", "Oh no!", "Oh mei!") are the one case
where pre-rendered samples may be needed; they would be generated by us offline and committed with a
`THIRD_PARTY.md` entry describing the generator (pending Q-D9). Audio unlocks on the first user
gesture (A-02).

## 13. Test strategy

| Level | Tool | What |
| --- | --- | --- |
| Unit | Vitest | every skill function against hand-built terrain fixtures (G-13 cases), terrain primitives, RNG, i18n, persistence, level validation |
| Integration | Vitest | `step` over whole levels with recorded replays; determinism (two runs, identical state hashes); every shipped level solvable by its replay |
| End-to-end | Playwright, Firefox + Chrome, desktop + tablet emulation | boot, title, play a level with the mouse, with the keyboard, with touch; theme and language switches; settings persist across reload; the screenshot for the README |
| Static | ESLint (type-aware, import boundaries), Prettier, Stylelint, markdownlint, shellcheck, actionlint, REUSE | pipeline |

The test hook `window.__bavarianLemmings` exposes
`{ state, step(n), assign(id, skill), load(levelId) }` in dev and test builds only.

## 14. Build and deployment

- Vite builds to `dist/`; base path configurable for GitHub Pages.
- Docker: multi-stage, `node:24` build stage, `nginx:alpine` serving `dist/`. Published to GHCR on
  tags by GitHub Actions. A smoke test curls the index and runs one Playwright check against the
  container.
- Offline (P-05): a Vite PWA plugin or a hand-written service worker, added after the first playable
  slice. Scheduled in plan.md.

## 15. Open architecture items

| Item | Depends on |
| --- | --- |
| Tick rate, splat height, level width, lemming cap: verify, then flip the constants to `verified` | plan tasks, community documentation |
| Press-aim-release vs. plain tap | Q-D1 |
| Side panels in landscape | Q-D3 |
| Voice line generation method | Q-D9 |
| Level codes (passwords) | Q-D6 |
| Service worker for offline | after the vertical slice |
