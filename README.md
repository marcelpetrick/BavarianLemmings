<!--
SPDX-FileCopyrightText: 2026 Marcel Petrick
SPDX-License-Identifier: GPL-3.0-or-later
-->

# BavarianLemmings

[![CI](https://github.com/marcelpetrick/BavarianLemmings/actions/workflows/ci.yml/badge.svg)](https://github.com/marcelpetrick/BavarianLemmings/actions/workflows/ci.yml)
[![License: GPL v3 or later](https://img.shields.io/badge/License-GPLv3%2B-blue.svg)](LICENSE)
[![Status: planning](https://img.shields.io/badge/status-planning-lightgrey.svg)](vision.md)

An homage to **Lemmings**, the 1991 DOS game, running natively in the browser (Firefox and Chrome).
It has a classic mode in the spirit of the 386-era original and a **Bavarian mode** in white and
blue, with mountains, Alpine folk music, Lederhosen and Weißwurst traps.

> **Status:** planning complete, implementation starting (plan.md milestone M0). There is no
> playable game yet.
>
> | Document | Answers |
> | --- | --- |
> | [vision.md](vision.md) | What: specification list, decisions, status, resume point |
> | [architecture.md](architecture.md) | How: decision rule, candidates, chosen structure, formats |
> | [plan.md](plan.md) | What next: checkable tasks per milestone and the Gantt roadmap |
> | [AGENTS.md](AGENTS.md) | Rules for anyone (human or agent) working here |

## What it will be

- **Classic mode:** 320×200 pixel art scaled crisply, the eight skills (Climber, Floater, Bomber,
  Blocker, Builder, Basher, Miner, Digger), per-pixel destructible terrain, steel and one-way
  walls, traps, release rate, time limit, nuke, DOS function-key shortcuts, AdLib-style music.
- **Bavarian mode:** the same game re-themed in white and blue with mountains, Lederhosen and
  Dirndl, a beer tent exit, Weißwurst traps and Alpine folk music.
- Four ratings of recreated levels, three UI languages (English, German, Bavarian), mouse and
  keyboard first, touch play on tablets, progress saved in the browser.
- Static site: GitHub Pages and a Docker image on GHCR. No backend, no emulator.

## Disclaimer

BavarianLemmings is an unofficial, non-commercial fan homage. It is not affiliated with or
endorsed by the rights holders of *Lemmings*. It contains no original graphics, sounds, music,
fonts or data files. Everything is made by the project itself or used under a free licence.

## Quality pipeline

```sh
npm ci                     # install the pinned tools
./localPipeline.sh         # the gate every commit must pass
./localPipeline.sh --noRun # the same, without launching the game (used by CI)
```

GitHub Actions run exactly `./localPipeline.sh --noRun` ([ci.yml](.github/workflows/ci.yml)).

## Scripts

| Script | Purpose |
| --- | --- |
| [`localPipeline.sh`](localPipeline.sh) | Quality gate: Markdown lint, shellcheck, actionlint, version and licence checks |
| [`scripts/bump-version.sh`](scripts/bump-version.sh) | Raise the semantic version (`patch` by default, every commit) |
| [`scripts/commit.sh`](scripts/commit.sh) | Bump the version, run the pipeline, commit with the version in the subject, push |
| [`scripts/install-actionlint.sh`](scripts/install-actionlint.sh) | Download the pinned actionlint into `.tools/` |
| [`scripts/check-constants.mjs`](scripts/check-constants.mjs) | List the unverified original-game constants; fail if one lacks a status or source |
| [`scripts/check-translations.mjs`](scripts/check-translations.mjs) | Fail if a translation key is missing in a language or used in code but undefined |
| [`scripts/check-plan.mjs`](scripts/check-plan.mjs) | Fail if a vision.md ID has no plan.md task; `--summary` prints done/open per milestone |

## Development

```sh
git clone https://github.com/marcelpetrick/BavarianLemmings.git
cd BavarianLemmings
npm ci
./localPipeline.sh
```

Work follows [plan.md](plan.md): tick a task in the commit that finishes it, bump the version with
`scripts/bump-version.sh`, keep `./localPipeline.sh` green, push. See [AGENTS.md](AGENTS.md).

## Licence

[GPL-3.0-or-later](LICENSE) © 2026 Marcel Petrick
