#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
# SPDX-License-Identifier: GPL-3.0-or-later
#
# bump-version.sh: raise the semantic version in package.json and package-lock.json.
#
# Project rule (AGENTS.md): every commit bumps the patch version, a major feature bumps the minor
# version. Run this before staging a commit; it only edits files, it never commits or tags.
#
# Usage:      scripts/bump-version.sh [patch|minor|major]   (default: patch)
# Output:     prints the new version
# Exit codes: 0 = bumped, 2 = bad usage
set -euo pipefail

part="${1:-patch}"
case "${part}" in
  patch|minor|major) ;;
  *) echo "usage: $0 [patch|minor|major]" >&2; exit 2 ;;
esac

cd "$(dirname "${BASH_SOURCE[0]}")/.."
npm version "${part}" --no-git-tag-version >/dev/null
node -p "require('./package.json').version"
