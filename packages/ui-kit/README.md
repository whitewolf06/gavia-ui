<p align="center">
  <img src="https://raw.githubusercontent.com/whitewolf06/gavia-ui/main/docs/brand/gavia-ui-mark-lake.svg" alt="Loon — the Gavia UI mark" width="64" height="64">
</p>

# Gavia UI

[![Unit test line coverage — repository snapshot](https://raw.githubusercontent.com/whitewolf06/gavia-ui/main/docs/quality-coverage.svg)](https://github.com/whitewolf06/gavia-ui/blob/main/apps/playground/src/project/quality-report.generated.json)

Component library and design system for **Vue 3 + TypeScript**.
**53 components, 113 SVG icons, 447 design tokens and five themes:**
Gavia, Gavia Dark, Classic, Classic Dark and Newspaper. The package includes Gavia Sans 0.6.
Vue 3 is the only required peer; there are no runtime dependencies.
Styles are imported explicitly. The library is free to use,
including in commercial projects.

Created by [Dmitry Gorbach](https://github.com/whitewolf06) for his own projects,
with control over components and dependencies. The small toolkit grew into an
open-source library. [Personal website](https://gorbach-dev.ru/).

<p align="center">
  <a href="https://whitewolf06.github.io/gavia-ui/"><img src="https://raw.githubusercontent.com/whitewolf06/gavia-ui/main/docs/brand/playground-button.svg" alt="Open Playground" width="230" height="44"></a><br>
  · <a href="https://whitewolf06.github.io/gavia-ui/?view=docs">Documentation</a>
  · <a href="https://whitewolf06.github.io/gavia-ui/?view=font">Gavia Sans</a>
  · <a href="https://github.com/whitewolf06/gavia-ui">GitHub</a>
</p>

[Quality and compatibility](https://whitewolf06.github.io/gavia-ui/?view=docs&section=quality):
unit tests, Vitest/V8 coverage, browsers, accessibility, SSR and installed package checks.
The 0–100% scales show the unit pass rate and coverage.
The badge stores a line coverage measurement. Its date, version and source are
[in the JSON report](https://github.com/whitewolf06/gavia-ui/blob/main/apps/playground/src/project/quality-report.generated.json). The published playground’s quality page shows its CI build report.
It may differ from the saved snapshot. Check the current CI status separately:
[Current CI runs](https://github.com/whitewolf06/gavia-ui/actions).

Source and package archive version: **0.12.0**. [Changelog](CHANGELOG.md) ·
[Upgrade to 0.12.0](https://github.com/whitewolf06/gavia-ui/blob/main/docs/migration-0.12.0.md) ·
[0.11 type migration](https://github.com/whitewolf06/gavia-ui/blob/main/docs/migration-0.11.0.md) ·
[0.10 themes](https://github.com/whitewolf06/gavia-ui/blob/main/docs/migration-0.10.0.md) ·
[Rebrand history](https://github.com/whitewolf06/gavia-ui/blob/main/docs/migration-gavia.md).
UI Kit code uses [MIT](LICENSE); font files use
[SIL OFL 1.1](https://github.com/whitewolf06/gavia-ui/blob/main/packages/ui-kit/fonts/gavia/OFL.txt).

## Themes

### Primary

**Gavia** and **Gavia Dark** are light and dark themes with a lake palette,
shared component dimensions and **Gavia Sans**.

| Theme | Mode | `data-wl-theme` | Package CSS |
| --- | --- | --- | --- |
| **Gavia** | Light | `gavia` | `gavia-ui/themes/gavia.css` |
| **Gavia Dark** | Dark | `gavia-dark` | `gavia-ui/themes/gavia-dark.css` |

Gavia Dark was added in 0.10.0.

### Additional

Classic and Classic Dark use the system sans-serif font.
Newspaper also uses system body text, with serif headings.
All themes share the same components.

| Theme | Appearance | `data-wl-theme` | Package CSS |
| --- | --- | --- | --- |
| **Classic** | Neutral light | `white` | `gavia-ui/themes/white.css` |
| **Classic Dark** | Neutral dark | `graphite` | `gavia-ui/themes/graphite.css` |
| **Newspaper** | Light, with serif headings | `newspaper` | `gavia-ui/themes/newspaper.css` |

Choose the theme CSS and its identifier from the table. For either primary theme,
also import `gavia-ui/styles/fonts/gavia.css`. Without an explicit theme,
the library uses Classic (`white`).

## Quick start

Install the library in a Vue app:

```bash
pnpm add gavia-ui@0.12.0 vue
# or
npm install gavia-ui@0.12.0 vue
# or
bun add gavia-ui@0.12.0 vue
```

```ts
// main.ts
import { createApp } from "vue";
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css"; // optional layout and typography classes
import "gavia-ui/themes/gavia.css";
import App from "./App.vue";

document.documentElement.dataset.wlTheme = "gavia";
createApp(App).mount("#app");
```

```vue
<script setup lang="ts">
import { WlButton } from "gavia-ui";
</script>

<template>
  <WlButton>Create project</WlButton>
</template>
```

Instead of `dataset.wlTheme`, set `<html data-wl-theme="gavia">`
in `index.html`. Both Gavia themes use Gavia Sans. Without the font CSS,
the browser uses a system font. Import `gavia-ui/themes/gavia-dark.css`
and set `data-wl-theme="gavia-dark"` for Gavia Dark. Without a theme selection, the library keeps Classic (`white`).
Classic / Classic Dark / Newspaper use `themes/white.css` / `themes/graphite.css` /
`themes/newspaper.css` and identifiers `white` / `graphite` / `newspaper`.
[Theme names and compatibility](https://github.com/whitewolf06/gavia-ui/blob/main/docs/migration-themes.md).
Basic setup does not require `WlConfig`.

## Gavia Sans font

The package includes Gavia Sans 0.6: Cyrillic and Latin, six weights
100 / 300 / 400 / 500 / 600 / 700 with upright and oblique faces, WOFF2 and TTF.
It is the main font in **Gavia and Gavia Dark**. Classic, Classic Dark and Newspaper
keep their typography. Import it explicitly: `import "gavia-ui/styles/fonts/gavia.css";`.

Files are available through `gavia-ui/fonts/gavia/<file>` and can be used without Vue.
[Specimens and Gavia-Sans-0.6.zip download](https://whitewolf06.github.io/gavia-ui/?view=font) ·
[Setup and license](https://github.com/whitewolf06/gavia-ui/blob/main/docs/font-gavia.md).
The old CSS family `Gavia` is registered as a compatibility alias; import paths
and `Gavia-*.ttf` / `Gavia-*.woff2` filenames are preserved.

## Design system

Shared typography roles, spacing scale, surfaces, states and UI patterns
are described in the [guide](https://github.com/whitewolf06/gavia-ui/blob/main/docs/design-system.md). Playground `?view=system`
shows 447 tokens, five themes and contracts for 53 components.

To use layout and typography CSS classes, import
`gavia-ui/styles/primitives.css`. Exports `wlDesignTokens`,
`wlDesignThemes`, `wlSpacing`, `wlTypography`, `wlBreakpoints`, `resolveWlToken` and
`getWlThemeTokens` work without the DOM. The JSON catalog is available at
`gavia-ui/design-tokens.json`. Update the token source through
`pnpm tokens:sync` and check it through `pnpm tokens:check`.

Legacy CSS tokens keep their names and values. For readable button contrast,
primary/danger use the new `--wl-action-primary-*` and
`--wl-action-danger-*` roles. Configure custom button colors through bg/hover/text
and check their combinations. All themes have a visible focus ring.
Field hints, headings and empty states use `--wl-text-muted`.

Components use their own markup and behavior, strict TypeScript
and plain CSS with `--wl-*` variables and CSS Layers.
State management, routes, API and business rules belong to the app.

## Peer dependencies

| Package | Version | Required |
| --- | --- | --- |
| `vue` | ^3.4 | Required peer |

## Optional configuration

The optional English preset wlLocaleEn was introduced in 0.12.0.
It is not available in 0.11.1 or earlier.
[Locale and documentation policy](https://github.com/whitewolf06/gavia-ui/blob/main/docs/localization.md).

WlConfig sets global pt, locale and motion. Install services when
using toasts or confirmation dialogs. Choose English explicitly with `wlLocaleEn`:

```ts
// main.ts
import { createApp } from "vue";
import { WlConfig, WlToastService, WlConfirmationService, wlLocaleEn } from "gavia-ui";

// Import styles explicitly: reset → font → base → theme
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/themes/gavia.css";

import App from "./App.vue";

document.documentElement.dataset.wlTheme = "gavia";
const app = createApp(App);
app.use(WlConfig, { locale: wlLocaleEn });
app.use(WlToastService);
app.use(WlConfirmationService);
app.mount("#app");
```

```vue
<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlInput, WlTag } from "gavia-ui";

const text = ref("");
</script>

<template>
  <WlButton variant="primary" size="md">Create</WlButton>
  <WlInput v-model="text" placeholder="Task name" />
  <WlTag variant="blue">Release 2.0</WlTag>
</template>
```

The library does not import CSS from JS. `WlConfig` is optional; the Russian locale
and standard `pt` map remain the default fallback for compatibility. Install services
only when their components are needed. See the [0.5 migration](https://github.com/whitewolf06/gavia-ui/blob/main/docs/migration-0.5.md).

## Exports

| Subpath | Contents |
| --- | --- |
| `gavia-ui` | ESM + `.d.ts`: components, types, `createWlPt`, `WlTooltip`, manifest and tokens |
| `gavia-ui/styles/reset.css` | Minimal reset (`wl.reset` layer) |
| `gavia-ui/styles/base.css` | Tokens + component styles (`wl.tokens`, `wl.components`) |
| `gavia-ui/styles/primitives.css` | Optional layout and typography classes |
| `gavia-ui/styles/fonts/gavia.css` | Explicit Gavia Sans setup and compatible `Gavia` CSS alias |
| `gavia-ui/fonts/gavia/<file>` | WOFF2, TTF and font licenses |
| `gavia-ui/themes/<theme>.css` | `gavia`, `gavia-dark`, `white`, `graphite` or `newspaper` |
| `gavia-ui/manifest.json` | JSON contracts for all 53 components |
| `gavia-ui/design-tokens.json` | JSON catalog of tokens, themes, typography and scales |
| `gavia-ui/package.json` | Package metadata |

## Tokens and themes

Three custom property layers in the `--wl-*` namespace:

1. **Foundation** — raw values: palette (`--wl-gray-*`, `--wl-blue-*`, …),
   radii, shadows, durations and fonts.
2. **Semantic** — roles: `--wl-bg`, `--wl-text`, `--wl-accent`, `--wl-success`, …
   Reference foundation; these roles are overridden by themes.
3. **Component** — `--wl-btn-height`, `--wl-input-radius`, `--wl-focus-ring`, …
   Reference semantic; support targeted component customization.

A theme is a separate CSS file overriding semantic/foundation tokens.
Switch with `data-wl-theme` after importing the themes:

```html
<html data-wl-theme="graphite">
```

For one theme, import its CSS and set the matching attribute:

```ts
import "gavia-ui/themes/newspaper.css";
```

```html
<html data-wl-theme="newspaper">
```

`newspaper` uses an almost-white background, serif headings, sans-serif
interface text, thin dividers and small color accents.

```css
[data-wl-theme="my-brand"] {
  --wl-accent: #7c3aed;
  --wl-accent-hover: #6d28d9;
  --wl-accent-soft: #f3effd;
  --wl-accent-border: #ddd0f8;
}
```

Local subtree customization:

```css
.compact-panel {
  --wl-btn-height: 30px;
  --wl-input-height: 30px;
}
```

## Shared component contract

- `variant`, `size` (`xs`/`sm`/`md`/`lg` where applicable), `density` (`default`/`compact`);
- Explicit `disabled` / `loading` / `invalid` props;
- `class` / `style` forwarded to the root element;
- Slots (`default`, `icon`, `prefix`, `suffix`, …);
- Root data attributes: `data-wl="<name>"`, `data-variant`, `data-size`;
- Stable low-specificity classes: `.wl-btn`, `.wl-btn--primary`,
  `.wl-btn--sm`, state classes `.is-loading` and `.is-disabled`.

### Native field attributes

For composite fields `WlInput`, `WlPasswordInput`, `WlNumberInput`, `WlSelect`,
`WlMultiSelect`, `WlAutocomplete`, `WlDatePicker`, `WlCheckbox`, `WlRadio` and
`WlSwitch`, attributes `id`, `name`, `form`, `required`, `readonly`, `aria-*` and
focus/input handlers reach the actual focusable control. `class`,
`style` and `data-*` stay on the component root. This connects
fields to `WlField` and native forms without inspecting internal DOM.

`WlField` exposes `id` and its `inputId` alias in the default slot, together with
`ariaDescribedby`, `ariaInvalid`, `invalid` and `required`.

### Overlay lifecycle

`WlDialog`, `WlDrawer`, `WlPopover` and popup `WlMenu` emit shared
`open` / `close` events. Dialog, drawer and popover support `closeOnEscape`,
dismiss behavior and an accessible label; dialog and drawer also expose
`blockScroll`. In a mobile overlay stack, only the top layer closes.
It traps focus and returns it to the opening trigger after closing.
Page scroll blocking preserves the existing vertical scrollbar space
so content does not shift when an overlay opens or closes.

### Overlay motion

Dialogs, drawers, popup menus, selection panels,
command palette, toasts and tooltips animate by default. The application
setting applies to all of them:

```ts
app.use(WlConfig, { motion: false });
```

Local `motion` takes priority over `WlConfig.motion`. It is supported by
`WlDialog`, `WlConfirmDialog`, `WlDrawer`, `WlPopover`, popup `WlMenu`,
`WlSelect`, `WlMultiSelect`, `WlAutocomplete`, `WlDatePicker`,
`WlCommandPalette` and `WlToast`:

```vue
<WlDrawer v-model:visible="open" :motion="false" />
```

For the tooltip directive, use
`v-wl-tooltip="{ value: 'Help', motion: false }"`. Local `true`
enables motion even with `WlConfig.motion: false`. With the system setting
`prefers-reduced-motion: reduce`, transition durations approach
zero; the tooltip is removed immediately. Adjust speed with
`--wl-dur-3`, `--wl-dur-4` and `--wl-dur-5`.

## Pass-through (`pt`)

`createWlPt()` returns the default map and can merge overrides.
Order: defaults → application configuration → instance `pt`.
`class` and `style` merge; other attributes use the last value.

```ts
app.use(WlConfig, {
  pt: {
    button: { root: { "data-test": "app-button" } }
  }
});
```

```vue
<WlButton :pt="{ root: { 'aria-label': 'Create task' } }">Create</WlButton>
```

## Components

| Group | Components |
| --- | --- |
| Actions | `WlButton`, `WlIconButton`, `WlButtonGroup`, `WlSegmented`, `WlMenu`, `WlNavItem` |
| Inputs | `WlTimePicker`, `WlFilePicker`, `WlInput`, `WlPasswordInput`, `WlNumberInput`, `WlTextarea`, `WlSelect`, `WlMultiSelect`, `WlAutocomplete`, `WlCheckbox`, `WlRadio`, `WlSwitch`, `WlSlider`, `WlDatePicker`, `WlCalendar`, `WlColorPicker`, `WlFileUpload` |
| Data | `WlTable`, `WlPagination`, `WlBadge`, `WlTag`, `WlChip`, `WlPill`, `WlAvatar`, `WlStatCard`, `WlProgress`, `WlSkeleton`, `WlEmpty` |
| Containers | `WlCard`, `WlAccordion`, `WlTabs`, `WlDialog`, `WlDrawer`, `WlPopover`, `WlDivider` |
| Composites | `WlPageHeader`, `WlFilterBar`, `WlSidebar`, `WlCommandPalette` |
| Navigation | `WlBreadcrumbs`, `WlSteps` |
| Feedback | `WlAlert`, `WlToast`, `WlConfirmDialog`, `WlSpinner` |
| Miscellaneous | `WlField`, `WlIcon` |

Each component has a [playground guide](https://whitewolf06.github.io/gavia-ui/?view=docs):
a live example, controls, copyable Vue code, API, accessibility and first release version.
Additional exports include the `WlTooltip` directive, `createWlPt` and types
(`WlSize`, `WlDensity`, `WlButtonVariant`, `WlTabItem`, …).

### Confirmations: WlConfirmDialog + useWlConfirm

Install the service and add one dialog at the application root:

```ts
// main.ts
import { WlConfirmationService } from "gavia-ui";

app.use(WlConfirmationService);
```

```vue
<script setup lang="ts">
import { WlButton, WlConfirmDialog, useWlConfirm } from "gavia-ui";

const { confirm, confirmDanger } = useWlConfirm();

function remove(): void {
  confirmDanger({
    header: "Delete task?",
    message: "This action cannot be undone.",
    acceptLabel: "Delete",
    accept: () => { /* ... */ }
  });
}
</script>

<template>
  <WlConfirmDialog />
  <WlButton variant="danger" @click="remove">Delete…</WlButton>
</template>
```

`confirm` shows a primary button; `confirmDanger` shows a danger button
with a warning icon. Default labels come from the configured library locale.
The compatibility fallback uses `wlLocaleRu.accept` / `wlLocaleRu.reject`;
set `locale: wlLocaleEn` in `WlConfig` for English labels.

## Component manifest

The manifest describes all 53 components: props with types, defaults
and allowed enum values, slots, events, `v-model` and `introducedIn` — the first release version.
A visual editor can use it to build a palette and props inspector,
and an AI agent can use it while preparing markup.

```ts
import { wlManifest } from "gavia-ui";
import type { WlComponentManifest } from "gavia-ui";

const button = wlManifest.find((entry) => entry.name === "WlButton");
```

Or use static JSON, generated at build time in `dist/manifest.json`:

```ts
import manifest from "gavia-ui/manifest.json";
```

Types: `WlComponentManifest`, `WlPropManifest`, `WlSlotManifest`, `WlEmitManifest`,
`WlModelManifest`, `WlManifestCategory`, `WlManifestPropType`. Categories:
`actions`, `inputs`, `data`, `containers`, `composites`, `navigation`, `feedback`, `misc`.
Icon props accept `WlIconName` values; the `object` type covers
pass-through (`pt`) or complex objects such as `locale`.

## Development

```bash
pnpm build      # build (vite lib mode → dist/index.js + dist/*.d.ts)
pnpm test       # Vitest + Vue Test Utils
pnpm typecheck  # vue-tsc --noEmit
pnpm test:e2e   # desktop/mobile, Chromium/Firefox/WebKit
pnpm test:visual # five-theme baselines on desktop/mobile
pnpm icons:check
pnpm tokens:check
pnpm verify:package
pnpm verify:dependencies
```

[Compatibility, browsers, accessibility and checks](https://github.com/whitewolf06/gavia-ui/blob/main/docs/quality.md).
Applications can install the package with pnpm, npm or Bun.
Use pnpm to develop this repository.
