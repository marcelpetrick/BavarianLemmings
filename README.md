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

> **Status:** requirements engineering. There is no game yet. The goal, the specification list
> and the open questions are in [vision.md](vision.md). The working rules are in
> [AGENTS.md](AGENTS.md).

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
| [`scripts/install-actionlint.sh`](scripts/install-actionlint.sh) | Download the pinned actionlint into `.tools/` |

## Licence

[GPL-3.0-or-later](LICENSE) © 2026 Marcel Petrick
