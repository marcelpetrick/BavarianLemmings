// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * The browser application (vision R-02, R-03, R-04): one 320×200 canvas, scaled by an integer
 * factor; the screen router; the frame loop that feeds wall-clock time to the session; mouse and
 * keyboard input; audio; and the test hook `window.__bavarianLemmings` (enabled with `?test`).
 */
import type { AudioEngine } from '../audio/engine';
import { LANGUAGES, translate, type Language } from '../i18n';
import { ALL_LEVELS, RATINGS, levelsOf, nextLevel } from '../levels';
import { isUnlocked, loadProgress, recordWin, saveSettings, type KeyValueStore, type Progress, type Settings } from '../persist/storage';
import { PanelRenderer } from '../render/panel';
import { PlayfieldRenderer } from '../render/playfield';
import { TextRenderer, context2d, type Context } from '../render/draw';
import { FONT } from '../render/font';
import { percent } from '../sim/game';
import type { Lemming } from '../sim/lemming';
import type { LevelData } from '../sim/level';
import { PLAYFIELD_HEIGHT, SCREEN_HEIGHT, SCREEN_WIDTH, TICK_MS, TICKS_PER_SECOND } from '../sim/constants';
import { isSkill } from '../sim/skills';
import type { SimEvent } from '../sim/state';
import { themeById, type Theme } from '../theme/themes';
import { commandForKey } from './keymap';
import { computeScaling, hitPanel, toLogical } from './layout';
import { cycle, itemAt, layoutMenu, moveFocus, resultCommentKey, type MenuEntry, type MenuItem, type ScreenId } from './screens';
import { Session } from './session';
import { statusParts } from './status';

/** Pixels from the left or right screen edge where the mouse scrolls the view (vision V-04). */
const EDGE_SCROLL_ZONE = 6;
const EDGE_SCROLL_SPEED = 4;
const VOLUME_STEPS = [0, 0.2, 0.4, 0.6, 0.8, 1];

export interface AppDeps {
  readonly root: HTMLElement;
  readonly store: KeyValueStore;
  readonly settings: Settings;
  readonly audio: AudioEngine | null;
  readonly testHook: boolean;
}

export class App {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: Context;
  private readonly text = new TextRenderer();
  private readonly settings: Settings;
  private progress: Progress;
  private screen: ScreenId = 'title';
  private items: MenuItem[] = [];
  private focus = 0;
  private rating = 'fun';
  private level: LevelData | null = null;
  private session: Session | null = null;
  private playfield: PlayfieldRenderer | null = null;
  private panel: PanelRenderer | null = null;
  private pointer: { x: number; y: number } | null = null;
  private lastFrame = 0;
  private resultWon = false;
  private readonly events: SimEvent[] = [];

  constructor(private readonly deps: AppDeps) {
    this.settings = { ...deps.settings };
    this.progress = loadProgress(deps.store);
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'game';
    this.canvas.width = SCREEN_WIDTH;
    this.canvas.height = SCREEN_HEIGHT;
    this.canvas.tabIndex = 0;
    deps.root.append(this.canvas);
    this.ctx = context2d(this.canvas);
    this.applyAudioSettings();
    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
    });
    this.canvas.addEventListener('pointermove', (event) => {
      this.onPointerMove(event);
    });
    this.canvas.addEventListener('pointerdown', (event) => {
      this.onPointerDown(event);
    });
    this.canvas.addEventListener('pointerleave', () => (this.pointer = null));
    this.canvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
    window.addEventListener('keydown', (event) => {
      this.onKey(event);
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.session) this.session.paused = true;
    });
    if (deps.testHook) this.installTestHook();
    this.show('title');
    this.canvas.focus();
    requestAnimationFrame((time) => {
      this.frame(time);
    });
  }

  private get theme(): Theme {
    return themeById(this.settings.theme);
  }

  private t(key: string, params: Readonly<Record<string, string | number>> = {}): string {
    return translate(this.settings.language, key, params);
  }

  private resize(): void {
    const scaling = computeScaling(window.innerWidth, window.innerHeight, this.settings.crt);
    this.canvas.style.width = `${scaling.cssWidth}px`;
    this.canvas.style.height = `${scaling.cssHeight}px`;
  }

  private applyAudioSettings(): void {
    const audio = this.deps.audio;
    if (!audio) return;
    audio.setVolume('music', this.settings.musicVolume);
    audio.setVolume('sfx', this.settings.sfxVolume);
    audio.setMuted(this.settings.muted);
    audio.setVoiceLanguage(this.settings.language);
  }

  private saveSettings(): void {
    saveSettings(this.deps.store, this.settings);
    this.applyAudioSettings();
    this.resize();
  }

  // ---------------------------------------------------------------- screens

  private show(screen: ScreenId): void {
    this.screen = screen;
    this.focus = 0;
    this.items = this.menuFor(screen);
    const first = this.items.findIndex((item) => item.enabled);
    this.focus = first;
    if (screen === 'title') this.playMusic(0);
  }

  private nextUnlockedLevel(): LevelData | undefined {
    for (const rating of RATINGS) {
      const list = levelsOf(rating);
      const index = this.progress[rating] ?? 0;
      if (index < list.length) return list[index];
    }
    return ALL_LEVELS[0];
  }

  private ratingName(rating: string): string {
    return this.t(`${this.theme.ratingPrefix}${rating}`);
  }

  private menuFor(screen: ScreenId): MenuItem[] {
    switch (screen) {
      case 'title': {
        const next = this.nextUnlockedLevel();
        const entries: MenuEntry[] = [
          {
            id: 'play',
            label: next ? this.t('menu.continue', { level: this.t(next.name) }) : this.t('menu.play'),
            enabled: next !== undefined,
          },
          { id: 'levels', label: this.t('menu.levels') },
          { id: 'bayern', label: this.settings.theme === 'bavarian' ? this.t('settings.theme.classic') : this.t('menu.bayern') },
          { id: 'settings', label: this.t('menu.settings') },
          { id: 'credits', label: this.t('menu.credits') },
        ];
        return layoutMenu(entries, 104);
      }
      case 'levels': {
        const list = levelsOf(this.rating);
        const entries: MenuEntry[] = [
          { id: 'rating', label: `< ${this.ratingName(this.rating)} >` },
          ...list.map((level, index) => ({
            id: `level:${level.id}`,
            label: `${String(index + 1).padStart(2, '0')} ${this.t(level.name)}`,
            enabled: isUnlocked(this.progress, this.rating, index),
          })),
          { id: 'back', label: this.t('menu.back') },
        ];
        return layoutMenu(entries, 40, 12);
      }
      case 'result': {
        const next = this.level ? nextLevel(this.level) : undefined;
        const entries: MenuEntry[] = [
          { id: 'retry', label: this.t('result.retry') },
          { id: 'next', label: this.t('result.next'), enabled: this.resultWon && next !== undefined },
          { id: 'menu', label: this.t('result.menu') },
        ];
        return layoutMenu(entries, 130);
      }
      case 'settings': {
        const s = this.settings;
        const percentOf = (v: number): string => `${Math.round(v * 100)}%`;
        const onOff = (v: boolean): string => (v ? 'ON' : 'OFF');
        const entries: MenuEntry[] = [
          { id: 'language', label: `${this.t('settings.language')}: ${this.t(`language.${s.language}`)}` },
          { id: 'theme', label: `${this.t('settings.theme')}: ${this.t(`settings.theme.${s.theme}`)}` },
          { id: 'music', label: `${this.t('settings.music')}: ${percentOf(s.musicVolume)}` },
          { id: 'sfx', label: `${this.t('settings.sfx')}: ${percentOf(s.sfxVolume)}` },
          { id: 'mute', label: `${this.t('settings.mute')}: ${onOff(s.muted)}` },
          { id: 'purist', label: `${this.t('settings.purist')}: ${onOff(s.purist)}` },
          { id: 'crt', label: `${this.t('settings.aspect')}: ${onOff(s.crt)}` },
          { id: 'back', label: this.t('menu.back') },
        ];
        return layoutMenu(entries, 40);
      }
      case 'credits':
        return layoutMenu([{ id: 'back', label: this.t('menu.back') }], 170);
      case 'preview':
      case 'play':
        return [];
    }
  }

  private activate(id: string): void {
    this.deps.audio?.playSfx('click');
    if (id.startsWith('level:')) {
      const level = ALL_LEVELS.find((l) => `level:${l.id}` === id);
      if (level) this.openPreview(level);
      return;
    }
    switch (id) {
      case 'play': {
        const next = this.nextUnlockedLevel();
        if (next) this.openPreview(next);
        return;
      }
      case 'levels':
      case 'settings':
      case 'credits':
        this.show(id);
        return;
      case 'bayern':
        this.settings.theme = this.settings.theme === 'bavarian' ? 'classic' : 'bavarian';
        this.saveSettings();
        this.show('title');
        return;
      case 'rating':
        this.rating = cycle(RATINGS, this.rating as (typeof RATINGS)[number]);
        this.show('levels');
        return;
      case 'back':
      case 'menu':
        this.show('title');
        return;
      case 'retry':
        if (this.level) this.openPreview(this.level);
        return;
      case 'next': {
        const next = this.level ? nextLevel(this.level) : undefined;
        if (next) this.openPreview(next);
        return;
      }
      default:
        this.changeSetting(id);
    }
  }

  private changeSetting(id: string): void {
    const s = this.settings;
    if (id === 'language') s.language = cycle<Language>(LANGUAGES, s.language);
    if (id === 'theme') s.theme = s.theme === 'classic' ? 'bavarian' : 'classic';
    if (id === 'music') s.musicVolume = cycle(VOLUME_STEPS, s.musicVolume);
    if (id === 'sfx') s.sfxVolume = cycle(VOLUME_STEPS, s.sfxVolume);
    if (id === 'mute') s.muted = !s.muted;
    if (id === 'purist') s.purist = !s.purist;
    if (id === 'crt') s.crt = !s.crt;
    this.saveSettings();
    const focus = this.focus;
    this.show('settings');
    this.focus = focus;
  }

  private openPreview(level: LevelData): void {
    this.level = level;
    this.rating = level.rating;
    this.show('preview');
  }

  private startLevel(): void {
    if (!this.level) return;
    this.session = new Session(this.level, { purist: this.settings.purist });
    this.playfield = new PlayfieldRenderer(this.theme, this.level.width, this.text);
    this.panel = new PanelRenderer(this.theme, this.text);
    this.lastFrame = performance.now();
    this.playMusic(ALL_LEVELS.indexOf(this.level));
    this.show('play');
  }

  private playMusic(index: number): void {
    const audio = this.deps.audio;
    if (!audio) return;
    const songs = audio.listSongs(this.settings.theme);
    const song = songs[Math.max(0, index) % songs.length];
    if (song && audio.currentSong !== song) audio.playMusic(song);
  }

  private finishLevel(): void {
    const session = this.session;
    const level = this.level;
    if (!session || !level) return;
    this.resultWon = session.state.outcome === 'won';
    if (this.resultWon && level.rating !== 'test')
      this.progress = recordWin(this.deps.store, level.rating, levelsOf(level.rating).indexOf(level));
    this.show('result');
  }

  // ---------------------------------------------------------------- loop

  private frame(time: number): void {
    const elapsed = Math.min(250, time - this.lastFrame);
    this.lastFrame = time;
    if (this.screen === 'play' && this.session) {
      const events = this.session.advance(elapsed);
      this.handleEvents(events);
      this.edgeScroll();
      if (this.session.state.outcome !== 'playing') this.finishLevel();
    }
    this.render();
    requestAnimationFrame((next) => {
      this.frame(next);
    });
  }

  private handleEvents(events: readonly SimEvent[]): void {
    this.playfield?.react(events);
    for (const event of events) this.deps.audio?.playEvent(event.type);
    if (this.deps.testHook) this.events.push(...events);
  }

  private edgeScroll(): void {
    const session = this.session;
    const pointer = this.pointer;
    if (!session || !pointer || pointer.y >= PLAYFIELD_HEIGHT) return;
    if (pointer.x < EDGE_SCROLL_ZONE) session.scrollBy(-EDGE_SCROLL_SPEED);
    if (pointer.x >= SCREEN_WIDTH - EDGE_SCROLL_ZONE) session.scrollBy(EDGE_SCROLL_SPEED);
  }

  // ---------------------------------------------------------------- input

  private logical(event: PointerEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return toLogical(event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height);
  }

  private onPointerMove(event: PointerEvent): void {
    this.pointer = this.logical(event);
    const hit = itemAt(this.items, this.pointer.x, this.pointer.y);
    if (hit) this.focus = this.items.indexOf(hit);
  }

  private onPointerDown(event: PointerEvent): void {
    event.preventDefault();
    void this.deps.audio?.unlock();
    this.canvas.focus();
    const point = this.logical(event);
    this.pointer = point;
    if (this.screen === 'preview') {
      this.startLevel();
      return;
    }
    if (this.screen === 'play') {
      this.clickPlay(point.x, point.y);
      return;
    }
    const item = itemAt(this.items, point.x, point.y);
    if (item) this.activate(item.id);
  }

  private levelPoint(x: number, y: number): { x: number; y: number } {
    const session = this.session;
    if (!session) return { x, y };
    const view = this.view();
    const scale = SCREEN_WIDTH / view.width;
    return { x: Math.floor(view.x + x / scale), y: Math.floor(view.y + y / scale) };
  }

  private clickPlay(x: number, y: number): void {
    const session = this.session;
    if (!session) return;
    if (y < PLAYFIELD_HEIGHT) {
      const point = this.levelPoint(x, y);
      session.clickLevel(point.x, point.y);
      return;
    }
    const hit = hitPanel(x, y, session.level.width);
    if (hit.kind === 'minimap') session.centreOn(hit.levelX);
    if (hit.kind !== 'button') return;
    this.deps.audio?.playSfx('click');
    const button = hit.button;
    if (isSkill(button)) session.command({ type: 'selectSkill', skill: button });
    else if (button === 'releaseMinus') session.command({ type: 'releaseRate', delta: -1 });
    else if (button === 'releasePlus') session.command({ type: 'releaseRate', delta: 1 });
    else session.command({ type: button });
  }

  private onKey(event: KeyboardEvent): void {
    void this.deps.audio?.unlock();
    const command = commandForKey(event.key);
    if (/^F\d{1,2}$/.test(event.key) || event.key === ' ' || event.key.startsWith('Arrow')) event.preventDefault();
    if (this.screen === 'play' && this.session) {
      if (command?.type === 'menu') this.show('title');
      else if (command) this.session.command(command);
      return;
    }
    if (this.screen === 'preview') {
      if (event.key === 'Enter' || event.key === ' ') this.startLevel();
      if (event.key === 'Escape') this.show('title');
      return;
    }
    if (event.key === 'ArrowDown') this.focus = moveFocus(this.items, this.focus, 1);
    else if (event.key === 'ArrowUp') this.focus = moveFocus(this.items, this.focus, -1);
    else if (event.key === 'Enter' || event.key === ' ') {
      const item = this.items[this.focus];
      if (item?.enabled) this.activate(item.id);
    } else if (event.key === 'Escape' && this.screen !== 'title') this.show('title');
  }

  // ---------------------------------------------------------------- rendering

  private view(): { x: number; y: number; width: number } {
    const session = this.session;
    if (!session) return { x: 0, y: 0, width: SCREEN_WIDTH };
    const width = session.visibleWidth;
    if (!session.zoomed) return { x: session.viewX, y: 0, width };
    const pointerX = this.pointer?.x ?? SCREEN_WIDTH / 2;
    const pointerY = Math.min(this.pointer?.y ?? PLAYFIELD_HEIGHT / 2, PLAYFIELD_HEIGHT);
    const x = Math.max(0, Math.min(session.level.width - width, session.viewX + Math.round(pointerX / 2)));
    return { x, y: Math.round((pointerY / PLAYFIELD_HEIGHT) * (PLAYFIELD_HEIGHT / 2)), width };
  }

  private render(): void {
    const ctx = this.ctx;
    const ui = this.theme.ui;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = ui.background;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    switch (this.screen) {
      case 'play':
        this.renderPlay();
        return;
      case 'title':
        this.renderBigTitle(this.t('app.title'), 30, ui.title);
        this.text.centred(ctx, this.t('app.subtitle'), SCREEN_WIDTH / 2, 62, ui.text);
        if (this.settings.theme === 'bavarian') this.renderLozenges();
        break;
      case 'levels':
        this.text.centred(ctx, this.t('menu.levels'), SCREEN_WIDTH / 2, 16, ui.title);
        break;
      case 'preview':
        this.renderPreview();
        return;
      case 'result':
        this.renderResult();
        break;
      case 'settings':
        this.text.centred(ctx, this.t('settings.title'), SCREEN_WIDTH / 2, 16, ui.title);
        break;
      case 'credits':
        this.text.centred(ctx, this.t('credits.title'), SCREEN_WIDTH / 2, 16, ui.title);
        for (let i = 1; i <= 7; i += 1) this.renderWrapped(this.t(`credits.line${i}`), 30 + (i - 1) * 19, ui.text);
        break;
    }
    this.renderMenu();
  }

  private renderMenu(): void {
    const ui = this.theme.ui;
    this.items.forEach((item, index) => {
      const color = !item.enabled ? '#606060' : index === this.focus ? ui.highlight : ui.text;
      if (index === this.focus && item.enabled) {
        this.ctx.strokeStyle = ui.highlight;
        this.ctx.strokeRect(item.x + 0.5, item.y + 0.5, item.w - 1, item.h - 1);
      }
      this.text.draw(this.ctx, item.label, item.x + 4, item.y + 2, color);
    });
  }

  /** Long lines (credits) wrap at word boundaries to fit the 320-pixel screen. */
  private renderWrapped(text: string, y: number, color: string): void {
    const maxChars = Math.floor((SCREEN_WIDTH - 8) / FONT.width);
    const lines: string[] = [];
    let line = '';
    for (const word of text.split(' ')) {
      if ((line + ' ' + word).trim().length > maxChars) {
        lines.push(line);
        line = word;
      } else line = (line + ' ' + word).trim();
    }
    lines.push(line);
    lines.forEach((l, i) => {
      this.text.centred(this.ctx, l, SCREEN_WIDTH / 2, y + i * 9, color);
    });
  }

  private renderBigTitle(text: string, y: number, color: string): void {
    this.ctx.save();
    this.ctx.scale(2, 2);
    this.text.centred(this.ctx, text, SCREEN_WIDTH / 4, y / 2, color);
    this.ctx.restore();
  }

  /** The white-and-blue lozenges of the Bavarian flag along the top and bottom (vision V-09). */
  private renderLozenges(): void {
    for (let x = 0; x < SCREEN_WIDTH; x += 8) {
      for (const y of [0, SCREEN_HEIGHT - 8]) {
        this.ctx.fillStyle = (x / 8) % 2 === 0 ? '#ffffff' : '#0066b3';
        this.ctx.beginPath();
        this.ctx.moveTo(x + 4, y);
        this.ctx.lineTo(x + 8, y + 4);
        this.ctx.lineTo(x + 4, y + 8);
        this.ctx.lineTo(x, y + 4);
        this.ctx.fill();
      }
    }
  }

  private renderPreview(): void {
    const level = this.level;
    if (!level) return;
    const ui = this.theme.ui;
    const list = levelsOf(level.rating);
    const lines = [
      this.t('preview.level', { number: list.indexOf(level) + 1 }),
      this.t(level.name),
      '',
      this.t('preview.lemmings', { count: level.lemmings }),
      this.t('preview.toSave', { percent: percent(level.toSave, level.lemmings) }),
      this.t('preview.releaseRate', { rate: level.releaseRate }),
      this.t('preview.time', { minutes: Math.round(level.timeSeconds / 60) }),
      this.t('preview.rating', { rating: this.ratingName(level.rating) }),
    ];
    lines.forEach((line, i) => {
      this.text.centred(this.ctx, line, SCREEN_WIDTH / 2, 40 + i * 12, i === 1 ? ui.title : ui.text);
    });
    this.text.centred(this.ctx, this.t('preview.start'), SCREEN_WIDTH / 2, 170, ui.highlight);
  }

  private renderResult(): void {
    const session = this.session;
    if (!session) return;
    const ui = this.theme.ui;
    const state = session.state;
    const saved = percent(state.saved, state.level.lemmings);
    const needed = percent(state.level.toSave, state.level.lemmings);
    this.text.centred(this.ctx, this.t(this.resultWon ? 'result.title.won' : 'result.title.lost'), SCREEN_WIDTH / 2, 30, ui.title);
    this.text.centred(this.ctx, this.t('result.rescued', { percent: saved }), SCREEN_WIDTH / 2, 60, ui.text);
    this.text.centred(this.ctx, this.t('result.needed', { percent: needed }), SCREEN_WIDTH / 2, 74, ui.text);
    this.renderWrapped(this.t(resultCommentKey(saved, needed)), 100, ui.highlight);
  }

  private hovered(): Lemming | null {
    const session = this.session;
    const pointer = this.pointer;
    if (!session || !pointer || pointer.y >= PLAYFIELD_HEIGHT) return null;
    const point = this.levelPoint(pointer.x, pointer.y);
    return session.lemmingAt(point.x, point.y);
  }

  private renderPlay(): void {
    const session = this.session;
    if (!session || !this.playfield || !this.panel) return;
    const hovered = this.hovered();
    const view = this.view();
    this.playfield.draw(this.ctx, session.state, view, hovered, this.pointer);
    let count = 0;
    if (hovered && this.pointer) {
      const point = this.levelPoint(this.pointer.x, this.pointer.y);
      count = session.countUnderCursor(point.x, point.y);
    }
    this.panel.draw(
      this.ctx,
      session.state,
      {
        selectedSkill: session.selectedSkill,
        paused: session.paused,
        nukeArmed: session.nukeArmed,
        fastForward: session.fastForward,
        viewX: view.x,
        viewWidth: view.width,
      },
      statusParts(session.state, hovered, count, this.settings.language),
      this.playfield.terrainImage,
    );
  }

  // ---------------------------------------------------------------- test hook (R-04)

  private installTestHook(): void {
    const toClient = (x: number, y: number): { x: number; y: number } => {
      const rect = this.canvas.getBoundingClientRect();
      return { x: rect.left + ((x + 0.5) * rect.width) / SCREEN_WIDTH, y: rect.top + ((y + 0.5) * rect.height) / SCREEN_HEIGHT };
    };
    const hook = {
      screen: (): ScreenId => this.screen,
      /** Client coordinates of a menu item's centre, for real mouse clicks. */
      menuItem: (id: string) => {
        const item = this.items.find((i) => i.id === id);
        return item ? { ...toClient(item.x + item.w / 2, item.y + item.h / 2), enabled: item.enabled } : null;
      },
      /** Client coordinates of a screen pixel. */
      screenToClient: toClient,
      /** Client coordinates of a level pixel in the current view. */
      levelToClient: (x: number, y: number) => {
        const view = this.view();
        const scale = SCREEN_WIDTH / view.width;
        return toClient((x - view.x) * scale, (y - view.y) * scale);
      },
      state: () => {
        const session = this.session;
        if (!session) return null;
        const s = session.state;
        return {
          levelId: s.level.id,
          tick: s.tick,
          outcome: s.outcome,
          saved: s.saved,
          died: s.died,
          spawned: s.spawned,
          releaseRate: s.releaseRate,
          skills: { ...s.skills },
          selectedSkill: session.selectedSkill,
          paused: session.paused,
          fastForward: session.fastForward,
          nuking: s.nuking,
          viewX: session.viewX,
          secondsLeft: Math.ceil(s.ticksLeft / TICKS_PER_SECOND),
          lemmings: s.lemmings.filter((l) => !l.removed).map((l) => ({ id: l.id, x: l.x, y: l.y, action: l.action })),
        };
      },
      settings: () => ({ ...this.settings }),
      events: () => this.events.splice(0).map((e) => e.type),
      /** Run the session faster in tests: real ticks, no waiting for wall-clock time. */
      advance: (ms: number) => {
        for (let left = ms; left > 0 && this.session; left -= TICK_MS) this.handleEvents(this.session.advance(Math.min(left, TICK_MS)));
        if (this.session && this.session.state.outcome !== 'playing' && this.screen === 'play') this.finishLevel();
      },
    };
    Object.assign(window, { __bavarianLemmings: hook });
  }
}
