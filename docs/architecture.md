# Архитектура WhiteUI

## Границы пакета

`packages/ui-kit` публикует Vue 3-компоненты, типы, манифест, темы и CSS.
`apps/playground` показывает их и запускает браузерные проверки. Пакет не знает
о маршрутах, API, хранилище или предметной области приложения. Единственный
обязательный peer — `vue`. Сборка ESM оставляет его внешним.

Точка входа `src/index.ts` экспортирует стабильные `Wl*` имена. Все 51
компонент описаны в `src/manifest`. Относительные импорты связывают файлы
внутри пакета; alias `@/` внутри пакета не используется. Стили импортирует
потребитель явно: `styles/reset.css`, `styles/base.css`, файл темы.

## Разделение ответственности и SOLID

- **Single responsibility.** Компонент обрабатывает props, события, слоты и
  разметку. `utils/options.ts` отвечает за выбор и клавиатуру,
  `utils/anchoredOverlay.ts` — за привязку панели и закрытие,
  `utils/overlayLifecycle.ts` — за модальный фокус и прокрутку. Сервисы хранят
  состояние уведомлений/подтверждений на уровне Vue-приложения.
- **Open/closed.** Варианты задаются props, содержимое — слотами, DOM-атрибуты
  внутренних разделов — `pt`, внешний вид — `--wl-*` токенами. Для новой темы
  переопределяют токены, не копируют компоненты.
- **Liskov substitution.** При замене реализации компонента сохраняют его
  публичный `v-model`, props, emits, слоты, классы `wl-*`, `data-wl` и состояния.
  Контрактные тесты и манифест проверяют эту границу.
- **Interface segregation.** Компонент принимает только нужные ему props;
  необязательные `WlConfig`, `WlToastService` и `WlConfirmationService`
  подключаются отдельно. Не заставляйте простое поле зависеть от оверлеев.
- **Dependency inversion.** Composables получают состояние через `provide`/
  `inject` Vue и типизированный контракт сервиса. Общее поведение не импортирует
  конкретный компонент. Поэтому два Vue-приложения на странице не делят очередь
  уведомлений или подтверждение.

Код компонентов не обращается к `window`/`document` при импорте модуля. DOM
используется только после монтирования или в обработчике. Это сохраняет
SSR-импорт. Для нового компонента сначала определить публичный контракт в
манифесте, затем написать реализацию и тесты по категориям: props/модель,
события/слоты, клавиатура/фокус, мобильный экран, SSR при необходимости.

## Темы и публичный DOM

Дизайн-система описана в [design-system.md](design-system.md). Её источник —
`tokens/source.json`; генератор проверяет ссылочную модель и контраст и создаёт
CSS, типизированный каталог и JSON. `src/design-system` содержит только данные
и чистые функции разрешения значений: DOM и Vue-состояние ему не нужны.
Необязательные CSS-примитивы типографики/компоновки импортируются явно.
Playground читает те же каталоги и манифест, сохраняя собственную ответственность
за демонстрационные сценарии. Бизнес-правила паттернов не входят в пакет.

Foundation → semantic → component — направление ссылок CSS-токенов. Все
переменные начинаются с `--wl-`. Слои `wl.reset`, `wl.tokens`, `wl.components`
сохраняют предсказуемый каскад. `wl-*` классы и `data-wl`, `data-size`,
`data-variant` являются частью контракта. Новое публичное имя требует
миграционной заметки.

`pt` настраивает атрибуты конкретных DOM-разделов. Для каждого раздела
порядок: `createWlPt()` → `WlConfig.pt` → `pt` экземпляра. `class` и `style`
объединяются, остальные атрибуты последнего уровня заменяют предыдущие.
Колбэк раздела получает `{ context }` с состоянием элемента. Оставшиеся имена
`pc*` сохранены для совместимости с прежними `pt`-настройками, хотя элементы
теперь рисует WhiteUI.

Переходы оверлеев используют Vue `Transition`/`TransitionGroup` и токены
`--wl-dur-*`. `WlConfig.motion` задаёт общий режим для Vue-приложения,
локальный `motion` prop имеет приоритет; подсказка принимает тот же параметр
в объекте директивы. Анимация не должна менять модель, события открытия/закрытия,
стек фокуса или срок жизни сервисного сообщения. После закрытия элемент
удаляется из DOM; при `prefers-reduced-motion: reduce` длительность почти нулевая.
`utils/bodyScrollLock.ts` держит общий счётчик модальных блокировок и резервирует
место существующей полосы прокрутки; последний закрытый оверлей возвращает
исходные inline-стили страницы.

Разделы, имеющие стандартные значения в `createWlPt()`:

| Ключ конфигурации | Разделы |
| --- | --- |
| `checkbox` | `input`, `box`, `icon` |
| `radiobutton` | `input`, `box`, `icon` |
| `toggleswitch` | `input`, `slider`, `handle` |
| `select` | `label`, `clearIcon`, `dropdown`, `dropdownIcon`, `overlay`, `listContainer`, `list`, `option`, `optionLabel`, `emptyMessage` |
| `multiselect` | `labelContainer`, `label`, `clearIcon`, `chipItem`, `pcChip.root`, `pcChip.label`, `pcChip.removeIcon`, `dropdown`, `dropdownIcon`, `overlay`, `header`, `pcFilter.root`, `filterIcon`, `listContainer`, `list`, `option`, `optionLabel`, `emptyMessage` |
| `autocomplete` | `inputMultiple`, `chipItem`, `pcChip.root`, `pcChip.label`, `pcChip.removeIcon`, `input`, `inputChip`, `dropdown`, `dropdownIcon`, `overlay`, `listContainer`, `list`, `option`, `emptyMessage` |
| `card` | `header`, `body`, `caption`, `title`, `subtitle`, `content`, `footer` |
| `dialog` | `mask`, `header`, `title`, `headerActions`, `content`, `footer`, `pcCloseButton.root`, `pcCloseButton.icon` |
| `confirmdialog` | `mask`, `header`, `title`, `content`, `icon`, `message`, `footer` |
| `drawer` | `mask`, `header`, `title`, `content`, `footer`, `pcCloseButton.root`, `pcCloseButton.icon` |
| `progressbar` | `value`, `label` |
| `avatar` | `label`, `image` |
| `tag` | `label` |
| `divider` | `content` |
| `tablist`, `tabpanels`, `tabpanel` | `content`, `tabList`, `activeBar`; `root`; `root` |
| `tooltip` | `root`, `text`, `arrow` |
| `selectbutton` | `pcToggleButton.root`, `pcToggleButton.content` |
| `breadcrumb` | `list`, `item`, `separator` |
| `menu` | `list`, `submenuLabel`, `item`, `itemContent`, `itemLink`, `separator` |
| `popover` | `content` |
| `toast` | `message`, `messageContent`, `messageIcon`, `messageText`, `summary`, `detail`, `closeButton`, `closeIcon` |
| `datatable` | `table`, `thead`, `tbody`, `bodyRow`, `emptyMessage`, `emptyMessageCell`, `mask`, `loadingIcon` |
| `datepicker` | `dropdown`, `dropdownIcon`, `panel`, `calendarContainer`, `calendar`, `header`, `title`, `selectMonth`, `selectYear`, `pcPrevButton.root`, `pcPrevButton.icon`, `pcNextButton.root`, `pcNextButton.icon`, `dayView`, `monthView`, `month`, `yearView`, `year`, `tableHeaderCell`, `weekDay`, `dayCell`, `day` |

Разделы применяются там, где соответствующий DOM существует. Например,
`footer` диалога появляется при наличии слота `footer`.

## Проверка изменения

`@playwright/test` закреплён на `1.58.2`: Vitest проверяет контракт и логику,
а браузерные сценарии проверяют фокус, позиционирование оверлеев, мобильную
ширину, три темы и всю партию иконок. `vue-tsc` в playground проверяет
потребительские шаблоны на этапе разработки.

В тестах jsdom пути для `node:fs` получайте через `fileURLToPath` и `URL`
из `node:url`. Глобальный `URL` в этом окружении принадлежит jsdom и не
принимается файловыми API Node 18; передавайте в них строковый путь.

`pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm build:playground`,
`pnpm run pack`, `pnpm verify:package`, `pnpm verify:dependencies`,
`pnpm icons:check`, `pnpm test:e2e`.
Дополнительно `pnpm tokens:check` проверяет три темы и актуальность генерации.
`verify:package` устанавливает архив в изолированного потребителя с одним Vue,
проверяет типы и сборку, включая все копируемые SFC-примеры и рецепты из витрины.
Их источник общий с кодом для копирования, без отдельной копии разметки.
Браузерные тесты проверяют Chromium, Firefox, WebKit,
мобильный Chromium и снимки тем. Прохождение статической сборки не заменяет
проверку взаимодействия.

В чистом checkout сборка предшествует проверке типов и запуску браузеров:
playground использует публичные типы и точку входа пакета из `dist`.
В тестах демонстрационных запросов и прогресса устанавливайте Playwright Clock
перед сценарием и приостанавливайте его после загрузки примера. Время продвигайте
явно; отмена должна проверять и промежуточный прогресс, и отсутствие позднего
результата. Клик не должен соревноваться с коротким таймером загрузки.
Бюджет пакетной проверки витрины учитывает загрузку страницы и три действия
для каждого ленивого примера. Таймаут отдельных проверок состояния остаётся
5 секунд; добавление примеров увеличивает только общий бюджет пакета.

`pnpm test:visual` сравнивает reviewed PNG в трёх темах на desktop/mobile;
эталоны и окружение Windows/Chromium описаны в `docs/design-system.md`.
Витрина разделяет обязанности: ComponentExplorer получает контракт и управляет
его применимыми props; SFC-пример содержит интеграцию компонента; RecipeGallery
выбирает сценарий; каждый рецепт владеет своим черновиком и демонстрационными
данными; CodePanel отвечает только за показ/копирование кода. Запросы и
бизнес-правила рецептов не попадают в runtime библиотеки.
