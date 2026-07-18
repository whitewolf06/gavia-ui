# План разработки WhiteLife UI

Дорожная карта `@whitelife/ui-kit` от HTML-прототипа до полной дизайн-системы.
Статусы: ✅ реализовано · 🚧 в работе · ⬜ запланировано · ⛔ не входит в kit
(прикладной уровень WhiteLife, собирается в приложении поверх kit).

Каждый этап завершается контрольными проверками: `pnpm build`,
`pnpm test`, `pnpm build:playground`, `pnpm run pack` (см. agents.md §6).

---

## Этап 0. Прототип дизайн-системы — ✅

- ✅ Однофайловый каталог `whitelife-uikit-prototipe.html` (токены, 12 секций,
  ванильный JS).
- ✅ Расширение вариациями: soft/link/lg/xs-кнопки, button group, пароль,
  степпер, счётчик, съёмные теги, presence-аватары, алерты с действием,
  типы тостов, поповер, аккордеон, слайдер, шаги, 46 иконок.

## Этап 1. Техническая основа — ✅

- ✅ pnpm workspace: `packages/ui-kit` + `apps/playground`.
- ✅ Vite library mode: ESM + TypeScript declarations, strict TS.
- ✅ PrimeVue 4 unstyled; `vue`/`primevue` — peers, `primeicons` — optional peer.
- ✅ Токены `--wl-*`: foundation → semantic → component; CSS Layers
  (`wl.reset`, `wl.tokens`, `wl.components`).
- ✅ Темы `white` + `graphite` через `data-wl-theme` / явный импорт.
- ✅ Subpath exports: `.`, `styles/base.css`, `styles/reset.css`, `themes/*.css`.
- ✅ `createWlPt()` — расширяемая pt-карта; без `app.use(PrimeVue)` внутри kit.
- ✅ README (интеграция, темизация, контракт) и agents.md (правила репозитория).

## Этап 2. Базовые компоненты — ✅ (21 + директива)

| Компонент | Статус | Прототип |
| --- | --- | --- |
| `WlButton` (8 вариантов, xs–lg, loading, block) | ✅ | `.btn` |
| `WlIcon` (встроенный SVG-набор) | ✅ | `.ic` |
| `WlInput` (размеры, invalid, prefix/suffix) | ✅ | `.input` |
| `WlTextarea` | ✅ | `.textarea` |
| `WlSelect` | ✅ | `.select` |
| `WlCheckbox` (+ indeterminate) | ✅ | `.checkline` |
| `WlRadio` | ✅ | `.box.rnd` |
| `WlSwitch` (sm/md) | ✅ | `.switch` |
| `WlTag` (5 цветов, removable) | ✅ | `.tag` |
| `WlChip` (фильтр, счётчик) | ✅ | `.chip` |
| `WlBadge` (+ dot) | ✅ | `.nav-badge`, `.bell-dot` |
| `WlAvatar` (24–48, presence) | ✅ | `.avatar` |
| `WlCard` (title/content/footer, hoverable) | ✅ | `.card` |
| `WlTabs` (items, счётчики, панели) | ✅ | `.tabs` |
| `WlAlert` (4 типа, action, closable) | ✅ | `.alert` |
| `WlProgress` (+ thin, ok) | ✅ | `.progress` |
| `WlSkeleton` | ✅ | `.skel` |
| `WlSpinner` (+ light) | ✅ | `.spinner` |
| `WlDialog` | ✅ | `.modal` |
| `WlDrawer` | ✅ | `.drawer` |
| `WlDivider` | ✅ | `.divider` |
| `WlTooltip` (директива) | ✅ | `[data-tip]` |

Проверки этапа: build ✓ · typecheck ✓ · 30/30 тестов ✓ · playground ✓ ·
pack ✓ (Vue/PrimeVue вне бандла).

## Этап 3. Навигация и оверлеи — ✅ (11 компонентов + composable)

| Компонент | Статус | Прототип |
| --- | --- | --- |
| `WlIconButton` (sm/md, счётчик/точка) | ✅ | `.icb` |
| `WlButtonGroup` | ✅ | `.btn-group` |
| `WlSegmented` (поверх SelectButton) | ✅ | `.seg` |
| `WlNavItem` (рейк с бейджем, width: 100%) | ✅ | `.nav-item` |
| `WlBreadcrumbs` (последний — `aria-current`) | ✅ | `.crumbs` |
| `WlPagination` (1-based `v-model:page` + compact) | ✅ | `.pager` |
| `WlMenu` (static + popup, заголовки, danger) | ✅ | `.menu` |
| `WlPopover` | ✅ | `.popover` |
| `WlToast` + `useWlToast()` + `WlToastService` (4 типа) | ✅ | `.toast` |
| `WlEmpty` | ✅ | `.empty` |
| `WlPill` (статус с точкой, 5 вариантов) | ✅ | `.pill` |

Проверки этапа: build ✓ · typecheck ✓ · 59/59 тестов ✓ · playground ✓ ·
pack ✓ (в архиве только dist/styles/themes/README/package.json).

## Этап 4. Формы и данные — ✅ (8 компонентов)

Политика реализации (уточнена): формы — собственные компоненты напрямую из
прототипа; таблица — обёртка PrimeVue DataTable.

| Компонент | Статус | Прототип |
| --- | --- | --- |
| `WlNumberInput` (степпер, клавиатура, clamp) | ✅ | `.stepper` |
| `WlPasswordInput` (глазок, aria-pressed) | ✅ | `.input-wrap` + `#pw-toggle` |
| `WlSlider` (заливка через `--wl-slider-pct`) | ✅ | `.slider` |
| `WlAccordion` (details/summary, single, controlled) | ✅ | `.acc` |
| `WlSteps` (done/current/pending) | ✅ | `.steps` |
| `WlField` (label + hint + error, useId-связка) | ✅ | `.field` |
| `WlTable` (DataTable: columns, cell-слоты, numeric, empty) | ✅ | `.table` |
| `WlStatCard` (label + value + focus-bar) | ✅ | `.stat-card` |

Заход 4a (формы) — собственные компоненты без PrimeVue; заход 4b — таблица на
DataTable, stat-card свой, плюс проброс `id`/aria во внутренние поля у
`WlInput`/`WlPasswordInput`/`WlNumberInput`. Проверки: build ✓ · typecheck ✓ ·
93/93 тестов ✓ · playground ✓ · pack ✓ (в kit 40 компонентов).

## Этап 5. Прикладной слой WhiteLife — ⛔ не в kit

Собирается в приложении из примитивов kit, в библиотеку не попадает
(agents.md §2: без бизнес-логики):

- ⛔ строка задачи (`.task`), строка заметки (`.note-row`)
- ⛔ таймлайн (`.tl-items`), agenda (`.ag-row`), строки настроек (`.set-row`)
- ⛔ командная палитра (`.palette`)
- ⛔ календарные ячейки (`.cal-day`), мини-график недели (`.week-bars`)
- ⛔ мини-карточки контента (`.note-mini`, `.tile`)

## Non-goals (зафиксировано)

- Pinia, Vue Router, API-клиенты, Markdown/Mermaid — никогда в runtime deps.
- Публикация пакета — только по отдельной явной команде.
- Tailwind / CSS-in-JS — не используются.
