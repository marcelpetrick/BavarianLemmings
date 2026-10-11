# BavarianLemmings: implementation plan

> Living checklist. [vision.md](vision.md) says what, [architecture.md](architecture.md) says how,
> this file says what to do next. Owner: Marcel Petrick.
> Last update: 2026-10-11 (v0.1.2, prototype playable).

## How to use this file

- Every task is one checkbox: `- [ ] M2.07 (G-02, R-03) text`. The ID is milestone-scoped and
  stable, the parentheses name the vision.md IDs the task satisfies. Tick it (`[x]`) in the same
  commit that finishes it.
- New work goes in here **first**, with the next free number at the end of its milestone. Never
  renumber. A dropped task is struck through (`~~M2.07~~`) with a reason, never deleted.
- Struck-through vision IDs and MAY items marked deferred in vision.md need no task.
- A task is done when its code, its tests and its documentation are committed and the pipeline is
  green. Partial work stays unticked.
- Decisions taken while working go into the decision log of vision.md with the date.
- Every milestone ends with a version bump of the minor number (AGENTS.md), a pipeline run and an
  update of the "Resume here" section in vision.md.

## Assumptions taken on 2026-10-11 (owner delegated these)

| Topic | Decision | Reason |
| --- | --- | --- |
| Order of work (Q-D7) | Vertical slice first: one level playable end to end with mouse and keyboard, then the layers (audio, i18n, themes, touch), then the content. | Finds integration problems early; every milestone ships something playable. |
| Level recreation (Q-D8) | Levels are rebuilt by the agent from public level descriptions, walkthrough texts and memory. Geometry, pieces and names are ours. Each level JSON records `inspiredBy`. | Owner: "check what is available in the web"; X-02 forbids any original data. |
| Touch (Q-D1, Q-D3) | Mouse and keyboard are primary and are built first. Touch is a later layer (M5) with press-aim-release and side panels in landscape as proposed in vision 3.4.1; a plain-tap option is added if the e2e tests on tablet emulation show press-aim-release is awkward. | Owner: "primary input is mouse and keyboard, touch is something you have to work out". |
| Devices (Q-D2) | Desktop Chrome is tested in CI (Firefox by manual play-testing, owner 2026-10-11). Tablets via Chrome on Android and Playwright tablet emulation. Safari on iPad and phones are best effort, not in CI. | Only Firefox and Chrome were ever required. |
| Fast-forward (Q-D4) | One speed, 4×, toggled by a button and by the `F` key; frame step with `.` while paused. | One speed keeps the panel simple; 4× matches the DOS tick rate times a comfortable factor. |
| Bavarian mode entry (Q-D5) | A theme toggle in settings **and** a "Bayern" button on the title screen. The theme does not change the language. | Discoverability without coupling two independent settings. |
| Level codes (Q-D6) | Deferred. Progress is saved in the browser; passwords can come later as a nostalgic extra. | Not needed for the goal; keeps M3 small. |
| Voices (Q-D9) | Voice lines follow the UI language. English and Bavarian sets exist. German UI uses the English set. | Owner: localized when switching to Bavarian; no German voice version. |
| Credits (Q-D10) | A credits screen with the owner's text: homage to the 1991 original, not affiliated, a browser recreation by Marcel Petrick, no original assets, no disassembled code, contact for any concern. | Owner. |

## Roadmap (Gantt)

Estimates for one agent working in sessions, starting 2026-10-12. Durations are calendar days and
are updated when a milestone closes. The chart is hand-maintained until `scripts/gantt.mjs`
(M0.18) generates it from the task list.

```mermaid
gantt
    title BavarianLemmings roadmap
    dateFormat  YYYY-MM-DD
    axisFormat  %d.%m.
    section M0 Foundations
    Docs, licence, pipeline (done)      :done, m0a, 2026-10-11, 1d
    Scaffold, lint, coverage, REUSE     :m0b, 2026-10-12, 2d
    Playwright smoke, plan check        :m0c, after m0b, 1d
    section M1 Simulation
    Constants, RNG, terrain, level      :m1a, after m0c, 2d
    Walker, faller, hatch, hazards      :m1b, after m1a, 2d
    Eight skills                        :m1c, after m1b, 4d
    Game loop, determinism, fixtures    :m1d, after m1c, 2d
    section M2 Vertical slice
    Scaler, theme loader, sprites       :m2a, after m1d, 3d
    Playfield, panel, mouse, keyboard   :m2b, after m2a, 3d
    First level, e2e, screenshot        :m2c, after m2b, 2d
    section M3 Game loop
    Screens, persistence, i18n          :m3a, after m2c, 3d
    FM synth, sfx, music, voices        :m3b, after m3a, 4d
    section M4 Bavarian
    Theme, sprites, objects, music      :m4a, after m3b, 4d
    section M5 Touch
    Touch panel, gestures, e2e          :m5a, after m4a, 3d
    section M6 Content
    Styles and reference table          :m6a, after m5a, 2d
    Fun 1-30                            :m6b, after m6a, 4d
    Tricky 1-30                         :m6c, after m6b, 4d
    Taxing 1-30                         :m6d, after m6c, 4d
    Mayhem 1-30                         :m6e, after m6d, 4d
    Verify constants                    :m6f, after m6e, 1d
    section M7 Delivery
    Docker, GHCR, Pages, release        :m7a, after m6f, 2d
    Offline, README, review, about      :m7b, after m7a, 2d
    Final check                         :milestone, m7c, after m7b, 0d
```

## M0: foundations (partly done)

- [x] M0.01 (Q) `vision.md` with the specification list, decision log and resume section.
- [x] M0.02 (Q) `AGENTS.md` with the working rules.
- [x] M0.03 (X-01) `LICENSE` with the GPL-3.0 text.
- [x] M0.04 (Q) `localPipeline.sh` with markdownlint, shellcheck, actionlint, semver and licence
      checks; `scripts/bump-version.sh`, `scripts/install-actionlint.sh`.
- [x] M0.05 (Q) `.github/workflows/ci.yml` running `./localPipeline.sh --noRun`.
- [x] M0.06 (Q) `README.md` with badges, status and the homage disclaimer.
- [x] M0.07 (R) `architecture.md`: decision rule, four candidates, choice, module map.
- [x] M0.08 (Q) `plan.md` (this file).
- [x] M0.09 (Q) First push to `github.com/marcelpetrick/BavarianLemmings` and CI green there
      (pushed by the owner; CI run 38145947990 green on 2026-10-11).
- [x] M0.10 (Q, P-02) Vite + TypeScript strict scaffold: `index.html`, `src/main.ts`, `vite.config.ts`,
      `tsconfig.json` with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`.
- [x] M0.11 (Q) Vitest with V8 coverage, threshold 95 % lines/branches/functions, in the pipeline.
- [x] M0.12 (Q, R-02) ESLint (type-aware) with import-boundary rule for `src/sim`, Prettier, Stylelint;
      all in the pipeline.
- [x] M0.13 (X-01, X-03) REUSE: `REUSE.toml`, SPDX headers on every source file, `reuse lint` in the
      pipeline; `THIRD_PARTY.md` created (empty table with licence columns).
- [x] M0.14 (Q) `scripts/check-constants.mjs`: lists every `unverified` constant (architecture 6.2).
- [x] M0.15 (Q) Playwright installed with Firefox and Chromium; one smoke test (page loads, canvas
      exists); in the pipeline and in CI with browser caching.
- [x] M0.16 (Q) `scripts/check-plan.mjs`: every vision.md ID (G/L/V/C/A/P/R/I/X) is referenced by
      at least one plan task; fails the pipeline otherwise. Exempt: struck-through IDs and MAY items
      marked deferred in vision.md.
- [ ] M0.17 (Q) Pipeline step order documented in README; CI badge works after M0.09.
- [ ] M0.18 (Q) `scripts/gantt.mjs`: generates the Mermaid Gantt in this file from the milestone
      headings and tick state (dashboards follow the data); README refreshed from the same data.
- [x] M0.19 (Q) `scripts/commit.sh`: format, bump, run the pipeline, commit with the version in the
      subject, push; refuses to commit on a red pipeline.
- [x] M0.20 (Q, P-01) End-to-end tests in Chromium only (owner, 2026-10-11); Firefox on demand with
      `BL_E2E_FIREFOX=1` and by manual play-testing. Preview port per checkout, so parallel
      worktree pipelines do not collide.
- [x] M0.21 (Q) `/updateDependencies`: all direct dependencies exact and current (TypeScript held at
      6.0 for typescript-eslint, `@types/node` at 24 for Node 24); smol-toml and katex overridden.

## M1: headless simulation

- [x] M1.01 (R-01, R-03, G-15) `src/sim/constants.ts` with every original-game number as a `constant()`
      with unit, status and source (tick rate, splat height, level size, lemming cap, release-rate
      bounds, builder bricks, bomber countdown, skill counts max 99).
- [x] M1.02 (G-12) `src/sim/rng.ts` xorshift32 with tests for a known sequence.
- [x] M1.03 (G-08) `src/sim/terrain.ts`: mask + palette image, `isSolid`, `clearMask`, `setBrick`,
      steel and one-way rules; unit tests with ASCII-art fixtures.
- [x] M1.04 (L-03) `src/sim/level.ts`: Level type, JSON schema (`schemas/level.schema.json`),
      loader, validator; one hand-written test level `assets/levels/test/flat.json`.
- [x] M1.05 (G-02) Walker and faller: walking, turning at walls, stepping up to N pixels, falling,
      fall distance counter, splat; fixtures for every edge (step up, step down, wall, cliff).
- [x] M1.06 (G-01) Hatch and release rate: spawn timing from the release rate, bounds 1..99 and
      the level minimum, spawn order, initial direction from the RNG.
- [x] M1.07 (G-09) Exit, drowning, out-of-bounds death, trap objects with trigger areas.
- [x] M1.08 (G-03, G-04) Climber and floater: permanent flags, climbing geometry, falling back,
      floater opening delay, athlete combination.
- [x] M1.09 (G-03, G-05) Bomber: countdown ticks, "oh no" state, crater mask, steel respected.
- [x] M1.10 (G-03, G-06) Blocker: turn zone, freeing by crater or by removed ground.
- [x] M1.11 (G-03, G-07) Builder: 12 bricks, brick geometry, head bump, shrug, turns at ceiling.
- [x] M1.12 (G-03, G-07) Basher: tunnel mask per stroke, stops at steel and at empty space,
      one-way respected.
- [x] M1.13 (G-03, G-07) Miner: diagonal stroke mask, stops at steel.
- [x] M1.14 (G-03, G-07) Digger: vertical mask, stops at steel, falls when done.
- [x] M1.15 (C-04) Skill assignment rules: which lemming under the cursor wins, which actions
      accept which skill, counters decrement.
- [x] M1.16 (G-10, G-11) `game.ts`: `step(state, inputs)`, time limit, OUT/IN/saved counters,
      win/lose evaluation, pause, nuke with countdown wave.
- [x] M1.17 (G-12) Determinism test: two runs with the same replay give identical state hashes;
      `replay.ts` with record and run.
- [x] M1.18 (G-13) Edge-case fixtures as named tests: builder meets ceiling, basher meets steel,
      blocker on crumbling edge, digger into water, floater over trap, climber at overhang.
- [x] M1.19 (G-14) Documented non-goal: no two-player code paths; a test asserts the public API
      has no second player.
- [x] M1.20 (Q) Coverage of `src/sim` at 100 % lines; milestone bump to 0.1.0.

## M2: vertical slice (one level, mouse and keyboard)

- [x] M2.01 (V-01) `render/scaler.ts`: integer scale factor from the viewport, letterbox, optional
      4:3 stretch, `image-rendering: pixelated`.
- [x] M2.02 (V-07, V-02) Classic theme, first terrain style "dirt": hand-drawn pieces (ours), palette,
      a background; `theme.json` manifest and loader.
- [x] M2.03 (V-05) Classic lemming sprite sheet (ours): walker, faller, climber, floater, bomber,
      blocker, builder, basher, miner, digger, splat, drown, exit, oh-no, shrug; frame counts
      documented per animation with their source.
- [x] M2.04 (V-04) `render/playfield.ts`: terrain image with dirty-row redraw, objects, lemmings,
      horizontal scroll, selection box, bomber countdown digits.
- [x] M2.05 (V-03) `render/panel/classic.ts`: 320×40 panel with release rate −/+, eight skill
      buttons with counts, pause, nuke, minimap with viewport; status line with lemming type under
      cursor, OUT, IN, TIME; bitmap font (ours).
- [x] M2.06 (C-01) `input/pointer.ts`: mouse to intents, crosshair cursor, box cursor over a
      lemming, click to assign, panel clicks, minimap click, edge scrolling.
- [x] M2.07 (C-02, C-03) `input/keyboard.ts`: F1/F2 release rate (direction per verified source),
      F3–F10 skills, F11 pause, F12 nuke, arrow keys scroll.
- [x] M2.08 (R-03, P-04) `ui/app.ts`: rAF loop with tick accumulator, pause, visibility pause.
- [x] M2.09 (R-04) `window.__bavarianLemmings` test hook in dev/test builds only.
- [x] M2.10 (G-10) Result screen: saved vs. needed, retry or next.
- [x] M2.11 (L-01a) First recreated level, Fun 1 equivalent ("Just dig!" idea): our geometry, our
      name, a recorded solution replay as its test.
- [x] M2.12 (P-01) Playwright e2e in Firefox and Chrome: load the level, assign a digger by mouse,
      win; same by keyboard.
- [x] M2.13 (C-05) Conveniences: fast-forward 4×, restart level, frame step, zoom (2× viewport);
      a Purist setting disables them.
- [x] M2.14 (Q) README screenshot captured by Playwright (`scripts/screenshot.mjs`), committed;
      milestone bump to 0.2.0 (the bump is made by the integrating commit on `main`).

## M3: full game loop, audio, languages, persistence

- [x] M3.01 (V-08, V-11) Title screen, level select by rating, level preview (L-04), settings screen,
      credits screen with the owner's text (see assumptions).
- [x] M3.02 (L-02) `persist/storage.ts`: versioned keys, progress written on level completion,
      continue from the furthest level; in-memory implementation for tests; invalid stored values are
      repaired field by field (v1 is the first version, so there is nothing to migrate yet).
- [x] M3.03 (I-01, I-02) `i18n/`: EN, DE, BAR locale files, `t()`, fallback to EN, language in
      settings; `scripts/check-translations.mjs` in the pipeline.
- [x] M3.04 (L-06) All level names and texts through i18n keys in all three languages.
- [x] M3.05 (A-02) `audio/engine.ts`: unlock on first gesture, master/music/sfx volume, mute,
      settings persisted.
- [x] M3.06 (A-03) `audio/fm.ts`: 2-operator FM voices with envelopes; a test renders a note to a
      buffer and checks the spectrum peak.
- [x] M3.07 (A-01) Sound effects as synth recipes: hatch, let's go, oh no, explosion, splat,
      drown, exit, trap, builder brick, button click; mapped from sim events.
- [x] M3.08 (A-05) Classic music: at least three of our own arrangements of public-domain melodies
      as note data, loop points, melody sources listed in `THIRD_PARTY.md` with public-domain
      evidence.
- [x] M3.09 (A-01, A-06) Voice lines EN and BAR, generated by us offline (generator and licence noted
      in `THIRD_PARTY.md`), selected by UI language; DE falls back to EN.
- [x] M3.10 (P-01) e2e: settings persist across reload, language switch changes the title text,
      audio unlock does not throw.
- [ ] M3.11 (Q) Milestone bump to 0.3.0.

## M4: Bavarian theme

- [x] M4.01 (V-09) Bavarian `theme.json`: white-and-blue palette, mountain backgrounds, panel skin,
      Bavarian rating names; the sprite sheet geometry check in the pipeline. Done as TypeScript data
      (`src/theme/themes.ts`), checked by unit tests instead of a JSON manifest.
- [x] M4.02 (V-10) Bavarian lemming sprites in Lederhosen and Dirndl, same frames as classic.
      One sheet for all lemmings: Lederhosen with braces and an alpine hat (a Dirndl variant needs
      per-lemming sheets; see M4.09).
- [x] M4.03 (V-10) Bavarian objects: beer tent exit, maypole scenery, Weißwurst and Maßkrug traps,
      Bavarian hatch.
- [x] M4.04 (V-07) Bavarian terrain styles mapped from the classic ones (dirt → Alm, marble →
      Wirtshaus wood, pillar → maypole, fire → Hendl grill, crystal → ice).
- [x] M4.05 (A-04) Bavarian music: at least three of our own arrangements of traditional
      public-domain tunes (Ländler, Zwiefacher, march), sources in `THIRD_PARTY.md`.
- [x] M4.06 (R-05) Theme switch in settings and a "Bayern" button on the title screen; theme
      persisted; switching reloads assets without reloading the page.
- [ ] M4.07 (P-01) e2e: switch to Bavarian, play the first level, screenshot for the README.
- [ ] M4.08 (Q) Milestone bump to 0.4.0.
- [ ] M4.09 (V-10) Dirndl lemmings: a second Bavarian sheet with the same geometry, chosen per
      lemming (even ids), renderer only.
- [ ] M4.10 (V-10) Maypole scenery placed in Bavarian levels (renderer decoration, no sim effect).

## M5: touch

- [x] M5.01 (C-06) `render/panel/touch.ts`: buttons at 48×48 CSS px minimum, landscape side
      columns, portrait bottom panel; `(pointer: coarse)` auto-selection with a settings override.
- [x] M5.02 (C-06) `input/touchGestures.ts`: press-aim-release with magnifier, two-finger scroll,
      minimap drag, pinch zoom, one-second nuke hold with progress ring, release-rate repeat.
- [x] M5.03 (C-06) `touch-action: none`, no context menu, fullscreen button, pause on hidden page.
- [x] M5.04 (P-06) e2e with Playwright tablet emulation (`hasTouch`, landscape and portrait) in
      Chromium: play the first level by touch only.
- [x] M5.05 (C-06) Decide plain-tap option from the e2e experience; document in vision decision log.
- [ ] M5.06 (Q) Milestone bump to 0.5.0.

## M6: content, all four ratings

One task per level, as a placeholder: the real name, geometry and `inspiredBy` are filled in when
the level is built. A level task is done when: our geometry and name exist, the JSON passes the
schema, a recorded solution replay passes as a test, the texts exist in three languages, and
`inspiredBy` is set. Numbering inside M6 is three digits because there are more than 99 tasks.

- [x] M6.01 (L-01a, X-02, X-05) Collect public level descriptions (names, skill sets, lemming
      counts, rescue targets, time limits) as a reference table `docs/levels-reference.md` with
      sources; no original data files are downloaded.
- [ ] M6.02 (V-07) Remaining classic terrain styles: fire, marble, pillar, crystal, with pieces.
- [x] M6.003 (L-01) Fun 01: "Just dig in!" (`fun-01`), after the original's Fun 1.
- [x] M6.004 (L-01) Fun 02: "Umbrellas up!" (`fun-02`), after the original's Fun 2.
- [x] M6.005 (L-01) Fun 03: "Stand your ground" (`fun-03`), after the original's Fun 3.
- [x] M6.006 (L-01) Fun 04: "Down, then up" (`fun-04`), after the original's Fun 4.
- [x] M6.007 (L-01) Fun 05: "Heads down, push through" (`fun-05`), after the original's Fun 5.
- [x] M6.008 (L-01) Fun 06: "Stand still, then bang" (`fun-06`), after the original's Fun 6.
- [x] M6.009 (L-01) Fun 07: "Mind the step" (`fun-07`), after the original's Fun 7.
- [x] M6.010 (L-01) Fun 08: "Looks worse than it is" (`fun-08`), after the original's Fun 8.
- [x] M6.011 (L-01) Fun 09: "Quick hands" (`fun-09`), after the original's Fun 9.
- [x] M6.012 (L-01) Fun 10: "A hole in the cake" (`fun-10`), after the original's Fun 10.
- [x] M6.013 (L-01) Fun 11: "Against the grain" (`fun-11`), after the original's Fun 11.
- [x] M6.014 (L-01) Fun 12: "Good things take time" (`fun-12`), after the original's Fun 12.
- [x] M6.015 (L-01) Fun 13: "Everybody down" (`fun-13`), after the original's Fun 13.
- [x] M6.016 (L-01) Fun 14: "Step by step" (`fun-14`), after the original's Fun 14.
- [x] M6.017 (L-01) Fun 15: "The scout goes first" (`fun-15`), after the original's Fun 15.
- [x] M6.018 (L-01) Fun 16: "No rush, please" (`fun-16`), after the original's Fun 16.
- [x] M6.019 (L-01) Fun 17: "Four doors, one way" (`fun-17`), after the original's Fun 17.
- [x] M6.020 (L-01) Fun 18: "Stand, then boom" (`fun-18`), after the original's Fun 18.
- [x] M6.021 (L-01) Fun 19: "Handle with care" (`fun-19`), after the original's Fun 19.
- [x] M6.022 (L-01) Fun 20: "Seven poles" (`fun-20`), after the original's Fun 20.
- [x] M6.023 (L-01) Fun 21: "Down in the caves" (`fun-21`), after the original's Fun 21.
- [ ] M6.024 (L-01) Fun 22: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.025 (L-01) Fun 23: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.026 (L-01) Fun 24: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.027 (L-01) Fun 25: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.028 (L-01) Fun 26: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.029 (L-01) Fun 27: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.030 (L-01) Fun 28: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.031 (L-01) Fun 29: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.032 (L-01) Fun 30: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.033 (L-01) Tricky 01: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.034 (L-01) Tricky 02: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.035 (L-01) Tricky 03: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.036 (L-01) Tricky 04: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.037 (L-01) Tricky 05: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.038 (L-01) Tricky 06: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.039 (L-01) Tricky 07: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.040 (L-01) Tricky 08: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.041 (L-01) Tricky 09: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.042 (L-01) Tricky 10: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.043 (L-01) Tricky 11: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.044 (L-01) Tricky 12: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.045 (L-01) Tricky 13: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.046 (L-01) Tricky 14: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.047 (L-01) Tricky 15: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.048 (L-01) Tricky 16: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.049 (L-01) Tricky 17: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.050 (L-01) Tricky 18: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.051 (L-01) Tricky 19: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.052 (L-01) Tricky 20: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.053 (L-01) Tricky 21: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.054 (L-01) Tricky 22: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.055 (L-01) Tricky 23: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.056 (L-01) Tricky 24: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.057 (L-01) Tricky 25: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.058 (L-01) Tricky 26: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.059 (L-01) Tricky 27: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.060 (L-01) Tricky 28: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.061 (L-01) Tricky 29: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.062 (L-01) Tricky 30: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.063 (L-01) Taxing 01: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.064 (L-01) Taxing 02: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.065 (L-01) Taxing 03: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.066 (L-01) Taxing 04: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.067 (L-01) Taxing 05: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.068 (L-01) Taxing 06: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.069 (L-01) Taxing 07: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.070 (L-01) Taxing 08: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.071 (L-01) Taxing 09: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.072 (L-01) Taxing 10: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.073 (L-01) Taxing 11: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.074 (L-01) Taxing 12: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.075 (L-01) Taxing 13: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.076 (L-01) Taxing 14: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.077 (L-01) Taxing 15: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.078 (L-01) Taxing 16: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.079 (L-01) Taxing 17: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.080 (L-01) Taxing 18: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.081 (L-01) Taxing 19: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.082 (L-01) Taxing 20: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.083 (L-01) Taxing 21: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.084 (L-01) Taxing 22: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.085 (L-01) Taxing 23: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.086 (L-01) Taxing 24: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.087 (L-01) Taxing 25: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.088 (L-01) Taxing 26: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.089 (L-01) Taxing 27: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.090 (L-01) Taxing 28: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.091 (L-01) Taxing 29: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.092 (L-01) Taxing 30: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.093 (L-01) Mayhem 01: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.094 (L-01) Mayhem 02: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.095 (L-01) Mayhem 03: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.096 (L-01) Mayhem 04: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.097 (L-01) Mayhem 05: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.098 (L-01) Mayhem 06: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.099 (L-01) Mayhem 07: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.100 (L-01) Mayhem 08: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.101 (L-01) Mayhem 09: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.102 (L-01) Mayhem 10: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.103 (L-01) Mayhem 11: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.104 (L-01) Mayhem 12: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.105 (L-01) Mayhem 13: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.106 (L-01) Mayhem 14: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.107 (L-01) Mayhem 15: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.108 (L-01) Mayhem 16: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.109 (L-01) Mayhem 17: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.110 (L-01) Mayhem 18: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.111 (L-01) Mayhem 19: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.112 (L-01) Mayhem 20: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.113 (L-01) Mayhem 21: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.114 (L-01) Mayhem 22: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.115 (L-01) Mayhem 23: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.116 (L-01) Mayhem 24: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.117 (L-01) Mayhem 25: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.118 (L-01) Mayhem 26: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.119 (L-01) Mayhem 27: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.120 (L-01) Mayhem 28: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.121 (L-01) Mayhem 29: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.122 (L-01) Mayhem 30: placeholder, name and `inspiredBy` filled in when built.
- [ ] M6.123 (V-06, G-15) Verify the tick rate, splat height, level size and lemming cap against
      behaviour documentation; flip the constants to `verified`; note the DOS 80-lemming cap.
- [ ] M6.124 (C-02) Verify the F1/F2 direction and the scroll keys against a documented DOS source.
- [ ] M6.125 (Q) Milestone bump to 0.6.0.

## M7: delivery

- [x] M7.01 (P-03) `Dockerfile` (node:24 build, nginx:alpine serve), `.dockerignore`,
      `scripts/docker-smoke.sh` (build, run, curl index, one Playwright check); in the pipeline.
- [x] M7.02 (P-03) `.github/workflows/docker.yml`: build and publish to GHCR on `v*` tags and on
      `main`.
- [x] M7.03 (P-03) `.github/workflows/pages.yml`: deploy `dist/` to GitHub Pages; "Play in
      browser" badge.
- [x] M7.04 (Q) `.github/workflows/release.yml`: on `v*` tags, check that the tag matches
      `package.json`, run the pipeline, attach the zipped `dist/`.
- [x] M7.05 (P-05) Service worker for offline play after the first load; e2e: reload offline.
- [ ] M7.06 (Q, X-04) README complete: badges (Play, CI, Pages, Docker, Release, Licence, REUSE,
      Coverage, stack), setup, testing, pipeline, Docker, usage, screenshots of both modes.
- [ ] M7.07 (Q) `/reviewBranch`, fix every finding; `review_YYYYMMDD.md` with status per finding.
- [x] M7.08 (Q) `/githubAbout`: description and topics applied.
- [ ] M7.09 (Q) Final check against every vision.md item (`scripts/check-plan.mjs` plus a manual
      pass); pipeline green locally and in CI; Docker image runs; tree clean; everything pushed.
- [ ] M7.10 (Q) Bump to 1.0.0 when the owner says so.
- [x] M7.11 (Q) After the first Pages deployment: set the repository homepage to the Pages URL.
- [ ] M7.12 (P-01) Manual play-test in Firefox and Chrome of every rating before 1.0; findings as
      issues or plan tasks.

## Cross-cutting rules (apply in every milestone)

- Every commit: `scripts/bump-version.sh`, `./localPipeline.sh` green, conventional message.
- Every new script: header comment with purpose, usage and exit codes; README table entry.
- Every asset: ours (noted in the commit) or a `THIRD_PARTY.md` row with licence and URL.
- Every original-game number: a `constant()` with a source, never a literal.
- Every new vision.md ID: at least one plan task that references it.
