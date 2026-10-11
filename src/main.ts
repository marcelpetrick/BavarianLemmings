// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

// Boot: create the game canvas. The game itself is wired in by ui/app.ts (plan M2.08).
const root = document.getElementById('app');
if (root) {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 200;
  canvas.id = 'game';
  root.append(canvas);
}
