# Базовые CSS-примитивы

Эти элементы не требуют Vue-компонента или плагина. Разметка сохраняет нативную
семантику, а оформление использует общие токены. Подключите стили явно:

```ts
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css";
import "gavia-ui/themes/white.css";
```

Reset необязателен; если он нужен приложению, подключите его перед base.css.
Контейнер использует border-box и не зависит от reset для расчёта ширины.

## Контейнеры

| Разметка | Назначение |
| --- | --- |
| `wl-container` | Центрирование страницы, max 1240 px и боковой gutter 24 px |
| `wl-container wl-container--narrow` | Статья или инструкция, max 72ch и тот же gutter |
| `wl-container wl-container--fluid` | Вся ширина родителя с боковым gutter |
| `wl-container wl-container--full` | Вся ширина родителя без gutter |

```html
<header>
  <div class="wl-container">Логотип, навигация и действия</div>
</header>
<main class="wl-container">
  <article class="wl-container wl-container--narrow">Текст статьи</article>
</main>
```

Модификаторы меняют ширину и отступы, а не создают другой layout. Выберите один
модификатор. Fluid/full заполняют родителя, а не выходят за его границы.
Для одинакового выравнивания шапки и страницы используйте одинаковый контейнер.
Не вкладывайте несколько одинаковых gutter без необходимости.

Токены: `--wl-layout-page-max`, `--wl-layout-page-gutter`,
`--wl-layout-reading-max`. Узкий контейнер ограничивается шириной родителя.

## Stack, inline и grid

- `wl-stack` — вертикальная группа.
- `wl-inline` — строка с переносом и выравниванием элементов по центру.
- `wl-grid` — равные адаптивные колонки.
- `data-space` — gap: none, 2xs, xs, sm, md, lg, xl, 2xl, 3xl, 4xl.

Grid использует `repeat(auto-fit, minmax(min(100%, var(--wl-layout-grid-min)), 1fr))`.
По умолчанию минимальная целевая ширина — 240 px. Число колонок зависит от
ширины самого контейнера. `min(100%, …)` позволяет колонке стать уже 240 px
в узком родителе. Нужное количество колонок и пропорции задаются обычным CSS
конкретного экрана; готовых `wl-col-6` или Bootstrap-классов в библиотеке нет.

```html
<section class="wl-stack" data-space="xl">
  <div class="wl-grid" data-space="lg">
    <article class="wl-surface">Первая карточка</article>
    <article class="wl-surface">Вторая карточка</article>
  </div>
  <div class="wl-inline" data-space="sm">Действия</div>
</section>
```

`wlBreakpoints`: sm 640, md 900, lg 1200 px. CSS custom properties не работают
в условиях media queries: укажите числовую границу. Порядок DOM должен совпадать
с порядком чтения. Не скрывайте обязательное содержимое при адаптации.
Подробнее: [адаптивность](responsiveness.md) — настройка композиции, container queries,
согласование CSS/JS и реальные границы готовых компонентов.

## Поверхности и локальная прокрутка

`wl-surface` задаёт фон, цвет текста, границу, радиус и padding.
`wl-rule` используется на `hr`; смысл разделения задаёт HTML.
`wl-scroll-area` ограничивает прокрутку своим контейнером. Для интерактивной
области добавьте `tabindex="0"`, `role="region"` и доступное имя.
Не оборачивайте всю страницу в горизонтальную прокрутку ради одной таблицы.
`wl-visually-hidden` оставляет пояснение доступным вспомогательным технологиям.

## Слои и z-index

| Роль | Значение по умолчанию | Назначение |
| --- | --- | --- |
| `--wl-layer-base` | 0 | Позиционированное обычное содержимое |
| `--wl-layer-sticky` | 50 | Закреплённая шапка и навигация |
| `--wl-layer-navigation` | 40 | Desktop sidebar |
| `--wl-layer-mask` | 70 | Маски диалогов и drawer |
| `--wl-layer-popover` | 80 | Выпадающие панели |
| `--wl-layer-command` | 90 | Command palette |
| `--wl-layer-filter` | 90 | Mobile filter drawer |
| `--wl-layer-navigation-modal` | 90 | Mobile sidebar |
| `--wl-layer-toast` | 100 | Уведомления |

В одной группе слоёв сравниваются z-index. `transform`, `opacity < 1`,
`isolation: isolate` и некоторые сочетания position/z-index создают новый
stacking context. Большое число у ребёнка не поднимает его выше родительского
контекста. `wl-isolate` намеренно ограничивает локальные декоративные слои.

```css
.page-navigation {
  position: sticky;
  top: 0;
  z-index: var(--wl-layer-sticky);
}
```

Z-index не управляет фокусом, блокировкой прокрутки или жизненным циклом окна.
Для интерактивных оверлеев используйте готовые компоненты. Телепортированные
picker/menu вычисляют слой с учётом своего anchor, поэтому внутри модального
окна фактический уровень панели может быть выше базового popover.
Прежние component-токены `--wl-mask-z`, `--wl-overlay-z` и другие сохраняются.

## Живые примеры

Docs → Layout и сетка показывает контейнеры, равные и пропорциональные колонки,
адаптацию, промежутки, вложенность, layout страницы, helpers и локальные слои.
Каждый пример имеет общий источник живой разметки и копируемого Vue SFC.

Структура руководства учитывает подробное разделение тем в документации
Bootstrap: [контейнеры](https://getbootstrap.com/docs/5.3/layout/containers/),
[сетка](https://getbootstrap.com/docs/5.3/layout/grid/),
[колонки](https://getbootstrap.com/docs/5.3/layout/columns/),
[промежутки](https://getbootstrap.com/docs/5.3/layout/gutters/).
Реализации примеров используют собственные токены и CSS Grid Gavia UI.
