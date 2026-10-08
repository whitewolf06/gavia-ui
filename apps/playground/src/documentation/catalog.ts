import type { DocumentationFoundationSection } from "../navigation";
import type { WlManifestCategory, WlPropManifest } from "../../../../packages/ui-kit/src/manifest";

export const documentationCategories: readonly { key: WlManifestCategory; label: string }[] = [
  { key: "actions", label: "Действия" },
  { key: "inputs", label: "Ввод данных" },
  { key: "data", label: "Данные" },
  { key: "containers", label: "Контейнеры" },
  { key: "composites", label: "Составные элементы" },
  { key: "navigation", label: "Навигация" },
  { key: "feedback", label: "Обратная связь" },
  { key: "misc", label: "Дополнительно" }
];

export function propType(prop: WlPropManifest): string {
  return prop.values?.length ? prop.values.map((value) => JSON.stringify(value)).join(" | ") : prop.type;
}

export function propDefault(prop: WlPropManifest): string {
  return prop.default === undefined ? "—" : JSON.stringify(prop.default) ?? "—";
}

export interface DocumentationPtSection {
  name: string;
  element: string;
  description: string;
}

/** The three named sections applied by WlButton.vue through useWlPt("button"). */
export const buttonPtSections: readonly DocumentationPtSection[] = [
  { name: "root", element: "button", description: "Атрибуты корневой кнопки, дополнительные class и style." },
  { name: "label", element: "span.wl-btn__label", description: "Обёртка default-слота; существует, когда передано содержимое." },
  { name: "loadingIcon", element: "span.wl-btn__spinner", description: "Спиннер при loading; скрыт от вспомогательных технологий." }
];

export const installationCommand = "pnpm add gavia-ui vue";
export const installationSource = [
  'import { createApp } from "vue";',
  'import "gavia-ui/styles/reset.css";',
  'import "gavia-ui/styles/base.css";',
  'import "gavia-ui/styles/primitives.css";',
  'import "gavia-ui/themes/white.css";',
  'import App from "./App.vue";',
  "",
  'document.documentElement.dataset.wlTheme = "white";',
  'createApp(App).mount("#app");'
].join("\n");

export interface DocumentationHeading { id: string; title: string; }
export interface DocumentationExampleHeading extends DocumentationHeading { name: string; description: string; }
export interface DocumentationFoundation {
  label: string;
  description: string;
  rulesHeading: DocumentationHeading;
  rules: readonly string[];
  examples: readonly DocumentationExampleHeading[];
  breakpointsHeading?: DocumentationHeading;
  layersHeading?: DocumentationHeading;
  additionalHeadings?: readonly DocumentationHeading[];
  continueHeading: DocumentationHeading;
}

export const documentationOverviewHeadings = [
  { id: "docs-install", title: "Установка" },
  { id: "docs-foundations", title: "Основы интерфейса" },
  { id: "docs-components", title: "От контракта к рабочему коду" },
  { id: "docs-tokens", title: "Токены и темы" },
  { id: "docs-icons", title: "Иконки" },
  { id: "docs-migration", title: "Миграция" }
] as const satisfies readonly DocumentationHeading[];

export type ButtonDocumentationTab = "examples" | "api" | "accessibility";
export const buttonDocumentationHeadings = {
  controls: { id: "docs-button-controls-title", title: "Настройки", tab: "examples" },
  preview: { id: "docs-button-preview-title", title: "Живой пример", tab: "examples" },
  source: { id: "docs-button-source-title", title: "Код для приложения", tab: "examples" },
  usage: { id: "docs-button-usage", title: "Когда использовать", tab: "examples" },
  props: { id: "docs-button-props", title: "Props", tab: "api" },
  events: { id: "docs-button-events", title: "События", tab: "api" },
  slots: { id: "docs-button-slots", title: "Слоты", tab: "api" },
  pt: { id: "docs-button-pt", title: "Pass-through: pt", tab: "api" },
  accessibility: { id: "docs-button-accessibility", title: "Клавиатура и состояния", tab: "accessibility" }
} as const satisfies Record<string, DocumentationHeading & { tab: ButtonDocumentationTab }>;
export const buttonDocumentationToc = Object.values(buttonDocumentationHeadings);
export const buttonContractAnchors = {
  props: buttonDocumentationHeadings.props.id,
  events: buttonDocumentationHeadings.events.id,
  slots: buttonDocumentationHeadings.slots.id,
  pt: buttonDocumentationHeadings.pt.id
};

export const documentationFoundationPages: Record<DocumentationFoundationSection, DocumentationFoundation> = {
  typography: {
    label: "Типографика",
    description: "Роли текста создают иерархию страницы. HTML задаёт структуру, CSS-класс — внешний вид; семейства шрифтов и размеры наследуются из темы.",
    rulesHeading: { id: "docs-typography-rules", title: "Практические правила" },
    rules: [
      "Один заголовок страницы; уровни h1–h6 следуют структуре документа. Выбирайте роль текста отдельно от HTML-тега.",
      "Body — основной текст; small + text-muted — пояснения. Обязательная инструкция должна оставаться читаемой на своей поверхности.",
      "Ограничивайте длинную строку примерно 60–75 символами. На небольшом экране переносите текст и выбирайте title вместо display при необходимости.",
      "Label подписывает действие или поле; code показывает идентификатор или фрагмент кода. Не заменяйте подпись placeholder.",
      "Используйте шрифты темы. Gavia, Gavia Dark, Classic, Classic Dark и Newspaper меняют токены без копирования компонентов."
    ],
    examples: [
      { name: "typography-scale", id: "docs-typography-scale", title: "Роли текста", description: "Все восемь ролей используют реальные классы wl-text-* и текущую тему." },
      { name: "text-hierarchy", id: "docs-text-hierarchy", title: "Заголовки, основной текст и пояснения", description: "Иерархия статьи, короткой инструкции и пар «название — значение». HTML-уровни выбирайте по контексту страницы." }
    ],
    continueHeading: { id: "docs-typography-next", title: "Продолжить" }
  },
  layout: {
    label: "Layout и сетка",
    description: "Начните с ширины страницы, затем выберите колонки, промежутки и точки перестройки. CSS helpers задают основу, локальный CSS уточняет композицию конкретного экрана.",
    rulesHeading: { id: "docs-layout-rules", title: "Как устроена компоновка" },
    rules: [
      "wl-container центрирует страницу и задаёт gutter. Модификаторы narrow, fluid и full подходят для чтения, широкой рабочей области и секций до края.",
      "wl-grid использует CSS Grid: repeat(auto-fit, minmax(min(100%, var(--wl-layout-grid-min)), 1fr)). Минимум колонки по умолчанию 240 px; число колонок зависит от ширины самого контейнера.",
      "auto-fit делит доступное место между занятыми колонками одинаково. Для заданной пропорции используйте локальный grid-template-columns; для 12 долей — локальные grid-column: span N.",
      "data-space меняет gap у stack, inline и grid. Gap разделяет соседей; padding отделяет содержимое от границы; margin связывает блок с окружением.",
      "Медиаусловия реагируют на ширину viewport. Проверяйте результат внутри sidebar и вложенных карточек: узкому контейнеру могут понадобиться другие условия или auto-fit.",
      "Сохраняйте порядок DOM при адаптации. minmax(0, 1fr), min-width: 0 и перенос длинного текста предотвращают переполнение; широкие таблицы помещайте в именованную прокручиваемую область.",
      "z-index действует внутри stacking context. Берите уровень из --wl-layer-*, ограничивайте локальную композицию wl-isolate и проверяйте, не создают ли предки transform, opacity или isolation."
    ],
    examples: [
      { name: "containers", id: "docs-layout-containers", title: "Контейнеры и ширина страницы", description: "Четыре варианта wl-container: ограниченная страница, узкая колонка чтения, fluid с gutter и full до края. Полосы показывают фактические боковые отступы." },
      { name: "equal-columns", id: "docs-layout-equal-columns", title: "Равные колонки: auto-fit", description: "Базовый wl-grid сам выбирает количество равных колонок с минимумом --wl-layout-grid-min. Измените ширину окна: карточки перестроятся без JavaScript и media queries." },
      { name: "column-proportions", id: "docs-layout-column-proportions", title: "Пропорции и 12 долей", description: "Локальная сетка из 12 долей даёт пары 8 + 4 и 6 + 6. На узком экране блоки занимают все 12 долей. Классы примера принадлежат приложению." },
      { name: "responsive-grid", id: "docs-layout-responsive-grid", title: "Адаптация по viewport", description: "Локальный CSS уточняет wl-grid: одна колонка, две от sm 640 px и три от md 900 px. Действия wl-inline переносятся, выбор карточки меняет локальный статус." },
      { name: "gap-alignment", id: "docs-layout-gap-alignment", title: "Промежутки и выравнивание", description: "data-space задаёт gap между карточками; align-items выравнивает их по началу, центру или растягивает. Настройки меняют живую компоновку." },
      { name: "nested-grid", id: "docs-layout-nested-grid", title: "Вложенная сетка", description: "Внешняя сетка размещает разделы, внутренняя — элементы одного раздела. Каждая wl-grid считает колонки по собственной доступной ширине и использует свой data-space." },
      { name: "page-composition", id: "docs-layout-page-composition", title: "Sidebar и основная область", description: "Локальная сетка sidebar + minmax(0, 1fr) собирает рабочую страницу; ниже md области идут одной колонкой в исходном порядке DOM." },
      { name: "spacing", id: "docs-layout-spacing", title: "Шкала отступов", description: "Роли из wlSpacing: ширина полосы задаётся настоящим CSS-токеном и наследует тему. Используйте одну шкалу для gap, padding и margin." },
      { name: "css-helpers", id: "docs-layout-css-helpers", title: "Поверхности, разделители и прокрутка", description: "wl-surface группирует содержимое, wl-rule разделяет части, wl-scroll-area ограничивает широкую таблицу. Прокручиваемый регион получает имя и фокус с клавиатуры." },
      { name: "stacking-layers", id: "docs-layout-stacking-layers", title: "Локальная композиция слоёв", description: "wl-isolate ограничивает stacking context этой иллюстрацией. Слои base, sticky и popover используют реальные токены; перекрытие не затрагивает страницу." }
    ],
    breakpointsHeading: { id: "docs-layout-breakpoints", title: "Границы для адаптации" },
    layersHeading: { id: "docs-layout-layers", title: "Слои и z-index" },
    continueHeading: { id: "docs-layout-next", title: "Продолжить" }
  },
  responsive: {
    label: "Адаптивность",
    description: "Выбирайте перестройку по месту для содержимого: ширина окна, ширина контейнера и изменение поведения решают разные задачи. Четыре рабочих примера показывают каждую границу настройки.",
    rulesHeading: { id: "docs-responsive-rules", title: "Как выбирать условие" },
    rules: [
      "Начинайте с узкого экрана: одна колонка, перенос действий и сохранение порядка DOM. Добавляйте пространство, когда содержимому становится тесно.",
      "Media queries описывают viewport. Auto-fit и container queries подходят для карточки, которая может оказаться в sidebar или в широкой области.",
      "JavaScript нужен, если меняется поведение, а не только положение элементов. CSS и matchMedia должны использовать одну числовую границу.",
      "Не скрывайте обязательное поле, сообщение об ошибке или основное действие. Длинный текст, увеличение масштаба и клавиатура входят в проверку."
    ],
    breakpointsHeading: { id: "docs-responsive-breakpoints", title: "Брейкпоинты Gavia UI" },
    examples: [
      { name: "responsive-viewport", id: "docs-responsive-viewport", title: "Mobile-first: ширина окна", description: "Одна колонка без условий; две от sm, три от md и четыре от lg. Подпись текущей ступени тоже управляется CSS, без слушателя resize." },
      { name: "responsive-fluid", id: "docs-responsive-fluid", title: "Auto-fit и локальные токены", description: "Измените минимум колонки, промежуток и gutter. Сетка перестроится по месту внутри родителя, не меняя брейкпоинты приложения." },
      { name: "responsive-container", id: "docs-responsive-container", title: "Container queries: место для карточки", description: "Выберите ширину контейнера. Структура дочерней карточки меняется от 420 px, заголовок — от 560 px; размер окна остаётся прежним." },
      { name: "responsive-behavior", id: "docs-responsive-behavior", title: "MatchMedia: изменение поведения", description: "От md фильтр виден сразу, ниже md раскрывается кнопкой. Модель сохраняется, подписка обновляется при смене условия и удаляется при размонтировании." }
    ],
    additionalHeadings: [
      { id: "docs-responsive-overrides", title: "Как переопределять" },
      { id: "docs-responsive-components", title: "Границы готовых компонентов" },
      { id: "docs-responsive-checks", title: "Что проверять" }
    ],
    continueHeading: { id: "docs-responsive-next", title: "Продолжить" }
  },
  content: {
    label: "Content и тексты",
    description: "Подписи, списки и состояния объясняют, что происходит и что делать дальше. Смысл передаётся текстом вместе с визуальным состоянием.",
    rulesHeading: { id: "docs-content-rules", title: "Практические правила" },
    rules: [
      "Начинайте подпись действия с глагола и уточняйте объект: «Сохранить материал», «Повторить», «Добавить проект».",
      "Используйте ol для шагов с порядком, ul для независимых пунктов и dl для пар «название — значение».",
      "Подпись поля видима всегда. Подсказка дополняет её, placeholder показывает пример. Ошибка объясняет следующий шаг и связана с контролом.",
      "Предусмотрите ready, loading, empty и error. Пустой результат и ошибка — разные ситуации; каждому нужен понятный следующий шаг.",
      "Сохраняйте введённые данные при ошибке, объясняйте отмену и результат действия. Загрузка блокирует повторное действие и сообщает aria-busy."
    ],
    examples: [
      { name: "content-writing", id: "docs-content-writing", title: "Подписи, списки и результат действия", description: "Шаги, независимые пункты, видимая подпись поля, связанная ошибка и отмена. Сохранение работает локально." },
      { name: "content-states", id: "docs-content-states", title: "Готово, загрузка, пусто и ошибка", description: "Переключите состояние, добавьте пример или повторите действие. Готовые компоненты сохраняют понятный текст и следующий шаг." }
    ],
    continueHeading: { id: "docs-content-next", title: "Продолжить" }
  }
};

export function foundationHeadings(section: DocumentationFoundationSection): readonly DocumentationHeading[] {
  const page = documentationFoundationPages[section];
  return [page.rulesHeading, ...(page.breakpointsHeading ? [page.breakpointsHeading] : []), ...page.examples,
    ...(page.additionalHeadings ?? []), ...(page.layersHeading ? [page.layersHeading] : []), page.continueHeading];
}
export const documentationFoundations = (["typography", "layout", "responsive", "content"] as const)
  .map((key) => ({ key, ...documentationFoundationPages[key] }));
