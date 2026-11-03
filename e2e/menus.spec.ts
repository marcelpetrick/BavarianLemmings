// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { readFileSync, readdirSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import { appVersion, clickMenu, menuItems, openGame, renderedTexts, screen, settings, startFirstLevel, type MenuItemView } from './helpers';

const LANGUAGES = ['en', 'de', 'bar'] as const;
type Language = (typeof LANGUAGES)[number];
type ThemeId = 'classic' | 'bavarian';
/** The ratings in the order the level list cycles through them (src/levels/index.ts). */
const RATINGS = ['fun', 'tricky', 'taxing', 'mayhem'] as const;
const LOCALES = 'src/i18n/locales';
const SCREEN = { width: 320, height: 200 };

const readTexts = (path: string): Record<string, string> => JSON.parse(readFileSync(path, 'utf8')) as Record<string, string>;
/** Level-name files of one language, without the hidden test rating that no menu lists. */
const levelFiles = (language: Language): string[] =>
  readdirSync(`${LOCALES}/levels`).filter((file) => file.endsWith(`.${language}.json`) && !file.startsWith('test.'));
/** The texts of a language as the game merges them: main texts plus every level name. */
const TEXTS = Object.fromEntries(
  LANGUAGES.map((language) => [
    language,
    Object.assign(readTexts(`${LOCALES}/${language}.json`), ...levelFiles(language).map((file) => readTexts(`${LOCALES}/levels/${file}`))),
  ]),
) as Record<Language, Record<string, string>>;

/** A translation from the locale files; a missing key fails the test instead of passing silently. */
function t(language: Language, key: string): string {
  const text = TEXTS[language][key];
  if (text === undefined) throw new Error(`${language}: no text for ${key}`);
  return text;
}

const ratingName = (language: Language, theme: ThemeId, rating: string): string =>
  t(language, `${theme === 'bavarian' ? 'rating.bavarian.' : 'rating.'}${rating}`);

async function chooseLanguage(page: Page, language: Language): Promise<void> {
  for (let count = 0; count < LANGUAGES.length && (await settings(page)).language !== language; count += 1)
    await clickMenu(page, 'language');
  expect((await settings(page)).language).toBe(language);
  await expect(page.locator('html')).toHaveAttribute('lang', language);
}

/** Every item lies inside the 320×200 screen, so no label is cut off or unreachable. */
function expectOnScreen(items: readonly MenuItemView[]): void {
  for (const item of items) {
    expect(item.x, item.label).toBeGreaterThanOrEqual(0);
    expect(item.y, item.label).toBeGreaterThanOrEqual(0);
    expect(item.x + item.w, item.label).toBeLessThanOrEqual(SCREEN.width);
    expect(item.y + item.h, item.label).toBeLessThanOrEqual(SCREEN.height);
  }
}

/** The canvas received every visible menu label in a frame after the last change. */
async function expectPaintedMenu(page: Page): Promise<MenuItemView[]> {
  const items = await menuItems(page);
  expectOnScreen(items);
  await expect.poll(() => renderedTexts(page)).toEqual(expect.arrayContaining(items.map((item) => item.label)));
  return items;
}

const labelOf = async (page: Page, id: string): Promise<string | undefined> =>
  (await menuItems(page)).find((item) => item.id === id)?.label;

/**
 * Walk the level list through every rating and every page, starting on the first rating, and
 * check each label against the locale files. Works for any number of levels in any rating.
 */
async function checkLevelList(page: Page, language: Language, theme: ThemeId): Promise<void> {
  let listed = 0;
  for (const rating of RATINGS) {
    expect(await labelOf(page, 'rating')).toBe(`< ${ratingName(language, theme, rating)} >`);
    const labels = new Map<string, string>();
    const pagesSeen = new Set<string>();
    for (;;) {
      const items = await expectPaintedMenu(page);
      const levels = items.filter((item) => item.id.startsWith('level:'));
      const pageKey = levels.map((item) => item.id).join();
      if (pagesSeen.has(pageKey)) break;
      pagesSeen.add(pageKey);
      for (const item of levels) labels.set(item.id, item.label);
      if (!items.some((item) => item.id === 'page')) break;
      await clickMenu(page, 'page');
    }
    const numbered = [...labels].map(([id, label]) => {
      const match = /^(\d{2,}) (.+)$/.exec(label);
      expect(match, label).not.toBeNull();
      return { id, number: Number(match?.[1]), name: match?.[2] };
    });
    numbered.sort((a, b) => a.number - b.number);
    numbered.forEach((entry, index) => {
      expect(entry.number, entry.id).toBe(index + 1);
      expect(entry.name, entry.id).toBe(t(language, `level.${entry.id.slice('level:'.length)}.name`));
    });
    listed += numbered.length;
    await clickMenu(page, 'rating');
  }
  const named = levelFiles(language).reduce((sum, file) => sum + Object.keys(readTexts(`${LOCALES}/levels/${file}`)).length, 0);
  expect(listed).toBe(named);
}

test.describe('menus and settings (V-08, V-11, I-01, R-05, L-02)', () => {
  for (const theme of ['classic', 'bavarian'] as const) {
    test(`a language change repaints every menu, level name and preview in the ${theme} theme (M6.140)`, async ({ page }) => {
      const errors = await openGame(page);
      await clickMenu(page, 'settings');
      if ((await settings(page)).theme !== theme) await clickMenu(page, 'theme');
      // Includes the reported Bavarian -> English switch twice, without a reload or a theme change.
      for (const language of ['bar', 'en', 'de', 'bar', 'en'] as const) {
        await chooseLanguage(page, language);
        const items = await expectPaintedMenu(page);
        expect(Object.fromEntries(items.map((item) => [item.id, item.label]))).toEqual({
          language: `${t(language, 'settings.language')}: ${t(language, `language.${language}`)}`,
          theme: `${t(language, 'settings.theme')}: ${t(language, `settings.theme.${theme}`)}`,
          music: `${t(language, 'settings.music')}: 60%`,
          sfx: `${t(language, 'settings.sfx')}: 80%`,
          mute: `${t(language, 'settings.mute')}: ${t(language, 'settings.off')}`,
          purist: `${t(language, 'settings.purist')}: ${t(language, 'settings.off')}`,
          layout: `${t(language, 'settings.layout')}: ${t(language, 'settings.layout.auto')}`,
          crt: `${t(language, 'settings.aspect')}: ${t(language, 'settings.off')}`,
          back: t(language, 'menu.back'),
        });
        expect(await renderedTexts(page)).toContain(t(language, 'settings.title'));
        expect((await settings(page)).theme).toBe(theme);
        await clickMenu(page, 'back');
        const first = t(language, 'level.fun-01.name');
        const title = await expectPaintedMenu(page);
        expect(title.map((item) => item.label)).toEqual([
          t(language, 'menu.continue').replace('{level}', first),
          t(language, 'menu.levels'),
          theme === 'bavarian' ? t(language, 'settings.theme.classic') : t(language, 'menu.bayern'),
          t(language, 'menu.settings'),
          t(language, 'menu.credits'),
        ]);
        await clickMenu(page, 'credits');
        await expectPaintedMenu(page);
        expect(await renderedTexts(page)).toContain(t(language, 'credits.title'));
        await clickMenu(page, 'back');
        await clickMenu(page, 'levels');
        await checkLevelList(page, language, theme);
        expect(await renderedTexts(page)).toContain(t(language, 'menu.levels'));
        await clickMenu(page, 'level:fun-01');
        await expect.poll(() => renderedTexts(page)).toContain(first);
        expect(await renderedTexts(page)).toContain(t(language, 'preview.rating').replace('{rating}', ratingName(language, theme, 'fun')));
        await page.keyboard.press('Escape');
        await clickMenu(page, 'settings');
      }
      await page.reload();
      await expect.poll(() => settings(page)).toMatchObject({ language: 'en', theme });
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      expect(errors).toEqual([]);
    });
  }

  for (const language of LANGUAGES) {
    test(`every settings value is translated, repainted and kept across a reload in ${language} (M6.141)`, async ({ page }) => {
      const errors = await openGame(page);
      await clickMenu(page, 'settings');
      await chooseLanguage(page, language);
      const endsWith = (value: string): string => `: ${value}`;
      for (const id of ['mute', 'purist', 'crt']) {
        await clickMenu(page, id);
        expect((await labelOf(page, id))?.endsWith(endsWith(t(language, 'settings.on')))).toBe(true);
        await expectPaintedMenu(page);
      }
      for (const [id, key] of [
        ['music', 'musicVolume'],
        ['sfx', 'sfxVolume'],
      ] as const) {
        for (let count = 0; count < 6; count += 1) {
          await clickMenu(page, id);
          const value = (await settings(page))[key] as number;
          expect((await labelOf(page, id))?.endsWith(endsWith(`${Math.round(value * 100)}%`))).toBe(true);
          await expectPaintedMenu(page);
        }
      }
      for (const layout of ['classic', 'touch', 'auto', 'classic'] as const) {
        await clickMenu(page, 'layout');
        expect((await settings(page)).layout).toBe(layout);
        expect(await labelOf(page, 'layout')).toBe(`${t(language, 'settings.layout')}: ${t(language, `settings.layout.${layout}`)}`);
        await expectPaintedMenu(page);
      }
      const chosen = await settings(page);
      await page.reload();
      await expect.poll(() => settings(page)).toEqual(chosen);
      await expect(page.locator('html')).toHaveAttribute('lang', language);
      await clickMenu(page, 'settings');
      await expectPaintedMenu(page);
      for (const id of ['mute', 'purist', 'crt']) {
        expect((await labelOf(page, id))?.endsWith(endsWith(t(language, 'settings.on')))).toBe(true);
        await clickMenu(page, id);
        expect((await labelOf(page, id))?.endsWith(endsWith(t(language, 'settings.off')))).toBe(true);
      }
      expect(errors).toEqual([]);
    });
  }

  test('the level list pages so every level can be reached, by mouse and keyboard (M6.140)', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('bl.v1.progress', JSON.stringify({ fun: 12 }));
    });
    const errors = await openGame(page);
    await clickMenu(page, 'levels');
    // The list opens on the page of the next level to play: Fun 13.
    let items = await expectPaintedMenu(page);
    expect(items.find((item) => item.id === 'level:fun-13')?.enabled).toBe(true);
    expect(items.some((item) => item.id === 'level:fun-01')).toBe(false);
    await page.keyboard.press('ArrowRight');
    items = await expectPaintedMenu(page);
    expect(items.some((item) => item.id === 'level:fun-13')).toBe(false);
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    items = await expectPaintedMenu(page);
    expect(items.some((item) => item.id === 'level:fun-01')).toBe(true);
    await clickMenu(page, 'page');
    expect(await labelOf(page, 'page')).toMatch(/^< Page 2\/\d+ >$/);
    await clickMenu(page, 'level:fun-13');
    expect(await screen(page)).toBe('preview');
    await expect.poll(() => renderedTexts(page)).toContain(t('en', 'level.fun-13.name'));
    expect(await renderedTexts(page)).toContain('Level 13');
    expect(errors).toEqual([]);
  });

  test('language and theme persist across a reload', async ({ page }) => {
    const errors = await openGame(page);
    await clickMenu(page, 'settings');
    expect(await screen(page)).toBe('settings');
    const start = (await settings(page)).language;
    await clickMenu(page, 'language');
    expect((await settings(page)).language).not.toBe(start);
    await clickMenu(page, 'theme');
    expect((await settings(page)).theme).toBe('classic');
    await page.reload();
    await expect.poll(() => page.evaluate('typeof window.__bavarianLemmings')).toBe('object');
    expect((await settings(page)).theme).toBe('classic');
    expect((await settings(page)).language).not.toBe(start);
    expect(errors).toEqual([]);
  });

  test('the Bayern button switches the theme and a Bavarian level runs', async ({ page }) => {
    const errors = await openGame(page);
    expect((await settings(page)).theme).toBe('bavarian');
    await clickMenu(page, 'settings');
    await clickMenu(page, 'theme');
    expect((await settings(page)).theme).toBe('classic');
    await clickMenu(page, 'back');
    await clickMenu(page, 'bayern');
    expect((await settings(page)).theme).toBe('bavarian');
    await startFirstLevel(page);
    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
  });

  test('the touch layout can be chosen on a desktop and works with the mouse (C-06)', async ({ page }) => {
    const errors = await openGame(page);
    await clickMenu(page, 'settings');
    await clickMenu(page, 'layout');
    await clickMenu(page, 'layout');
    expect((await settings(page)).layout).toBe('touch');
    await clickMenu(page, 'back');
    await startFirstLevel(page);
    expect(await page.evaluate('window.__bavarianLemmings.layout()')).toBe('touch');
    await page.locator('[data-touch-button="builder"]').click();
    expect(await page.evaluate('window.__bavarianLemmings.state().selectedSkill')).toBe('builder');
    await page.locator('[data-touch-button="menu"]').click();
    expect(await screen(page)).toBe('title');
    expect(errors).toEqual([]);
  });

  test('credits show the homage notice; level select lists Fun 1', async ({ page }) => {
    const errors = await openGame(page);
    await clickMenu(page, 'credits');
    expect(await screen(page)).toBe('credits');
    await clickMenu(page, 'back');
    await clickMenu(page, 'levels');
    expect(await screen(page)).toBe('levels');
    await clickMenu(page, 'level:fun-01');
    expect(await screen(page)).toBe('preview');
    expect(errors).toEqual([]);
  });

  test('title and credits show the running version from package.json (M6.145)', async ({ page }) => {
    const errors = await openGame(page);
    const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    expect(await appVersion(page)).toBe(version);
    await clickMenu(page, 'credits');
    expect(await screen(page)).toBe('credits');
    expect(errors).toEqual([]);
  });
});
