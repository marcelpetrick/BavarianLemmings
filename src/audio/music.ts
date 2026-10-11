// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Music: the song format, a pure sequencer and the song data (vision A-02, A-04, A-05).
 *
 * Terms used in this file:
 * - *beat*: one count of the bar (a quarter note in every song here). Positions and lengths are in beats.
 * - *bar*: a group of beats; a song lists the beats of every bar, so a Zwiefacher can mix 3 and 2.
 * - *loop point*: the beat where playback jumps back to after the last beat of the song.
 *
 * Songs are written as a melody string plus one chord symbol per bar. `buildSong()` turns that into
 * channels: melody, optional parallel thirds (the Alpine "Terzen"), bass, chords and drums, in the
 * style of the song (galop, oom-pah). All arrangements are ours. The melodies are either in the
 * public domain (source and evidence in THIRD_PARTY.md) or our own compositions. No note comes from
 * the original game's soundtrack or its arrangements.
 */

import { type InstrumentId, INSTRUMENTS, midiToFrequency, mixInto, renderNote } from './fm';

export type MusicTheme = 'classic' | 'bavarian';

export interface SongNote {
  /** MIDI note number (60 = middle C). */
  readonly pitch: number;
  /** Start in beats from the beginning of the song. */
  readonly start: number;
  /** Length in beats. */
  readonly length: number;
  /** Loudness from 0 to 1, multiplied with the channel volume. */
  readonly velocity: number;
}

export interface SongChannel {
  readonly name: string;
  readonly instrument: InstrumentId;
  /** Channel loudness from 0 to 1. */
  readonly volume: number;
  readonly notes: readonly SongNote[];
}

export interface Song {
  readonly id: string;
  readonly title: string;
  readonly theme: MusicTheme;
  /** Beats per minute. */
  readonly tempo: number;
  /** Beats of every bar, in order. */
  readonly barBeats: readonly number[];
  /** Total length in beats (the sum of `barBeats`). */
  readonly lengthBeats: number;
  /** Beat where playback continues after the end. Equal to `lengthBeats` means "play once". */
  readonly loopStartBeat: number;
  readonly channels: readonly SongChannel[];
}

/** One note to play, at an absolute beat that counts on across loops. */
export interface ScheduledNote {
  readonly channel: number;
  readonly instrument: InstrumentId;
  readonly pitch: number;
  /** Absolute beat since playback started (loops unrolled). */
  readonly beat: number;
  readonly length: number;
  /** Note velocity times channel volume, 0 to 1. */
  readonly gain: number;
}

/**
 * All notes that start in [fromBeat, toBeat), with loops unrolled: the song plays from beat 0 to its
 * end once, then repeats [loopStartBeat, lengthBeats) forever. Sorted by beat, then channel. Pure.
 */
export function scheduleNotes(song: Song, fromBeat: number, toBeat: number): ScheduledNote[] {
  const result: ScheduledNote[] = [];
  const collect = (offset: number, minimumStart: number): void => {
    song.channels.forEach((channel, index) => {
      for (const note of channel.notes) {
        if (note.start < minimumStart) continue;
        const beat = note.start + offset;
        if (beat >= fromBeat && beat < toBeat) {
          result.push({
            channel: index,
            instrument: channel.instrument,
            pitch: note.pitch,
            beat,
            length: note.length,
            gain: note.velocity * channel.volume,
          });
        }
      }
    });
  };
  if (fromBeat < song.lengthBeats) collect(0, 0);
  const loopLength = song.lengthBeats - song.loopStartBeat;
  if (loopLength > 0 && toBeat > song.lengthBeats) {
    const firstPass = Math.max(1, Math.floor((fromBeat - song.lengthBeats) / loopLength) + 1);
    const lastPass = Math.ceil((toBeat - song.lengthBeats) / loopLength);
    for (let pass = firstPass; pass <= lastPass; pass++) {
      collect(song.lengthBeats + (pass - 1) * loopLength - song.loopStartBeat, song.loopStartBeat);
    }
  }
  return result.sort((a, b) => a.beat - b.beat || a.channel - b.channel);
}

/** Seconds per beat at the song's tempo. */
export function secondsPerBeat(song: Song): number {
  return 60 / song.tempo;
}

/**
 * Gain of the music bus before the user's volume. The channels of a song add up to a peak of about
 * 1.7 (measured by the song test with renderSong); 0.5 keeps the mix below full scale.
 */
export const MUSIC_BUS_GAIN = 0.5;

/** Render the notes starting in [fromBeat, toBeat) offline into one buffer (tests, previews). Pure. */
export function renderSong(song: Song, sampleRate: number, fromBeat: number, toBeat: number): Float32Array {
  const beatSeconds = secondsPerBeat(song);
  const notes = scheduleNotes(song, fromBeat, toBeat);
  const tailSeconds = 1; // longest release in the bank is 0.3 s; one second is safe.
  const out = new Float32Array(Math.ceil(((toBeat - fromBeat) * beatSeconds + tailSeconds) * sampleRate));
  for (const scheduled of notes) {
    const samples = renderNote(
      INSTRUMENTS[scheduled.instrument],
      midiToFrequency(scheduled.pitch),
      scheduled.length * beatSeconds,
      sampleRate,
    );
    mixInto(out, samples, Math.round((scheduled.beat - fromBeat) * beatSeconds * sampleRate), scheduled.gain);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Notation helpers
// ---------------------------------------------------------------------------------------------

type NoteLetter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
const NOTE_OFFSETS: Readonly<Record<NoteLetter, number>> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Pitch class (0 to 11) of a letter with an optional '#' or 'b'. */
function pitchClassOf(letter: string, accidental: string | undefined): number {
  const shift = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  return (NOTE_OFFSETS[letter as NoteLetter] + shift + 12) % 12;
}

/** MIDI number of a note name such as "C4" (60), "F#5" or "Bb3". Throws on anything else. */
export function parseNoteName(name: string): number {
  const match = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  if (!match) throw new Error(`bad note name "${name}"`);
  const letter = match[1] as NoteLetter;
  const accidental = match[2];
  // Cb and B# cross the octave boundary; the octave number belongs to the letter, as in scientific pitch notation.
  const shift = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  return 12 * (Number(match[3]) + 1) + NOTE_OFFSETS[letter] + shift;
}

/**
 * Parse a melody string: space-separated tokens "NOTE/BEATS" ("G5/0.5") or "r/BEATS" for a rest.
 * "|" marks bar lines for the reader and is ignored. Returns the notes and the total length in beats.
 */
export function parseMelody(text: string): { notes: SongNote[]; lengthBeats: number } {
  const notes: SongNote[] = [];
  let position = 0;
  for (const token of text.split(/\s+/)) {
    if (token === '' || token === '|') continue;
    const slash = token.indexOf('/');
    const name = token.slice(0, Math.max(0, slash));
    const beats = slash < 0 ? Number.NaN : Number(token.slice(slash + 1));
    if (!(beats > 0)) throw new Error(`bad length in "${token}"`);
    if (name !== 'r') notes.push({ pitch: parseNoteName(name), start: position, length: beats, velocity: 1 });
    position += beats;
  }
  return { notes, lengthBeats: position };
}

export interface Chord {
  /** Pitch class of the root, 0 (C) to 11 (B). */
  readonly root: number;
  /** Semitones above the root. */
  readonly intervals: readonly number[];
}

type ChordQuality = '' | 'm' | '7' | 'm7' | 'dim';
const CHORD_QUALITIES: Readonly<Record<ChordQuality, readonly number[]>> = {
  '': [0, 4, 7],
  m: [0, 3, 7],
  '7': [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  dim: [0, 3, 6],
};

/** Parse a chord symbol: root (C, F#, Bb) plus quality ('', m, 7, m7, dim). Throws on anything else. */
export function parseChord(symbol: string): Chord {
  const match = /^([A-G])(#|b)?(m7|m|7|dim)?$/.exec(symbol);
  if (!match) throw new Error(`bad chord "${symbol}"`);
  const quality = (match[3] ?? '') as ChordQuality;
  return { root: pitchClassOf(match[1] as NoteLetter, match[2]), intervals: CHORD_QUALITIES[quality] };
}

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
/** Semitones down to the diatonic third below, per scale degree: C→A 3, D→B 3, E→C 4, F→D 3, G→E 3, A→F 4, B→G 4. */
const THIRD_DOWN = [3, 3, 4, 3, 3, 4, 4];

/**
 * The note a diatonic third below `pitch` in the major key on `tonic` (pitch class). Notes outside
 * the scale get a minor third below. This is how a second voice "sings in thirds" in Alpine music.
 */
export function thirdBelow(pitch: number, tonic: number): number {
  const relative = (((pitch - tonic) % 12) + 12) % 12;
  // indexOf gives -1 for a note outside the scale, and THIRD_DOWN[-1] is undefined: a minor third.
  return pitch - (THIRD_DOWN[MAJOR_SCALE.indexOf(relative)] ?? 3);
}

/** Accompaniment patterns. */
export type AccompanimentStyle =
  /** Bass on every beat (root, fifth), chord stabs on the off-beats, hi-hat: a fast cancan feel. */
  | 'galop'
  /** Bass on beat 1 (and 3 in four-beat bars), chords on the other beats: Ländler, Zwiefacher, march. */
  | 'oomPah';

export interface SongSpec {
  readonly id: string;
  readonly title: string;
  readonly theme: MusicTheme;
  readonly tempo: number;
  /** Tonic pitch class of the written key (0 = C, before `transpose`), used for the thirds. */
  readonly key: number;
  /**
   * Semitones to shift the melody and chords by. Bass and chord voicings are placed in their fixed
   * ranges after the shift, so a transposed song keeps a full bass.
   */
  readonly transpose: number;
  /** Beats per bar: one number for every bar, or a list per bar. */
  readonly meter: number | readonly number[];
  /** Chord symbols, one entry per bar separated by "|"; "G7,C" splits a bar evenly. */
  readonly chords: string;
  readonly melody: string;
  readonly melodyInstrument: InstrumentId;
  /** Add a second voice a third below the melody from this bar on (0-based); omit for none. */
  readonly thirdsFromBar?: number;
  readonly thirdsInstrument?: InstrumentId;
  readonly bassInstrument: InstrumentId;
  readonly chordInstrument: InstrumentId;
  readonly style: AccompanimentStyle;
  readonly drums: boolean;
  /** Bar (0-based) where the loop restarts. */
  readonly loopStartBar: number;
}

const BASS_LOW = 40; // E2: lowest bass note, keeps the FM bass out of the mud.
const CHORD_LOW = 55; // G3: lowest chord note, so the stabs sit between bass and melody.

function bassPitch(pitchClass: number): number {
  const pitch = 36 + pitchClass;
  return pitch < BASS_LOW ? pitch + 12 : pitch;
}

function chordPitches(chord: Chord): number[] {
  return chord.intervals.map((interval) => {
    const pitch = 48 + ((chord.root + interval) % 12);
    return pitch < CHORD_LOW ? pitch + 12 : pitch;
  });
}

/** One bar of the accompaniment: its beats and its chords (split evenly over the beats). */
export interface Bar {
  readonly beats: number;
  readonly chords: readonly Chord[];
}

interface Accompaniment {
  bass: SongNote[];
  chords: SongNote[];
  kick: SongNote[];
  snare: SongNote[];
  hat: SongNote[];
}

function note(pitch: number, start: number, length: number, velocity = 1): SongNote {
  return { pitch, start, length, velocity };
}

/** Generate bass, chord and drum notes for every bar in the given style. */
export function accompany(bars: readonly Bar[], style: AccompanimentStyle): Accompaniment {
  const parts: Accompaniment = { bass: [], chords: [], kick: [], snare: [], hat: [] };
  let barStart = 0;
  bars.forEach(({ beats, chords }, barIndex) => {
    for (let beat = 0; beat < beats; beat++) {
      const chord = chords[Math.floor((beat / beats) * chords.length)];
      if (!chord) continue;
      const root = bassPitch(chord.root);
      const fifth = root + 7 > 55 ? root - 5 : root + 7;
      const at = barStart + beat;
      if (style === 'galop') {
        parts.bass.push(note(beat % 2 === 0 ? root : fifth, at, 0.45));
        for (const pitch of chordPitches(chord)) parts.chords.push(note(pitch, at + 0.5, 0.3));
        if (beat % 2 === 0) parts.kick.push(note(36, at, 0.2));
        else parts.snare.push(note(50, at, 0.15));
        parts.hat.push(note(80, at + 0.5, 0.05));
      } else {
        const isBassBeat = beat === 0 || (beats >= 4 && beat === 2);
        if (isBassBeat) {
          // Alternate root and fifth between bars (and between beat 1 and 3), as a tuba player does;
          // a chord change in the middle of the bar always lands on its root.
          const chordChanged = beat > 0 && chord !== chords[0];
          const useRoot = chordChanged || (barIndex + beat / 2) % 2 === 0;
          parts.bass.push(note(useRoot ? root : fifth, at, 0.8, beat === 0 ? 1 : 0.85));
          parts.kick.push(note(36, at, 0.2, beat === 0 ? 1 : 0.7));
        } else {
          for (const pitch of chordPitches(chord)) parts.chords.push(note(pitch, at, 0.45));
          parts.snare.push(note(50, at, 0.1, 0.6));
        }
      }
    }
    barStart += beats;
  });
  return parts;
}

/** Turn a song specification into a playable song. Throws when melody and bars disagree in length. */
export function buildSong(spec: SongSpec): Song {
  const barChordSymbols = spec.chords.split('|').map((bar) => bar.trim());
  const meter = spec.meter;
  const barBeats = typeof meter === 'number' ? barChordSymbols.map(() => meter) : [...meter];
  if (barBeats.length !== barChordSymbols.length) {
    throw new Error(`${spec.id}: ${barChordSymbols.length} chord bars but ${barBeats.length} meter entries`);
  }
  const lengthBeats = barBeats.reduce((sum, beats) => sum + beats, 0);
  const melody = parseMelody(spec.melody);
  if (melody.lengthBeats !== lengthBeats) {
    throw new Error(`${spec.id}: melody has ${melody.lengthBeats} beats, bars have ${lengthBeats}`);
  }
  const bars = barChordSymbols.map((bar, index) => ({
    beats: Number(barBeats[index]), // same length as barChordSymbols, checked above
    chords: bar.split(',').map((symbol) => {
      const chord = parseChord(symbol.trim());
      return { ...chord, root: (((chord.root + spec.transpose) % 12) + 12) % 12 };
    }),
  }));
  const parts = accompany(bars, spec.style);
  const shift = (notes: readonly SongNote[]): SongNote[] => notes.map((n) => ({ ...n, pitch: n.pitch + spec.transpose }));
  const barStartBeat = (bar: number): number => barBeats.slice(0, bar).reduce((sum, beats) => sum + beats, 0);

  const channels: SongChannel[] = [{ name: 'melody', instrument: spec.melodyInstrument, volume: 0.9, notes: shift(melody.notes) }];
  if (spec.thirdsFromBar !== undefined) {
    const from = barStartBeat(spec.thirdsFromBar);
    const thirds = melody.notes.filter((n) => n.start >= from).map((n) => ({ ...n, pitch: thirdBelow(n.pitch, spec.key) }));
    channels.push({ name: 'thirds', instrument: spec.thirdsInstrument ?? spec.melodyInstrument, volume: 0.55, notes: shift(thirds) });
  }
  channels.push(
    { name: 'bass', instrument: spec.bassInstrument, volume: 0.8, notes: parts.bass },
    { name: 'chords', instrument: spec.chordInstrument, volume: 0.4, notes: parts.chords },
  );
  if (spec.drums) {
    channels.push(
      { name: 'kick', instrument: 'kick', volume: 0.7, notes: parts.kick },
      { name: 'snare', instrument: 'snare', volume: 0.3, notes: parts.snare },
    );
    if (parts.hat.length > 0) channels.push({ name: 'hat', instrument: 'hat', volume: 0.22, notes: parts.hat });
  }
  return {
    id: spec.id,
    title: spec.title,
    theme: spec.theme,
    tempo: spec.tempo,
    barBeats,
    lengthBeats,
    loopStartBeat: barStartBeat(spec.loopStartBar),
    channels,
  };
}

// ---------------------------------------------------------------------------------------------
// Song data. Melody sources and public-domain evidence: THIRD_PARTY.md, "Public-domain melodies".
// ---------------------------------------------------------------------------------------------

/** Classic theme defaults: AdLib lead over plucked bass and organ stabs. */
const CLASSIC = {
  theme: 'classic',
  key: 0,
  meter: 4,
  melodyInstrument: 'lead',
  bassInstrument: 'bass',
  chordInstrument: 'stab',
  drums: true,
  loopStartBar: 0,
} as const;

const GALOP_A1 = `C5/1 D5/0.5 F5/0.5 E5/0.5 D5/0.5 G5/1 | G5/1 G5/0.5 A5/0.5 E5/0.5 F5/0.5 D5/1 |
  D5/1 D5/0.5 F5/0.5 E5/0.5 D5/0.5 C5/0.5 C6/0.5 | B5/0.5 A5/0.5 G5/0.5 F5/0.5 E5/0.5 D5/0.5 C5/1 |`;
const GALOP_A2 = `C5/1 D5/0.5 F5/0.5 E5/0.5 D5/0.5 G5/1 | G5/1 G5/0.5 A5/0.5 E5/0.5 F5/0.5 D5/1 |
  D5/1 D5/0.5 F5/0.5 E5/0.5 D5/0.5 C5/0.5 C6/0.5 | C5/0.5 G5/0.5 E5/0.5 D5/0.5 C5/2 |`;
/** Our own 8-bar bridge between the cancan phrases (not from Offenbach). */
const GALOP_BRIDGE = `E5/0.5 F5/0.5 G5/0.5 A5/0.5 G5/1 C6/1 | B5/0.5 A5/0.5 G5/0.5 F5/0.5 E5/1 G5/1 |
  F5/0.5 G5/0.5 A5/0.5 B5/0.5 C6/1 A5/1 | G5/0.5 F5/0.5 E5/0.5 D5/0.5 C5/1 r/1 |
  E5/0.5 F5/0.5 G5/0.5 A5/0.5 G5/1 C6/1 | D6/0.5 C6/0.5 B5/0.5 A5/0.5 G5/1 F5/1 |
  E5/0.5 G5/0.5 C6/0.5 G5/0.5 D5/0.5 G5/0.5 B5/0.5 G5/0.5 | C6/1 G5/0.5 E5/0.5 C5/2`;

const LONDON_A = `G5/0.75 A5/0.25 G5/0.5 F5/0.5 E5/0.5 F5/0.5 G5/1 | D5/0.5 E5/0.5 F5/1 E5/0.5 F5/0.5 G5/1 |
  G5/0.75 A5/0.25 G5/0.5 F5/0.5 E5/0.5 F5/0.5 G5/1 | D5/1 G5/1 E5/0.5 C5/1.5 |`;
/** Our own running-eighths variation on the London Bridge phrase. */
const LONDON_VARIATION = `G5/0.5 C6/0.5 A5/0.5 G5/0.5 F5/0.5 A5/0.5 G5/0.5 E5/0.5 |
  D5/0.5 F5/0.5 E5/0.5 D5/0.5 E5/0.5 G5/0.5 F5/0.5 E5/0.5 |
  G5/0.5 C6/0.5 A5/0.5 G5/0.5 F5/0.5 A5/0.5 G5/0.5 E5/0.5 | D5/0.5 G5/0.5 B5/0.5 D6/0.5 C6/2 |`;
const LONDON_CHORDS_A = 'C | G7,C | C | G7,C';

const ODE_A = `E5/1 E5/1 F5/1 G5/1 | G5/1 F5/1 E5/1 D5/1 | C5/1 C5/1 D5/1 E5/1 |`;
const ODE_B = `D5/1 D5/1 E5/1 C5/1 | D5/1 E5/0.5 F5/0.5 E5/1 C5/1 | D5/1 E5/0.5 F5/0.5 E5/1 D5/1 | C5/1 D5/1 G4/2 |`;

/** Bavarian theme defaults: accordion and tuba, the sound of a Blaskapelle at a village fair. */
const BAVARIAN = {
  theme: 'bavarian',
  melodyInstrument: 'accordion',
  thirdsInstrument: 'clarinet',
  bassInstrument: 'tuba',
  chordInstrument: 'accordion',
  style: 'oomPah',
  loopStartBar: 0,
} as const;

const AUGUSTIN_A1 = 'G5/1.5 A5/0.5 G5/0.5 F5/0.5 | E5/1 C5/1 C5/1 | D5/1 G4/1 G4/1 | E5/1 C5/1 C5/1 |';
const AUGUSTIN_A2 = 'G5/1.5 A5/0.5 G5/0.5 F5/0.5 | E5/1 C5/1 C5/1 | D5/1 G4/1 B4/1 | C5/3 |';
const AUGUSTIN_B = 'D5/1 G4/1 G4/1 | E5/1 C5/1 C5/1 | D5/1 G4/1 G4/1 | E5/1 C5/1 C5/1 |';
const AUGUSTIN_MELODY = `${AUGUSTIN_A1} ${AUGUSTIN_A2} ${AUGUSTIN_B} ${AUGUSTIN_A2}`;
const AUGUSTIN_CHORDS = 'C | C | G7 | C | C | C | G7 | C | G7 | C | G7 | C | C | C | G7 | C';

/** Our own Zwiefacher: the bar pattern 3-3-2-2 (two waltz bars, two "Dreher" bars) four times, played twice. */
const ZWIEFACHER_MELODY = `B4/1 D5/1 G5/1 | F#5/1 E5/1 D5/1 | E5/0.5 F#5/0.5 G5/1 | D5/1 B4/1 |
  C5/1 E5/1 A5/1 | G5/1 F#5/1 E5/1 | D5/0.5 E5/0.5 F#5/1 | A5/1 D5/1 |
  B4/1 D5/1 G5/1 | B5/1 A5/1 G5/1 | C6/0.5 B5/0.5 A5/1 | G5/1 E5/1 |
  D5/1 G5/1 B5/1 | A5/1 F#5/1 D5/1 | E5/0.5 F#5/0.5 A5/0.5 F#5/0.5 | G5/2`;

const ZWIEFACHER_CHORDS = 'G | D7 | G | G | C | D7 | D | D7 | G | G | C | C | G | D7 | D | G';

/** Our own march: an 8-bar main strain and an 8-bar trio that the second voice joins in thirds. */
const MARCH_MELODY = `C5/1 F5/0.5 F5/0.5 F5/1 A5/1 | G5/0.5 F5/0.5 E5/0.5 F5/0.5 G5/2 |
  C5/1 G5/0.5 G5/0.5 G5/1 Bb5/1 | A5/0.5 G5/0.5 F#5/0.5 G5/0.5 A5/2 |
  C6/1 A5/0.5 F5/0.5 C5/1 F5/1 | Bb5/1 G5/0.5 E5/0.5 C5/1 E5/1 |
  G5/0.5 A5/0.5 Bb5/0.5 G5/0.5 E5/1 C5/1 | F5/2 r/1 C5/1 |
  D5/1 F5/1 Bb5/1.5 A5/0.5 | G5/1 F5/1 D5/2 | C5/1 E5/1 G5/1.5 F5/0.5 | E5/1 D5/1 C5/2 |
  A5/1 C6/1 A5/1 F5/1 | Bb5/1 D6/1 Bb5/1 G5/1 | A5/0.5 Bb5/0.5 C6/0.5 A5/0.5 G5/1 E5/1 | F5/2 F4/1 r/1`;

const SONG_SPECS: readonly SongSpec[] = [
  {
    ...CLASSIC,
    id: 'classic-galop',
    title: 'Galop infernal (after Offenbach, 1858)',
    tempo: 160,
    transpose: 0,
    chords: 'C | G7 | G7 | G7,C | C | G7 | G7 | C | C | G7 | F | C | C | G7 | C,G7 | C',
    melody: `${GALOP_A1} ${GALOP_A2} ${GALOP_BRIDGE}`,
    style: 'galop',
  },
  {
    ...CLASSIC,
    id: 'classic-london-bridge',
    title: 'London Bridge (traditional)',
    tempo: 132,
    // Written in C, played in F: a fifth lower keeps the lead out of the shrill top octave.
    transpose: -7,
    chords: `${LONDON_CHORDS_A} | ${LONDON_CHORDS_A} | C | G7,C | C | G7,C | ${LONDON_CHORDS_A}`,
    melody: `${LONDON_A} ${LONDON_A} ${LONDON_VARIATION} ${LONDON_A}`,
    thirdsFromBar: 8,
    thirdsInstrument: 'flute',
    style: 'oomPah',
  },
  {
    ...CLASSIC,
    id: 'classic-ode',
    title: 'Ode to Joy (after Beethoven, 1824)',
    tempo: 144,
    transpose: 2,
    chords: 'C | C,G | C | C,G | C | C,G | C | G,C | G,C | G,C | G | C,G | C | C,G | C | G,C',
    melody: `${ODE_A} E5/1.5 D5/0.5 D5/2 | ${ODE_A} D5/1.5 C5/0.5 C5/2 | ${ODE_B} ${ODE_A} D5/1.5 C5/0.5 C5/2`,
    melodyInstrument: 'flute',
    style: 'galop',
  },
  {
    ...BAVARIAN,
    id: 'bavarian-augustin',
    title: 'Ländler: O du lieber Augustin (traditional)',
    tempo: 152,
    key: 0,
    // Written in C, played in B flat, the home key of a brass band.
    transpose: -2,
    meter: 3,
    chords: `${AUGUSTIN_CHORDS} | ${AUGUSTIN_CHORDS}`,
    melody: `${AUGUSTIN_MELODY} ${AUGUSTIN_MELODY}`,
    // First time solo, second time with the clarinet in thirds.
    thirdsFromBar: 16,
    drums: false,
  },
  {
    ...BAVARIAN,
    id: 'bavarian-zwiefacher',
    title: 'Zwiefacher: Hupfauf (our own composition)',
    tempo: 176,
    key: 7,
    transpose: 0,
    meter: Array.from({ length: 32 }, (_, bar) => (bar % 4 < 2 ? 3 : 2)),
    chords: `${ZWIEFACHER_CHORDS} | ${ZWIEFACHER_CHORDS}`,
    melody: `${ZWIEFACHER_MELODY} | ${ZWIEFACHER_MELODY}`,
    melodyInstrument: 'clarinet',
    // First time the clarinet alone, second time the accordion joins in thirds.
    thirdsFromBar: 16,
    thirdsInstrument: 'accordion',
    drums: false,
  },
  {
    ...BAVARIAN,
    id: 'bavarian-march',
    title: 'Marsch: Almauftrieb (our own composition)',
    tempo: 120,
    key: 5,
    transpose: 0,
    meter: 4,
    chords: 'F | C7 | C7 | F | F | C7 | C7 | F | Bb | Bb | C7 | C7 | F | Bb | C7 | F',
    melody: MARCH_MELODY,
    melodyInstrument: 'brass',
    thirdsFromBar: 8,
    chordInstrument: 'brass',
    drums: true,
  },
];

/** Every song, built once at module load (pure data; a bad spec fails the unit tests). */
export const SONGS: readonly Song[] = SONG_SPECS.map(buildSong);

/** Song ids of one theme, in playing order. */
export function listSongs(theme: MusicTheme): string[] {
  return SONGS.filter((song) => song.theme === theme).map((song) => song.id);
}

/** A song by id, or undefined. */
export function findSong(id: string): Song | undefined {
  return SONGS.find((song) => song.id === id);
}
