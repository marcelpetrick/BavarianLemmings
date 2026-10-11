// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The browser side of audio: a thin wrapper around Web Audio (vision A-01, A-02, A-06).
 *
 * All sound is computed by the pure modules (fm.ts, sfx.ts, music.ts) and only copied into
 * AudioBuffers here. This file holds no musical logic, so it is covered by the Playwright tests
 * instead of unit tests.
 *
 * Rules this class keeps:
 * - Browsers block audio until the user interacts with the page. The AudioContext is created and
 *   resumed in `unlock()`, which the UI calls from the first click, key or touch (A-02).
 * - Nothing here throws when audio is unavailable (no Web Audio, blocked context, missing voice
 *   files). The game then simply stays silent.
 * - Music is scheduled ahead with a look-ahead timer: every 25 ms the notes of the next 100 ms are
 *   handed to the audio clock, so a busy main thread never makes the music stutter.
 */

import { INSTRUMENTS, midiToFrequency, renderNote } from './fm';
import { findSong, listSongs as listThemeSongs, MUSIC_BUS_GAIN, scheduleNotes, secondsPerBeat, type MusicTheme, type Song } from './music';
import { renderSfx, SFX_FOR_EVENT, type SfxId, VOICE_FOR_EVENT, type VoiceLanguage, type VoiceLine, voiceSetFor } from './sfx';

/** Volume controls: master scales everything, music and sfx scale their own bus. */
export type AudioChannel = 'master' | 'music' | 'sfx';

/** Timer period of the music scheduler, in milliseconds. */
const SCHEDULER_PERIOD_MS = 25;
/** How far ahead of the audio clock notes are scheduled, in seconds. */
const LOOKAHEAD_SECONDS = 0.1;
/** After a stall longer than this (background tab), skip missed notes instead of playing them all at once. */
const MAX_CATCH_UP_SECONDS = 0.5;
/** Gain changes glide with this time constant, in seconds, so volume changes do not click. */
const GAIN_SMOOTHING_SECONDS = 0.02;
const VOICE_LINES: readonly VoiceLine[] = ['letsGo', 'ohNo', 'yippee'];

interface MusicState {
  readonly song: Song;
  readonly startTime: number;
  nextBeat: number;
  timer: ReturnType<typeof setInterval>;
}

type AudioContextConstructor = new () => AudioContext;

function findAudioContext(): AudioContextConstructor | undefined {
  // Typed as always present by lib.dom, but missing in old browsers and in some privacy modes.
  const scope = globalThis as unknown as { AudioContext?: AudioContextConstructor; webkitAudioContext?: AudioContextConstructor };
  return scope.AudioContext ?? scope.webkitAudioContext;
}

export interface AudioEngineOptions {
  /** URL of the voice folder, ending in '/'. Defaults to `<base>audio/voices/`. */
  readonly voiceBaseUrl?: string;
}

export class AudioEngine {
  private context: AudioContext | undefined;
  private masterGain: GainNode | undefined;
  private readonly busGains = new Map<'music' | 'sfx', GainNode>();
  private readonly volumes: Record<AudioChannel, number> = { master: 1, music: 0.7, sfx: 1 };
  private mutedState = false;
  private voiceLanguage: VoiceLanguage = 'en';
  private readonly sfxBuffers = new Map<SfxId, AudioBuffer>();
  private readonly noteBuffers = new Map<string, AudioBuffer>();
  private readonly voiceBuffers = new Map<string, AudioBuffer | 'loading' | 'failed'>();
  private music: MusicState | undefined;
  /** The song asked for before unlock, or the one playing; restarted after unlock. */
  private wantedSong: string | undefined;
  private readonly voiceBaseUrl: string;

  constructor(options: AudioEngineOptions = {}) {
    this.voiceBaseUrl = options.voiceBaseUrl ?? `${import.meta.env.BASE_URL}audio/voices/`;
  }

  /** True once the AudioContext exists and runs. */
  get unlocked(): boolean {
    return this.context?.state === 'running';
  }

  get muted(): boolean {
    return this.mutedState;
  }

  /** Id of the song that plays (or will play after unlock), or undefined. */
  get currentSong(): string | undefined {
    return this.wantedSong;
  }

  /**
   * Create and resume the AudioContext. Call it from a user gesture (click, key, touch).
   * Resolves to true when audio runs; never throws. Safe to call many times.
   */
  async unlock(): Promise<boolean> {
    try {
      if (!this.context) {
        const Context = findAudioContext();
        if (!Context) return false;
        this.context = new Context();
        this.buildGraph(this.context);
        this.preloadVoices();
      }
      if (this.context.state !== 'running') await this.context.resume();
    } catch {
      return false;
    }
    if (this.unlocked && this.wantedSong !== undefined && !this.music) this.playMusic(this.wantedSong);
    return this.unlocked;
  }

  /**
   * Unlock on the first pointer, key or touch event on `target` (A-02). Returns a function that
   * removes the listeners. The listeners also remove themselves once audio runs.
   */
  attachUnlockListeners(target: EventTarget = globalThis): () => void {
    const events = ['pointerdown', 'keydown', 'touchend'] as const;
    const handler = (): void => {
      void this.unlock().then((running) => {
        if (running) detach();
      });
    };
    const detach = (): void => {
      for (const event of events) target.removeEventListener(event, handler);
    };
    for (const event of events) target.addEventListener(event, handler);
    return detach;
  }

  /** Set a channel volume, 0 to 1 (clamped). Works before unlock too. */
  setVolume(channel: AudioChannel, volume: number): void {
    this.volumes[channel] = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : 0));
    this.applyGains();
  }

  getVolume(channel: AudioChannel): number {
    return this.volumes[channel];
  }

  /** Mute or unmute everything; the volumes are kept. */
  setMuted(muted: boolean): void {
    this.mutedState = muted;
    this.applyGains();
  }

  /** The UI language decides the voice set (A-06); German uses the English set (Q-D9). */
  setVoiceLanguage(language: VoiceLanguage): void {
    this.voiceLanguage = language;
    this.preloadVoices();
  }

  /** Play the sound of a simulation event (`SimEventType`). Unknown and silent events do nothing. */
  playEvent(eventType: string): void {
    const voice = VOICE_FOR_EVENT[eventType];
    if (voice) {
      this.playVoice(voice, this.voiceLanguage);
      return;
    }
    const sfx = SFX_FOR_EVENT[eventType];
    if (sfx) this.playSfx(sfx);
  }

  /** Play a sound effect by id (also UI sounds such as 'click'). */
  playSfx(id: SfxId): void {
    const context = this.context;
    const bus = this.busGains.get('sfx');
    if (!context || !bus || !this.unlocked) return;
    let buffer = this.sfxBuffers.get(id);
    if (!buffer) {
      buffer = this.toBuffer(context, renderSfx(id, context.sampleRate));
      this.sfxBuffers.set(id, buffer);
    }
    this.startBuffer(context, buffer, bus, context.currentTime, 1);
  }

  /**
   * Speak a voice line in the set of `language`. While the recording is not loaded (or failed to
   * load), the synthesised effect of the same name plays instead, so the moment is never silent.
   */
  playVoice(line: VoiceLine, language: VoiceLanguage): void {
    const context = this.context;
    const bus = this.busGains.get('sfx');
    if (!context || !bus || !this.unlocked) return;
    const key = `${voiceSetFor(language)}/${line}`;
    const entry = this.voiceBuffers.get(key);
    if (entry instanceof AudioBuffer) {
      this.startBuffer(context, entry, bus, context.currentTime, 1);
      return;
    }
    if (entry === undefined) this.loadVoice(context, key);
    this.playSfx(line);
  }

  /** Song ids of a theme, in playing order. */
  listSongs(theme: MusicTheme): string[] {
    return listThemeSongs(theme);
  }

  /**
   * Start a song from its beginning; it loops until `stopMusic()` or another `playMusic()`.
   * Before unlock the song is remembered and starts on unlock. Returns false for an unknown id.
   */
  playMusic(songId: string): boolean {
    const song = findSong(songId);
    if (!song) return false;
    this.stopMusic();
    this.wantedSong = songId;
    const context = this.context;
    const bus = this.busGains.get('music');
    if (!context || !bus || !this.unlocked) return true;
    this.prerenderSong(context, song);
    const state: MusicState = {
      song,
      startTime: context.currentTime + 0.05,
      nextBeat: 0,
      timer: setInterval(() => {
        this.scheduleAhead(context, bus, state);
      }, SCHEDULER_PERIOD_MS),
    };
    this.music = state;
    this.scheduleAhead(context, bus, state);
    return true;
  }

  /** Stop the music. Notes already handed to the audio clock (at most 100 ms) still sound. */
  stopMusic(): void {
    if (this.music) clearInterval(this.music.timer);
    this.music = undefined;
    this.wantedSong = undefined;
  }

  /** Stop everything and close the AudioContext. */
  async dispose(): Promise<void> {
    this.stopMusic();
    const context = this.context;
    this.context = undefined;
    this.busGains.clear();
    this.masterGain = undefined;
    try {
      await context?.close();
    } catch {
      // Already closed: nothing to do.
    }
  }

  private buildGraph(context: AudioContext): void {
    // A compressor guards the output against clipping when many effects play at once.
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.ratio.value = 12;
    limiter.connect(context.destination);
    this.masterGain = context.createGain();
    this.masterGain.connect(limiter);
    for (const bus of ['music', 'sfx'] as const) {
      const gain = context.createGain();
      gain.connect(this.masterGain);
      this.busGains.set(bus, gain);
    }
    this.applyGains(true);
  }

  private applyGains(immediate = false): void {
    const context = this.context;
    if (!context || !this.masterGain) return;
    const set = (node: GainNode | undefined, value: number): void => {
      if (!node) return;
      if (immediate) node.gain.value = value;
      else node.gain.setTargetAtTime(value, context.currentTime, GAIN_SMOOTHING_SECONDS);
    };
    set(this.masterGain, this.mutedState ? 0 : this.volumes.master);
    set(this.busGains.get('music'), this.volumes.music * MUSIC_BUS_GAIN);
    set(this.busGains.get('sfx'), this.volumes.sfx);
  }

  private toBuffer(context: AudioContext, samples: Float32Array): AudioBuffer {
    const buffer = context.createBuffer(1, samples.length, context.sampleRate);
    buffer.getChannelData(0).set(samples);
    return buffer;
  }

  private startBuffer(context: AudioContext, buffer: AudioBuffer, destination: AudioNode, when: number, gain: number): void {
    const source = context.createBufferSource();
    source.buffer = buffer;
    if (gain === 1) {
      source.connect(destination);
    } else {
      const level = context.createGain();
      level.gain.value = gain;
      source.connect(level).connect(destination);
    }
    source.start(when);
  }

  private noteKey(instrument: string, pitch: number, seconds: number): string {
    return `${instrument}|${pitch}|${seconds.toFixed(4)}`;
  }

  private noteBuffer(context: AudioContext, instrument: keyof typeof INSTRUMENTS, pitch: number, seconds: number): AudioBuffer {
    const key = this.noteKey(instrument, pitch, seconds);
    let buffer = this.noteBuffers.get(key);
    if (!buffer) {
      buffer = this.toBuffer(context, renderNote(INSTRUMENTS[instrument], midiToFrequency(pitch), seconds, context.sampleRate));
      this.noteBuffers.set(key, buffer);
    }
    return buffer;
  }

  /** Render every distinct note of a song before it starts, so playback never waits for synthesis. */
  private prerenderSong(context: AudioContext, song: Song): void {
    this.noteBuffers.clear();
    const beatSeconds = secondsPerBeat(song);
    for (const note of scheduleNotes(song, 0, song.lengthBeats)) {
      this.noteBuffer(context, note.instrument, note.pitch, note.length * beatSeconds);
    }
  }

  private scheduleAhead(context: AudioContext, bus: GainNode, state: MusicState): void {
    if (this.music !== state) return;
    const beatSeconds = secondsPerBeat(state.song);
    const nowBeat = (context.currentTime - state.startTime) / beatSeconds;
    // A throttled timer (background tab) would dump all missed notes at once: skip them instead.
    if (nowBeat - state.nextBeat > MAX_CATCH_UP_SECONDS / beatSeconds) state.nextBeat = nowBeat;
    const horizonBeat = (context.currentTime + LOOKAHEAD_SECONDS - state.startTime) / beatSeconds;
    if (horizonBeat <= state.nextBeat) return;
    for (const note of scheduleNotes(state.song, state.nextBeat, horizonBeat)) {
      const buffer = this.noteBuffer(context, note.instrument, note.pitch, note.length * beatSeconds);
      const when = Math.max(context.currentTime, state.startTime + note.beat * beatSeconds);
      this.startBuffer(context, buffer, bus, when, note.gain);
    }
    state.nextBeat = horizonBeat;
  }

  private preloadVoices(): void {
    const context = this.context;
    if (!context) return;
    const set = voiceSetFor(this.voiceLanguage);
    for (const line of VOICE_LINES) {
      const key = `${set}/${line}`;
      if (!this.voiceBuffers.has(key)) this.loadVoice(context, key);
    }
  }

  private loadVoice(context: AudioContext, key: string): void {
    this.voiceBuffers.set(key, 'loading');
    void (async () => {
      try {
        const response = await fetch(`${this.voiceBaseUrl}${key}.wav`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = await context.decodeAudioData(await response.arrayBuffer());
        this.voiceBuffers.set(key, buffer);
      } catch {
        // Missing or undecodable file: the synthesised fallback plays from now on.
        this.voiceBuffers.set(key, 'failed');
      }
    })();
  }
}
