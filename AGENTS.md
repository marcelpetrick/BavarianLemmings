# AGENTS.md: how to work on BavarianLemmings

This file overrides the parent `codingWithGPT/AGENTS.md` where they differ.

## The four documents

| File | Answers | Who changes it |
| --- | --- | --- |
| [vision.md](vision.md) | **What** we build: specification list with stable IDs, decisions, open questions, status, "Resume here" | Agents, after every step; owner decisions go into its decision log with the date |
| [architecture.md](architecture.md) | **How** it is built: decision rule, candidates, choice, module map, formats | Agents, when a structural decision changes, with the reason |
| [plan.md](plan.md) | **What to do next**: checkable tasks per milestone, Gantt roadmap | Agents: tick tasks in the commit that finishes them, add new tasks before starting them |
| [README.md](README.md) | **How to use it**: status, setup, pipeline, scripts, Docker, screenshots | Agents, refreshed whenever a user-visible thing changes (at least once per milestone) |

Start every session by reading the "Resume here" section of `vision.md`, then the open tasks of the
current milestone in `plan.md`.

## Current phase

**Implementation runs; a playable prototype exists (v0.1.x).** All 30 Fun levels play end to end
in the browser with mouse and keyboard, both themes, audio, three languages. The open work is in
`plan.md`: original-layout reconstruction and the three remaining ratings (M6), fidelity checks
and final release validation (M7). The owner has delegated the remaining product
decisions (see the assumptions table in `plan.md`). Ask only for decisions that are really the
owner's: an irreversible action, a change on shared infrastructure, a real trade-off between
stated goals.

## Working with subagents

The owner wants parallel work through subagents. The routine:

1. Give each subagent an isolated git worktree and a disjoint set of files (for example levels,
   touch, delivery). Name the files it may touch in its brief.
2. A subagent commits on its own branch with conventional messages, **without** bumping the version
   and **without** pushing.
3. The integrator takes each commit onto `main` with `git cherry-pick --no-commit <sha>`, restores
   `package.json` and `package-lock.json`, and commits it with `scripts/commit.sh` (version bump,
   full pipeline, push). One subagent commit gives one `main` commit.
4. Conflicts in shared files (locale JSON, `plan.md`, `playwright.config.ts`) are resolved by the
   integrator, never by force.
5. `.claude/worktrees/` is ignored by git, ESLint and Prettier. Parallel pipelines get their own
   preview port automatically (`playwright.config.ts`).

## Mission

Read `vision.md` and understand the goal. Follow `plan.md`, implement everything, make the decisions
yourself, and keep working until the whole vision is done and the product works. Do not skip
requirements. When something new is needed, add it to `plan.md` first, then do it.

## Git

- Work directly on `main`.
- **Atomic commits:** one logical change per commit, committed as you go.
- **Conventional Commits:** `feat:`, `fix:`, `docs:`, `test:`, `build:`, `ci:`, `refactor:`,
  `chore:`, `perf:`, `style:`. The body says **why**, not only what. The subject ends with the new
  version in parentheses, for example `feat: add digger skill (v0.1.4)`.
- **Semantic versioning:** every commit bumps the patch version (`scripts/bump-version.sh`). A
  finished milestone or a major feature bumps the minor version. 1.0.0 is the owner's call.
- Every commit is green before it is made: `./localPipeline.sh` passes. Use
  `scripts/commit.sh "<type>: <subject>" "<why>" [patch|minor]`, which formats, bumps, runs the
  pipeline, commits and pushes, and refuses on a red pipeline.
- Push after every commit (`scripts/commit.sh` does it). The owner allowed agents to push on
  2026-10-11. When a push fails, say so once. Never leave unpushed work unmentioned.
- Never force-push, never rewrite published history, never push without being allowed to.

## Everything is verifiable

Nothing is believed, everything is checked by a test or a pipeline step that a stranger can run:

- **Unit tests** (Vitest) for every function in `src/sim` and every pure helper elsewhere.
- **Integration tests** (Vitest) for whole-level replays and determinism.
- **End-to-end tests** (Playwright) in **Chromium only** for every user-visible feature: mouse,
  keyboard, touch (tablet emulation), themes, languages, settings persistence, offline. Firefox is
  checked by manual play-testing (owner decision 2026-10-11); `BL_E2E_FIREFOX=1 npx playwright test`
  runs the suite in Firefox on demand.
- **Pipeline checks** for everything that is not code: Markdown, shell scripts, workflows, SPDX
  headers, translations complete, assets attributed, sprite-sheet geometry equal across themes,
  unverified constants listed, every vision ID covered by a plan task, Docker image serves the game.
- **Coverage at least 95 %** (lines, branches, functions); `src/sim` at 100 % lines.
- A feature without its test is not done. A fix without a regression test is not done.
- Facts about the original game are `constant()`s with a source and a status; `unverified` ones
  are listed by the pipeline until a documented source confirms them.

## Local pipeline

- `./localPipeline.sh` is the single gate. GitHub Actions run exactly `./localPipeline.sh --noRun`
  (as in Cullendula) and stay green.
- It grows with the project in this order: Markdown, shell, workflow lint (done); type check,
  ESLint, Prettier, Stylelint; unit and integration tests with coverage; build; translation, asset,
  constants and plan checks; REUSE; Playwright in Chromium; Docker build and smoke test.
- Every step is idempotent and prints its name; a failure names the step.

## Scripts

Write small, reusable scripts for repetitive tasks (`scripts/`). Every script has a header comment
with purpose, usage and exit codes, an SPDX header, passes shellcheck, and has a row in the README.

## Delivery order

1. The local version works in the browser (M1 to M6 in `plan.md`).
2. Then dockerize it (node build stage, nginx serve stage).
3. GitHub Actions build the Docker image and publish it to **GHCR**.
4. GitHub Pages deploys the static build (the "Play in browser" badge).

## Assets and copyright

- No original Lemmings material: no graphics, sounds, music, fonts, level files or data files, and no
  loading of the player's own copy. No disassembly of the original code. Draw, compose and rebuild
  from memory, public descriptions and observation.
- Every asset is generated by us (pixel art, procedural graphics, Web Audio synthesis, pre-rendered
  samples we generate) or has a free licence compatible with the GPL. Each one is recorded in
  `THIRD_PARTY.md` with licence and URL.
- Community reverse-engineering notes are a reference for **behaviour**. Code from them is only taken
  under vision.md X-03 (licence checked, attributed, GPL-compatible).
- The credits screen and the README say: unofficial homage to the 1991 original, not affiliated,
  browser recreation by Marcel Petrick, no original assets, no disassembled code; anyone with a
  concern is asked to contact us so a solution can be found.

## Licence

**GPL-3.0-or-later.** `LICENSE` holds the text. SPDX copyright and licence headers on every source,
script, style and workflow file; REUSE-compliant (`reuse lint` in the pipeline), as in AlliumAssault.

## README

- Refreshed from time to time: at least at every milestone and whenever setup, scripts, pipeline or
  usage change. Its status line matches `plan.md`.
- Disclaimer: unofficial homage, no affiliation with the rights holders of Lemmings.
- Badges in the style of [AlliumAssault](https://github.com/marcelpetrick/AlliumAssault),
  [myLastFmPlayer](https://github.com/marcelpetrick/myLastFmPlayer) and
  [Cullendula](https://github.com/marcelpetrick/Cullendula): play in browser, CI / local pipeline,
  Pages, Docker/GHCR, latest release, licence, REUSE, coverage, and the stack versions.
- Documents setup, testing, the pipeline, Docker and usage; a table of all scripts.
- Includes at least one **real screenshot** of the running UI per mode, taken by a script.

## Reference template

<https://github.com/marcelpetrick/AlliumAssault> is the model for the toolchain, the CI workflows,
the README and the badges. Check its licence and attribution rules before copying anything
(vision.md X-03).

## Readability: the flight-manual style

Documents and code are written so that a tired reader at 2 a.m. can act on them without guessing:

- Short declarative sentences. One idea per sentence. Present tense. Active voice.
- Procedures are numbered steps with the exact command, in the order they are run.
- Every term is used in one meaning only, and defined where it first appears (lemming *action*,
  *skill*, *intent*, *tick*, *theme*).
- Every number has a unit and a source. No magic numbers in code: a `constant()` with provenance.
- Checklists over prose where a reader must verify something. Tables over lists where things have
  more than one attribute.
- No unexplained abbreviations. No jargon where a plain word exists.
- Every living document ends with a "Resume here" section: state, check commands, restart commands.
- Code comments explain why, and name the original behaviour being reproduced; names are full words.

## Definition of done

1. Run `/reviewBranch` and fix every finding; record them in `review_YYYYMMDD.md` with a status
   per finding (fixed with commit / scheduled / open).
2. Run `/githubAbout`.
3. Do a final check against **every** item in `vision.md` (`scripts/check-plan.mjs` plus a manual
   pass). Each one is done, or explicitly deferred by the owner.
4. The full `localPipeline.sh` is green, and GitHub Actions are green.
5. The Docker image builds, starts and serves the working game.
6. Everything is pushed and the working tree is clean.

Stop only when the whole `vision.md` is really done and the product works.
