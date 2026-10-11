// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Sound effects as synthesis recipes (vision A-01, A-03).
 *
 * Each effect is pure data: a list of *steps* (FM tones, filtered noise bursts, a creaking door,
 * pitch sweeps, bubbles). `renderSfx()` turns a recipe into samples, deterministically, so the
 * tests can check every effect and the engine can cache the result. None of these sounds is taken
 * from the original game; they are built to play the same role (a door opens, a lemming explodes).
 */

import { createNoise, type InstrumentId, INSTRUMENTS, midiToFrequency, mixInto, normalise, renderNote } from './fm';

/** An FM note from the instrument bank. */
export interface ToneStep {
  readonly kind: 'tone';
  readonly instrument: InstrumentId;
  readonly midi: number;
  /** Start in seconds from the beginning of the effect. */
  readonly at: number;
  /** Held duration in seconds (the instrument release follows). */
  readonly length: number;
  readonly gain: number;
}

/** White noise through a low-pass filter whose cutoff glides from `cutoffStartHz` to `cutoffEndHz`. */
export interface NoiseStep {
  readonly kind: 'noise';
  readonly at: number;
  readonly length: number;
  readonly gain: number;
  readonly seed: number;
  readonly cutoffStartHz: number;
  readonly cutoffEndHz: number;
}

/** A creaking hinge: a train of clicks at a wobbling rate, each ringing a resonator. */
export interface CreakStep {
  readonly kind: 'creak';
  readonly at: number;
  readonly length: number;
  readonly gain: number;
  readonly rateStartHz: number;
  readonly rateEndHz: number;
  readonly resonanceHz: number;
}

/**
 * An oscillator whose frequency moves between `fromHz` and `toHz`: a straight glide when
 * `lfoHz` is 0, otherwise up and down `lfoHz` times per second (a siren).
 */
export interface SweepStep {
  readonly kind: 'sweep';
  readonly at: number;
  readonly length: number;
  readonly gain: number;
  readonly fromHz: number;
  readonly toHz: number;
  readonly lfoHz: number;
}

/** Bubbles: short rising sine chirps at pseudo-random times and pitches. */
export interface BubbleStep {
  readonly kind: 'bubbles';
  readonly at: number;
  readonly length: number;
  readonly gain: number;
  readonly seed: number;
  readonly count: number;
}

export type SfxStep = ToneStep | NoiseStep | CreakStep | SweepStep | BubbleStep;

export interface SfxRecipe {
  readonly steps: readonly SfxStep[];
  /** Loudest sample after rendering, 0 to 1; sets the effect's level relative to the others. */
  readonly peak: number;
}

const tone = (instrument: InstrumentId, midi: number, at: number, length: number, gain = 1): ToneStep => ({
  kind: 'tone',
  instrument,
  midi,
  at,
  length,
  gain,
});

const noise = (at: number, length: number, cutoffStartHz: number, cutoffEndHz: number, seed: number, gain = 1): NoiseStep => ({
  kind: 'noise',
  at,
  length,
  gain,
  seed,
  cutoffStartHz,
  cutoffEndHz,
});

/** Every effect. The comment names the moment in the game it accompanies. */
export const SFX_RECIPES = {
  /** The entrance trapdoor swings open: a creak and a wooden thump. */
  hatch: {
    peak: 0.8,
    steps: [
      { kind: 'creak', at: 0, length: 0.65, gain: 1, rateStartHz: 16, rateEndHz: 42, resonanceHz: 650 },
      tone('kick', 40, 0.62, 0.12, 0.8),
    ],
  },
  /** Fallback for the "Let's go!" voice line: two cheerful rising notes. */
  letsGo: { peak: 0.6, steps: [tone('lead', 67, 0, 0.09), tone('lead', 72, 0.12, 0.16)] },
  /** Fallback for the "Oh no!" voice line: two falling notes. */
  ohNo: { peak: 0.6, steps: [tone('brass', 64, 0, 0.16), tone('brass', 58, 0.2, 0.3)] },
  /** A skill is assigned to a lemming: a short bright "tink". */
  assign: { peak: 0.5, steps: [tone('bell', 88, 0, 0.05), tone('stab', 76, 0, 0.03, 0.5)] },
  /** A bomber explodes: a falling noise roar over a deep thump. */
  explode: { peak: 0.95, steps: [noise(0, 0.9, 5000, 120, 1), tone('kick', 28, 0, 0.3, 1)] },
  /** A lemming falls too far: a short wet thud. */
  splat: { peak: 0.8, steps: [noise(0, 0.16, 1800, 200, 2), tone('kick', 33, 0, 0.06, 0.8)] },
  /** A lemming falls into water: a splash, then bubbles. */
  drown: {
    peak: 0.75,
    steps: [noise(0, 0.4, 3000, 400, 3), { kind: 'bubbles', at: 0.12, length: 0.7, gain: 0.7, seed: 4, count: 8 }],
  },
  /** A lemming reaches the exit: a quick rising arpeggio (fallback for "Yippee!"). */
  yippee: {
    peak: 0.6,
    steps: [tone('lead', 72, 0, 0.06), tone('lead', 76, 0.07, 0.06), tone('lead', 79, 0.14, 0.06), tone('lead', 84, 0.21, 0.16)],
  },
  /** A trap snaps: a metallic clang with a burst of grit. */
  trap: { peak: 0.85, steps: [tone('bell', 52, 0, 0.3), tone('bell', 59, 0.015, 0.3, 0.7), noise(0, 0.07, 7000, 2000, 5, 0.6)] },
  /** A builder lays a brick: a dry tick. */
  brick: { peak: 0.45, steps: [tone('stab', 76, 0, 0.025), noise(0, 0.02, 6000, 3000, 6, 0.3)] },
  /** The last bricks of a builder: the same tick, higher, twice. */
  brickWarn: { peak: 0.5, steps: [tone('stab', 83, 0, 0.025), tone('stab', 88, 0.07, 0.025)] },
  /** A digger, basher or miner hits steel: a high ring. */
  steel: { peak: 0.6, steps: [tone('bell', 96, 0, 0.2), tone('bell', 103, 0, 0.12, 0.5)] },
  /** The release rate changes by one step: a tiny tick. */
  tick: { peak: 0.35, steps: [tone('stab', 84, 0, 0.02)] },
  /** Nuke: a siren for about a second. */
  nuke: { peak: 0.7, steps: [{ kind: 'sweep', at: 0, length: 1.2, gain: 1, fromHz: 520, toHz: 880, lfoHz: 2.5 }] },
  /** A UI button is pressed. */
  click: { peak: 0.4, steps: [tone('stab', 72, 0, 0.02), noise(0, 0.012, 8000, 4000, 7, 0.4)] },
} as const satisfies Record<string, SfxRecipe>;

export type SfxId = keyof typeof SFX_RECIPES;

export const SFX_IDS = Object.keys(SFX_RECIPES) as SfxId[];

/**
 * Event types the simulation emits (`SimEventType` in src/sim/state.ts). Listed here so this module
 * stays independent of the simulation and the tests can check the mapping is complete.
 */
export const SIM_EVENT_TYPES = [
  'letsGo',
  'hatchOpen',
  'spawn',
  'assign',
  'ohNo',
  'explode',
  'splat',
  'drown',
  'exit',
  'trap',
  'brick',
  'builderWarn',
  'shrug',
  'fellOut',
  'steel',
  'releaseRate',
  'nuke',
  'end',
] as const;

/**
 * Which effect each simulation event plays. Events without an entry are silent on purpose:
 * `spawn` (one per lemming would drown the hatch sound), `shrug`, `fellOut` and `end`.
 */
export const SFX_FOR_EVENT: Partial<Record<string, SfxId>> = {
  letsGo: 'letsGo',
  hatchOpen: 'hatch',
  assign: 'assign',
  ohNo: 'ohNo',
  explode: 'explode',
  splat: 'splat',
  drown: 'drown',
  exit: 'yippee',
  trap: 'trap',
  brick: 'brick',
  builderWarn: 'brickWarn',
  steel: 'steel',
  releaseRate: 'tick',
  nuke: 'nuke',
};

/** Voice lines (vision A-06). */
export type VoiceLine = 'letsGo' | 'ohNo' | 'yippee';

/** Events that speak a voice line. When the voice is loaded it replaces the synthesised fallback. */
export const VOICE_FOR_EVENT: Partial<Record<string, VoiceLine>> = {
  letsGo: 'letsGo',
  ohNo: 'ohNo',
  exit: 'yippee',
};

/** UI languages (vision I-01). */
export type VoiceLanguage = 'en' | 'de' | 'bar';

/** Recorded voice sets; the folder names under public/audio/voices/. */
export type VoiceSet = 'en' | 'bar';

/** Which voice set a UI language uses. German uses the English set (owner decision Q-D9). */
export function voiceSetFor(language: VoiceLanguage): VoiceSet {
  return language === 'bar' ? 'bar' : 'en';
}

function stepEnd(step: SfxStep): number {
  if (step.kind === 'tone') return step.at + step.length + INSTRUMENTS[step.instrument].carrier.envelope.release;
  return step.at + step.length;
}

/** Fade-in and fade-out shape for non-tone steps: 2 ms in, then a quadratic decay to zero. */
function burstEnvelope(time: number, length: number): number {
  const fadeIn = Math.min(1, time / 0.002);
  const remaining = 1 - time / length;
  return fadeIn * remaining * remaining;
}

function renderStep(step: Exclude<SfxStep, ToneStep>, sampleRate: number): Float32Array {
  const count = Math.max(1, Math.round(step.length * sampleRate));
  const out = new Float32Array(count);
  switch (step.kind) {
    case 'noise': {
      const random = createNoise(step.seed);
      let filtered = 0;
      for (let i = 0; i < count; i++) {
        const progress = i / count;
        const cutoff = step.cutoffStartHz * (step.cutoffEndHz / step.cutoffStartHz) ** progress;
        const alpha = 1 - Math.exp((-2 * Math.PI * cutoff) / sampleRate);
        filtered += alpha * (random() - filtered);
        out[i] = filtered * burstEnvelope(i / sampleRate, step.length);
      }
      break;
    }
    case 'creak': {
      // Two-pole resonator (bandwidth 90 Hz) excited by one click per hinge "stick-slip".
      const radius = Math.exp((-Math.PI * 90) / sampleRate);
      const a1 = 2 * radius * Math.cos((2 * Math.PI * step.resonanceHz) / sampleRate);
      const a2 = -radius * radius;
      let y1 = 0;
      let y2 = 0;
      let clickPhase = 1;
      for (let i = 0; i < count; i++) {
        const time = i / sampleRate;
        const progress = i / count;
        const rate = (step.rateStartHz + (step.rateEndHz - step.rateStartHz) * progress) * (1 + 0.35 * Math.sin(2 * Math.PI * 3 * time));
        clickPhase += rate / sampleRate;
        let excitation = 0;
        if (clickPhase >= 1) {
          clickPhase -= 1;
          excitation = 1;
        }
        const y = excitation + a1 * y1 + a2 * y2;
        y2 = y1;
        y1 = y;
        out[i] = y * Math.sin(Math.PI * progress);
      }
      break;
    }
    case 'sweep': {
      let phase = 0;
      for (let i = 0; i < count; i++) {
        const time = i / sampleRate;
        const position = step.lfoHz === 0 ? i / count : 0.5 - 0.5 * Math.cos(2 * Math.PI * step.lfoHz * time);
        const frequency = step.fromHz + (step.toHz - step.fromHz) * position;
        phase += (2 * Math.PI * frequency) / sampleRate;
        const edge = Math.min(1, time / 0.01, (step.length - time) / 0.05);
        out[i] = Math.tanh(4 * Math.sin(phase)) * 0.8 * edge;
      }
      break;
    }
    case 'bubbles': {
      const random = createNoise(step.seed);
      const bubbleSamples = Math.round(0.05 * sampleRate);
      for (let b = 0; b < step.count; b++) {
        const start = Math.floor(((b + 0.5 * (random() + 1)) / step.count) * (count - bubbleSamples));
        const base = 350 + 250 * (random() + 1);
        const bubble = new Float32Array(bubbleSamples);
        let phase = 0;
        for (let i = 0; i < bubbleSamples; i++) {
          const progress = i / bubbleSamples;
          phase += (2 * Math.PI * base * (1 + 0.8 * progress)) / sampleRate;
          bubble[i] = Math.sin(phase) * (1 - progress) * (1 - progress);
        }
        mixInto(out, bubble, start, 1);
      }
      break;
    }
  }
  return out;
}

/** Render a recipe into one mono buffer, normalised to the recipe's peak. Pure. */
export function renderRecipe(recipe: SfxRecipe, sampleRate: number): Float32Array {
  const totalSeconds = Math.max(...recipe.steps.map(stepEnd));
  const out = new Float32Array(Math.ceil(totalSeconds * sampleRate) + 1);
  for (const step of recipe.steps) {
    const offset = Math.round(step.at * sampleRate);
    if (step.kind === 'tone') {
      const instrument = INSTRUMENTS[step.instrument];
      const samples = renderNote(instrument, midiToFrequency(step.midi), step.length, sampleRate);
      mixInto(out, samples, offset, step.gain);
    } else {
      mixInto(out, renderStep(step, sampleRate), offset, step.gain);
    }
  }
  return normalise(out, recipe.peak);
}

/** Render a sound effect by id. Pure; the engine caches the result per sample rate. */
export function renderSfx(id: SfxId, sampleRate: number): Float32Array {
  return renderRecipe(SFX_RECIPES[id], sampleRate);
}
