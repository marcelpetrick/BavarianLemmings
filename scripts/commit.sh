#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
# SPDX-License-Identifier: GPL-3.0-or-later
#
# commit.sh: the project's commit routine in one step (AGENTS.md, "Git").
#
# 1. bumps the version (patch by default), 2. runs ./localPipeline.sh --noRun and stops if it is red,
# 3. stages everything and commits with the subject "<subject> (vX.Y.Z)" and the given body,
# 4. pushes. On a red pipeline the version bump is undone and nothing is committed.
#
# Usage:      scripts/commit.sh "<type>: <subject>" "<body: why>" [patch|minor|major]
# Output:     the pipeline log goes to .tools/last-pipeline.log; prints the new commit line
# Exit codes: 0 = committed and pushed, 1 = pipeline red or git failed, 2 = bad usage
set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "usage: $0 \"<type>: <subject>\" \"<body>\" [patch|minor|major]" >&2
  exit 2
fi
subject="$1"
body="$2"
part="${3:-patch}"

cd "$(dirname "${BASH_SOURCE[0]}")/.."
mkdir -p .tools
version="$(scripts/bump-version.sh "${part}")"
if ! ./localPipeline.sh --noRun > .tools/last-pipeline.log 2>&1; then
  git checkout -- package.json package-lock.json
  grep -E "^==>|FAILED" .tools/last-pipeline.log | tail -3 >&2
  echo "pipeline red: nothing committed (log: .tools/last-pipeline.log)" >&2
  exit 1
fi
git add -A
git commit -q -m "${subject} (v${version})" -m "${body}"
git push -q
git log --oneline -1
