# Basic CSS primitives

Layout and typography classes work with ordinary HTML.
They need no Vue component or plugin. Styling uses shared tokens.
Import styles explicitly:

```ts
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css";
import "gavia-ui/themes/white.css";
```

Reset is optional; if needed, import it before base.css.
The container uses border-box and does not rely on reset to calculate width.

## Containers

| Markup | Purpose |
| --- | --- |
| `wl-container` | Centered page, max 1240 px and a 24 px side gutter |
| `wl-container wl-container--narrow` | Article or instructions, max 72ch and the same gutter |
| `wl-container wl-container--fluid` | Full parent width with a side gutter |
| `wl-container wl-container--full` | Full parent width without a gutter |

```html
<header>
  <div class="wl-container">Logo, navigation and actions</div>
</header>
<main class="wl-container">
  <article class="wl-container wl-container--narrow">Article text</article>
</main>
```

Choose one modifier: it sets width and side padding.
Fluid/full fill the parent within its width. Use the same container type
to align the header and page. Avoid nesting identical side padding unnecessarily.

Tokens: `--wl-layout-page-max`, `--wl-layout-page-gutter`,
`--wl-layout-reading-max`. The narrow container is constrained by its parent width.

## Stack, inline and grid

- `wl-stack` — a vertical group.
- `wl-inline` — a wrapping row with vertically centered items.
- `wl-grid` — equal responsive columns.
- `data-space` — gap: none, 2xs, xs, sm, md, lg, xl, 2xl, 3xl, 4xl.

Grid uses `repeat(auto-fit, minmax(min(100%, var(--wl-layout-grid-min)), 1fr))`.
The default target minimum width is 240 px. Column count depends on the
container’s own width. `min(100%, …)` lets a column shrink below 240 px inside
a narrow parent. Use page-specific CSS for fixed column counts and proportions;
the library has no `wl-col-6` or Bootstrap classes.

```html
<section class="wl-stack" data-space="xl">
  <div class="wl-grid" data-space="lg">
    <article class="wl-surface">First card</article>
    <article class="wl-surface">Second card</article>
  </div>
  <div class="wl-inline" data-space="sm">Actions</div>
</section>
```

`wlBreakpoints`: sm 640, md 900, lg 1200 px. CSS custom properties do not work
in media-query conditions; use numeric bounds. DOM order must match reading order.
Do not hide required content in responsive layouts.
See [responsiveness](responsiveness.md) for composition, container queries,
CSS/JS alignment and the actual thresholds of built-in components.

## Surfaces and local scrolling

`wl-surface` sets background, text color, border, radius and padding.
Use `wl-rule` on `hr`; HTML determines the meaning of the separation.
`wl-scroll-area` confines scrolling to its container. For an interactive region,
add `tabindex="0"`, `role="region"` and an accessible name.
Do not make the whole page scroll horizontally for one table.
`wl-visually-hidden` keeps explanatory text available to assistive technology.

## Layers and z-index

| Role | Default | Purpose |
| --- | --- | --- |
| `--wl-layer-base` | 0 | Ordinary positioned content |
| `--wl-layer-sticky` | 50 | Sticky header and navigation |
| `--wl-layer-navigation` | 40 | Desktop sidebar |
| `--wl-layer-mask` | 70 | Dialog and drawer masks |
| `--wl-layer-popover` | 80 | Dropdown panels |
| `--wl-layer-command` | 90 | Command palette |
| `--wl-layer-filter` | 90 | Mobile filter drawer |
| `--wl-layer-navigation-modal` | 90 | Mobile sidebar |
| `--wl-layer-toast` | 100 | Notifications |

z-index values are compared within one stacking context. `transform`,
`opacity < 1`, `isolation: isolate` and some position/z-index combinations
create a new context. A large child value cannot lift it above its parent
context. `wl-isolate` intentionally confines local decorative layers.

```css
.page-navigation {
  position: sticky;
  top: 0;
  z-index: var(--wl-layer-sticky);
}
```

z-index does not manage focus, scroll locking or window lifecycle.
Use existing components for interactive overlays. Teleported pickers/menus
calculate their layer using the anchor, so a panel inside a modal can be above
the base popover level. Legacy component tokens such as `--wl-mask-z`
and `--wl-overlay-z` are preserved.

## Live examples

Docs → Layout and grid shows containers, equal and proportional columns,
responsive layouts, gaps, nesting, page composition, helpers and local layers.
Each example reads its markup and copyable code from one Vue SFC.

The guide’s topic structure draws on Bootstrap documentation:
[containers](https://getbootstrap.com/docs/5.3/layout/containers/),
[grid](https://getbootstrap.com/docs/5.3/layout/grid/),
[columns](https://getbootstrap.com/docs/5.3/layout/columns/) and
[gutters](https://getbootstrap.com/docs/5.3/layout/gutters/).
The examples use Gavia UI’s own tokens and CSS Grid.
