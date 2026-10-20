# 05. Composables и утилиты: что вынести и что добавить

[← к оглавлению](README.md)

## Текущее состояние

Публично экспортируются только:
- `useWlToast`, `useWlConfirm`;
- сервисы `WlToastService`, `WlConfirmationService`;
- `WlConfig`, `createWlPt`, `normalizeWlLocale`, `resolveWlIconName`.

Внутри пакета при этом уже есть хорошее переиспользуемое поведение, которое пользователи пишут заново в каждом приложении:

| Внутренний модуль | Что делает | Публичный? |
|---|---|---|
| `utils/useWlId.ts` | SSR-безопасные ID (Vue 3.4/3.5) | нет |
| `utils/anchoredOverlay.ts` | позиционирование у якоря, закрытие по клику снаружи и Escape | нет |
| `utils/overlayLifecycle.ts` | фокус-ловушка, восстановление фокуса, Escape, стек | нет |
| `utils/bodyScrollLock.ts` | блокировка скролла со счётчиком и компенсацией скроллбара | нет |
| `utils/options.ts` | `optionLabel`/`optionValue`, навигация по списку | нет |
| `config.ts → mergeWlAttrs` | слияние attrs с class/style | нет |
| `apps/playground/src/theme-builder/palette.ts` | контраст, нормализация hex, генерация темы | **в Playground**, не в библиотеке |
| `apps/playground/src/themes.ts`, `preferences.ts`, `theme-transition.ts` | системная тема, запоминание выбора, плавная смена | **в Playground** |

Логика контраста реализована **трижды**: в `palette.ts` (Playground), в `scripts/token-tools.mjs` (проверка токенов) и частично в `WlColorPicker` (нормализация hex). Логика темы живёт в Playground, хотя она нужна любому приложению на Gavia.

## Принцип отбора

Важно не превратиться во второй VueUse. Предлагаю правило для `AGENTS.md`:

> Composable или утилита попадают в публичный API, только если (1) их использует сама библиотека **и** (2) без них пользователь будет повторять неочевидную логику (a11y, i18n, позиционирование, тема). Общие утилиты (debounce, storage, fetch) — не наша зона, для них есть VueUse.

## Как поставлять

- **Отдельные entry points**, чтобы не трогать главный бандл и было очевидно, что это не компоненты:
  - `gavia-ui/composables` — Vue-зависимые;
  - `gavia-ui/utils` — чистые функции без Vue, работают и в Node/SSR, и в тестах.
- Для этого `vite.config.ts` → `build.lib.entry: { index, composables, utils }` и `exports` с тремя ключами. Попутно можно включить `preserveModules`, чтобы tree-shaking работал по файлам.
- Внутри компонентов импортировать из тех же модулей. Тогда утилиты проверяются самой библиотекой, и [ARCH-6](01-architecture.md) про дубли закрывается.

---

## Чистые утилиты (`gavia-ui/utils`)

### UTIL-1. Плюрализация · P1 · S

Сейчас в locale есть `selectedItems: "{count} выбрано"`, а `formatWlLocaleText` умеет только подстановку `{key}`. Для русского нужны формы «1 файл / 2 файла / 5 файлов», и для английского тоже: «1 file / 2 files».

```ts
// utils/plural.ts — без зависимостей, на Intl.PluralRules
export type WlPluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
export function wlPlural(locale: string, count: number, forms: WlPluralForms): string {
  const rule = new Intl.PluralRules(locale).select(count);
  return (forms[rule] ?? forms.other).replace("{count}", formatWlNumber(locale, count));
}
// wlPlural("ru", 5, { one: "{count} файл", few: "{count} файла", many: "{count} файлов", other: "{count} файла" })
```

Дополнительно:
- кэш `Intl.PluralRules` по locale (`Map`);
- поддержка форм в locale-словаре библиотеки: `selectedItems: { one, few, many, other }` вместо строки, со старым строковым форматом как fallback;
- в Playground этим же можно заменить ручные склонения, если они есть в i18n (vue-i18n умеет `|`-формы, но только для своих сообщений).

### UTIL-2. Форматирование чисел и размеров · P1 · S

```ts
formatWlNumber(locale, value, options?)             // Intl.NumberFormat c кэшем
formatWlBytes(locale, bytes)                       // style: "unit", unit: "kilobyte" | "megabyte" — без ручного "КБ"
formatWlCount(value, { max: 99 })                  // "99+" для бейджей/счётчиков
formatWlPercent(locale, value)
```

Сразу заменяет:
- `humanSize()` + `fileByteUnit` / `fileKilobyteUnit` / `fileMegabyteUnit` / `decimalSeparator` в `WlFileUpload` и в locale. Четыре ключа словаря становятся не нужны;
- счётчики в `WlBadge`, `WlIconButton`, `WlTabs`, `WlChip`, `WlNavItem`, `WlFilterBar` (сейчас «1000» не превращается в «999+» и не форматируется).

### UTIL-3. Даты · P1 · M

DatePicker и Calendar уже содержат `parseIso` / `toIso` / сравнение ISO-строк. Их стоит вынести и дополнить:

```ts
parseWlIsoDate("2026-10-17"): Date | null
toWlIsoDate(date): string
formatWlDate(locale, iso, { dateStyle: "medium" })
formatWlRelativeTime(locale, date, now?)  // Intl.RelativeTimeFormat: «5 минут назад»
getWlMonthNames(locale, "long" | "short") // Intl.DateTimeFormat → убирает monthNames из locale-словаря
getWlWeekdayNames(locale, "narrow" | "short")
getWlFirstDayOfWeek(locale)               // Intl.Locale#getWeekInfo где есть, иначе таблица по региону
```

Это позволит в DatePicker поддерживать формат отображения через `Intl`, а не два жёстких шаблона `dd.mm.yyyy` / `yyyy-mm-dd`.

### UTIL-4. Инициалы и строки · P2 · S

```ts
getWlInitials("Дмитрий Горбач") // "ДГ"; учитывает дефисы, одно слово, эмодзи
```

Для `WlAvatar`: если `image` не задан или не загрузился, показывать инициалы из `label`. Ещё можно добавить `getWlColorFromString(name)` — стабильный цвет фона аватара из палитры токенов.

### UTIL-5. Цвет и контраст · P1 · M

Перенести из `apps/playground/src/theme-builder/palette.ts` и `scripts/token-tools.mjs` в один модуль:

```ts
normalizeWlHex(value): string | null
getWlContrastRatio(fg, bg): number
meetsWlContrast(fg, bg, "AA" | "AAA", "normal" | "large"): boolean
```

Используется:
- в `WlColorPicker` (нормализация);
- в `tokens:check` (скрипт импортирует из `src/utils`);
- в конструкторе тем Playground;
- пользователями, которые строят свои темы.

Одна реализация вместо трёх.

### UTIL-6. Числа · P2 · S

```ts
clamp(value, min, max)
finiteOr(value, fallback)
toPercent(value, min, max)   // безопасно к Infinity и переполнению — логика уже есть в WlSlider
roundToStep(value, step, min)
```

Убирает 22 вхождения `Number.isFinite(...)` с ручным `Math.min(Math.max(...))` в 7 компонентах.

### UTIL-7. `mergeWlAttrs` / `deepMerge` · P2 · S

Сделать публичными: они нужны тем, кто пишет обёртки над компонентами Gavia и хочет корректно объединять `class`/`style`.

### UTIL-8. `createWlLocaleFromIntl(code, overrides?)` · P1 · M

Сейчас `locale.ts` — это 389 строк, две полные копии словаря (ru/en), включая названия месяцев и дней недели, разделитель дробной части и единицы размера.

Если генерировать всё, что знает `Intl` (месяцы, дни, первый день недели, числа, единицы, плюрализация), то в словаре остаются только ~40 UI-строк. Поддержать новый язык становится вопросом одного JSON. Хороший аргумент для open source: «добавить язык — 40 строк».

---

## Composables (`gavia-ui/composables`)

### UTIL-9. `useWlTheme()` · P1 · M

Сейчас эта логика размазана по Playground: `themes.ts`, `preferences.ts`, `theme-transition.ts`, inline-скрипт до первой отрисовки. Нужна она любому приложению:

```ts
const { theme, preference, setPreference, resolved } = useWlTheme({
  themes: { light: "gavia", dark: "gavia-dark" },
  storageKey: "wl-theme",          // опционально
  transition: true                 // плавная смена, уважает prefers-reduced-motion
});
// preference: "light" | "dark" | "system"; resolved учитывает matchMedia
```

Плюс экспорт `wlThemeInitScript(options)`: строка для `<script>` в `index.html`, чтобы не было вспышки темы. Это уже реализовано в Playground и протестировано, осталось перенести.

### UTIL-10. `useWlAnnouncer()` — live region · P1 · S

```ts
const { announce } = useWlAnnouncer();
announce("Найдено 12 результатов");               // polite
announce("Ошибка сохранения", "assertive");
```

Один скрытый `aria-live`-контейнер на приложение (через provide или ленивое создание в `body`). Используется:
- в Autocomplete и CommandPalette — число результатов (A11Y-7);
- в Toast — ассертивные ошибки;
- в FileUpload — отклонённые файлы;
- в копировании «Скопировано».

### UTIL-11. `useWlRovingFocus()` · P1 · M

Roving tabindex для групп: стрелки, Home/End, ориентация, `loop`, пропуск disabled. Нужен в Tabs (сейчас логика своя внутри), Segmented, Toolbar, RadioGroup, Menu, Pagination (опционально).

### UTIL-12. `useWlListbox()` / `useWlTypeahead()` · P0–P1 · M

Расширение текущего `useListNavigation`:
- ID опций и `aria-activedescendant`;
- `scrollIntoView`;
- typeahead;
- пропуск disabled;
- PageUp/PageDown.

Сначала внутренний (P0, ради A11Y-1/2), потом публичный: пользователям нужен для собственных списков.

### UTIL-13. `useWlClipboard()` · P2 · S

`copy(text)` → `Promise<boolean>`, состояние `copied` со сбросом через N мс. В Playground копирование уже есть. Основа для `WlCopyButton` (NEW-13).

### UTIL-14. `useWlDisclosure()` / `useWlControllable()` · P2 · S

Паттерн «контролируемый или неконтролируемый v-model» вручную повторён в `WlAccordion` (`inner` + `isControlled`), частично в Chip и Tabs:

```ts
const open = useWlControllable(props, "open", emit, { defaultValue: false });
```

Нужен для единообразия, когда компонентов станет больше. Внутренний на первом этапе.

### UTIL-15. `useWlFocusTrap()`, `useWlScrollLock()`, `useWlDismiss()`, `useWlAnchoredPosition()` · P2 · M

Публичные обёртки над `overlayLifecycle`, `bodyScrollLock` и `anchoredOverlay`, чтобы пользователь мог сделать свой оверлей, который корректно встаёт в общий стек Gavia: Escape закрывает верхний, фокус возвращается.

Это сильный аргумент для библиотеки: «свой поповер, который не ломает наши модалки». Публиковать после оптимизации из [PERF-2](07-performance-and-bundle.md).

### UTIL-16. `useWlMediaQuery()` / `useWlBreakpoint()` / `useWlReducedMotion()` · P2 · S

Брейкпоинты описаны в `docs/responsiveness.md` и токенах. Composable, который читает те же значения (`useWlBreakpoint().md`), нужен компонентам (Sidebar mobile, Dialog fullscreen на мобильных) и пользователям. `useWlReducedMotion` убирает разрозненные `matchMedia("(prefers-reduced-motion)")`.

### UTIL-17. `useWlHotkey()` · P3 · S

Сочетания клавиш с учётом платформы (⌘/Ctrl), без конфликтов с полями ввода. Логика `Ctrl+K` из CommandPalette.

---

## Итоговый приоритет

| Приоритет | Что |
|---|---|
| P0 | UTIL-12 (внутренний, ради доступности списков) |
| P1 | UTIL-1 плюрализация, UTIL-2 числа и размеры, UTIL-5 контраст, UTIL-8 locale из Intl, UTIL-9 тема, UTIL-10 announcer, UTIL-11 roving focus, UTIL-3 даты |
| P2 | UTIL-4, 6, 7, 13, 14, 15, 16 |
| P3 | UTIL-17 |

Сначала делать внутренние модули и переводить на них компоненты. Публиковать — когда API устоялся на двух-трёх собственных потребителях.
