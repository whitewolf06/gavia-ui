import type { wlDesignTokens } from "../../../../../packages/ui-kit/src";

import type { DocumentationAssetSection } from "../../navigation";
export type { DocumentationAssetSection } from "../../navigation";
export interface DocumentationAssetHeading { id: string; title: string; }
export interface DocumentationAssetPage {
  label: string;
  description: string;
  headings: readonly DocumentationAssetHeading[];
}
export const iconDocumentationHeadings = {
  playground: { id: "docs-icons-playground", title: "Имя и размеры" },
  catalog: { id: "docs-icons-catalog", title: "Каталог иконок" },
  accessibility: { id: "docs-icons-accessibility", title: "Иконки и доступность" },
  compatibility: { id: "docs-icons-compatibility", title: "CSS-размер, синонимы и fallback" },
  pipeline: { id: "docs-icons-pipeline", title: "Добавление SVG" }
} as const;
export const colorDocumentationHeadings = {
  themes: { id: "docs-colors-themes", title: "Темы" },
  setup: { id: "docs-colors-setup", title: "Подключение CSS" },
  surfaces: { id: "docs-colors-surfaces", title: "Поверхности" },
  text: { id: "docs-colors-text", title: "Текст" },
  accent: { id: "docs-colors-accent", title: "Акцент" },
  status: { id: "docs-colors-status", title: "Статусы" },
  borders: { id: "docs-colors-borders", title: "Границы и фокус" },
  examples: { id: "docs-colors-examples", title: "Цвет в интерфейсе" }
} as const;
export const documentationAssetPages: Record<DocumentationAssetSection, DocumentationAssetPage> = {
  icons: {
    label: "Иконки",
    description: "Встроенный SVG-каталог, выбор имени и размера, наследование currentColor и доступные действия. Иконки используют единый реестр Gavia UI.",
    headings: Object.values(iconDocumentationHeadings)
  },
  colors: {
    label: "Цвета и темы",
    description: "Поверхности, текст, акценты и состояния строятся на semantic токенах. Смена темы меняет значения; контракты компонентов и смысл интерфейса сохраняются.",
    headings: Object.values(colorDocumentationHeadings)
  }
};
export const documentationAssets = (["icons", "colors"] as const)
  .map((key) => ({ key, ...documentationAssetPages[key] }));

type SemanticColorName = Extract<(typeof wlDesignTokens)[number], { layer: "semantic"; type: "color" }>["name"];

export interface DocumentationColorGroup {
  key: keyof Pick<typeof colorDocumentationHeadings, "surfaces" | "text" | "accent" | "status" | "borders">;
  description: string;
  tokens: readonly SemanticColorName[];
}
/** Named semantic roles, resolved from the canonical catalogue rather than copied colours. */
export const documentationColorGroups: readonly DocumentationColorGroup[] = [
  {
    key: "surfaces",
    description: "Основная и вторичная поверхности, hover и специализированные фоны. Текст размещайте с подходящей foreground-ролью.",
    tokens: ["--wl-bg", "--wl-bg-soft", "--wl-bg-hover", "--wl-mask-bg", "--wl-avatar-bg", "--wl-tooltip-bg"]
  },
  {
    key: "text",
    description: "Основной текст, пояснения, менее заметные подписи, ошибки и текст tooltip. Снижение внимания не должно скрывать обязательную инструкцию.",
    tokens: ["--wl-text", "--wl-text-2", "--wl-text-3", "--wl-text-muted", "--wl-text-danger", "--wl-tooltip-text"]
  },
  {
    key: "accent",
    description: "Акцент действия и его состояния. Мягкая поверхность и границы поддерживают выделение без сплошной заливки.",
    tokens: ["--wl-accent", "--wl-accent-hover", "--wl-accent-soft", "--wl-accent-soft-hover", "--wl-accent-border", "--wl-accent-border-hover"]
  },
  {
    key: "status",
    description: "Успех, предупреждение и ошибка сопровождаются понятным текстом. Мягкие поверхности, границы и foreground роли выбираются вместе.",
    tokens: ["--wl-success", "--wl-success-soft", "--wl-success-border", "--wl-warn", "--wl-warn-soft", "--wl-warn-border", "--wl-danger", "--wl-danger-hover", "--wl-danger-soft", "--wl-danger-soft-hover", "--wl-danger-border", "--wl-info-text", "--wl-ok-text", "--wl-warn-text", "--wl-err-text"]
  },
  {
    key: "borders",
    description: "Обычная и усиленная граница разделяют поверхности. Видимый фокус показывает положение клавиатуры и сохраняется в каждой теме.",
    tokens: ["--wl-border", "--wl-border-2", "--wl-focus-color", "--wl-focus-invalid-color"]
  }
];
