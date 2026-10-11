// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * A small two-operator FM synthesiser with the character of the AdLib / OPL2 sound card (vision A-03).
 *
 * The OPL2 chip builds every voice from two operators: a *modulator* whose output bends the phase
 * of a *carrier*, which is what you hear. Each operator has a frequency ratio, an output level, an
 * ADSR envelope and one of a few waveforms (OPL2 has sine, half-sine, absolute sine; OPL3 adds a
 * square). This module reproduces that structure, not the chip itself.
 *
 * Everything here is pure: `renderNote()` renders a note offline into a Float32Array. The browser
 * layer (`engine.ts`) copies those samples into AudioBuffers, so tests hear exactly what players hear.
 */

/** Operator waveforms of the OPL family. 'square' is a softened square, as on the OPL3. */
export type Waveform = 'sine' | 'halfSine' | 'absSine' | 'square';

/** ADSR envelope. Times are in seconds; `sustain` is a level from 0 to 1. */
export interface Envelope {
  readonly attack: number;
  readonly decay: number;
  readonly sustain: number;
  readonly release: number;
}

export interface Operator {
  /** Frequency as a multiple of the note frequency (OPL "MULT"). */
  readonly ratio: number;
  /**
   * Output level. For the modulator this is the modulation index in radians (how strongly it bends
   * the carrier); for the carrier it is the amplitude from 0 to 1.
   */
  readonly level: number;
  readonly waveform: Waveform;
  readonly envelope: Envelope;
}

export interface FmInstrument {
  readonly carrier: Operator;
  readonly modulator: Operator;
  /** Modulator self-feedback from 0 to 1 (OPL "FB"); makes the tone buzzier. */
  readonly feedback: number;
  /** Deterministic white noise mixed into the carrier, 0 to 1; used for drums. */
  readonly noise: number;
  /** Pitch starts this many semitones above the note and glides down to it (drums, zaps). */
  readonly sweepSemitones: number;
  /** Duration of that glide in seconds. */
  readonly sweepSeconds: number;
  /** Vibrato depth in semitones and rate in Hz (accordion and clarinet warble). */
  readonly vibratoSemitones: number;
  readonly vibratoHz: number;
}

const TWO_PI = 2 * Math.PI;
/** Steepness of the softened square; 6 keeps the edges round enough to avoid harsh aliasing. */
const SQUARE_SOFTNESS = 6;
const SQUARE_NORMALISER = Math.tanh(SQUARE_SOFTNESS);

/** One sample of a waveform at a phase in radians. Range -1 to 1. */
export function waveform(shape: Waveform, phase: number): number {
  const s = Math.sin(phase);
  switch (shape) {
    case 'sine':
      return s;
    case 'halfSine':
      return s > 0 ? s : 0;
    case 'absSine':
      return Math.abs(s);
    case 'square':
      return Math.tanh(SQUARE_SOFTNESS * s) / SQUARE_NORMALISER;
  }
}

/**
 * Envelope level at `time` seconds after note-on, for a key held `gateSeconds` long.
 * Attack rises linearly to 1, decay falls linearly to `sustain`, release falls linearly to 0.
 */
export function envelopeLevel(envelope: Envelope, time: number, gateSeconds: number): number {
  if (time < 0) return 0;
  const held = Math.min(time, gateSeconds);
  let level: number;
  if (held < envelope.attack) {
    level = held / envelope.attack;
  } else if (held < envelope.attack + envelope.decay) {
    level = 1 - ((held - envelope.attack) / envelope.decay) * (1 - envelope.sustain);
  } else {
    level = envelope.sustain;
  }
  if (time <= gateSeconds) return level;
  const released = time - gateSeconds;
  if (released >= envelope.release) return 0;
  return level * (1 - released / envelope.release);
}

/** Frequency in Hz of a MIDI note number (69 = A4 = 440 Hz, twelve-tone equal temperament). */
export function midiToFrequency(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/**
 * Deterministic white noise (xorshift32). Never Math.random(): the same seed gives the same sound,
 * so tests can compare renders and every player hears the same explosion.
 */
export function createNoise(seed: number): () => number {
  let state = seed >>> 0 || 0x9e3779b9;
  return () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return (state / 0xffffffff) * 2 - 1;
  };
}

/** Number of samples a note renders to: the held part plus the carrier release tail. */
export function noteSampleCount(instrument: FmInstrument, durationSeconds: number, sampleRate: number): number {
  return Math.max(1, Math.ceil((durationSeconds + instrument.carrier.envelope.release) * sampleRate));
}

/**
 * Render one note offline. Pure: the same arguments always return the same samples.
 *
 * The result covers the held duration plus the release tail, and its last sample is silence, so
 * notes never end in a click.
 */
export function renderNote(instrument: FmInstrument, frequencyHz: number, durationSeconds: number, sampleRate: number): Float32Array {
  const count = noteSampleCount(instrument, durationSeconds, sampleRate);
  const out = new Float32Array(count);
  const noise = createNoise(Math.round(frequencyHz * 1000) + count);
  const { carrier, modulator } = instrument;
  let carrierPhase = 0;
  let modulatorPhase = 0;
  let previousModulator = 0;
  for (let i = 0; i < count; i++) {
    const time = i / sampleRate;
    let frequency = frequencyHz;
    if (instrument.sweepSemitones !== 0 && time < instrument.sweepSeconds) {
      frequency *= 2 ** ((instrument.sweepSemitones * (1 - time / instrument.sweepSeconds)) / 12);
    }
    if (instrument.vibratoSemitones !== 0) {
      frequency *= 2 ** ((instrument.vibratoSemitones * Math.sin(TWO_PI * instrument.vibratoHz * time)) / 12);
    }
    const modulatorEnvelope = envelopeLevel(modulator.envelope, time, durationSeconds);
    const modulatorOut =
      modulator.level * modulatorEnvelope * waveform(modulator.waveform, modulatorPhase + instrument.feedback * previousModulator);
    previousModulator = modulatorOut;
    const carrierEnvelope = envelopeLevel(carrier.envelope, time, durationSeconds);
    let sample = waveform(carrier.waveform, carrierPhase + modulatorOut);
    if (instrument.noise > 0) sample = sample * (1 - instrument.noise) + noise() * instrument.noise;
    out[i] = carrier.level * carrierEnvelope * sample;
    carrierPhase = (carrierPhase + (TWO_PI * frequency * carrier.ratio) / sampleRate) % TWO_PI;
    modulatorPhase = (modulatorPhase + (TWO_PI * frequency * modulator.ratio) / sampleRate) % TWO_PI;
  }
  // The release reaches zero exactly one sample after the buffer; pin the last sample to silence.
  out[count - 1] = 0;
  return out;
}

/** Add `source` into `target` starting at sample `offset`, scaled by `gain`. Samples past the end are dropped. */
export function mixInto(target: Float32Array, source: Float32Array, offset: number, gain: number): void {
  const start = Math.max(0, -offset);
  const end = Math.max(start, Math.min(source.length, target.length - offset));
  const view = target.subarray(offset + start, offset + end);
  const part = source.subarray(start, end);
  // Typed-array map keeps the index in bounds by construction; no per-sample bounds checks needed.
  view.set(part.map((sample, i) => sample * gain + Number(view[i])));
}

/** Scale a buffer so its loudest sample is exactly `peak` (silence stays silence). Returns the buffer. */
export function normalise(buffer: Float32Array, peak: number): Float32Array {
  let max = 0;
  for (const sample of buffer) max = Math.max(max, Math.abs(sample));
  if (max === 0) return buffer;
  const factor = peak / max;
  buffer.set(buffer.map((sample) => sample * factor));
  return buffer;
}

const NO_EXTRAS = { feedback: 0, noise: 0, sweepSemitones: 0, sweepSeconds: 0, vibratoSemitones: 0, vibratoHz: 0 } as const;

/** Build an instrument; omitted extras (feedback, noise, sweep, vibrato) are off. */
export function defineInstrument(
  carrier: Operator,
  modulator: Operator,
  extras: Partial<Omit<FmInstrument, 'carrier' | 'modulator'>> = {},
): FmInstrument {
  return { ...NO_EXTRAS, ...extras, carrier, modulator };
}

function env(attack: number, decay: number, sustain: number, release: number): Envelope {
  return { attack, decay, sustain, release };
}

function op(ratio: number, level: number, shape: Waveform, envelope: Envelope): Operator {
  return { ratio, level, waveform: shape, envelope };
}

/**
 * The voice bank. Patches are our own, tuned by ear towards the bright, slightly buzzy sound of an
 * early-1990s AdLib soundtrack. Levels leave headroom so that a mix of four voices stays below 1.
 */
export const INSTRUMENTS = {
  /** Bright square-ish lead for classic melodies. */
  lead: defineInstrument(op(1, 0.5, 'square', env(0.005, 0.12, 0.6, 0.06)), op(2, 1.2, 'sine', env(0.005, 0.2, 0.4, 0.06)), {
    feedback: 0.3,
  }),
  /** Soft flute: nearly pure sine with a breathy touch of modulation. */
  flute: defineInstrument(op(1, 0.5, 'sine', env(0.03, 0.1, 0.8, 0.08)), op(1, 0.6, 'sine', env(0.03, 0.2, 0.3, 0.08)), {
    vibratoSemitones: 0.08,
    vibratoHz: 5.5,
  }),
  /** Plucked electric bass. */
  bass: defineInstrument(op(1, 0.6, 'sine', env(0.003, 0.25, 0.3, 0.05)), op(1, 2.2, 'halfSine', env(0.003, 0.15, 0.1, 0.05))),
  /** Short organ-like chord stab. */
  stab: defineInstrument(op(1, 0.22, 'halfSine', env(0.004, 0.15, 0.4, 0.05)), op(2, 1, 'sine', env(0.004, 0.1, 0.3, 0.05))),
  /** Accordion (Ziehharmonika): reedy, with a gentle tremolo-like vibrato. */
  accordion: defineInstrument(op(1, 0.42, 'square', env(0.02, 0.1, 0.85, 0.07)), op(1, 1.6, 'absSine', env(0.02, 0.1, 0.8, 0.07)), {
    feedback: 0.2,
    vibratoSemitones: 0.06,
    vibratoHz: 6,
  }),
  /** Clarinet: odd harmonics from a 3:1 modulator. */
  clarinet: defineInstrument(op(1, 0.4, 'sine', env(0.03, 0.1, 0.8, 0.07)), op(3, 1.4, 'sine', env(0.03, 0.15, 0.7, 0.07)), {
    vibratoSemitones: 0.05,
    vibratoHz: 5,
  }),
  /** Brass (trumpet, flugelhorn): the modulation swells with the envelope. */
  brass: defineInstrument(op(1, 0.45, 'sine', env(0.03, 0.15, 0.75, 0.08)), op(1, 2.6, 'sine', env(0.05, 0.2, 0.7, 0.08)), {
    feedback: 0.15,
  }),
  /** Tuba for the oom-pah bass. */
  tuba: defineInstrument(op(1, 0.65, 'sine', env(0.015, 0.2, 0.55, 0.06)), op(1, 1.3, 'halfSine', env(0.02, 0.2, 0.5, 0.06))),
  /** Bell / glockenspiel: inharmonic 3.5:1 ratio gives the metallic ring. */
  bell: defineInstrument(op(1, 0.4, 'sine', env(0.002, 0.6, 0, 0.3)), op(3.5, 2, 'sine', env(0.002, 0.5, 0, 0.3))),
  /** Bass drum: a sine that drops two octaves in 60 ms. */
  kick: defineInstrument(op(1, 0.8, 'sine', env(0.001, 0.15, 0, 0.03)), op(1, 0.5, 'sine', env(0.001, 0.05, 0, 0.03)), {
    sweepSemitones: 24,
    sweepSeconds: 0.06,
  }),
  /** Snare: noise over a short tone. */
  snare: defineInstrument(op(1, 0.45, 'sine', env(0.001, 0.12, 0, 0.03)), op(1.4, 1, 'sine', env(0.001, 0.05, 0, 0.03)), {
    noise: 0.75,
  }),
  /** Closed hi-hat: almost all noise, very short. */
  hat: defineInstrument(op(1, 0.25, 'square', env(0.001, 0.04, 0, 0.02)), op(7.1, 3, 'sine', env(0.001, 0.03, 0, 0.02)), {
    noise: 0.9,
  }),
} as const satisfies Record<string, FmInstrument>;

export type InstrumentId = keyof typeof INSTRUMENTS;

export const INSTRUMENT_IDS = Object.keys(INSTRUMENTS) as InstrumentId[];
