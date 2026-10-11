#!/usr/bin/env bash
# SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
# SPDX-License-Identifier: GPL-3.0-or-later
#
# docker-smoke.sh: prove that the Docker image builds, starts and serves the working game (plan M7.01).
#
# Steps:
#   1. Build the image from the Dockerfile (tag bavarianlemmings:smoke).
#   2. Run a container; Docker picks a free host port on 127.0.0.1.
#   3. Check with curl: index.html, the JavaScript asset it names and one voice line answer HTTP 200;
#      the WAV file is served as audio/wav; hashed assets carry a long cache header.
#   4. When Playwright is installed (node_modules), open the game in Chromium and wait for the test hook.
#   5. Stop and remove the container (also on failure).
#
# Usage:      scripts/docker-smoke.sh
# Exit codes: 0 = image serves the game, 1 = a check failed (the check is named), 2 = docker is missing
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

readonly IMAGE="bavarianlemmings:smoke"
container=""

fail() { printf 'docker-smoke: FAILED: %s\n' "$1" >&2; exit 1; }
cleanup() { if [[ -n "${container}" ]]; then docker rm --force "${container}" >/dev/null 2>&1 || true; fi; }
trap cleanup EXIT

command -v docker >/dev/null || { echo "docker-smoke: docker is not installed" >&2; exit 2; }

echo "docker-smoke: building ${IMAGE}"
docker build --quiet --tag "${IMAGE}" . >/dev/null || fail "docker build"

container="$(docker run --detach --publish 127.0.0.1::80 "${IMAGE}")" || fail "docker run"
port="$(docker port "${container}" 80/tcp | head -n 1 | sed 's/.*://')"
[[ -n "${port}" ]] || fail "no host port published"
readonly base="http://127.0.0.1:${port}"
echo "docker-smoke: container ${container:0:12} serves ${base}"

# nginx needs a moment to accept connections; wait up to 10 s.
for _ in $(seq 1 50); do
  curl --silent --output /dev/null "${base}/" && break
  sleep 0.2
done

status() { curl --silent --output /dev/null --write-out '%{http_code}' "$1"; }
header() { curl --silent --head "$1" | tr -d '\r' | grep -i "^$2:" | head -n 1 | cut -d' ' -f2-; }

[[ "$(status "${base}/")" == 200 ]] || fail "index.html did not answer 200"

script_path="$(curl --silent "${base}/" | grep -o 'assets/index-[A-Za-z0-9_-]*\.js' | head -n 1)"
[[ -n "${script_path}" ]] || fail "index.html names no JavaScript asset"
[[ "$(status "${base}/${script_path}")" == 200 ]] || fail "${script_path} did not answer 200"
[[ "$(header "${base}/${script_path}" cache-control)" == *immutable* ]] || fail "${script_path} lacks the immutable cache header"
echo "docker-smoke: index.html and ${script_path} answer 200"

wav_path="$(docker exec "${container}" sh -c 'cd /usr/share/nginx/html && find audio -name "*.wav" | head -n 1')"
if [[ -n "${wav_path}" ]]; then
  [[ "$(status "${base}/${wav_path}")" == 200 ]] || fail "${wav_path} did not answer 200"
  [[ "$(header "${base}/${wav_path}" content-type)" == audio/wav* ]] || fail "${wav_path} is not served as audio/wav"
  echo "docker-smoke: ${wav_path} answers 200 as audio/wav"
fi

if [[ -d node_modules/@playwright/test ]]; then
  BASE_URL="${base}" node --input-type=module -e "
    import { chromium } from '@playwright/test';
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(process.env.BASE_URL + '/?test');
    await page.waitForFunction(() => typeof window.__bavarianLemmings === 'object', null, { timeout: 15000 });
    const screen = await page.evaluate(() => window.__bavarianLemmings.screen());
    await browser.close();
    if (screen !== 'title' || errors.length > 0) { console.error(screen, errors); process.exit(1); }
  " || fail "the game did not start in Chromium"
  echo "docker-smoke: the game starts in Chromium (title screen, no page errors)"
else
  echo "docker-smoke: Playwright not installed, browser check skipped"
fi

echo "docker-smoke: OK"
