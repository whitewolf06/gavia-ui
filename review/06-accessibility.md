# 06. Доступность (a11y)

[← к оглавлению](README.md)

## Оценка: 7/10

База сильная:
- нативные элементы (`button`, `input`, `details`, `nav`, `ol`);
- `WlField` со связями `useId`;
- корректные `aria-invalid` / `aria-busy` / `aria-current`;
- фокус-ловушка и восстановление фокуса;
- `prefers-reduced-motion`;
- axe WCAG 2.2 AA в пяти темах, включая открытые оверлеи, плюс проверка контраста токенов.

Слабость в том, что автоматические проверки **не ловят поведенческие** проблемы для скринридеров. Ниже — то, что найдено чтением кода и проверкой дерева доступности Chrome.

---

## Дефекты

### A11Y-1. Combobox без `aria-activedescendant` · **P0** · S

**Где:** `WlSelect`, `WlMultiSelect`, `WlAutocomplete`.

Фокус остаётся на combobox, а активная опция подсвечивается только визуально (`data-active="true"`). У опций нет `id`, у combobox нет `aria-activedescendant`.

Проверено в Chromium через `Accessibility.getFullAXTree`: после ArrowDown фокус на `combobox`, `aria-activedescendant = null`. Скринридер при перемещении стрелками **ничего не произносит**. Пользователь NVDA/VoiceOver не может выбрать значение с клавиатуры.

axe этого не ловит (это не статическое нарушение), поэтому e2e зелёные.

**Исправление** (паттерн уже есть в `WlCommandPalette`):

```vue
<div role="combobox" :aria-activedescendant="visible ? `${listId}-opt-${active}` : undefined" ...>
<div v-for="(option, index) in options" :id="`${listId}-opt-${index}`" role="option" ...>
```

Лучше сделать это один раз в `useListNavigation` → `useWlListbox` ([UTIL-12](05-composables-and-utils.md)).

**Тесты:**
- unit: после ArrowDown `aria-activedescendant` указывает на существующий `id` с `aria-selected` или `data-active`;
- e2e (Chromium): снимок дерева доступности, где активный потомок равен ожидаемой опции.

### A11Y-2. Активная опция не прокручивается в видимую область · **P0** · S

У `.wl-select__list` `max-height: 240px; overflow-y: auto`, а `scrollIntoView` есть только в CommandPalette. На списке длиннее ~7 опций выделение после нескольких нажатий стрелки уходит за нижний край. Зрячий пользователь клавиатуры не видит, что выбрано.

**Исправление:** в `useWlListbox` следить за `active` и вызывать `scrollIntoView({ block: "nearest" })`.

**Тест:** e2e со списком на 30 опций: End → последняя опция в видимой области (`toBeInViewport`).

### A11Y-3. Дубли ID в `WlTabs` · **P0** · S

`:id="`wl-tab-${item.key}`"` и панель `:aria-labelledby="`wl-tab-${item.key}`"`. Две группы вкладок с одинаковыми ключами на странице (например, `general` в настройках и в карточке) дают дубли `id`, и панель ссылается не на ту вкладку. Дубли ID — нарушение WCAG 4.1.1 в старой редакции и практическая поломка связей.

Дополнительно:
- у таба нет `aria-controls`, у панели нет `id`;
- `tabindex="0"` на панели отсутствует. APG рекомендует фокусируемую панель, если в ней нет фокусируемых элементов.

**Исправление:** префикс из `useWlId()`: `${uid}-tab-${key}`, `${uid}-panel-${key}`, плюс `aria-controls`.

### A11Y-4. `WlAlert` всегда `role="alert"` · P1 · S

`role="alert"` = `aria-live="assertive"`: скринридер прерывает пользователя при каждом рендере. Для статичных info- и success-блоков на странице (подсказки, баннеры) это неверно. **Исправление:**
- prop `live?: "assertive" | "polite" | "off"`;
- по умолчанию `role="status"` для `info`/`success` и `role="alert"` для `danger`/`warning`.

### A11Y-5. Компоненты без гарантированного доступного имени · P1 · S–M

- **`WlIconButton`**: `ariaLabel?: string` необязателен, а кнопка из одной иконки без имени — нарушение 4.1.2. Варианты: сделать `ariaLabel` обязательным в типах, если нет слота по умолчанию (через перегрузку props), или dev-предупреждение `console.warn` в `onMounted`, если у кнопки нет `aria-label`, `aria-labelledby` и текста.
- **Select / MultiSelect / Autocomplete внутри `WlField`**: корень Select — это `div[role=combobox]`, а `<label for>` не даёт имя `div`. Документация честно говорит «задайте `aria-label`», но правильнее, чтобы `WlField` передавал в слот `labelId`, а списочные компоненты сами ставили `aria-labelledby`. Тогда `<WlField label="Город"><template #default="f"><WlSelect v-bind="f"/></template></WlField>` работает без ручного aria.
- **`WlBadge dot`** и **`WlIconButton dot`/`count`**: точка и счётчик не озвучиваются. Нужен визуально скрытый текст через locale: «есть новые», «3 непрочитанных» с плюрализацией ([UTIL-1](05-composables-and-utils.md)).
- **`WlAvatar presence`**: `aria-hidden`, статус «в сети» не передаётся. Нужен `aria-label` у обёртки или скрытый текст.
- **`WlProgress`**: нет пропсов для подписи. `aria-label` идёт через attrs, но в документации и типах этого нет.

### A11Y-6. Фон модальных окон не `inert` · P1 · S

`WlDialog` и `WlDrawer` ставят `aria-modal="true"` и ловят Tab. Но мобильные скринридеры (VoiceOver iOS, TalkBack) при свайп-навигации могут выйти за пределы диалога, если остальной контент не скрыт.

**Исправление:** при открытии модального слоя ставить `inert` на соседей body-уровня (кроме контейнера оверлея) и снимать при закрытии, со счётчиком, как у `bodyScrollLock`. Атрибут `inert` поддерживается всеми актуальными браузерами.

### A11Y-7. Нет объявлений о результатах поиска · P1 · S

`WlAutocomplete` и `WlCommandPalette` (и MultiSelect с `filter`) не сообщают «найдено N вариантов» или «ничего не найдено» для скринридера. Это стандартная часть паттерна combobox с фильтром.

**Исправление:** `useWlAnnouncer()` ([UTIL-10](05-composables-and-utils.md)), объявлять с debounce ~500 мс после изменения запроса.

### A11Y-8. `WlSteps` без списочной семантики · P2 · S

Сейчас разметка — `div` + `span`. Должно быть `<ol>` / `<li>` с `aria-current="step"` (оно уже есть). Состояние «выполнено» должно передаваться текстом, а не только иконкой галочки: например, скрытое «выполнено».

### A11Y-9. Тосты: время жизни и уровень срочности · P1 · S

- Время жизни 2.2 с нельзя изменить через `useWlToast()`. Это меньше, чем нужно для чтения сообщения с деталями. WCAG 2.2.1 (Timing Adjustable) требует возможности продлить время, хотя бы паузой при наведении или фокусе.
- Контейнер `aria-live="polite"` для всех сообщений, включая ошибки.

**Исправление:** дефолт ≥ 5 с (ошибки — sticky или 8+ с), пауза при hover/focus, `role="alert"` для error. Подробно — в [03-components.md → Toast](03-components.md#toast-p1).

### A11Y-10. Списки: typeahead и disabled-опции · P1 · M

По APG Listbox/Combobox ожидается:
- переход по первым буквам;
- PageUp / PageDown;
- пропуск disabled-опций с `aria-disabled="true"`.

Сейчас этого нет. Входит в [UTIL-12](05-composables-and-utils.md).

### A11Y-13. `WlMenu`: каждый пункт — отдельная остановка Tab · P1 · S

У всех пунктов меню `tabindex="0"` (кроме disabled). Стрелочная навигация есть, но Tab тоже проходит по **каждому** пункту. По паттерну APG Menu у меню одна остановка Tab: активный пункт `tabindex="0"`, остальные `-1` (roving tabindex), а Tab уводит фокус из меню, и popup при этом закрывается. Пункты рендерятся как `<a>` без `href`, поэтому превратить пункт в настоящую ссылку нельзя (см. CMP-2).

**Исправление:** `useWlRovingFocus` ([UTIL-11](05-composables-and-utils.md)) и закрытие popup по Tab.

### A11Y-11. `FOCUSABLE_SELECTOR` неполный · P2 · S

В `overlayLifecycle.ts` нет `[contenteditable]:not([contenteditable="false"])`, `summary`, `audio[controls]`, `video[controls]`, `iframe`, `details > summary:first-of-type`. Диалог с встроенным видео или аккордеоном неправильно зацикливает Tab.

### A11Y-12. Ошибка поля с `role="alert"` · P2 · S

`WlField` выводит ошибку с `role="alert"`. Если форма открывается с уже показанными ошибками (сервер вернул 422), каждая из них «кричит» при монтировании. Лучше:
- `aria-describedby` на поле (уже есть) + `aria-invalid`;
- объявлять **сводку** ошибок при сабмите (паттерн error summary).

Также сейчас подсказка (hint) пропадает, когда появляется ошибка. Пользователь теряет формат, который нужно ввести. Нужно показывать обе, через `aria-describedby="hint err"`.

---

## Процесс

- **A11Y-P1.** Включить `eslint-plugin-vuejs-accessibility` ([LINT-1](02-code-style-and-lint.md)): статические ошибки шаблонов ловятся при написании. P0, S, вместе с линтером.
- **A11Y-P2.** Поведенческие a11y-тесты на дерево доступности. Playwright умеет `page.accessibility` и CDP `Accessibility.getFullAXTree`, а также `toMatchAriaSnapshot()`. Добавить на каждый интерактивный компонент снимок «открыт / активна вторая опция / выбрано». P1, M. Это поймало бы A11Y-1 и A11Y-3.
- **A11Y-P3.** Ручная проверка скринридером перед 1.0: NVDA + Firefox, VoiceOver + Safari (macOS и iOS) по чек-листу 10 ключевых компонентов. Результат записать в `docs/quality.md` с датой и версиями. P1, M.
- **A11Y-P4.** Раздел Accessibility в Playground: заменить общие советы таблицей «Клавиша → действие» и «Что объявляет скринридер» для каждого компонента ([10-playground-docs.md](10-playground-docs.md)). P2, M.
