# Адаптивность

Адаптивность настраивается обычным CSS для конкретной страницы или компонента.
В Docs (`?view=docs&section=responsive`) есть четыре рабочих Vue-примера:
ширина окна, auto-fit, container queries и изменение поведения через matchMedia.
Код для копирования берётся из тех же SFC.

## Выбор условия

| Задача | Механизм |
| --- | --- |
| Меняется компоновка всей страницы | Mobile-first `@media (min-width: …)` |
| Равные карточки занимают доступное место | `wl-grid` с auto-fit и минимумом колонки |
| Одна карточка используется в разных областях | Именованный CSS query container |
| Меняется поведение: раскрытие, доступность, lifecycle | `matchMedia` после монтирования |

Начинайте с одной колонки и порядка DOM, который подходит для чтения.
Добавляйте колонки, когда для них хватает места. Ориентируйтесь на ширину
содержимого: карточка в боковой панели может оставаться узкой на большом экране.
Расположение меняйте через CSS. JavaScript нужен, если меняется поведение.

## Каталог брейкпоинтов

| Экспорт `wlBreakpoints` | Ширина |
| --- | --- |
| `sm` | 640 px |
| `md` | 900 px |
| `lg` | 1200 px |

Это числовой каталог, экспортируемый из `gavia-ui`. Его источник —
`packages/ui-kit/tokens/source.json → breakpoints`, производный файл —
`src/design-system/tokens.generated.ts`. Каталог не переписывает готовый CSS.
В примере ширины viewport соответствуют одной, двум, трём и четырём колонкам.

```css
.page-grid { display: grid; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 640px) {
  .page-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 900px) {
  .page-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```

`var()` работает в значениях свойств, а не в условиях размеров `@media` или
`@container`. Числовую границу нужно записать в CSS явно. Например,
`@media (min-width: var(--wl-breakpoint-md))` не является рабочей настройкой.
[CSS custom properties — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties).

## Локальное переопределение

Токены композиции можно задать на корне конкретной страницы:

```css
.project-page {
  --wl-layout-page-max: 1440px;
  --wl-layout-page-gutter: clamp(12px, 3vw, 32px);
  --wl-layout-grid-min: 280px;
  --wl-layout-grid-gap: var(--wl-space-lg);
}
```

- `page-max` ограничивает контейнер, `page-gutter` задаёт боковые отступы;
- `grid-min` задаёт целевой минимум колонки auto-fit;
- `grid-gap` задаёт промежуток `wl-grid` без `data-space`;
- `data-space` выбирает gap из общей шкалы и имеет приоритет над grid-gap.

Токены наследуются потомками страницы. Они меняют размеры и доступное место,
а не пороги media queries. `min(100%, …)` в примитиве не даёт целевому минимуму
колонки вытолкнуть сетку за узкий контейнер.

Если конкретной композиции нужен переход при 820 px, напишите локальное
`@media (min-width: 820px)`. Не обязательно двигать общую шкалу. Если одновременно
меняется поведение, `matchMedia` должен получить то же число.

Для изменения каталога **в исходниках библиотеки** поменяйте `breakpoints` в
`tokens/source.json` и выполните `pnpm tokens:sync`, затем `pnpm tokens:check`.
Генератор обновляет каталог, но не ручные media queries. Согласуйте CSS и JS
отдельно. Глобального runtime-переключателя брейкпоинтов у библиотеки нет.

## Container queries

Контейнер задаёт `container-type: inline-size` и имя; условия применяются к его
потомкам. В живом примере WlSelect меняет запрошенную ширину 280/420/640 px,
она ограничивается реальным родителем. Две колонки появляются от 420 px фактической
ширины, размер заголовка меняется от 560 px.

```css
.card-host { container-type: inline-size; container-name: project-card; }
.card { display: grid; grid-template-columns: minmax(0, 1fr); }
@container project-card (min-width: 420px) {
  .card { grid-template-columns: 96px minmax(0, 1fr); }
}
```

[Container queries — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries).

## MatchMedia, SSR и очистка

В примере `MediaBehavior.vue` граница берётся из `wlBreakpoints.md`. `window`
читается только в `onMounted`; исходное значение `null` одинаково для SSR и
первого клиентского рендера. Подписка на `change` пересчитывает режим, а
`onBeforeUnmount` удаляет именно тот listener. Значение поля сохраняется в
модели вне условной разметки. При сужении фильтр остаётся открытым, если
внутри него находится фокус; при расширении фокус с исчезающей кнопки переносится
в поле после обновления DOM. Устаревший callback не выполняется после смены
режима или размонтирования.

[matchMedia — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia),
[MediaQueryList: change — MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event).

CSS и matchMedia согласовываются по одной границе, если они управляют одним
режимом. Не добавляйте обработчик каждого `resize` для сетки, которая может
перестроиться средствами CSS. При скрытии области проверьте активный фокус,
сохранение введённых данных и доступность переключателя.

## Встроенные границы компонентов

| Элемент | Условие | Поведение |
| --- | --- | --- |
| WlPageHeader | До 720 px | Перестройка расположения через CSS |
| WlFilterBar | До 720 px | CSS + matchMedia; мобильная панель, inert/aria-hidden и scroll lock |
| WlSidebar | До 900 px | Мобильная раскладка CSS; приложение управляет mobileOpen/pinned/collapsible |

Изменить эти границы через публичный prop пока нельзя. Токены ширины drawer
и sidebar задают размер панели. У WlFilterBar вместе с CSS-порогом должны
переключаться режим панели, доступность и блокировка прокрутки.
Диалоги ограничивают размер относительно viewport, длинные интерактивные группы
имеют локальную прокрутку. Композиция шапки и Docs playground использует собственные
условия по месту для содержимого — это не универсальная шкала библиотеки.

## Проверка композиции

- Узкий экран, точная граница и размер сразу до/после неё.
- Узкий родитель независимо от ширины окна.
- Длинные подписи, локализация, масштаб и перенос действий.
- Нет горизонтальной прокрутки всей страницы ради одной таблицы.
- Порядок Tab совпадает с DOM; фокус и модель сохраняются при перестройке.
- Оверлеи, маска, inert/aria-hidden и scroll lock переключаются вместе.
- Проверены Escape и возврат фокуса.
- Слушатели создаются в lifecycle и удаляются при размонтировании.

Связанные руководства: [CSS-примитивы](primitives.md),
[устройство playground](playground.md), [дизайн-система](design-system.md).
