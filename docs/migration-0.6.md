# Design system 0.6.0: changes and migration

Version 0.6.0 combines PrimeVue removal and the new design system.
Vue 3 remains the only required peer. There are no runtime dependencies.

## Release contents

- 51 native Vue components, 47 SVG icons and White, Graphite, Newspaper themes.
- 416 typed tokens with foundation → semantic → component layers,
  one JSON source and reference, contrast and generation checks.
- Optional layout and typography classes in `styles/primitives.css`;
  `design-tokens.json` and exports for reading values without the DOM.
- Copyable SFC examples for every component and six working recipes:
  content list, profile, settings, content card, project wizard
  and attachment upload. Examples are checked in an installed package consumer.
- Optional overlay motion, reduced motion support, stable page width
  during scroll blocking and fixes for focus and overlay layers.
- Contract tests, browser scenarios and 78 visual baselines across three themes
  on desktop/mobile. CI checks the package on Node 18 and 24.

## Upgrade from published 0.3

Follow the [PrimeVue removal guide](migration-0.5.md):
move configuration to `WlConfig`, install the services you use
on the Vue app, and replace PrimeVue `<Column>` inside `WlTable`
with `columns` and `cell-*` slots. These initialization changes also apply to 0.6.0.

Public `Wl*` exports, models, props, events, slots, SVG icon names,
`wl-*` classes and previous CSS tokens are preserved. `pt` order:
defaults → app configuration → component instance.

## Upgrade from working 0.5

No additional configuration is required. Styles remain
explicit imports. For new layout classes, add:

```ts
import "gavia-ui/styles/primitives.css";
```

The existing 165 CSS tokens keep their names and resolved values in every theme.
For contrast, primary/danger use new `--wl-action-primary-*` and
`--wl-action-danger-*` roles. Hint text uses `--wl-text-muted`;
destructive text uses `--wl-text-danger`; keyboard focus has an explicit ring.
For custom action styling, set background, hover and text together.

Motion is enabled by default. For immediate transitions, use
`app.use(WlConfig, { motion: false })` or local `:motion="false"`.
`prefers-reduced-motion` is respected automatically.

`WlButton` sets focus before the click handler so Dialog/Drawer
return it to the opening button in Safari. `WlFileUpload` errors are announced
through `role="alert"`. Dropdown panels account for their parent’s layer.

## Application checks after upgrading

1. Update to a version with API 0.6. If moving to the new name,
   follow the [Gavia UI migration](migration-gavia.md): the first public npm release
   under the new name is [gavia-ui@0.7.0](https://www.npmjs.com/package/gavia-ui).
2. Check builds, types and the themes you use, including custom action tokens.
3. Check forms, keyboard, overlay opening/closing and focus return,
   page scrolling, dates, tables and toast/confirmation services.
4. Compare dense and narrow screens against the [design system rules](design-system.md).

Examples simulate saves and errors locally. Connect
your app’s API, validation and business rules when adopting them. After upgrading,
check actual screens with their data and assistive technologies;
library automation does not replace that review.
