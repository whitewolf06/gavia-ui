# Gavia UI design system

Gavia UI includes 53 Vue components, SVG icons, design tokens and five themes.
This guide describes shared interface rules. The current version appears
in the playground header. Docs (`?view=docs`) covers typography, layout and grid,
responsiveness, content and states, component catalog, icons, colors and API.
Design-system examples are available at `?view=system`.
Previous `?view=components` opens documentation.

## Principles

- **Clarity.** Short labels, an explicit primary action and an explanation of the result.
- **Consistency.** Shared text roles, spacing scale and state contracts.
- **Accessibility.** Keyboard support, visible focus, control labels and error messages.
- **Restraint.** Accent draws attention to an action; spacing and surfaces
  establish groups. Color is accompanied by text or an icon.
- **Independence.** The package handles UI. Validation, API, routes and business rules
  belong to the app. Vue is the only required peer.

## Token source and generation

Editable source: `packages/ui-kit/tokens/source.json`. Each token has
a stable `--wl-*` name, layer, type, category, purpose, value and optional
theme values. References use `var(--wl-name)` without a fallback. Do not put
arbitrary CSS blocks or external resources in the source.

```bash
pnpm tokens:sync   # validate the source and update every derived file
pnpm tokens:check  # check references, layers, contrast and generated output
```

The generator creates:

- The token block in `styles/base.css`, preserving component styles;
- `themes/gavia.css`, `themes/gavia-dark.css`, `themes/white.css`,
  `themes/graphite.css`, `themes/newspaper.css`;
- Optional `styles/primitives.css` for typography and layout;
- `src/design-system/tokens.generated.ts` with types and catalogs;
- `tokens/catalog.generated.json`, packaged as `design-tokens.json`.

Do not edit derived files manually. `tokens:check` runs in CI. It rejects
unknown/circular references, backward layer references, direct
component → foundation references, invalid basic value formats, missing
scale references and insufficient contrast in approved pairs.

### Layers

| Layer | Responsibility | Example |
| --- | --- | --- |
| Foundation | Palette, numeric values, font families, shadows | `--wl-blue-600`, `--wl-space-16` |
| Semantic | Surface, text, action or geometry role | `--wl-bg`, `--wl-control-height-md`, `--wl-space-lg` |
| Component | Specific component setting | `--wl-btn-height`, `--wl-input-radius` |

Semantic references foundation; same-layer semantic aliases are allowed.
Component references semantic. Cycles are forbidden. Foundation does not depend on roles
or components. Historical values use foundation `palette-*` and
`dimension-*` to preserve previous public CSS variables.

Use semantic roles for a new screen. Change component roles to configure
a specific component. Do not add another shade or spacing value if an existing
role already communicates the intended meaning.

<a id="темы-и-совместимость"></a>

## Themes and compatibility

| Theme | `data-wl-theme` / CSS | Purpose |
| --- | --- | --- |
| Gavia | `gavia` / `themes/gavia.css` | Light lake palette, Gavia Sans |
| Gavia Dark | `gavia-dark` / `themes/gavia-dark.css` | Dark Gavia, Gavia Sans |
| Classic | `white` / `themes/white.css` | Neutral light UI with blue accent; formerly White |
| Classic Dark | `graphite` / `themes/graphite.css` | Classic dark UI; formerly Graphite |
| Newspaper | `newspaper` / `themes/newspaper.css` | Paper palette, print-style headings, restrained radii |

The playground defaults to Gavia. Base `styles/base.css` tokens
and default `resolveWlToken` / `getWlThemeTokens` values retain Classic
with identifier `white` so existing apps continue using previous
values. Classic / Classic Dark change catalog labels only;
identifiers, CSS paths and previous theme positions are preserved.
Gavia Dark is available on npm since 0.10.0.
[Name and catalog migration](migration-themes.md) · [both Gavia themes](theme-gavia.md).

Themes are imported explicitly. To switch among all five, import five CSS files
and set `data-wl-theme` on `html`. Both Gavia themes also use
`styles/fonts/gavia.css`. Each file contains the complete token set,
so nested `data-wl-theme="white"` inside Classic Dark restores light
surfaces, dimensions and fonts. A local theme sets its own values;
place custom overrides after Gavia UI files. Teleported
overlays inherit the `body`/`html` theme rather than a card’s local theme.

All 165 previous public tokens and their resolved values are preserved in the three
earlier themes: Classic (`white`), Classic Dark (`graphite`) and Newspaper. This is protected
by `tests/fixtures/tokens-0.5.json` and a regression test. Historical snapshots are not
rewritten when labels change. Component names, classes, props,
events, slots and models remain unchanged.

Roles `--wl-action-primary-*` and `--wl-action-danger-*` define readable text,
backgrounds and button states. Historical `--wl-accent`, `--wl-danger` and
`--wl-on-accent` values in the earlier themes are preserved. For custom action colors,
override bg/hover/text together and check contrast.
Keyboard focus has an explicit ring. Field hints, table headings/empty state
and `WlEmpty` descriptions use readable `--wl-text-muted`.

## Typography

| Role / CSS class | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| `wl-text-display` | 40 / 48 px | 700 | Introduction; one main emphasis |
| `wl-text-title` | 28 / 36 px | 700 | Page or large dialog title |
| `wl-text-heading` | 20 / 28 px | 650 | Page section |
| `wl-text-subheading` | 16 / 24 px | 600 | Card or field group |
| `wl-text-body` | 14 / 20 px | 400 | Descriptions, instructions, forms |
| `wl-text-small` | 12 / 18 px | 400 | Explanations and compact labels |
| `wl-text-label` | 13 / 20 px | 500 | Action or field label |
| `wl-text-code` | 12 / 18 px | 400 | Identifiers and code |

Classes set appearance; HTML h1–h6 sets structure. Do not skip heading levels
to obtain a size. Limit long text to roughly 60–75 characters
per line. On mobile, display can become title. Font families
come from the theme; third-party fonts are not loaded automatically.

`wl-text-muted` / `--wl-text-muted` is for readable explanations.
`--wl-text-3` remains for decorative details and should not carry essential
instructions. Actual contrast depends on the surface behind the text.

## Spacing, grid and surfaces

| `data-space` key | none | 2xs | xs | sm | md | lg | xl | 2xl | 3xl | 4xl |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| px | 0 | 2 | 4 | 8 | 12 | 16 | 24 | 32 | 48 | 64 |

Use sm within small groups, lg between fields, xl for card padding
and 3xl/4xl between sections. Existing component dimensions are preserved rather than
forced onto the new scale. `size` sets control dimensions;
`density="compact"` sets density for busy work screens.

Import optional primitives as CSS:

```ts
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css";
import "gavia-ui/themes/white.css";
```

```html
<section class="wl-container">
  <div class="wl-stack" data-space="xl">
    <h1 class="wl-text-title">Settings</h1>
    <div class="wl-grid" data-space="lg">
      <article class="wl-surface">Content</article>
    </div>
    <div class="wl-inline" data-space="sm">Actions</div>
  </div>
</section>
```

- `wl-stack`: vertical group; `wl-inline`: wrapping row.
- `wl-grid`: responsive columns starting at 240 px; one column on narrow screens.
- `wl-container`: width up to `--wl-layout-page-max` (1240 px), 24 px side padding;
  `wl-container--narrow` — reading width up to 72ch; `--fluid` — full width with padding;
  `--full` — full width without padding. Add modifiers to `wl-container`.
- `wl-surface`: background, border, radius and 24 px padding.
- `wl-rule`: divider on native `hr`.
- `wl-scroll-area`: local scrolling for wide content; provide an accessible
  name and `tabindex="0"` for keyboard operation.
- `wl-isolate`: local stacking context for adjacent positioned layers.
- `wl-visually-hidden`: assistive-technology text.
- `data-space`: stack/inline/grid gap, lg by default.

The detailed contract, container variants and z-index rules are
in [primitives.md](primitives.md). Live examples are in Docs → Layout and grid.

Typed `wlBreakpoints` provides media-query values: sm 640, md 900, lg 1200 px.
CSS custom properties cannot be substituted into ordinary media-query conditions;
write these numeric boundaries explicitly in CSS. Content determines the layout breakpoint.
Preserve reading order, allow action wrapping and local table
scrolling. Do not hide required fields on small screens.

Cards use `--wl-elevation-surface`; floating panels use
`--wl-elevation-floating`. Simple groups need borders and spacing.
`--wl-layer-*` orders navigation, modal masks, panels and toasts;
overlay behavior manages focus and lifecycle separately from CSS.
A dropdown teleported to body accounts for its control’s layer:
options remain usable above mobile filters, Drawer and Dialog.

## Actions and states

Use primary for one main action in each group.
Secondary is for additional actions, ghost for quieter actions,
and danger for deletion or other destructive actions with clear confirmation.
Start labels with a verb: “Save”, “Add material”, “Retry”.
An icon without text needs an accessible name through `aria-label`/`ariaLabel`.

States apply only to components supporting the corresponding
manifest prop. Do not add artificial states to decorative components.

| State | Rule |
| --- | --- |
| Default / hover / pressed | Predictable feedback without shifting adjacent content |
| Focus | Visible ring, logical Tab order, no focus trap outside modals |
| Disabled | Action blocked; explain the reason nearby when needed |
| Loading | Repeat action blocked; `aria-busy` communicates state |
| Invalid | Visible error connected to the control; entered value preserved |
| Selected / active | Selection communicated by state and an accessible attribute, not color alone |

`pt` merges in defaults → WlConfig → local prop order. Slots,
props, CSS tokens and `pt` preserve the SOLID boundaries in [architecture.md](architecture.md).
The playground manifest shows the exact contract for each of 53 components.

## Patterns

### Form

Use `WlField` with a visible label. Its scoped slot supplies `id`,
`ariaDescribedby`, `invalid` and `required`. Connect them to the control:

```vue
<WlField label="Email" id="email" :error="error" required v-slot="field">
  <WlInput :id="field.id" v-model="email" type="email" required
    :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" />
</WlField>
```

For div controls such as WlSelect, also pass `aria-label` or
`aria-labelledby`: native label/for connects only labelable HTML elements.
Validate on form submission. On error, preserve input,
explain the correction and focus the first invalid field.
Placeholders supplement labels. The app defines validation rules.
A working example is in the playground “Patterns” section.

### Data

Plan four states before API integration: ready (`WlTable`), loading
(`WlSkeleton` + text + aria-busy), empty (`WlEmpty` + next step), error
(`WlAlert` + retry). Explain what happened and what to do next.
Do not disguise an error as an empty result. `cell-*` slots extend tables
without copying their implementation.

### Overlays and feedback

Dialog is for a decision requiring focused attention; Drawer shows details
while preserving context; Popover/Menu is for local selection. Escape closes;
modal focus stays within the window and returns to the initiator. Shared scroll lock
preserves page width with multiple modal elements open.
Toast reports background-action results; field errors stay near fields.
Toast/confirmation state belongs to the Vue app.

Motion is enabled by default: global `WlConfig.motion`, local `motion` prop.
`--wl-motion-fast/normal/slow/ease` roles define timing. `prefers-reduced-motion`
reduces motion in every theme, including nested themes. Transitions do not change models,
events, message lifetime or focus rules.

## Typed API and JSON

```ts
import {
  wlDesignTokens, wlDesignThemes, wlSpacing, wlTypography, wlBreakpoints,
  resolveWlToken, getWlThemeTokens, type WlDesignTokenName, type WlSpace
} from "gavia-ui";
import catalog from "gavia-ui/design-tokens.json";

const name: WlDesignTokenName = "--wl-space-lg";
const space: WlSpace = "lg";
resolveWlToken(name, "graphite"); // "16px"
getWlThemeTokens("newspaper"); // new immutable object of resolved values
```

The API works in SSR without the DOM. It returns **shipped theme values**;
it does not read custom CSS overrides or system reduced motion.
For actual page values, consumers use getComputedStyle after mounting.
Catalogs and JSON are available to editors and agents; CSS is not
imported from JS. Unknown JavaScript token/theme names throw errors.

## Accessibility and checks

System policy: regular text contrast at least 4.5:1; focus indicator contrast
on the main background at least 3:1. Approved pairs are checked in all five themes: text,
muted text, actions/hover, hints, statuses and focus. Transparent
colors are excluded from automatic calculation. This checks specific pairs rather than
certifying whole-interface accessibility. Check other combinations,
custom colors, zoom, reading order and screen-reader behavior separately.

For touch, aim for about 44 × 44 px targets: size lg, action spacing
and sufficient clickable area. Existing sm/xs dimensions are preserved.
Do not make essential actions available only through hover or color.

Before release, after checks are authorized:

```bash
pnpm tokens:check
pnpm icons:check
pnpm verify:dependencies
pnpm build
pnpm typecheck
pnpm test
pnpm build:playground
pnpm run pack
pnpm verify:package
pnpm test:e2e
pnpm test:visual
```

Vitest checks legacy contracts, all 165 previous tokens across three themes, pure API
and generator errors. Playwright checks search, themes/nested themes, contracts,
forms, data states, Drawer, focus, reduced motion and mobile width,
and records screenshots. Archive verification installs the package into an isolated consumer
with one Vue and imports the new API, JSON and CSS primitives.
Vitest uses up to four workers. Run large local unit suites, builds
and browser tests sequentially: concurrent load
may exhaust browser and SSR-import timeouts. CI runs browser jobs separately.

## Working examples and recipes

The playground has a separate Vue example for every public component:
`apps/playground/src/design-system/examples/Wl*.vue`. The “Contracts” section
controls actual manifest props: variant, size,
density and applicable states. “Variant and state matrix” displays
each axis separately; controls combine them.
Hover, press, selection and focus are checked through actual interaction. Fake
CSS classes are not used to simulate browser pseudo-states.

“Check focus” focuses the example’s first available control.
Disabled/loading explanations stay nearby. Opening, Escape, selection and
focus return use actual models and events. Toast and Confirm
use single App.vue containers; their motion/pt is configured there.

“Copy code” uses the same live-example SFC,
inserts current settings and replaces internal imports with public
`gavia-ui`. Transformation lives in `scripts/example-source.mjs`;
the isolated `verify:package` consumer uses it too.
If the browser blocks clipboard writes, a manual-copy field appears.
Success is shown only after a successful write.

### Six connected recipes

| Recipe | Available flow |
| --- | --- |
| List and CRUD | Search, status filter, sorting, pages, create/edit in Drawer, cancel, delete confirmation, Toast |
| Form | Validation, first-error focus, hints, loading, save error, retry with retained input |
| Settings | Draft, field dependencies, change indicator, cancel and save |
| Detail | Breadcrumbs, author/status, keyboard tabs, Dialog, cancel and description save |
| Wizard | Step validation, heading focus, back without data loss, review and finish |
| Attachments | File type/size/count, accessible errors, progress, cancel and retry after failure |

Source: `apps/playground/src/design-system/recipes/*.vue`. Copy each recipe
in full, including local styles. A separate nearby example shows CSS,
five themes and service setup. Utility classes require an explicit
`styles/primitives.css` import. Forms and uploads simulate responses locally;
replace simulations with app requests when adopting them. No preview
files or data are sent to external services.

### Complex content and accessibility

“Complex content” shows long labels, eight tags,
80 options, 20 table rows with unbroken identifiers,
a long error, date limits and a nested Dialog inside Drawer.
Tables scroll within their regions. The CRUD recipe’s 640 px minimum
table width keeps statuses and actions readable on mobile.
Check at 320 px,
with larger text, Tab order and top-overlay Escape behavior.
After closing a nested layer, focus returns to its parent.
Long action labels can wrap with automatic button height.
For large multiple selections, show a count through
`maxSelectedLabels` while keeping the full list accessible in the open control.
Wrap long identifiers with `overflow-wrap: anywhere` or keep
them in a scrollable table region. Do not hide page-wide overflow.

Automation covers these scenarios, field/error connections,
accessible names and keyboard behavior. Before shipping to a product,
check forms, errors, live announcements and overlays with a screen reader,
and browser zoom at 200%. This reviews a specific screen;
examples and tests do not establish accessibility for every consumer screen.

## Visual baselines

`pnpm test:visual` compares images with saved PNGs through
Playwright `toHaveScreenshot` rather than only taking screenshots. It compares six
recipes, complex content, button/palette focus, invalid fields and open
Select/Dialog/Drawer in Classic, Classic Dark and Newspaper on desktop/mobile.
Separate Gavia and Gavia Dark baselines check real Gavia Sans, home,
font page and open Select/Dialog. Five themes are covered in total.

Baselines: `apps/playground/e2e/visual-baselines/`.
Canonical environment: Windows + Chromium from pinned Playwright 1.58.2;
CI uses a separate `windows-2022` job. Desktop: 1280×900,
mobile: 390×844; DPR 1, ru-RU, UTC, fixed date, reduced motion.
Classic baseline fonts are Arial and monospaced Consolas;
Newspaper retains its heading-font role. Allowed difference: 0.2% of pixels.
During capture, the playground header uses normal positioning so it does not cover
the top of tall examples. Functional tests retain the actual sticky header.
Select list screenshots wait for panel entry and align only the frame origin
to whole CSS pixels: fractional fixed positioning changes text rasterization
during cropping. List dimensions, fonts and styles are preserved; interaction tests
check dropdown placement and accessibility.
A separate Linux job continues interaction checks in
Chromium, Firefox, WebKit and mobile Chromium.

For an intentional visual change:

1. Run `pnpm test:visual` and inspect expected/actual/diff.
2. Review changed states and all five themes in the playground.
3. Update baselines with `pnpm test:visual --update-snapshots`.
4. Review every changed PNG and rerun without updating.

CI never updates baselines automatically; screenshots and diffs are saved
as artifacts. Describe the reason for a baseline change in review.

Browser commands start a separate Vite on 4173 by default. To check
an existing local playground, set `GAVIA_E2E_BASE_URL`, for example
in PowerShell: `$env:GAVIA_E2E_BASE_URL = 'http://127.0.0.1:5175'`.
Without it, CI starts its own preview. Scenario and baseline tests
disable smooth page scrolling; separate interaction tests check
overlay motion.

## Extending the system

1. Find existing tokens, components and patterns. Identify the missing contract.
2. Add a role to source.json; preserve reference direction and theme values.
3. Run tokens:sync; update documentation and a playground example.
4. For API changes, update the manifest, types and contract tests. For icons,
   follow the [batch SVG process](icons.md).
5. Retain a working SFC example, applicable state matrix and copyable
   code for every public component. For new recipes, check errors,
   cancellation and retry, and update the recipe catalog and test.
6. Check all five themes, keyboard, touch, types, archive and consumer; run
   `test:visual` and review baseline changes.
7. Public-name or behavior changes require migration notes.

Commits, versions and publication are agreed separately. This repository’s code is
the design-system source. Figma synchronization is a separate task.

Accessibility target, contracts, SSR, coverage and budgets: [quality.md](quality.md).
