import {
  resolveWlToken, wlContrastPairs, wlDesignThemes, wlDesignTokens,
  type WlDesignTokenName, type WlDesignTokenDefinition
} from "../../../../packages/ui-kit/src/design-system";
import type { WlThemeName } from "../../../../packages/ui-kit/src/types";

export const THEME_DRAFT_SCHEMA_VERSION = 1 as const;

export const themePaletteFields = [
  { key: "background", label: "Основной фон", description: "Поверхность страницы." },
  { key: "surface", label: "Карточки и панели", description: "Карточки и поднятые поверхности." },
  { key: "softSurface", label: "Мягкая поверхность", description: "Фон групп и мягких состояний, например hover и disabled." },
  { key: "text", label: "Основной текст", description: "Заголовки и основной текст интерфейса." },
  { key: "mutedText", label: "Вспомогательный текст", description: "Подписи, пояснения и placeholder." },
  { key: "border", label: "Границы", description: "Рамки полей, карточек и разделители." },
  { key: "primary", label: "Основное действие", description: "Фон основной кнопки; текст, hover и active подбираются автоматически." },
  { key: "link", label: "Ссылки и фокус", description: "Ссылки, выделение выбора и клавиатурный фокус." }
] as const;

export type ThemePaletteKey = (typeof themePaletteFields)[number]["key"];
export type ThemePalette = Record<ThemePaletteKey, string>;
export type ThemeOverrides = Partial<Record<WlDesignTokenName, string>>;
export interface ThemeContrast {
  key: string;
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  minimum: number;
  passes: boolean;
}
export interface ThemeDraft {
  name: string;
  baseTheme: WlThemeName;
  palette: ThemePalette;
}
export interface ThemeSpec extends ThemeDraft {
  schemaVersion: typeof THEME_DRAFT_SCHEMA_VERSION;
  colorScheme: "light" | "dark";
  overrides: ThemeOverrides;
  semanticBindings: ThemeOverrides;
}
export interface ThemeExport {
  spec: ThemeSpec;
  json: string;
  css: string;
  prompt: string;
}

const fieldTokens: Record<ThemePaletteKey, WlDesignTokenName> = {
  background: "--wl-bg",
  surface: "--wl-bg-raised",
  softSurface: "--wl-bg-soft",
  text: "--wl-text",
  mutedText: "--wl-text-muted",
  border: "--wl-border",
  primary: "--wl-action-primary-bg",
  link: "--wl-accent"
};
const foundationFields: Record<Exclude<ThemePaletteKey, "primary">, WlDesignTokenName> = {
  background: "--wl-palette-bg",
  surface: "--wl-palette-bg-raised",
  softSurface: "--wl-palette-bg-soft",
  text: "--wl-palette-text",
  mutedText: "--wl-palette-text-2",
  border: "--wl-palette-border",
  link: "--wl-palette-accent"
};
const primaryBindings: ThemeOverrides = {
  "--wl-action-primary-bg": "var(--wl-palette-action-primary-bg)",
  "--wl-action-primary-hover": "var(--wl-palette-action-primary-hover)",
  "--wl-action-primary-active": "var(--wl-palette-action-primary-active)",
  "--wl-action-primary-text": "var(--wl-palette-action-primary-text)"
};
const definitions = new Map<WlDesignTokenName, WlDesignTokenDefinition>(wlDesignTokens.map((token) => [token.name, token]));

function getBaseTheme(baseTheme: WlThemeName) {
  const theme = wlDesignThemes.find((item) => item.name === baseTheme);
  if (!theme) throw new Error("Неизвестная базовая тема.");
  return theme;
}

/** Only opaque RGB hexadecimal values enter the generated style and export. */
export function normalizeHex(value: string): string | null {
  const input = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(input)) return input;
  if (/^#[0-9a-f]{3}$/.test(input)) {
    return "#" + input.slice(1).split("").map((character) => character + character).join("");
  }
  return null;
}

function normalizedPalette(palette: ThemePalette): ThemePalette {
  return Object.fromEntries(themePaletteFields.map(({ key }) => {
    const value = typeof palette[key] === "string" ? normalizeHex(palette[key]) : null;
    if (!value) throw new Error(`Некорректный цвет: ${key}.`);
    return [key, value];
  })) as ThemePalette;
}

export function createThemePalette(baseTheme: WlThemeName): ThemePalette {
  getBaseTheme(baseTheme);
  return Object.fromEntries(themePaletteFields.map(({ key }) => [
    key, resolveWlToken(fieldTokens[key], baseTheme)
  ])) as ThemePalette;
}

function channels(color: string): [number, number, number] {
  return [1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16)) as [number, number, number];
}
function luminance(color: string): number {
  const linear = channels(color).map((value) => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}
export function getContrastRatio(foreground: string, background: string): number {
  const fg = normalizeHex(foreground);
  const bg = normalizeHex(background);
  if (!fg || !bg) throw new Error("Контраст доступен для цветов #rgb и #rrggbb.");
  const first = luminance(fg);
  const second = luminance(bg);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
function mix(color: string, target: string, weight: number): string {
  const from = channels(color);
  const to = channels(target);
  return "#" + from.map((channel, index) => Math.round(
    channel * (1 - weight) + to[index]! * weight
  ).toString(16).padStart(2, "0")).join("");
}
function readableForeground(background: string): string {
  if (getContrastRatio("#211a12", background) >= 4.5) return "#211a12";
  return getContrastRatio("#ffffff", background) >= getContrastRatio("#000000", background)
    ? "#ffffff" : "#000000";
}
function primaryState(color: string, weight: number): string {
  // Move toward the side which strengthens the chosen foreground contrast.
  const foreground = readableForeground(color);
  return mix(color, foreground === "#ffffff" ? "#000000" : "#ffffff", weight);
}

/**
 * Foundation deltas for a scope carrying data-wl-theme=<base>.
 * Named theme CSS redeclares aliases on that scope, including portal roots.
 * The four action bindings allow primary and links to vary independently.
 */
export function createThemeOverrides(input: ThemePalette, baseTheme: WlThemeName): ThemeOverrides {
  const palette = normalizedPalette(input);
  const baseline = createThemePalette(baseTheme);
  const changed = (key: ThemePaletteKey) => palette[key] !== baseline[key];
  const overrides: ThemeOverrides = {};
  for (const key of Object.keys(foundationFields) as (keyof typeof foundationFields)[]) {
    if (changed(key)) overrides[foundationFields[key]] = palette[key];
  }
  if (changed("background") && !changed("surface")) {
    // White/Graphite/Newspaper raised surfaces otherwise follow the page alias.
    overrides["--wl-palette-bg-raised"] = palette.surface;
  }
  if (changed("background") || changed("softSurface")) {
    overrides["--wl-palette-bg-hover"] = mix(palette.softSurface, palette.text, 0.04);
  }
  if (changed("border")) {
    overrides["--wl-palette-border-2"] = mix(palette.border, palette.text, 0.16);
  }
  if (changed("mutedText")) {
    overrides["--wl-palette-text-3"] = mix(palette.mutedText, palette.background, 0.25);
  }
  if (changed("link")) {
    overrides["--wl-palette-text-accent"] = palette.link;
    overrides["--wl-palette-accent-hover"] = mix(palette.link, palette.text, 0.1);
    overrides["--wl-palette-on-accent"] = readableForeground(palette.link);
  }
  if (changed("primary") || changed("link")) {
    Object.assign(overrides, primaryBindings);
    overrides["--wl-palette-action-primary-bg"] = palette.primary;
    overrides["--wl-palette-action-primary-hover"] = changed("primary")
      ? primaryState(palette.primary, 0.08) : resolveWlToken("--wl-action-primary-hover", baseTheme);
    overrides["--wl-palette-action-primary-active"] = changed("primary")
      ? primaryState(palette.primary, 0.16) : resolveWlToken("--wl-action-primary-active", baseTheme);
    overrides["--wl-palette-action-primary-text"] = changed("primary")
      ? readableForeground(palette.primary) : resolveWlToken("--wl-action-primary-text", baseTheme);
  }
  if (changed("primary") || changed("link") || changed("background") || changed("surface")) {
    const dark = getBaseTheme(baseTheme).colorScheme === "dark";
    overrides["--wl-palette-accent-soft"] = mix(palette.surface, palette.primary, dark ? 0.18 : 0.12);
    overrides["--wl-palette-accent-soft-hover"] = mix(palette.surface, palette.primary, dark ? 0.25 : 0.19);
    overrides["--wl-palette-accent-border"] = mix(palette.surface, palette.primary, 0.34);
    overrides["--wl-palette-accent-border-hover"] = mix(palette.surface, palette.primary, 0.46);
  }
  return overrides;
}

function resolveWithOverrides(name: WlDesignTokenName, baseTheme: WlThemeName, overrides: ThemeOverrides): string {
  function resolve(reference: WlDesignTokenName, trail: WlDesignTokenName[]): string {
    if (trail.includes(reference)) throw new Error("Цикл в токенах темы.");
    const token = definitions.get(reference);
    if (!token) throw new Error(`Неизвестный токен: ${reference}.`);
    const value = overrides[reference] ?? token.themes?.[baseTheme] ?? token.value;
    return value.replace(/var\((--wl-[a-z0-9-]+)\)/g, (_, dependency: WlDesignTokenName) =>
      resolve(dependency, [...trail, reference]));
  }
  return resolve(name, []);
}

export function getThemeContrast(palette: ThemePalette, baseTheme: WlThemeName): ThemeContrast[] {
  const overrides = createThemeOverrides(palette, baseTheme);
  const rows: Omit<ThemeContrast, "ratio" | "passes">[] = wlContrastPairs.map((pair) => ({
    key: pair.name,
    label: pair.label,
    foreground: resolveWithOverrides(pair.foreground, baseTheme, overrides),
    background: resolveWithOverrides(pair.background, baseTheme, overrides),
    minimum: pair.minimum
  }));
  rows.push({
    key: "checked",
    label: "Отметка выбора на акценте",
    foreground: resolveWithOverrides("--wl-on-accent", baseTheme, overrides),
    background: resolveWithOverrides("--wl-accent", baseTheme, overrides),
    minimum: 3
  });
  return rows.map((row) => {
    const ratio = getContrastRatio(row.foreground, row.background);
    return { ...row, ratio, passes: ratio >= row.minimum };
  });
}

export function isThemeNameValid(name: string): boolean {
  return /^[a-z][a-z0-9-]{0,31}$/.test(name) && !wlDesignThemes.some((theme) => theme.name === name);
}

export function parseThemeDraft(value: unknown): ThemeDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const draft = value as Record<string, unknown>;
  if (draft.schemaVersion !== THEME_DRAFT_SCHEMA_VERSION || typeof draft.name !== "string"
    || !isThemeNameValid(draft.name) || !wlDesignThemes.some((theme) => theme.name === draft.baseTheme)
    || !draft.palette || typeof draft.palette !== "object" || Array.isArray(draft.palette)) return null;
  try {
    return {
      name: draft.name,
      baseTheme: draft.baseTheme as WlThemeName,
      palette: normalizedPalette(draft.palette as ThemePalette)
    };
  } catch {
    return null;
  }
}

export function createThemeExport(name: string, baseTheme: WlThemeName, palette: ThemePalette): ThemeExport {
  if (!isThemeNameValid(name)) throw new Error("Название темы: 1–32 латинских символа, цифры и дефисы; имя существующей темы занято.");
  const theme = getBaseTheme(baseTheme);
  const values = normalizedPalette(palette);
  const delta = createThemeOverrides(values, baseTheme);
  const overrides: ThemeOverrides = {};
  const semanticBindings: ThemeOverrides = {};
  for (const [key, value] of Object.entries(delta)) {
    const tokenName = key as WlDesignTokenName;
    const token = definitions.get(tokenName)!;
    (token.layer === "foundation" ? overrides : semanticBindings)[tokenName] = value;
  }
  const spec: ThemeSpec = {
    schemaVersion: THEME_DRAFT_SCHEMA_VERSION, name, baseTheme,
    colorScheme: theme.colorScheme, palette: values, overrides, semanticBindings
  };
  const json = JSON.stringify(spec, null, 2);
  const selector = `[data-wl-theme="${name}"]`;
  const declarations = wlDesignTokens.map((token) =>
    `    ${token.name}: ${delta[token.name] ?? definitions.get(token.name)!.themes?.[baseTheme] ?? token.value};`);
  const css = [
    "/* Gavia UI: load after base.css and the shipped theme styles. */",
    "@layer wl.tokens {",
    `  ${selector} {`,
    `    color-scheme: ${theme.colorScheme};`,
    ...declarations,
    "  }",
    "  @media (prefers-reduced-motion: reduce) {",
    `    ${selector} {`,
    ...wlDesignTokens.filter((token) => /^--wl-dur-[1-5]$/.test(token.name))
      .map((token) => `      ${token.name}: 0.01ms;`),
    "    }",
    "  }",
    "}",
    ""
  ].join("\n");
  const prompt = [
    `Создай тему Gavia UI «${name}» на основе «${baseTheme}» по спецификации ниже.`,
    "Источник: packages/ui-kit/tokens/source.json. Добавь тему с указанным colorScheme в themes и контракт WlThemeName.",
    "Для каждого токена сначала скопируй его themes[baseTheme] ?? value в themes[name]; это сохраняет полный снимок основы, включая семантические отличия.",
    "Затем применяй overrides только к foundation-токенам и semanticBindings только к указанным семантическим ролям основного действия.",
    "Не меняй существующие темы, имена Wl* и --wl-*. Не подменяй выбранные background/primary/link автоматически.",
    "Запусти pnpm tokens:sync и pnpm tokens:check. Проверь контраст и показ компонентов с data-wl-theme нового имени, включая портал Select.",
    "CSS для быстрого просмотра содержит полный снимок базы, а JSON ниже — переносимые изменения источника.",
    "Спецификация JSON:",
    json
  ].join("\n\n");
  return { spec, json, css, prompt };
}
