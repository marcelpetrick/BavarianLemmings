// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/** Test helpers: signal measurements without Web Audio. */

/** Power of one frequency in a signal (Goertzel algorithm, a single-bin DFT). */
export function goertzelPower(samples: Float32Array, frequencyHz: number, sampleRate: number): number {
  const coefficient = 2 * Math.cos((2 * Math.PI * frequencyHz) / sampleRate);
  let previous = 0;
  let previous2 = 0;
  for (const sample of samples) {
    const current = sample + coefficient * previous - previous2;
    previous2 = previous;
    previous = current;
  }
  return previous2 * previous2 + previous * previous - coefficient * previous * previous2;
}

/** The frequency with the most power among `start`, `start + step`, ... up to `end` (inclusive). */
export function spectralPeak(samples: Float32Array, sampleRate: number, start: number, end: number, step: number): number {
  let best = start;
  let bestPower = -1;
  for (let frequency = start; frequency <= end; frequency += step) {
    const power = goertzelPower(samples, frequency, sampleRate);
    if (power > bestPower) {
      bestPower = power;
      best = frequency;
    }
  }
  return best;
}

/** Largest absolute sample value. */
export function peakOf(samples: Float32Array): number {
  let max = 0;
  for (const sample of samples) max = Math.max(max, Math.abs(sample));
  return max;
}

/** True when every sample is a finite number. */
export function allFinite(samples: Float32Array): boolean {
  return samples.every((sample) => Number.isFinite(sample));
}

/** Root mean square of a slice. */
export function rms(samples: Float32Array, from = 0, to = samples.length): number {
  let sum = 0;
  for (let i = from; i < to; i++) sum += (samples[i] ?? 0) ** 2;
  return Math.sqrt(sum / Math.max(1, to - from));
}
