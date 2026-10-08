import type { DocumentationHeading } from "../catalog";
import type { WlTableColumn, WlTableRow } from "../../../../../packages/ui-kit/src";

export const qualityDocumentationHeadings = {
  measurement: { id: "docs-quality-measurement", title: "Покрытие unit-тестами" },
  checks: { id: "docs-quality-checks", title: "Что проверяется" },
  environment: { id: "docs-quality-environment", title: "Браузеры и Vue" },
  accessibility: { id: "docs-quality-accessibility", title: "Доступность и SSR" },
  versions: { id: "docs-quality-versions", title: "Версии и совместимость" }
} as const satisfies Record<string, DocumentationHeading>;

export const documentationQualityPage = {
  key: "quality",
  label: "Качество и совместимость",
  description: "Покрытие unit-тестами, состав проверок и правила совместимости Gavia UI.",
  headings: Object.values(qualityDocumentationHeadings)
} as const;

export const qualityCheckColumns: WlTableColumn[] = [
  { key: "name", label: "Проверка", width: "30%" },
  { key: "scope", label: "Что она проверяет" }
];
export const qualityCheckRows: WlTableRow[] = [
  { name: "Vitest + Vue Test Utils", scope: "Контракты компонентов, состояния, события, утилиты и ветки поведения. Проценты выше относятся к этим unit-тестам." },
  { name: "Playwright", scope: "Взаимодействия, клавиатура, фокус и оверлеи в Chromium, Firefox, WebKit и мобильном Chromium." },
  { name: "Визуальные эталоны", scope: "Desktop и mobile в Gavia, Gavia Dark, Classic, Classic Dark и Newspaper. Для Gavia и Gavia Dark загружается Gavia Sans; классические эталоны используют Arial/Consolas." },
  { name: "Axe", scope: "Видимые страницы и открытые списки/диалоги в пяти темах, правила WCAG 2.2 AA в Chromium. Клавиатурные сценарии проверяются отдельно." },
  { name: "Публичный контракт", scope: "Declarations и прежний Vue-потребитель сравниваются с сохранённым снимком: удаления и сужение контракта останавливают проверку." },
  { name: "Архив пакета", scope: "Собранный tarball: ESM-import, типы, SFC из примеров, SSR и гидратация, файлы и лицензии, размер приложения с одной кнопкой." }
];
export const qualityEnvironmentColumns: WlTableColumn[] = [
  { key: "name", label: "Окружение", width: "38%" },
  { key: "scope", label: "Целевой диапазон" }
];
export const qualityEnvironmentRows: WlTableRow[] = [
  { name: "Chrome / Edge", scope: "111+; соответствующие Android Chromium" },
  { name: "Firefox", scope: "121+; соответствующие Android Firefox" },
  { name: "Safari / iOS Safari", scope: "16.4+" },
  { name: "Vue", scope: "3.4+; Vue остаётся единственным обязательным peer" }
];
