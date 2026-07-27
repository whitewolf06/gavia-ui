<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import {
  WlAccordion,
  WlAlert,
  WlAutocomplete,
  WlAvatar,
  WlBadge,
  WlBreadcrumbs,
  WlButton,
  WlButtonGroup,
  WlCalendar,
  WlCard,
  WlCheckbox,
  WlChip,
  WlColorPicker,
  WlCommandPalette,
  WlConfirmDialog,
  WlDatePicker,
  WlDialog,
  WlDivider,
  WlDrawer,
  WlEmpty,
  WlField,
  WlFileUpload,
  WlIcon,
  WlIconButton,
  WlInput,
  WlMenu,
  WlMultiSelect,
  WlNavItem,
  WlNumberInput,
  WlPagination,
  WlPasswordInput,
  WlPill,
  WlPopover,
  WlProgress,
  WlRadio,
  WlSegmented,
  WlSelect,
  WlSidebar,
  WlSkeleton,
  WlSlider,
  WlSpinner,
  WlStatCard,
  WlSteps,
  WlSwitch,
  WlTable,
  WlTabs,
  WlTag,
  WlTextarea,
  WlToast,
  WlTooltip,
  useWlConfirm,
  useWlToast,
  wlManifest
} from "@whitelife-core/ui-kit";
import type {
  WlAccordionItem,
  WlBreadcrumbItem,
  WlCalendarEvent,
  WlCommandPaletteGroup,
  WlCommandPaletteItem,
  WlFileReject,
  WlMenuItem,
  WlPillVariant,
  WlSegmentedOption,
  WlSidebarGroup,
  WlSidebarItem,
  WlStepItem,
  WlTabItem,
  WlTableColumn,
  WlTableRow,
  WlTagVariant,
  WlThemeName,
  WlManifestCategory
} from "@whitelife-core/ui-kit";

const vWlTooltip = WlTooltip;

const manifestCategories = [
  { id: "actions", label: "Действия" },
  { id: "inputs", label: "Ввод" },
  { id: "data", label: "Данные" },
  { id: "containers", label: "Контейнеры" },
  { id: "composites", label: "Композитные" },
  { id: "navigation", label: "Навигация" },
  { id: "feedback", label: "Обратная связь" },
  { id: "misc", label: "Прочее" }
] as const satisfies ReadonlyArray<{ id: WlManifestCategory; label: string }>;

const manifestGroups = manifestCategories.map((category) => ({
  ...category,
  entries: wlManifest.filter((entry) => entry.category === category.id)
}));

const commandPaletteVisible = ref(false);
const commandPaletteQuery = ref("");
const sidebarActive = ref("today");
const sidebarPinned = ref(false);
const sidebarMobileOpen = ref(false);

const sidebarGroups: WlSidebarGroup[] = [
  {
    id: "main",
    items: [
      { key: "today", label: "Сегодня", icon: "home" },
      { key: "notes", label: "Заметки", icon: "note", badge: 24 },
      { key: "tasks", label: "Задачи", icon: "task", badge: 5 },
      { key: "calendar", label: "Календарь", icon: "calendar" },
      { key: "time", label: "Время", icon: "clock" },
      { key: "media", label: "Медиа", icon: "image" },
      { key: "timeline", label: "Хроника", icon: "activity" }
    ]
  },
  {
    id: "tools",
    label: "Инструменты",
    separator: true,
    items: [{ key: "assistant", label: "Ассистент", icon: "sparkle" }]
  }
];

const sidebarFooterItems: WlSidebarItem[] = [
  { key: "help", label: "Помощь", icon: "help" },
  { key: "settings", label: "Настройки", icon: "settings" }
];

const commandPaletteGroups: WlCommandPaletteGroup[] = [
  {
    id: "pages",
    label: "Быстрые переходы",
    showWhenEmpty: true,
    items: [
      {
        id: "page-components",
        label: "Все компоненты",
        description: "Начало витрины",
        icon: "file",
        keywords: ["страницы", "каталог"],
        href: "#pg-components",
        data: { targetId: "pg-components" }
      },
      {
        id: "page-colors",
        label: "Цвета и токены",
        description: "Foundation, semantic и component tokens",
        icon: "image",
        keywords: ["страницы", "тема", "палитра"],
        href: "#pg-colors",
        data: { targetId: "pg-colors" }
      }
    ]
  },
  {
    id: "components",
    label: "Компоненты",
    showWhenEmpty: false,
    items: wlManifest.map((entry) => ({
      id: `component-${entry.name}`,
      label: entry.name,
      description: entry.description,
      icon: "file",
      keywords: [entry.category, entry.introducedIn],
      data: { component: entry.name }
    }))
  },
  {
    id: "tasks-example",
    label: "Задачи · пример данных потребителя",
    showWhenEmpty: false,
    items: [
      {
        id: "task-contracts",
        label: "Проверить контракты компонентов",
        description: "Пример результата из внешнего источника",
        icon: "check",
        keywords: ["задача", "контракт"],
        data: { kind: "task", id: "demo-1" }
      },
      {
        id: "task-navigation",
        label: "Добавить навигацию по версиям",
        description: "Пример результата из внешнего источника",
        icon: "check",
        keywords: ["задача", "версия"],
        data: { kind: "task", id: "demo-2" }
      }
    ]
  }
];

function onCommandPaletteSelect(item: WlCommandPaletteItem): void {
  const data = item.data as { component?: string; targetId?: string } | undefined;
  if (data?.component) {
    scrollToComponent(data.component);
  } else if (data?.targetId) {
    document.getElementById(data.targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function componentDataWl(name: string): string {
  return name
    .slice(2)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

function scrollToComponent(name: string): void {
  const dataWl = componentDataWl(name);
  const directTarget = document.querySelector<HTMLElement>(`[data-wl="${dataWl}"]`);
  const showcaseTarget = Array.from(document.querySelectorAll<HTMLElement>(".spec")).find((element) =>
    element.querySelector(".spec-h")?.textContent?.includes(name)
  );
  const target = directTarget ?? showcaseTarget;

  target?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* Тема */
const theme = ref<WlThemeName>("white");
watch(theme, async (value) => {
  document.documentElement.dataset.wlTheme = value;
  await nextTick();
  resolveColors();
});

/* Основа (этап 5a): свотчи цветов с runtime-разрешением hex */
const swatchGroups = [
  {
    title: "Нейтральные",
    note: "фоны, бордеры, текст",
    tokens: ["bg", "bg-soft", "bg-hover", "border", "border-2", "text", "text-2", "text-3"]
  },
  {
    title: "Акцент и семантика",
    note: "синий — единственный primary",
    tokens: ["accent", "accent-hover", "accent-soft", "accent-border", "success", "warn", "danger"]
  }
] as const;

const resolvedHex = ref<Record<string, string>>({});

function toHexColor(raw: string): string {
  const v = raw.trim();
  if (v.startsWith("#")) return v.toLowerCase();
  const m = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(v);
  if (!m) return v;
  const h = (n: string): string => Number(n).toString(16).padStart(2, "0");
  return `#${h(m[1]!)}${h(m[2]!)}${h(m[3]!)}`;
}

function resolveColors(): void {
  const cs = getComputedStyle(document.documentElement);
  const out: Record<string, string> = {};
  for (const group of swatchGroups) {
    for (const token of group.tokens) {
      out[token] = toHexColor(cs.getPropertyValue(`--wl-${token}`));
    }
  }
  resolvedHex.value = out;
}

onMounted(resolveColors);

async function copySwatch(token: string): Promise<void> {
  const name = `--wl-${token}`;
  const hex = resolvedHex.value[token] ?? "";
  const text = hex || name;
  try {
    await navigator.clipboard.writeText(text);
    toast.info("Скопировано", `${name} · ${text}`);
  } catch {
    toast.warn("Не удалось скопировать", text);
  }
}

/* Формы */
const text = ref("");
const search = ref("");
const invalidText = ref("admin");
const note = ref("");
const cities = [
  { label: "Москва", value: "msk" },
  { label: "Санкт-Петербург", value: "spb" },
  { label: "Казань", value: "kzn" },
  { label: "Новосибирск", value: "nsk" }
];
const city = ref<string | null>(null);

/* Мультиселект и автокомплит */
const selectedCities = ref<string[]>(["msk"]);
const cityPick = ref<unknown>(null);
const citySuggestions = ref([...cities]);
function searchCities(event: { query: string }): void {
  const q = event.query.trim().toLowerCase();
  citySuggestions.value = q ? cities.filter((c) => c.label.toLowerCase().includes(q)) : [...cities];
}
const cityPickLabel = computed(() => {
  const v = cityPick.value;
  if (v && typeof v === "object" && "label" in v) return String((v as { label: unknown }).label);
  return v == null ? "" : String(v);
});

const agree = ref(true);
const partial = ref(false);
const locked = ref(false);
const plan = ref("basic");
const notify = ref(true);
const notifySm = ref(false);

/* Формы (этап 4a) */
const qty = ref(3);
const qtySm = ref(5);
const password = ref("s3cret-pass");
const volume = ref(40);

const fieldTitle = ref("");
const fieldLogin = ref("ad");
const fieldLoginError = computed(() =>
  fieldLogin.value.length < 3 ? "Слишком короткий логин — минимум 3 символа" : undefined
);

const accItems: WlAccordionItem[] = [
  {
    key: "focus",
    title: "Что такое фокус-режим?",
    content:
      "Режим, в котором WhiteLife скрывает всё, кроме текущей задачи: без уведомлений, бейджей и лишних панелей."
  },
  {
    key: "time",
    title: "Как работает учёт времени?",
    content:
      "Таймер запускается из задачи или записывается вручную. Все записи попадают в недельный отчёт."
  },
  {
    key: "share",
    title: "Можно ли делиться заметками?",
    content: "Да, заметкой можно поделиться ссылкой с правами «чтение» или «редактирование»."
  },
  { key: "api", title: "Есть ли публичный API?", content: "Скоро.", disabled: true }
];
const accOpen = ref<string[]>(["focus"]);

const stepItems: WlStepItem[] = [
  { label: "Проект" },
  { label: "Участники" },
  { label: "Настройки" },
  { label: "Готово" }
];
const stepCurrent = ref(1);

/* Чипы и теги */
const chipActive = ref(false);
const chipDesign = ref(true);
const tags = ref(["Срочно", "Релиз 2.0", "Дизайн"]);
function removeTag(tag: string): void {
  tags.value = tags.value.filter((t) => t !== tag);
}

/* Табы */
const tabItems: WlTabItem[] = [
  { key: "tasks", label: "Задачи", icon: "check", count: 12 },
  { key: "notes", label: "Заметки", icon: "edit", count: 4 },
  { key: "alerts", label: "Уведомления", icon: "bell", count: 2 },
  { key: "profile", label: "Профиль", icon: "user" }
];
const activeTab = ref("tasks");

/* Навигация (этап 3) */
const periodOptions: WlSegmentedOption[] = [
  { label: "День", value: "day" },
  { label: "Неделя", value: "week" },
  { label: "Месяц", value: "month" },
  { label: "Год", value: "year", disabled: true }
];
const period = ref<string | null>("week");

const viewOptions: WlSegmentedOption[] = [
  { label: "Список", value: "list", icon: "minus" },
  { label: "Доска", value: "board", icon: "plus" },
  { label: "Календарь", value: "calendar", icon: "bell" }
];
const view = ref<string | null>("list");

const navActive = ref("tasks");

const crumbItems: WlBreadcrumbItem[] = [
  { label: "Проекты", href: "#/projects" },
  { label: "WhiteLife", href: "#/projects/whitelife" },
  { label: "Спринт 24" }
];

const pagerPage = ref(6);
const compactPage = ref(4);

/* Меню, поповер и тосты */
const menuAction = ref("—");
const staticMenuItems: WlMenuItem[] = [
  { label: "Открыть", icon: "eye", shortcut: "⌘O", command: () => (menuAction.value = "Открыть") },
  { label: "Переименовать", icon: "edit", shortcut: "F2", command: () => (menuAction.value = "Переименовать") },
  { separator: true },
  { header: "Опасная зона" },
  { label: "Удалить", icon: "trash", danger: true, command: () => (menuAction.value = "Удалить") },
  { label: "Заблокировать", disabled: true }
];
const popupMenuItems: WlMenuItem[] = [
  { label: "Дублировать", icon: "plus", command: () => (menuAction.value = "Дублировать") },
  { label: "Поделиться", icon: "user", command: () => (menuAction.value = "Поделиться") },
  { separator: true },
  { label: "Архивировать", icon: "trash", danger: true, command: () => (menuAction.value = "Архивировать") }
];

const toast = useWlToast();

const { confirm, confirmDanger } = useWlConfirm();
function askDeleteTask(): void {
  confirmDanger({
    header: "Удалить задачу?",
    message: "Задача «Черновик презентации» будет удалена без возможности восстановления.",
    acceptLabel: "Удалить",
    accept: () => toast.ok("Задача удалена"),
    reject: () => toast.info("Удаление отменено")
  });
}
function askPublish(): void {
  confirm({
    header: "Опубликовать релиз?",
    message: "Версия 2.0 станет доступна всем пользователям.",
    accept: () => toast.ok("Релиз опубликован")
  });
}

/* Данные (этап 4b): таблица и стат-карточки */
interface TaskStatus {
  label: string;
  variant: WlPillVariant;
}

const taskColumns: WlTableColumn[] = [
  { key: "task", label: "Задача" },
  { key: "project", label: "Проект", width: 110 },
  { key: "due", label: "Срок", width: 100 },
  { key: "status", label: "Статус", width: 130 },
  { key: "estimate", label: "Оценка", numeric: true, width: 90 }
];

const taskRows: WlTableRow[] = [
  {
    task: "Черновик презентации «Атлас»",
    project: "Атлас",
    due: "17 июля",
    status: { label: "В работе", variant: "info" },
    estimate: "3 ч"
  },
  {
    task: "Ревью макетов онбординга",
    project: "Атлас",
    due: "18 июля",
    status: { label: "Черновик", variant: "neutral" },
    estimate: "1 ч"
  },
  {
    task: "Оплатить интернет и квартплату",
    project: "Дом",
    due: "25 июля",
    status: { label: "Ждёт", variant: "warn" },
    estimate: "15 мин"
  },
  {
    task: "Отправить отчёт за июнь",
    project: "Работа",
    due: "14 июля",
    status: { label: "Готово", variant: "ok" },
    estimate: "2 ч"
  }
];

function asStatus(value: unknown): TaskStatus {
  return value as TaskStatus;
}

const projectVariants: Record<string, WlTagVariant> = {
  Атлас: "blue",
  Дом: "amber",
  Работа: "green"
};
function projectVariant(value: unknown): WlTagVariant {
  return projectVariants[String(value)] ?? "gray";
}

/* Цвет и дата (этап 5a) */
const pickedColor = ref("#2563eb");

const DAY_MS = 86_400_000;
function relDate(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * DAY_MS);
  const p = (n: number): string => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const todayIso = relDate(0);
const calDate = ref(todayIso);
const calEvents: WlCalendarEvent[] = [
  { date: relDate(-2), label: "Ревью" },
  { date: relDate(-1), label: "19:30 созвон", tone: "blue" },
  { date: todayIso, label: "Демо", tone: "blue" },
  { date: relDate(2), label: "Релиз 2.0" },
  { date: relDate(2), label: "Перенос задач" },
  { date: relDate(5), label: "Ретро" }
];

/* Файлы и дата (этап 5b) */
const pickedDate = ref<string | null>(null);
const uploaded = ref<File[]>([]);
function onUploadReject(payload: WlFileReject): void {
  toast.warn("Файл отклонён", payload.file.name);
}

const popupMenu = ref<{ toggle: (e: Event) => void } | null>(null);
const cardPop = ref<{ toggle: (e: Event) => void } | null>(null);
function togglePopupMenu(event: Event): void {
  popupMenu.value?.toggle(event);
}
function toggleCardPop(event: Event): void {
  cardPop.value?.toggle(event);
}

/* Обратная связь и оверлеи */
const showClosable = ref(true);
const dialogVisible = ref(false);
const drawerVisible = ref(false);
</script>

<template>
  <header class="pg-top">
    <span class="pg-logo">W</span>
    <b class="pg-title">WhiteLife UI Kit</b>
    <span class="muted">playground · все компоненты</span>
    <WlButton size="sm" variant="secondary" @click="commandPaletteVisible = true">
      <template #icon><WlIcon name="search" :size="15" /></template>
      Поиск
      <span class="pg-command-key">Ctrl K</span>
    </WlButton>
    <div class="pg-theme">
      <WlChip :active="theme === 'white'" @click="theme = 'white'">White</WlChip>
      <WlChip :active="theme === 'graphite'" @click="theme = 'graphite'">Graphite</WlChip>
    </div>
  </header>

  <WlCommandPalette
    v-model:visible="commandPaletteVisible"
    v-model:query="commandPaletteQuery"
    :groups="commandPaletteGroups"
    shortcut
    @select="onCommandPaletteSelect"
  >
    <template #footer>
      Быстрые ссылки видны сразу · задачи и компоненты ищутся той же строкой
    </template>
  </WlCommandPalette>

  <main class="pg-main">
    <div class="pg-shell">
      <aside class="pg-component-nav" aria-label="Навигация по компонентам">
        <div class="pg-component-nav__head">
          <span>Компоненты</span>
          <span>{{ wlManifest.length }}</span>
        </div>
        <section v-for="group in manifestGroups" :key="group.id" class="pg-component-nav__group">
          <h2 class="pg-component-nav__title">{{ group.label }}</h2>
          <button
            v-for="entry in group.entries"
            :key="entry.name"
            type="button"
            class="pg-component-nav__item"
            :aria-label="`Показать ${entry.name}, добавлен в ${entry.introducedIn}`"
            @click="scrollToComponent(entry.name)"
          >
            <code>{{ entry.name }}</code>
            <span class="pg-component-nav__version">v{{ entry.introducedIn }}</span>
          </button>
        </section>
      </aside>

      <div class="pg-content">
    <span id="pg-components" class="pg-scroll-target" aria-hidden="true"></span>
    <h1 class="pg-h1">Компоненты</h1>
    <p class="pg-lead">
      Витрина @whitelife-core/ui-kit: Vue 3 + TypeScript, PrimeVue 4 в unstyled-режиме,
      токены --wl-* и темы white / graphite.
    </p>

    <!-- ==================== Цвета ==================== -->
    <span id="pg-colors" class="pg-scroll-target" aria-hidden="true"></span>
    <section class="pg-sec">
      <h2 class="pg-sec-title">Цвета</h2>
      <p class="pg-sec-desc">
        Нейтральная база + один акцент. Hex разрешается через getComputedStyle — значения
        корректны в обеих темах. Клик по свотчу копирует hex в буфер.
      </p>

      <div v-for="group in swatchGroups" :key="group.title" class="spec">
        <div class="spec-h">
          <span class="spec-name">{{ group.title }}</span>
          <span class="spec-note">{{ group.note }}</span>
        </div>
        <div class="spec-b">
          <div class="pg-swatches">
            <button
              v-for="t in group.tokens"
              :key="t"
              type="button"
              class="pg-sw"
              :title="`Скопировать ${resolvedHex[t] || t}`"
              @click="copySwatch(t)"
            >
              <span class="pg-sw-c" :style="{ background: `var(--wl-${t})` }"></span>
              <span class="pg-sw-b">
                <span class="pg-sw-n">--wl-{{ t }}</span>
                <span class="pg-sw-h">{{ resolvedHex[t] || "…" }}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Типографика ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Типографика</h2>
      <p class="pg-sec-desc">Системный шрифтовой стек, тёмный графит. Числа в данных — с tabular-nums.</p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">Шкала</span><span class="spec-note">размер/строка · насыщенность</span></div>
        <div class="spec-b" style="padding-top: 8px; padding-bottom: 8px">
          <div class="pg-type-row">
            <div style="font-size: 26px; font-weight: 700; letter-spacing: -0.02em">Заголовок страницы</div>
            <div class="pg-type-meta">display · 26/34 · 700</div>
          </div>
          <div class="pg-type-row">
            <div style="font-size: 20px; font-weight: 650; letter-spacing: -0.015em">Заголовок раздела</div>
            <div class="pg-type-meta">title-1 · 20/28 · 650</div>
          </div>
          <div class="pg-type-row">
            <div style="font-size: 16px; font-weight: 600">Заголовок блока</div>
            <div class="pg-type-meta">title-2 · 16/24 · 600</div>
          </div>
          <div class="pg-type-row">
            <div style="font-size: 14px; font-weight: 600">Заголовок карточки</div>
            <div class="pg-type-meta">title-3 · 14/20 · 600</div>
          </div>
          <div class="pg-type-row">
            <div style="font-size: 14px">Основной текст интерфейса и длинные абзацы с описаниями.</div>
            <div class="pg-type-meta">body · 14/20 · 400</div>
          </div>
          <div class="pg-type-row">
            <div style="font-size: 13px; color: var(--wl-text-2)">
              Вторичный текст, подписи и мета-информация рядом с основным контентом.
            </div>
            <div class="pg-type-meta">body-small · 13/18 · 400 · text-2</div>
          </div>
          <div class="pg-type-row">
            <div style="font-size: 12px; color: var(--wl-text-3)">Подпись, время, служебная информация</div>
            <div class="pg-type-meta">caption · 12/16 · 400 · text-3</div>
          </div>
          <div class="pg-type-row">
            <div
              style="
                font-size: 11.5px;
                font-weight: 600;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                color: var(--wl-text-3);
              "
            >
              Метка группы
            </div>
            <div class="pg-type-meta">overline · 11.5/16 · 600 · uppercase</div>
          </div>
          <div class="pg-type-row">
            <div style="font-family: var(--wl-mono); font-size: 14px; font-variant-numeric: tabular-nums">
              04:12:37 · 26 ч 40 мин
            </div>
            <div class="pg-type-meta">mono · таймеры и числа</div>
          </div>
          <div class="pg-type-row">
            <a
              href="#"
              style="color: var(--wl-accent); font-weight: 500; text-decoration: none"
              @click.prevent
              >Текстовая ссылка</a
            >
            <div class="pg-type-meta">link · accent · hover: underline</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Кнопки ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Кнопки</h2>
      <p class="pg-sec-desc">Варианты, размеры, состояния loading / disabled, block, иконки.</p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">Варианты</span><span class="spec-note">variant</span></div>
        <div class="spec-b">
          <div class="row">
            <WlButton variant="primary">Создать</WlButton>
            <WlButton variant="secondary">Черновик</WlButton>
            <WlButton variant="ghost">Отмена</WlButton>
            <WlButton variant="soft">Мягкая</WlButton>
            <WlButton variant="danger">Удалить</WlButton>
            <WlButton variant="danger-quiet">Удалить тихо</WlButton>
            <WlButton variant="soft-danger">Архив</WlButton>
            <WlButton variant="link">Подробнее</WlButton>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">Размеры</span><span class="spec-note">size: xs / sm / md / lg</span></div>
        <div class="spec-b">
          <div class="row">
            <WlButton size="xs" variant="primary">XS 26</WlButton>
            <WlButton size="sm" variant="primary">SM 32</WlButton>
            <WlButton size="md" variant="primary">MD 40</WlButton>
            <WlButton size="lg" variant="primary">LG 48</WlButton>
            <WlButton size="sm" density="compact">Compact sm</WlButton>
            <WlButton size="md" density="compact">Compact md</WlButton>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">Состояния и иконки</span></div>
        <div class="spec-b">
          <div class="row">
            <WlButton variant="primary" loading>Сохранение…</WlButton>
            <WlButton disabled>Недоступно</WlButton>
            <WlButton variant="primary">
              <template #icon><WlIcon name="plus" :size="16" /></template>
              Новая задача
            </WlButton>
            <WlButton variant="secondary">
              <template #icon><WlIcon name="search" :size="16" /></template>
              Найти
            </WlButton>
            <WlButton variant="danger-quiet">
              <template #icon><WlIcon name="trash" :size="16" /></template>
              Удалить
            </WlButton>
          </div>
          <div class="row">
            <WlButton variant="primary" block>Создать проект (block)</WlButton>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Формы ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Формы</h2>
      <p class="pg-sec-desc">Инпуты, textarea, select, чекбоксы, радио и переключатели.</p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlInput</span><span class="spec-note">размеры, invalid, disabled, prefix/suffix</span></div>
        <div class="spec-b">
          <div class="row">
            <WlInput v-model="text" placeholder="Название задачи" />
            <WlInput v-model="invalidText" invalid placeholder="Логин" />
            <WlInput model-value="Заблокировано" disabled />
          </div>
          <div class="row">
            <WlInput v-model="search" size="sm" placeholder="Поиск (sm)">
              <template #prefix><WlIcon name="search" :size="15" /></template>
            </WlInput>
            <WlInput v-model="text" size="lg" placeholder="Большой инпут (lg)" />
            <WlInput v-model="text" density="compact" placeholder="Compact" />
          </div>
          <div class="row">
            <WlInput v-model="search" placeholder="Суффикс справа">
              <template #suffix><WlIcon name="eye" :size="15" /></template>
            </WlInput>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlTextarea / WlSelect</span></div>
        <div class="spec-b">
          <div class="row" style="align-items: flex-start">
            <WlTextarea v-model="note" placeholder="Короткое описание заметки…" />
            <WlSelect v-model="city" :options="cities" option-label="label" option-value="value" placeholder="Город" />
            <WlSelect v-model="city" :options="cities" option-label="label" option-value="value" placeholder="Маленький (sm)" size="sm" />
            <WlSelect :options="cities" option-label="label" option-value="value" placeholder="Invalid" invalid />
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">WlMultiSelect / WlAutocomplete</span>
          <span class="spec-note">чипы + фильтр · complete → suggestions</span>
        </div>
        <div class="spec-b">
          <div class="row" style="align-items: flex-start">
            <WlMultiSelect
              v-model="selectedCities"
              :options="cities"
              option-label="label"
              option-value="value"
              placeholder="Города (чипы + фильтр)"
              display="chip"
              filter
              :max-selected-labels="3"
            />
            <WlMultiSelect
              :options="cities"
              option-label="label"
              option-value="value"
              placeholder="Invalid"
              invalid
            />
            <span class="muted">выбрано: {{ selectedCities.join(", ") || "—" }}</span>
          </div>
          <div class="row" style="align-items: flex-start">
            <WlAutocomplete
              v-model="cityPick"
              :suggestions="citySuggestions"
              option-label="label"
              placeholder="Начните вводить город…"
              @complete="searchCities"
            />
            <WlAutocomplete
              :suggestions="citySuggestions"
              option-label="label"
              placeholder="С кнопкой раскрытия"
              dropdown
              @complete="searchCities"
            />
            <span class="muted">автокомплит: {{ cityPickLabel || "—" }}</span>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlCheckbox / WlRadio / WlSwitch</span></div>
        <div class="spec-b">
          <div class="col">
            <WlCheckbox v-model="agree">Согласен с условиями сервиса</WlCheckbox>
            <WlCheckbox v-model="partial" indeterminate>Выбраны не все пункты (indeterminate)</WlCheckbox>
            <WlCheckbox v-model="locked" disabled>Недоступный чекбокс</WlCheckbox>
          </div>
          <WlDivider>Тариф</WlDivider>
          <div class="col">
            <WlRadio v-model="plan" value="basic" name="plan">Базовый — 0 ₽</WlRadio>
            <WlRadio v-model="plan" value="pro" name="plan">Про — 590 ₽/мес</WlRadio>
            <WlRadio v-model="plan" value="team" name="plan" disabled>Команда (скоро)</WlRadio>
          </div>
          <WlDivider />
          <div class="col">
            <WlSwitch v-model="notify">Уведомления о задачах</WlSwitch>
            <WlSwitch v-model="notifySm" size="sm">Компактный переключатель (sm)</WlSwitch>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">WlNumberInput / WlPasswordInput / WlSlider</span>
          <span class="spec-note">step, min/max, arrow keys, eye-toggle, --wl-slider-pct</span>
        </div>
        <div class="spec-b">
          <div class="row">
            <WlNumberInput v-model="qty" :min="1" :max="10" aria-label="Количество" />
            <WlNumberInput v-model="qtySm" :min="0" :max="50" :step="5" size="sm" aria-label="Количество (sm)" />
            <WlNumberInput :model-value="3" disabled aria-label="Отключено" />
            <span class="muted">qty: {{ qty }} · qtySm: {{ qtySm }}</span>
          </div>
          <div class="row">
            <WlPasswordInput v-model="password" />
            <WlPasswordInput model-value="wrong-pass" invalid aria-label="Пароль с ошибкой" />
            <span class="muted">pw: {{ password }}</span>
          </div>
          <div class="row">
            <WlSlider v-model="volume" aria-label="Громкость уведомлений" />
            <span class="muted">Громкость уведомлений · {{ volume }}%</span>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">WlField</span>
          <span class="spec-note">scoped slot: { id, ariaDescribedby, invalid }</span>
        </div>
        <div class="spec-b">
          <div class="row" style="align-items: flex-start">
            <WlField
              v-slot="{ id, ariaDescribedby, invalid }"
              label="Название задачи"
              required
              hint="Коротко и по делу — до 80 символов"
            >
              <WlInput
                v-model="fieldTitle"
                placeholder="Например: Подготовить демо"
                :invalid="invalid"
                :id="id"
                :aria-describedby="ariaDescribedby"
              />
            </WlField>
            <WlField
              v-slot="{ id, ariaDescribedby, invalid }"
              label="Логин"
              hint="Минимум 3 символа"
              :error="fieldLoginError"
            >
              <WlInput
                v-model="fieldLogin"
                placeholder="Логин"
                :invalid="invalid"
                :id="id"
                :aria-describedby="ariaDescribedby"
              />
            </WlField>
          </div>
          <p class="muted">Поле «Логин» показывает ошибку вместо подсказки, пока меньше 3 символов.</p>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">WlAccordion</span>
          <span class="spec-note">multiple + v-model:openKeys · single</span>
        </div>
        <div class="spec-b">
          <div class="row" style="align-items: flex-start">
            <div class="col" style="flex: 1; gap: 8px">
              <WlAccordion v-model:open-keys="accOpen" :items="accItems" />
              <span class="muted">открыто: {{ accOpen.join(", ") || "—" }}</span>
            </div>
            <WlAccordion single :items="accItems" style="flex: 1" />
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlSteps</span><span class="spec-note">done / current / pending</span></div>
        <div class="spec-b">
          <WlSteps :items="stepItems" :current="stepCurrent" style="max-width: 100%" />
          <div class="row" style="margin-top: 14px">
            <WlButton size="sm" variant="secondary" :disabled="stepCurrent === 0" @click="stepCurrent--">
              Назад
            </WlButton>
            <WlButton
              size="sm"
              variant="primary"
              :disabled="stepCurrent === stepItems.length - 1"
              @click="stepCurrent++"
            >
              Далее
            </WlButton>
            <span class="muted">шаг {{ stepCurrent + 1 }} из {{ stepItems.length }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Чипы, теги, бейджи ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Чипы, теги, бейджи</h2>
      <p class="pg-sec-desc">Фильтры, статусные метки и счётчики.</p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlChip</span><span class="spec-note">active, count, disabled</span></div>
        <div class="spec-b">
          <div class="row">
            <WlChip v-model:active="chipActive">Все задачи</WlChip>
            <WlChip v-model:active="chipDesign" :count="7">Дизайн</WlChip>
            <WlChip :count="23">Бэклог</WlChip>
            <WlChip disabled>Архив</WlChip>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlTag / WlBadge</span></div>
        <div class="spec-b">
          <div class="row">
            <WlTag>Обычный</WlTag>
            <WlTag variant="blue">Релиз 2.0</WlTag>
            <WlTag variant="green">Готово</WlTag>
            <WlTag variant="amber">В работе</WlTag>
            <WlTag variant="red">Просрочено</WlTag>
            <WlTag v-for="tag in tags" :key="tag" variant="blue" removable @remove="removeTag(tag)">
              {{ tag }}
            </WlTag>
          </div>
          <div class="row">
            <WlBadge :value="3" />
            <WlBadge :value="12" variant="gray" />
            <WlBadge value="OK" variant="success" />
            <WlBadge :value="5" variant="warn" />
            <WlBadge :value="9" variant="danger" />
            <span class="muted">dot:</span>
            <WlBadge dot />
            <WlBadge dot variant="danger" />
            <WlBadge dot variant="success" />
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Навигация ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Навигация</h2>
      <p class="pg-sec-desc">
        Табы, сегменты, пункты меню, хлебные крошки, пагинация и сгруппированные кнопки.
      </p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlTabs</span><span class="spec-note">items + v-model + #panel</span></div>
        <div class="spec-b">
          <WlTabs v-model="activeTab" :items="tabItems">
            <template #panel="{ item }">
              <p class="muted">
                Активный раздел: «{{ item.label }}» (ключ: {{ item.key }}). Здесь рендерится
                содержимое через scoped-слот <code>#panel</code>.
              </p>
            </template>
          </WlTabs>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlSegmented</span><span class="spec-note">options + v-model, disabled option</span></div>
        <div class="spec-b">
          <div class="row">
            <WlSegmented v-model="period" :options="periodOptions" />
            <span class="muted">выбрано: {{ period }}</span>
          </div>
          <div class="row">
            <WlSegmented v-model="view" :options="viewOptions" />
            <span class="muted">с иконками</span>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlNavItem</span><span class="spec-note">icon, badge, active — ширину задаёт контейнер</span></div>
        <div class="spec-b">
          <div class="row" style="align-items: flex-start">
            <div class="col" style="width: 230px; gap: 4px">
              <WlNavItem label="Задачи" icon="check" :badge="12" :active="navActive === 'tasks'" @click="navActive = 'tasks'" />
              <WlNavItem label="Заметки" icon="edit" :badge="4" :active="navActive === 'notes'" @click="navActive = 'notes'" />
              <WlNavItem label="Уведомления" icon="bell" :active="navActive === 'alerts'" @click="navActive = 'alerts'" />
              <WlNavItem label="Профиль" icon="user" :active="navActive === 'profile'" @click="navActive = 'profile'" />
              <WlNavItem label="Архив" icon="trash" disabled />
            </div>
            <span class="muted">активный: {{ navActive }}</span>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlBreadcrumbs</span><span class="spec-note">последний пункт — текущий, не ссылка</span></div>
        <div class="spec-b">
          <WlBreadcrumbs :items="crumbItems" />
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlPagination</span><span class="spec-note">siblings-окно с многоточиями и compact-вариант</span></div>
        <div class="spec-b">
          <div class="row">
            <WlPagination v-model:page="pagerPage" :page-count="12" />
          </div>
          <div class="row">
            <WlPagination v-model:page="compactPage" :page-count="9" compact />
            <span class="muted">страница {{ compactPage }} из 9 — ввод с клавиатуры</span>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlButtonGroup / WlIconButton</span><span class="spec-note">склейка рамок, счётчики и dot</span></div>
        <div class="spec-b">
          <div class="row">
            <WlButtonGroup>
              <WlButton size="sm" variant="secondary">День</WlButton>
              <WlButton size="sm" variant="secondary">Неделя</WlButton>
              <WlButton size="sm" variant="secondary">Месяц</WlButton>
            </WlButtonGroup>
            <WlButtonGroup>
              <WlIconButton icon="chevron-left" variant="secondary" aria-label="Назад" />
              <WlIconButton icon="chevron-right" variant="secondary" aria-label="Вперёд" />
            </WlButtonGroup>
          </div>
          <div class="row">
            <WlIconButton icon="bell" :count="4" aria-label="Уведомления" />
            <WlIconButton icon="search" aria-label="Поиск" />
            <WlIconButton icon="plus" active aria-label="Добавить" />
            <WlIconButton icon="bell" dot variant="soft" aria-label="Есть новые" />
            <WlIconButton icon="user" variant="secondary" size="sm" :count="2" aria-label="Профиль" />
            <WlIconButton icon="trash" disabled aria-label="Удалить" />
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Карточки ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Карточки</h2>
      <p class="pg-sec-desc">Слоты title / content / footer, состояние hoverable.</p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlCard</span></div>
        <div class="spec-b">
          <div class="row" style="align-items: stretch">
            <WlCard style="width: 300px">
              <template #title>Спринт 24</template>
              8 задач в работе, 3 на ревью. Демо — в пятницу в 15:00.
              <template #footer>
                <WlButton size="sm" variant="soft">Открыть доску</WlButton>
                <span class="muted">обновлено вчера</span>
              </template>
            </WlCard>
            <WlCard hoverable style="width: 300px">
              <template #title>Заметка о продукте</template>
              Hoverable-карточка: тень и рамка усиливаются при наведении. Подходит для
              кликабельных превью.
              <template #footer>
                <WlTag variant="green">Новая</WlTag>
                <span class="muted">12 июня</span>
              </template>
            </WlCard>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Данные и индикаторы ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Данные и индикаторы</h2>
      <p class="pg-sec-desc">Стат-карточки, таблица, аватары, прогресс, скелетоны и спиннеры.</p>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">WlStatCard</span>
          <span class="spec-note">icon / label / value / description / progress / tone, #footer</span>
        </div>
        <div class="spec-b">
          <div class="row" style="align-items: stretch">
            <WlStatCard
              icon="bell"
              label="Время сегодня"
              value="4 ч 12 мин"
              description="из дневной цели 6 часов"
              :progress="70"
              tone="success"
              style="flex: 1; min-width: 220px"
            />
            <WlStatCard
              icon="eye"
              label="Фокус дня"
              value="Черновик презентации «Атлас»"
              description="2 из 5 разделов готовы"
              :progress="40"
              style="flex: 1; min-width: 220px"
            />
            <WlStatCard
              icon="check"
              label="Задач закрыто"
              value="17"
              description="за эту неделю"
              style="flex: 1; min-width: 220px"
            >
              <template #footer><span class="muted">+4 к прошлой неделе</span></template>
            </WlStatCard>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">WlTable</span>
          <span class="spec-note">columns + #cell-&lt;key&gt; scoped slots, numeric, emptyMessage</span>
        </div>
        <div class="spec-b">
          <WlTable :value="taskRows" :columns="taskColumns">
            <template #cell-project="{ value }">
              <WlTag :variant="projectVariant(value)">{{ value }}</WlTag>
            </template>
            <template #cell-status="{ value }">
              <WlPill :variant="asStatus(value).variant">{{ asStatus(value).label }}</WlPill>
            </template>
          </WlTable>
          <p class="muted" style="margin: 14px 0 10px">
            Колонка «Оценка» — numeric (вправо, табличные цифры). Пустое состояние таблицы:
          </p>
          <WlTable :value="[]" :columns="taskColumns" empty-message="Задач пока нет" />
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlAvatar</span><span class="spec-note">sizes 24–48, presence</span></div>
        <div class="spec-b">
          <div class="row">
            <WlAvatar label="АИ" :size="24" />
            <WlAvatar label="АИ" :size="28" />
            <WlAvatar label="АИ" :size="32" />
            <WlAvatar label="АИ" :size="36" />
            <WlAvatar label="АИ" :size="48" />
            <WlAvatar label="МК" :size="36" presence="online" />
            <WlAvatar label="ДС" :size="36" presence="busy" />
            <WlAvatar label="ЕВ" :size="36" presence="offline" />
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlProgress / WlSkeleton / WlSpinner</span></div>
        <div class="spec-b">
          <div class="col">
            <WlProgress :value="64" />
            <WlProgress :value="32" thin />
            <WlProgress :value="100" variant="ok" />
          </div>
          <div class="col" style="margin-top: 18px; max-width: 320px">
            <WlSkeleton height="14px" width="70%" />
            <WlSkeleton height="12px" />
            <WlSkeleton height="12px" width="45%" />
            <div class="row" style="margin-top: 6px">
              <WlSkeleton shape="circle" width="36px" height="36px" />
              <div class="col" style="flex: 1">
                <WlSkeleton height="11px" width="55%" />
                <WlSkeleton height="11px" width="35%" />
              </div>
            </div>
          </div>
          <div class="row" style="margin-top: 18px">
            <WlSpinner size="sm" />
            <WlSpinner />
            <WlSpinner size="lg" />
            <span style="background: var(--wl-gray-800); padding: 8px 12px; border-radius: 8px; display: inline-flex">
              <WlSpinner light />
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Цвет и дата ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Цвет и дата</h2>
      <p class="pg-sec-desc">Собственные компоненты без PrimeVue: палитра и месячный календарь.</p>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">WlColorPicker</span>
          <span class="spec-note">v-model hex · swatches · size · валидация #rgb/#rrggbb</span>
        </div>
        <div class="spec-b">
          <div class="row" style="align-items: flex-start">
            <WlColorPicker v-model="pickedColor" />
            <div class="col" style="gap: 8px">
              <span class="pg-color-demo" :style="{ background: pickedColor || 'transparent' }">Aa</span>
              <span class="muted">выбрано: {{ pickedColor || "—" }}</span>
            </div>
            <div class="col" style="gap: 8px">
              <WlColorPicker v-model="pickedColor" size="sm" />
              <span class="muted">size="sm" — тот же v-model</span>
            </div>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">WlCalendar</span>
          <span class="spec-note">v-model ISO-дата · v-model:month · events · Mon-first</span>
        </div>
        <div class="spec-b">
          <div class="row" style="align-items: flex-start">
            <WlCalendar v-model="calDate" :events="calEvents" />
            <div class="col" style="gap: 8px">
              <span class="muted">выбрано: {{ calDate || "—" }}</span>
              <WlButton size="sm" variant="soft" @click="calDate = todayIso">Сегодня</WlButton>
            </div>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">WlDatePicker</span>
          <span class="spec-note">v-model ISO · showIcon · invalid · size · русская локаль</span>
        </div>
        <div class="spec-b">
          <div class="row" style="align-items: flex-start">
            <div class="col" style="gap: 8px; width: 280px">
              <WlDatePicker v-model="pickedDate" showIcon placeholder="Выберите дату" />
              <span class="muted">выбрано: {{ pickedDate || "—" }}</span>
            </div>
            <div class="col" style="gap: 8px; width: 280px">
              <WlDatePicker v-model="pickedDate" size="sm" placeholder="Компактный (sm)" />
              <WlDatePicker model-value="2026-07-14" invalid showIcon placeholder="С ошибкой" />
            </div>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">WlFileUpload</span>
          <span class="spec-note">v-model File[] · accept · maxSize · maxFiles · reject</span>
        </div>
        <div class="spec-b">
          <WlFileUpload
            v-model="uploaded"
            :max-size="5 * 1024 * 1024"
            :max-files="5"
            style="max-width: 560px"
            @reject="onUploadReject"
          />
          <p class="muted" style="margin-top: 10px">
            выбрано файлов: {{ uploaded.length }} из 5 · файлы никуда не загружаются — список
            хранится локально, выгрузку выполняет приложение
          </p>
        </div>
      </div>
    </section>

    <!-- ==================== Обратная связь ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Обратная связь</h2>
      <p class="pg-sec-desc">Алерты четырёх вариантов, action-слот и закрытие.</p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlAlert</span></div>
        <div class="spec-b">
          <div class="col">
            <WlAlert variant="info" title="Совет">
              Перетащите задачу на календарь, чтобы запланировать время.
            </WlAlert>
            <WlAlert variant="ok" title="Готово">
              Данные синхронизированы 2 минуты назад.
            </WlAlert>
            <WlAlert variant="warn" title="Внимание">
              Лимит хранилища почти исчерпан — осталось 120 МБ.
              <template #action>
                <WlButton size="xs" variant="secondary">Увеличить</WlButton>
              </template>
            </WlAlert>
            <WlAlert v-if="showClosable" variant="err" title="Ошибка" closable @close="showClosable = false">
              Не удалось сохранить изменения. Попробуйте ещё раз.
            </WlAlert>
            <WlButton v-else size="sm" variant="soft" @click="showClosable = true">
              Показать алерт снова
            </WlButton>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Композитные ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Композитные компоненты</h2>
      <p class="pg-sec-desc">
        Переиспользуемые сценарии, собранные из базовых элементов UI-kit и не связанные
        с роутером, API или предметной моделью приложения.
      </p>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">WlSidebar</span>
          <span class="spec-note">WlNavItem внутри · hover / pinned / mobile drawer</span>
        </div>
        <div class="spec-b">
          <div class="pg-sidebar-demo">
            <WlSidebar
              v-model="sidebarActive"
              v-model:pinned="sidebarPinned"
              v-model:mobile-open="sidebarMobileOpen"
              :groups="sidebarGroups"
              :footer-items="sidebarFooterItems"
              brand="WhiteLife"
              brand-mark="W"
            />
            <div class="pg-sidebar-demo__content">
              <div class="row">
                <WlIconButton
                  icon="panel"
                  variant="secondary"
                  aria-label="Открыть мобильную навигацию"
                  @click="sidebarMobileOpen = true"
                />
                <WlButton size="sm" variant="secondary" @click="sidebarPinned = !sidebarPinned">
                  {{ sidebarPinned ? "Открепить" : "Закрепить" }}
                </WlButton>
              </div>
              <div>
                <strong>Активный пункт: {{ sidebarActive }}</strong>
                <p class="muted" style="margin-top: 6px">
                  Наведите на свёрнутую панель или закрепите её. Переходы и данные пунктов
                  остаются ответственностью приложения.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">WlCommandPalette</span>
          <span class="spec-note">быстрые ссылки + единая строка поиска · Ctrl/Cmd+K</span>
        </div>
        <div class="spec-b">
          <div class="row">
            <WlButton variant="secondary" @click="commandPaletteVisible = true">
              <template #icon><WlIcon name="search" :size="16" /></template>
              Открыть палитру
            </WlButton>
            <span class="muted">
              Группы «страницы», «компоненты» и пример внешних задач используют один контракт.
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Оверлеи ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Оверлеи</h2>
      <p class="pg-sec-desc">Диалог, drawer, меню, поповер, тосты и разделитель.</p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlDialog / WlDrawer / WlTooltip</span></div>
        <div class="spec-b">
          <div class="row">
            <WlButton variant="primary" @click="dialogVisible = true">Открыть диалог</WlButton>
            <WlButton variant="secondary" @click="drawerVisible = true">Открыть drawer</WlButton>
            <WlButton v-wl-tooltip="'Подсказка из директивы WlTooltip'" variant="ghost">
              Наведите на меня
            </WlButton>
          </div>
          <WlDivider>Разделитель с подписью</WlDivider>
          <p class="muted">Текст между разделителями.</p>
          <WlDivider />
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlMenu</span><span class="spec-note">статическое и popup, header / separator / danger</span></div>
        <div class="spec-b">
          <div class="row" style="align-items: flex-start">
            <WlMenu :items="staticMenuItems" />
            <div class="col" style="gap: 8px">
              <WlButton variant="secondary" @click="togglePopupMenu">
                Открыть popup-меню
              </WlButton>
              <WlMenu ref="popupMenu" popup :items="popupMenuItems" />
              <span class="muted">последняя команда: {{ menuAction }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlPopover</span><span class="spec-note">toggle по клику, портал в body</span></div>
        <div class="spec-b">
          <div class="row">
            <WlButton variant="secondary" @click="toggleCardPop">
              Детали карточки
            </WlButton>
            <WlPopover ref="cardPop">
              <b style="display: block; margin-bottom: 6px; color: var(--wl-text)">Карточка 128</b>
              Поповер — лёгкая панель рядом с якорем. Клик вне панели закрывает её.
              <div style="margin-top: 10px">
                <WlButton size="xs" variant="soft">Открыть полностью</WlButton>
              </div>
            </WlPopover>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlToast + useWlToast</span><span class="spec-note">bottom-center, life 2200 мс</span></div>
        <div class="spec-b">
          <div class="row">
            <WlButton size="sm" variant="soft" @click="toast.ok('Изменения сохранены')">ok</WlButton>
            <WlButton size="sm" variant="soft" @click="toast.info('Новая версия доступна')">info</WlButton>
            <WlButton size="sm" variant="soft" @click="toast.warn('Лимит хранилища почти исчерпан')">warn</WlButton>
            <WlButton size="sm" variant="soft" @click="toast.err('Не удалось сохранить изменения')">err</WlButton>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">WlConfirmDialog + useWlConfirm</span>
          <span class="spec-note">confirm / confirmDanger, accept/reject → toast</span>
        </div>
        <div class="spec-b">
          <div class="row">
            <WlButton size="sm" variant="danger" @click="askDeleteTask">Удалить…</WlButton>
            <WlButton size="sm" variant="secondary" @click="askPublish">Опубликовать…</WlButton>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlEmpty / WlPill</span></div>
        <div class="spec-b">
          <div class="row" style="align-items: stretch">
            <WlEmpty
              icon="search"
              title="Ничего не найдено"
              description="Попробуйте изменить запрос или сбросить фильтры."
              style="flex: 1"
            >
              <template #action>
                <WlButton size="sm" variant="secondary">Сбросить фильтры</WlButton>
              </template>
            </WlEmpty>
            <WlEmpty icon="bell" title="Уведомлений нет" style="flex: 1">
              Новые события появятся здесь автоматически.
            </WlEmpty>
          </div>
          <div class="row">
            <WlPill>Черновик</WlPill>
            <WlPill variant="info">В работе</WlPill>
            <WlPill variant="ok">Готово</WlPill>
            <WlPill variant="warn">Ждёт ревью</WlPill>
            <WlPill variant="err">Просрочено</WlPill>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Токены и кастомизация ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Токены и кастомизация</h2>
      <p class="pg-sec-desc">
        Локальное переопределение токенов на поддереве и точечный pt на одном экземпляре.
      </p>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">Scoped token overrides</span>
          <span class="spec-note">--wl-btn-height: 34px; --wl-accent: #7c3aed</span>
        </div>
        <div class="spec-b">
          <div
            class="row"
            style="
              --wl-btn-height: 34px;
              --wl-accent: #7c3aed;
              --wl-accent-hover: #6d28d9;
              --wl-accent-soft: #f3effd;
              --wl-accent-border: #ddd0f8;
              --wl-accent-soft-hover: #eae3fa;
              --wl-accent-border-hover: #d4c4f2;
            "
          >
            <WlButton variant="primary">Фиолетовая</WlButton>
            <WlButton variant="soft">Мягкая фиолетовая</WlButton>
            <WlTag variant="blue">Тег той же темы</WlTag>
            <WlProgress :value="48" />
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">Per-component :pt</span>
          <span class="spec-note">aria-label + data-test на root</span>
        </div>
        <div class="spec-b">
          <div class="row">
            <WlButton
              variant="primary"
              :pt="{ root: { 'aria-label': 'Создать задачу', 'data-test': 'app-button' } }"
            >
              Кнопка с pt
            </WlButton>
            <span class="muted">root получит aria-label и data-test через PrimeVue pt.</span>
          </div>
        </div>
      </div>
    </section>
      </div>
    </div>
  </main>

  <!-- Оверлеи -->
  <WlToast />
  <WlConfirmDialog />
  <WlDialog v-model:visible="dialogVisible" header="Новая задача">
    <div class="col">
      <WlInput v-model="text" placeholder="Название задачи" />
      <WlTextarea v-model="note" placeholder="Описание…" />
      <WlSelect v-model="city" :options="cities" option-label="label" option-value="value" placeholder="Исполнитель (город)" />
    </div>
    <template #footer>
      <WlButton variant="ghost" @click="dialogVisible = false">Отмена</WlButton>
      <WlButton variant="primary" @click="dialogVisible = false">Создать</WlButton>
    </template>
  </WlDialog>

  <WlDrawer v-model:visible="drawerVisible" header="Детали задачи" position="right">
    <p>
      Drawer — боковая панель поверх контента. Подходит для деталей записи, фильтров
      и вторичных действий, не прерывая основной сценарий.
    </p>
    <p style="margin-top: 12px">
      Позиция задаётся prop'ом <code>position</code>: right (по умолчанию), left, top, bottom, full.
    </p>
    <template #footer>
      <WlButton variant="secondary" @click="drawerVisible = false">Закрыть</WlButton>
      <WlButton variant="primary" @click="drawerVisible = false">Сохранить</WlButton>
    </template>
  </WlDrawer>
</template>

<style>
.pg-top {
  height: 60px;
  border-bottom: 1px solid var(--wl-border);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  position: sticky;
  top: 0;
  background: var(--wl-bg);
  z-index: 50;
}
.pg-logo {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: var(--wl-accent);
  color: var(--wl-on-accent);
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pg-title {
  font-size: 14.5px;
}
.pg-theme {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.pg-command-key {
  margin-left: 4px;
  color: var(--wl-text-3);
  font-family: var(--wl-mono);
  font-size: 10px;
}
.pg-scroll-target {
  display: block;
  scroll-margin-top: 76px;
}
.pg-sidebar-demo {
  height: 520px;
  display: flex;
  overflow: hidden;
  border: 1px solid var(--wl-border);
  border-radius: var(--wl-radius-lg);
  background: var(--wl-bg-soft);
}
.pg-sidebar-demo__content {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
}
.pg-main {
  max-width: 1240px;
  margin: 0 auto;
  padding: 36px 24px 120px;
}
.pg-shell {
  display: grid;
  grid-template-columns: 236px minmax(0, 1fr);
  gap: 32px;
}
.pg-content {
  min-width: 0;
}
.pg-component-nav {
  position: sticky;
  top: 76px;
  align-self: start;
  max-height: calc(100vh - 92px);
  overflow: auto;
  border: 1px solid var(--wl-border);
  border-radius: var(--wl-radius);
  background: var(--wl-bg);
}
.pg-component-nav__head {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid var(--wl-border);
  background: var(--wl-bg-soft);
  font-size: 12px;
  font-weight: 600;
}
.pg-component-nav__group {
  padding: 8px 6px;
}
.pg-component-nav__group + .pg-component-nav__group {
  border-top: 1px solid var(--wl-bg-soft);
}
.pg-component-nav__title {
  margin: 0 6px 4px;
  color: var(--wl-text-3);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.pg-component-nav__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 6px;
  padding: 5px 6px;
  border: 0;
  border-radius: 5px;
  color: var(--wl-text);
  background: transparent;
  cursor: pointer;
  text-align: left;
}
.pg-component-nav__item:hover,
.pg-component-nav__item:focus-visible {
  background: var(--wl-accent-soft);
  outline: none;
}
.pg-component-nav__version {
  flex: none;
  padding: 2px 4px;
  border: 1px solid var(--wl-border);
  border-radius: 4px;
  color: var(--wl-text-3);
  font-family: var(--wl-mono);
  font-size: 10px;
}
.pg-h1 {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.pg-lead {
  font-size: 14px;
  color: var(--wl-text-2);
  margin: 8px 0 40px;
  max-width: 640px;
}
.pg-sec {
  margin-bottom: 56px;
}
.pg-sec-title {
  font-size: 17px;
  font-weight: 650;
  letter-spacing: -0.01em;
}
.pg-sec-desc {
  font-size: 13px;
  color: var(--wl-text-2);
  margin: 5px 0 18px;
  max-width: 640px;
}
.spec {
  border: 1px solid var(--wl-border);
  border-radius: var(--wl-radius);
  margin-bottom: 14px;
  overflow: hidden;
  background: var(--wl-bg);
}
.spec-h {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--wl-border);
  background: var(--wl-bg-soft);
}
.spec-name {
  font-size: 12.5px;
  font-weight: 600;
}
.spec-note {
  font-size: 11.5px;
  color: var(--wl-text-3);
  font-family: var(--wl-mono);
}
.spec-b {
  padding: 20px;
}
.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.row + .row {
  margin-top: 14px;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.col + .col,
.col + .row {
  margin-top: 14px;
}
.muted {
  color: var(--wl-text-3);
  font-size: 12.5px;
}
code {
  font-family: var(--wl-mono);
  font-size: 12px;
  background: var(--wl-bg-soft);
  border: 1px solid var(--wl-border);
  border-radius: 5px;
  padding: 1px 6px;
}
/* Этап 5a — свотчи и типографика (только playground) */
.pg-swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}
.pg-sw {
  border: 1px solid var(--wl-border);
  border-radius: var(--wl-radius);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.12s;
  text-align: left;
  background: var(--wl-bg);
}
.pg-sw:hover {
  border-color: var(--wl-border-2);
}
.pg-sw-c {
  display: block;
  height: 56px;
  border-bottom: 1px solid var(--wl-border);
}
.pg-sw-b {
  display: block;
  padding: 8px 10px;
}
.pg-sw-n {
  display: block;
  font-size: 12px;
  font-weight: 600;
}
.pg-sw-h {
  display: block;
  font-size: 11px;
  color: var(--wl-text-3);
  font-family: var(--wl-mono);
}
.pg-type-row {
  padding: 12px 0;
  border-bottom: 1px solid var(--wl-bg-soft);
}
.pg-type-row:last-child {
  border-bottom: none;
}
.pg-type-meta {
  font-size: 11.5px;
  color: var(--wl-text-3);
  font-family: var(--wl-mono);
  margin-top: 4px;
}
.pg-color-demo {
  width: 64px;
  height: 64px;
  border-radius: var(--wl-radius-lg);
  border: 1px solid var(--wl-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  transition: background 0.15s;
}
@media (max-width: 900px) {
  .pg-main {
    max-width: 980px;
  }
  .pg-shell {
    display: block;
  }
  .pg-component-nav {
    position: static;
    max-height: 260px;
    margin-bottom: 32px;
  }
  .pg-component-nav__group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 2px;
  }
  .pg-component-nav__title {
    grid-column: 1 / -1;
  }
}
</style>
