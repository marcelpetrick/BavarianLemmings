#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 Marcel Petrick
# SPDX-License-Identifier: GPL-3.0-or-later
#
# localPipeline.sh: the single quality gate of BavarianLemmings.
#
# Every commit must pass this script, and GitHub Actions run exactly this script, so "green locally"
# and "green in CI" mean the same thing. Steps are added as the project grows (see AGENTS.md):
# today it checks documents, shell scripts and workflows; later the type check, unit/integration
# tests with coverage >= 95 %, the build, end-to-end tests in Firefox and Chrome, and Docker.
#
# Usage:      ./localPipeline.sh [--noRun]
#               --noRun  skip launching the game at the end (used by CI; nothing to launch yet)
# Exit codes: 0 = all steps green, 1 = a step failed (the failing step is named), 2 = bad usage
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

no_run=false
for arg in "$@"; do
  case "${arg}" in
    --noRun) no_run=true ;;
    *) echo "usage: $0 [--noRun]" >&2; exit 2 ;;
  esac
done

step() { printf '\n==> %s\n' "$1"; }
fail() { printf '\nFAILED: %s\n' "$1" >&2; exit 1; }

step "Dependencies (npm ci, exact versions from package-lock.json)"
npm ci --no-fund --no-audit >/dev/null || fail "npm ci"

step "Version is valid semver"
version="$(node -p "require('./package.json').version")"
[[ "${version}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || fail "package.json version '${version}' is not MAJOR.MINOR.PATCH"
echo "version ${version}"

step "Licence file present"
grep -q "GNU GENERAL PUBLIC LICENSE" LICENSE || fail "LICENSE is missing or not the GPL text"

step "Markdown lint (markdownlint-cli2)"
npx --no-install markdownlint-cli2 || fail "markdown lint"

step "Shell script lint (shellcheck)"
mapfile -t shell_scripts < <(git ls-files --cached --others --exclude-standard '*.sh')
shellcheck "${shell_scripts[@]}" || fail "shellcheck"

step "Workflow lint (actionlint)"
actionlint_bin="$(scripts/install-actionlint.sh)" || fail "actionlint install"
"${actionlint_bin}" || fail "actionlint"

if [[ "${no_run}" == false ]]; then
  step "Launch"
  echo "nothing to launch yet (requirements phase)"
fi

printf '\nAll steps green.\n'
