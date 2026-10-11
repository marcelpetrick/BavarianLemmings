// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { INSTRUMENTS } from '../../src/audio/fm';
import { allFinite, peakOf, rms } from './spectrum';
import {
  accompany,
  buildSong,
  findSong,
  listSongs,
  MUSIC_BUS_GAIN,
  parseChord,
  parseMelody,
  parseNoteName,
  renderSong,
  scheduleNotes,
  secondsPerBeat,
  SONGS,
  thirdBelow,
  type Song,
  type SongSpec,
} from '../../src/audio/music';

const tinySong: Song = {
  id: 'tiny',
  title: 'Tiny',
  theme: 'classic',
  tempo: 120,
  barBeats: [4, 4],
  lengthBeats: 8,
  loopStartBeat: 4,
  channels: [
    {
      name: 'a',
      instrument: 'lead',
      volume: 0.5,
      notes: [
        { pitch: 60, start: 0, length: 1, velocity: 1 },
        { pitch: 62, start: 4, length: 1, velocity: 0.5 },
        { pitch: 64, start: 6, length: 1, velocity: 1 },
      ],
    },
    { name: 'b', instrument: 'bass', volume: 1, notes: [{ pitch: 36, start: 4, length: 2, velocity: 1 }] },
  ],
};

const baseSpec: SongSpec = {
  id: 'spec',
  title: 'Spec',
  theme: 'bavarian',
  tempo: 100,
  key: 0,
  transpose: 0,
  meter: [3, 2],
  chords: 'C | G7',
  melody: 'E5/1 D5/1 C5/1 | B4/1 r/1',
  melodyInstrument: 'accordion',
  bassInstrument: 'tuba',
  chordInstrument: 'accordion',
  style: 'oomPah',
  drums: false,
  loopStartBar: 1,
};

describe('notation', () => {
  it('parses note names in scientific pitch notation', () => {
    expect(parseNoteName('C4')).toBe(60);
    expect(parseNoteName('A4')).toBe(69);
    expect(parseNoteName('F#5')).toBe(78);
    expect(parseNoteName('Bb3')).toBe(58);
    expect(parseNoteName('C-1')).toBe(0);
    expect(() => parseNoteName('H4')).toThrow(/bad note/);
  });

  it('parses melodies with rests and bar lines', () => {
    const { notes, lengthBeats } = parseMelody('C4/1 r/0.5 | D4/0.5  E4/2 |');
    expect(lengthBeats).toBe(4);
    expect(notes).toEqual([
      { pitch: 60, start: 0, length: 1, velocity: 1 },
      { pitch: 62, start: 1.5, length: 0.5, velocity: 1 },
      { pitch: 64, start: 2, length: 2, velocity: 1 },
    ]);
    expect(() => parseMelody('C4')).toThrow(/bad length/);
    expect(() => parseMelody('C4/0')).toThrow(/bad length/);
    expect(() => parseMelody('C4/x')).toThrow(/bad length/);
  });

  it('parses chord symbols', () => {
    expect(parseChord('C')).toEqual({ root: 0, intervals: [0, 4, 7] });
    expect(parseChord('Am')).toEqual({ root: 9, intervals: [0, 3, 7] });
    expect(parseChord('G7')).toEqual({ root: 7, intervals: [0, 4, 7, 10] });
    expect(parseChord('F#m7')).toEqual({ root: 6, intervals: [0, 3, 7, 10] });
    expect(parseChord('Bb')).toEqual({ root: 10, intervals: [0, 4, 7] });
    expect(parseChord('Cb')).toEqual({ root: 11, intervals: [0, 4, 7] });
    expect(parseChord('Bdim')).toEqual({ root: 11, intervals: [0, 3, 6] });
    expect(() => parseChord('X')).toThrow(/bad chord/);
  });

  it('finds the diatonic third below in a key', () => {
    expect(thirdBelow(64, 0)).toBe(60); // E -> C, major third
    expect(thirdBelow(60, 0)).toBe(57); // C -> A, minor third
    expect(thirdBelow(71, 0)).toBe(67); // B -> G
    expect(thirdBelow(67, 7)).toBe(64); // G -> E in G major
    expect(thirdBelow(66, 0)).toBe(63); // F# is outside C major: minor third
  });
});

describe('scheduleNotes', () => {
  it('returns the notes starting inside the window, with gain = velocity x volume', () => {
    expect(scheduleNotes(tinySong, 0, 4)).toEqual([{ channel: 0, instrument: 'lead', pitch: 60, beat: 0, length: 1, gain: 0.5 }]);
    expect(scheduleNotes(tinySong, 4, 6).map((n) => [n.channel, n.pitch, n.beat, n.gain])).toEqual([
      [0, 62, 4, 0.25],
      [1, 36, 4, 1],
    ]);
  });

  it('treats the window as half-open [from, to)', () => {
    expect(scheduleNotes(tinySong, 0.5, 4)).toEqual([]);
    expect(scheduleNotes(tinySong, 0, 0)).toEqual([]);
  });

  it('unrolls the loop from the loop point, beyond the first loop', () => {
    const beats = scheduleNotes(tinySong, 7, 20).map((n) => [n.pitch, n.beat]);
    // Loop is beats 4..8 of the song; after the end it repeats at 8, 12, 16 ...
    expect(beats).toEqual([
      [62, 8],
      [36, 8],
      [64, 10],
      [62, 12],
      [36, 12],
      [64, 14],
      [62, 16],
      [36, 16],
      [64, 18],
    ]);
    // The intro note before the loop point is never repeated.
    expect(scheduleNotes(tinySong, 8, 1000).some((n) => n.pitch === 60)).toBe(false);
  });

  it('gives the same notes whether scheduled in one window or many small ones', () => {
    const whole = scheduleNotes(tinySong, 0, 40);
    const pieces = [];
    for (let beat = 0; beat < 40; beat += 0.37) pieces.push(...scheduleNotes(tinySong, beat, Math.min(40, beat + 0.37)));
    expect(pieces).toEqual(whole);
  });

  it('plays a song without a loop only once', () => {
    const once: Song = { ...tinySong, loopStartBeat: 8 };
    expect(scheduleNotes(once, 0, 100)).toHaveLength(4);
    expect(scheduleNotes(once, 8, 100)).toEqual([]);
  });

  it('converts tempo to seconds per beat', () => {
    expect(secondsPerBeat(tinySong)).toBe(0.5);
  });
});

describe('buildSong', () => {
  it('builds melody, bass and chords with a per-bar meter (Zwiefacher style)', () => {
    const song = buildSong(baseSpec);
    expect(song.barBeats).toEqual([3, 2]);
    expect(song.lengthBeats).toBe(5);
    expect(song.loopStartBeat).toBe(3);
    expect(song.channels.map((c) => c.name)).toEqual(['melody', 'bass', 'chords']);
    const bass = song.channels[1]!.notes;
    expect(bass.map((n) => [n.pitch, n.start])).toEqual([
      [48, 0], // C3 on beat 1 of bar 1
      [50, 3], // the fifth (D3 for G) on beat 1 of bar 2: root and fifth alternate between bars
    ]);
    const chordStarts = [...new Set(song.channels[2]!.notes.map((n) => n.start))];
    expect(chordStarts).toEqual([1, 2, 4]);
  });

  it('adds thirds, drums, transposition and split bars', () => {
    const song = buildSong({
      ...baseSpec,
      meter: 4,
      chords: 'C,G | C',
      melody: 'E5/2 D5/2 | C5/4',
      transpose: 2,
      thirdsFromBar: 1,
      drums: true,
      style: 'oomPah',
    });
    expect(song.channels.map((c) => c.name)).toEqual(['melody', 'thirds', 'bass', 'chords', 'kick', 'snare']);
    expect(song.channels[0]!.notes.map((n) => n.pitch)).toEqual([78, 76, 74]);
    expect(song.channels[1]!.notes.map((n) => n.pitch)).toEqual([71]); // A4 + 2
    expect(song.channels[1]!.instrument).toBe('accordion');
    // Bar 1: D (C+2) on beat 1, then A (G+2, the bar's second chord) on its root on beat 3.
    // Bar 2: the fifth of D (A) on beat 1, the root D on beat 3.
    expect(song.channels[2]!.notes.map((n) => n.pitch % 12)).toEqual([2, 9, 9, 2]);
  });

  it('adds a hi-hat in the galop style', () => {
    const song = buildSong({ ...baseSpec, style: 'galop', drums: true });
    expect(song.channels.map((c) => c.name)).toContain('hat');
  });

  it('rejects specs whose melody or meter does not fit the bars', () => {
    expect(() => buildSong({ ...baseSpec, melody: 'C5/1' })).toThrow(/melody has 1 beats/);
    expect(() => buildSong({ ...baseSpec, meter: [3] })).toThrow(/2 chord bars but 1 meter/);
  });

  it('skips bars without chords in the accompaniment', () => {
    const parts = accompany([{ beats: 2, chords: [] }], 'oomPah');
    expect(parts.bass).toEqual([]);
  });
});

describe('song data', () => {
  it('gives the Bavarian songs their dance meters: Ländler 3/4, Zwiefacher 3/4 and 2/4 mixed, march 4/4', () => {
    expect(new Set(findSong('bavarian-augustin')!.barBeats)).toEqual(new Set([3]));
    expect(new Set(findSong('bavarian-zwiefacher')!.barBeats)).toEqual(new Set([3, 2]));
    expect(new Set(findSong('bavarian-march')!.barBeats)).toEqual(new Set([4]));
    for (const id of listSongs('bavarian')) {
      expect(findSong(id)!.channels.map((c) => c.instrument)).toContain('tuba');
    }
  });

  it.each(SONGS.map((song) => [song.id, song] as const))('%s is well-formed', (_id, song) => {
    expect(song.lengthBeats).toBe(song.barBeats.reduce((a, b) => a + b, 0));
    expect(song.barBeats.length).toBeGreaterThanOrEqual(16);
    expect(song.barBeats.length).toBeLessThanOrEqual(32);
    expect(song.loopStartBeat).toBeGreaterThanOrEqual(0);
    expect(song.loopStartBeat).toBeLessThan(song.lengthBeats);
    expect(song.tempo).toBeGreaterThanOrEqual(60);
    expect(song.tempo).toBeLessThanOrEqual(200);
    const names = song.channels.map((c) => c.name);
    expect(names).toEqual(expect.arrayContaining(['melody', 'bass', 'chords']));
    for (const channel of song.channels) {
      expect(INSTRUMENTS[channel.instrument], channel.name).toBeDefined();
      expect(channel.notes.length, channel.name).toBeGreaterThan(0);
      for (const n of channel.notes) {
        expect(n.pitch, channel.name).toBeGreaterThanOrEqual(36);
        expect(n.pitch, channel.name).toBeLessThanOrEqual(96);
        expect(n.start).toBeGreaterThanOrEqual(0);
        expect(n.start + n.length).toBeLessThanOrEqual(song.lengthBeats);
        expect(n.length).toBeGreaterThan(0);
        expect(n.velocity).toBeGreaterThan(0);
        expect(n.velocity).toBeLessThanOrEqual(1);
      }
    }
    const melody = song.channels.find((c) => c.name === 'melody')!;
    for (const n of melody.notes) {
      expect(n.pitch).toBeGreaterThanOrEqual(60);
      expect(n.pitch).toBeLessThanOrEqual(90);
    }
  });

  it.each(SONGS.map((song) => [song.id, song] as const))('%s mixes below full scale on the music bus and is audible', (_id, song) => {
    const samples = renderSong(song, 8000, 0, song.lengthBeats);
    expect(allFinite(samples)).toBe(true);
    expect(peakOf(samples) * MUSIC_BUS_GAIN).toBeLessThan(1);
    expect(rms(samples)).toBeGreaterThan(0.1);
  });

  it('has unique ids and at least three songs per theme', () => {
    expect(new Set(SONGS.map((s) => s.id)).size).toBe(SONGS.length);
    expect(listSongs('classic').length).toBeGreaterThanOrEqual(3);
    expect(listSongs('bavarian').length).toBeGreaterThanOrEqual(3);
    for (const id of listSongs('classic')) expect(findSong(id)?.theme).toBe('classic');
    for (const id of listSongs('bavarian')) expect(findSong(id)?.theme).toBe('bavarian');
    expect(findSong('nope')).toBeUndefined();
  });
});
