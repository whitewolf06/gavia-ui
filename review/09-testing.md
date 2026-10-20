# 09. Тесты

[← к оглавлению](README.md)

## Оценка: 8.5/10

### Цифры (прогон `pnpm test:coverage` в облачной копии)

| Метрика | Значение |
|---|---|
| Unit-файлов / тестов | 63 / **701**, все проходят |
| Покрытие строк | 98.55% (порог 97) |
| Ветки | 89.31% (порог 85) |
| Функции | 86.62% (порог 81) |
| Время прогона | ~65 с (из них ~69 с суммарно — подготовка окружения jsdom) |
| Типовые тесты | `*.types.ts`: позитивные и негативные фикстуры для моделей, колонок, слотов, pt, модификаторов |
| E2E | 26 spec-файлов (~5.5 тыс. строк), 4 браузерных проекта |
| A11y | axe WCAG 2.2 AA в 5 темах, включая открытые оверлеи |
| Визуальные | 122 эталона (desktop/mobile × 5 тем), Windows/Chromium |
| Скрипты | `node --test` для release-tools, quality-report, check-compatibility |

Это уровень зрелой библиотеки. E2E написаны хорошо: локаторы по ролям (`getByRole`), нет `waitForTimeout`, ожидания через web-first-ассерты. Есть отдельная фикстурная страница `e2e.html` для изолированной проверки компонентов.

---

## Проблемы и что добавить

### TEST-1. Тесты организованы по истории, а не по компонентам · P1 · M

Имена файлов отражают этапы разработки:
- `stage5a.test.ts`, `stage5b.test.ts` — ColorPicker, Calendar, DatePicker, FileUpload;
- `pickers-0.8.test.ts`, `pickers-0.8.spec.ts` — TimePicker, FilePicker;
- `prime-removal-regression.test.ts`;
- `basic-components.test.ts`, `forms.test.ts`, `data.test.ts`, `navigation.test.ts`, `overlays.test.ts` — по несколько компонентов в каждом.

Чтобы найти тесты `WlColorPicker`, нужен поиск. Новый участник и агент не знают, куда класть тест.

**Предлагаемая структура:**

```
packages/ui-kit/tests/
  components/          WlSelect.test.ts, WlColorPicker.test.ts, … (по одному на компонент)
  contracts/           css, pt, native-attributes, accessibility, component-contract, locale, ssr
  types/               *.types.ts (компилируются vue-tsc, не запускаются)
  utils/               overlay-*, body-scroll-lock, options, merge
  assets/              icons, tokens, fonts, manifest
  setup.ts
apps/playground/tests/  (см. TEST-2)
```

Перенос делать отдельным PR без изменения содержимого тестов, чтобы сохранить историю (`git mv`).

### TEST-2. Тесты Playground внутри пакета библиотеки · P1 · S

12 файлов в `packages/ui-kit/tests` проверяют Playground и импортируют из `apps/playground`: `playground-*.test.ts`, `theme-builder`, `documentation-*`, `code-highlighting`, `responsive-documentation`, `example-source`, `project-changelog` и другие.

**Последствия:**
- `pnpm test` библиотеки падает из-за правок документации;
- граница пакетов нарушена;
- скорость тестов библиотеки страдает.

**Решение:** `apps/playground/vitest.config.ts` (jsdom), перенос файлов, корневой `pnpm test` запускает оба проекта (`vitest --project` или `pnpm -r test`).

### TEST-3. Пробелы в покрытии · P1 · S–M

Самые слабые файлы по веткам и функциям:

| Файл | Строки | Ветки | Функции |
|---|---|---|---|
| `directives/tooltip.ts` | **69%** | **51%** | **45%** |
| `components/WlSkeleton.vue` | 100% | 50% | 100% |
| `utils/useWlId.ts` | 100% | 60% | 100% |
| `components/WlTabs.vue` | 100% | 72% | 60% |
| `components/WlDialog.vue` | 100% | 75% | 75% |
| `components/WlAvatar.vue`, `WlChip.vue`, `WlSegmented.vue` | 100% | 75% | — |
| `components/WlTextarea.vue` | 100% | 78% | — |
| `utils/options.ts` | 97% | 83% | — |
| `components/WlMultiSelect.vue` | 100% | 84% | 75% |

Обратите внимание: у SFC под V8 почти всегда 100% строк, потому что шаблон компилируется в render-функцию и «исполняется» целиком. **Для компонентов ориентироваться нужно на ветки и функции.**

**Что дописать:**
- **Tooltip:** задержки show/hide, отмена при быстром уходе курсора, Escape, фокус (не только hover), обновление значения при открытом тултипе, удаление элемента с открытым тултипом (утечки), `pt`, reduced motion, все четыре placement с упором в край экрана.
- **Tabs:** клавиатура (Home/End/стрелки по кругу), уникальность ID при двух экземплярах (A11Y-3), смена `items` с исчезновением активной вкладки.
- **Dialog:** `dismissable` по клику на маску vs клик внутри с отпусканием снаружи (сейчас `@mousedown` на маске), немодальный режим, `afterLeave`.

### TEST-4. Нет тестов, которые бы поймали найденные проблемы · **P0–P1** · M

| Найдено в ревью | Каким тестом ловится |
|---|---|
| A11Y-1: нет `aria-activedescendant` | unit: после ArrowDown `aria-activedescendant` указывает на существующий `[role=option]`; e2e: `toMatchAriaSnapshot` / CDP AX-tree |
| A11Y-2: нет прокрутки к опции | e2e: 30 опций, End → `await expect(lastOption).toBeInViewport()` |
| A11Y-3: дубли ID в Tabs | unit-контракт: смонтировать **каждый** компонент дважды и проверить, что `document.querySelectorAll('[id]')` уникальны |
| PERF-1: `import * as Vue` | size-тест: сборка фикстуры `WlSelect` ≤ лимита ([PERF-8](07-performance-and-bundle.md)) |
| PERF-2: глобальные слушатели | unit: шпион на `document.addEventListener`, смонтировать 10 закрытых Select → 0 глобальных слушателей; после open → N; после close → 0 |
| CMP-3: контракт осей | контракт по манифесту: inputs объявляют `size`/`density`/`pt` |
| Двойной `choose` в Select | unit: клик по опции → ровно одно `update:modelValue` |

Особенно ценен **контракт уникальности ID** («смонтировать дважды»): он дешёвый и ловит целый класс ошибок во всех 53 компонентах.

### TEST-5. Скорость unit-тестов · P2 · S

65 с на 701 тест — в основном из-за того, что jsdom поднимается для каждого из 63 файлов. Около трети файлов DOM не нужен вовсе (CSS-контракт, токены, иконки, шрифты, манифест, changelog, release-notes).

**Варианты (можно сочетать):**
- `environment: "node"` по умолчанию + `// @vitest-environment jsdom` (или `environmentMatchGlobs` / `projects`) только там, где нужен DOM;
- `happy-dom` вместо jsdom: обычно в 2–3 раза быстрее, но проверить совместимость фокуса и `getComputedStyle`;
- `pool: "threads"` вместо `forks`, если тесты не мешают друг другу.

### TEST-6. Vitest Browser Mode для оверлеев · P2 · M

`tests/setup.ts` мокает `ResizeObserver` и `matchMedia`, а тесты позиционирования и фокуса в jsdom проверяют логику, но не реальное поведение (`getBoundingClientRect` всегда нули). **Vitest Browser Mode** (провайдер Playwright, Chromium) запускает те же тесты Vue Test Utils в настоящем браузере. Это хорошо подходит для:
- `anchoredOverlay`: позиция у края экрана, переворот вверх;
- `overlayLifecycle`: Tab-цикл, восстановление фокуса;
- `bodyScrollLock`: компенсация скроллбара;
- tooltip.

Часть таких сценариев сейчас живёт в e2e через Playground. Browser Mode проверит их без Playground и быстрее.

### TEST-7. Поиск элементов по классам вместо ролей · P3 · S

Unit-тесты в основном ищут по классам (`.wl-select__option`, `.wl-color-picker__sw`). Так как классы — часть публичного контракта, это допустимо. Но поведенческие тесты надёжнее и читаемее через роли и имена. `@testing-library/vue` (одна dev-зависимость) или собственные хелперы `getByRole` поверх VTU. Новые тесты стоит писать через роли.

### TEST-8. Условные `expect` · P2 · S

Линтер нашёл 44 `vitest/no-conditional-expect` и 57 `playwright/no-conditional-expect` + 43 `no-conditional-in-test`. Тест с `if (...) expect(...)` может пройти, ничего не проверив. Нужно пройти и заменить на явные ветки (`test.each`) или безусловные проверки.

### TEST-9. E2E против dev-сервера · P2 · S

`playwright.config.ts` поднимает `pnpm dev`, а продакшен-сборку проверяет только `pages.pw.ts` (18 сценариев). В production-сборке бывают отличия: порядок CSS-чанков, ленивые чанки, минификация, `import.meta.env.DEV`-ветки.

**Решение:** в CI основной e2e гонять на `vite build && vite preview` (локально можно оставить dev для скорости, переключая через переменную окружения).

### TEST-10. Мутационное тестирование · P3 · M

При покрытии 98% строк и 89% веток следующий шаг — **Stryker** (`@stryker-mutator/core` + vitest-runner). Он покажет, какие тесты исполняют код, но ничего не проверяют. Запускать вручную раз в релиз на `src/utils` и ключевых компонентах (Select, DatePicker, overlay), не в CI. Хорошо смотрится в портфолио («mutation score 80%+»).

### TEST-11. Комментарии и названия · P3 · S

- `tests/setup.ts`: комментарии «PrimeVue TabList needs it», «PrimeVue DatePicker overlay needs it». Моки остались, а причина устарела. Нужно переписать (или убрать моки, если они больше не нужны).
- В unit-тестах тексты на русском («Создать», «Сохранить»), а названия тестов на английском. Для open source лучше единообразно на английском (тестовые строки можно оставить русскими, если проверяется русская локаль).

---

## Итог по приоритетам

| P0 | P1 | P2 | P3 |
|---|---|---|---|
| TEST-4 (тесты на A11Y-1/2/3 вместе с исправлениями) | TEST-1, TEST-2, TEST-3 | TEST-5, TEST-6, TEST-8, TEST-9 | TEST-7, TEST-10, TEST-11 |
