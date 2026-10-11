#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
# SPDX-License-Identifier: GPL-3.0-or-later
#
# generate-voices.sh: generate the lemming voice lines (vision A-06) with offline speech synthesis.
#
# The voices are ours: espeak-ng speaks each line with a high-pitched voice, then
# scripts/pitch-wav.mjs speeds it up 1.3 times so it sounds squeaky. No recording of the original
# game is used. Output: 16-bit mono WAVs at 22050 Hz in public/audio/voices/{en,bar}/.
# The committed files were made with espeak-ng 1.52.0. Re-running overwrites them; the English
# voice of espeak-ng is not bit-exact between runs, so expect small binary diffs, not audible ones.
#
# Lines (file name = voice line id used by src/audio/engine.ts):
#   en:  letsGo "Let's go!",  ohNo "Oh no!",  yippee "Yippee!"
#   bar: letsGo "Auf geht's!", ohNo "Oh mei!", yippee "Pfiat di!"   (spoken with the German voice)
#
# Usage:      scripts/generate-voices.sh
# Exit codes: 0 = all files written, 1 = espeak-ng or node missing, or a file failed
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

for tool in espeak-ng node; do
  command -v "${tool}" >/dev/null || { echo "missing tool: ${tool}" >&2; exit 1; }
done

speed_factor=1.3   # how much faster and higher than espeak-ng's own voice
espeak_pitch=99    # espeak-ng pitch, 0 to 99
espeak_rate=170    # words per minute before the speed-up

work_dir="$(mktemp -d)"
trap 'rm -rf "${work_dir}"' EXIT

# speak <language dir> <espeak voice> <line id> <text>
speak() {
  local dir="public/audio/voices/$1" voice="$2" id="$3" text="$4"
  mkdir -p "${dir}"
  espeak-ng -v "${voice}" -p "${espeak_pitch}" -s "${espeak_rate}" -w "${work_dir}/${id}.wav" "${text}"
  node scripts/pitch-wav.mjs "${work_dir}/${id}.wav" "${dir}/${id}.wav" "${speed_factor}"
}

speak en en+f3 letsGo "Let's go!"
speak en en+f3 ohNo "Oh no!"
speak en en+f3 yippee "Yippee!"
speak bar de+f3 letsGo "Auf geht's!"
speak bar de+f3 ohNo "Oh mei!"
speak bar de+f3 yippee "Pfiat di!"
