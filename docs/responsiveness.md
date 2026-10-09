# Responsiveness

Use ordinary CSS to adapt a particular page or component.
Docs (`?view=docs&section=responsive`) contains four working Vue examples:
viewport width, auto-fit, container queries and behavior changes through matchMedia.
Copyable code comes from the same SFCs.

## Choosing a condition

| Requirement | Mechanism |
| --- | --- |
| The whole page layout changes | Mobile-first `@media (min-width: …)` |
| Equal cards fill available space | `wl-grid` with auto-fit and a column minimum |
| One card appears in different regions | A named CSS query container |
| Behavior changes: expansion, accessibility, lifecycle | `matchMedia` after mounting |

Start with one column and a readable DOM order.
Add columns when there is room. Follow content width: a sidebar card may remain
narrow on a large screen. Use CSS for positioning; use JavaScript for behavior changes.

## Breakpoint catalog

| `wlBreakpoints` export | Width |
| --- | --- |
| `sm` | 640 px |
| `md` | 900 px |
| `lg` | 1200 px |

This numeric catalog is exported from `gavia-ui`.
Its source is `packages/ui-kit/tokens/source.json → breakpoints`;
the derived file is `src/design-system/tokens.generated.ts`.
The catalog does not rewrite existing CSS. The viewport example uses
one, two, three and four columns.

```css
.page-grid { display: grid; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 640px) {
  .page-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 900px) {
  .page-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```

`var()` works in property values, not size conditions in `@media` or `@container`.
Write numeric thresholds explicitly. For example,
`@media (min-width: var(--wl-breakpoint-md))` is not a working configuration.
[CSS custom properties — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties).

## Local overrides

Set composition tokens at a particular page root:

```css
.project-page {
  --wl-layout-page-max: 1440px;
  --wl-layout-page-gutter: clamp(12px, 3vw, 32px);
  --wl-layout-grid-min: 280px;
  --wl-layout-grid-gap: var(--wl-space-lg);
}
```

- `page-max` limits the container; `page-gutter` sets side padding.
- `grid-min` sets the target minimum for an auto-fit column.
- `grid-gap` sets the `wl-grid` gap without `data-space`.
- `data-space` selects a gap from the shared scale and overrides grid-gap.

Page descendants inherit these tokens. They change dimensions and available
space, not media-query thresholds. `min(100%, …)` in the primitive prevents
the target column minimum from pushing a grid beyond a narrow container.

If a particular layout needs an 820 px transition, write local
`@media (min-width: 820px)`. There is no need to change the shared scale.
If behavior also changes, give `matchMedia` the same number.

To change the catalog **in library source**, edit `breakpoints` in
`tokens/source.json` and run `pnpm tokens:sync`, then `pnpm tokens:check`.
The generator updates the catalog, not handwritten media queries.
Align CSS and JS separately. The library has no global runtime breakpoint switch.

## Container queries

A container sets `container-type: inline-size` and a name; conditions apply
to its descendants. In the live example, WlSelect changes the requested width
between 280/420/640 px, bounded by the real parent. Two columns appear at an
actual width of 420 px; the heading size changes at 560 px.

```css
.card-host { container-type: inline-size; container-name: project-card; }
.card { display: grid; grid-template-columns: minmax(0, 1fr); }
@container project-card (min-width: 420px) {
  .card { grid-template-columns: 96px minmax(0, 1fr); }
}
```

[Container queries — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries).

## MatchMedia, SSR and cleanup

`MediaBehavior.vue` takes its threshold from `wlBreakpoints.md`.
It reads `window` only in `onMounted`; the initial `null` value is the same
for SSR and the first client render. A `change` subscription recalculates
the mode, and `onBeforeUnmount` removes that exact listener. The input value
stays in a model outside conditional markup. On narrowing, the filter stays
open if it contains focus; on widening, focus moves from a disappearing button
to the input after the DOM update. Stale callbacks do not run after a mode
change or unmount.

[matchMedia — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia),
[MediaQueryList: change — MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event).

Align CSS and matchMedia at the same threshold when they control one mode.
Do not add a listener for every `resize` to a grid that CSS can reflow.
When hiding a region, check active focus, preserved input and access to the toggle.

## Built-in component thresholds

| Element | Condition | Behavior |
| --- | --- | --- |
| WlPageHeader | Below 720 px | CSS layout reflow |
| WlFilterBar | Below 720 px | CSS + matchMedia; mobile panel, inert/aria-hidden and scroll lock |
| WlSidebar | Below 900 px | Mobile CSS layout; the application controls mobileOpen/pinned/collapsible |

These thresholds currently have no public prop override. Drawer and sidebar
width tokens control panel size. WlFilterBar must switch panel mode,
accessibility and scroll locking along with its CSS threshold.
Dialogs constrain their size against the viewport; long interactive groups
have local scrolling. Playground header and Docs layouts use content-specific
conditions rather than a universal library scale.

## Reviewing a layout

- A narrow screen, the exact threshold and widths immediately before/after it.
- A narrow parent, independent of viewport width.
- Long labels, localization, zoom and wrapping actions.
- No whole-page horizontal scrolling for one table.
- Tab order matches DOM order; focus and models survive reflow.
- Overlays, masks, inert/aria-hidden and scroll lock switch together.
- Escape and focus restoration are checked.
- Listeners are created in lifecycle and removed on unmount.

Related guides: [CSS primitives](primitives.md),
[playground architecture](playground.md), [design system](design-system.md).
