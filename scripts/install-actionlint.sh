#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
# SPDX-License-Identifier: GPL-3.0-or-later
#
# install-actionlint.sh: download the pinned actionlint release into .tools/ (git-ignored).
#
# actionlint checks the GitHub Actions workflow files. It is a single Go binary with no npm
# package, so we fetch the official release once and reuse it. Re-running is a no-op when the
# pinned version is already present (idempotent).
#
# Usage:      scripts/install-actionlint.sh
# Output:     prints the path of the binary on stdout
# Exit codes: 0 = binary ready, 1 = unsupported platform or download failed
set -euo pipefail

readonly VERSION="1.7.7"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly ROOT
readonly TOOLS="${ROOT}/.tools"
readonly BIN="${TOOLS}/actionlint-${VERSION}"

if [[ -x "${BIN}" ]]; then
  echo "${BIN}"
  exit 0
fi

case "$(uname -s)-$(uname -m)" in
  Linux-x86_64) platform="linux_amd64" ;;
  Linux-aarch64) platform="linux_arm64" ;;
  Darwin-arm64) platform="darwin_arm64" ;;
  Darwin-x86_64) platform="darwin_amd64" ;;
  *) echo "install-actionlint: unsupported platform $(uname -s)-$(uname -m)" >&2; exit 1 ;;
esac

url="https://github.com/rhysd/actionlint/releases/download/v${VERSION}/actionlint_${VERSION}_${platform}.tar.gz"
tmp="$(mktemp -d)"
trap 'rm -rf "${tmp}"' EXIT

curl -fsSL "${url}" -o "${tmp}/actionlint.tar.gz" || { echo "install-actionlint: download failed: ${url}" >&2; exit 1; }
tar -xzf "${tmp}/actionlint.tar.gz" -C "${tmp}" actionlint
mkdir -p "${TOOLS}"
mv "${tmp}/actionlint" "${BIN}"
chmod +x "${BIN}"
echo "${BIN}"
