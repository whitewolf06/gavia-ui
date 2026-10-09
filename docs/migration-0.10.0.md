# Upgrade to Gavia UI 0.10.0

Version 0.10.0 adds a fifth theme, Gavia Dark, and renames White and Graphite
to Classic and Classic Dark. It updates compatibility and quality checks,
the playground and narrow alert layouts. Publication and check results
are recorded in the [release history](releases.md).

## Breaking changes: theme catalog types

`wlDesignThemes` is a public readonly tuple. In 0.10.0 it has five entries
instead of four; literal labels `"White"` / `"Graphite"` changed to `"Classic"` /
`"Classic Dark"`. Code relying on the exact tuple length, an old label type or
using a label as an identifier needs changes. Add `gavia-dark` to exhaustive
`WlThemeName` branches.

Identifiers `white` / `graphite`, previous CSS paths and the four themes’ positions
are preserved. Gavia Dark is appended to the public catalog; playground grouping
does not change its order. Select themes through `name` and
use `label` for display:

```ts
import { wlDesignThemes, type WlDesignTheme, type WlThemeName } from "gavia-ui";

const themes: readonly WlDesignTheme[] = wlDesignThemes;
const selectedTheme: WlThemeName = "gavia-dark";
const selected = themes.find((theme) => theme.name === selectedTheme);
```

[Detailed catalog migration](migration-themes.md). Old query links and drafts
using `white` / `graphite` need no renaming. Historical
contract snapshots are preserved.

## Installation and setup

Vue `^3.4.0` remains the only required peer. The UI kit has no
runtime dependencies; setup needs neither PrimeVue nor PrimeIcons. The consumer’s
package manager does not change the API:

```bash
pnpm add gavia-ui@0.10.0 vue
# or
npm install gavia-ui@0.10.0 vue
# or
bun add gavia-ui@0.10.0 vue
```

Reset, CSS and fonts are imported explicitly. To switch among all five themes:

```ts
import { createApp } from "vue";
import App from "./App.vue";
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/themes/white.css";
import "gavia-ui/themes/graphite.css";
import "gavia-ui/themes/newspaper.css";
import "gavia-ui/themes/gavia.css";
import "gavia-ui/themes/gavia-dark.css";

document.documentElement.dataset.wlTheme = "gavia";
createApp(App).mount("#app");
```

| Theme | `data-wl-theme` | Package CSS |
| --- | --- | --- |
| Gavia | `gavia` | `gavia-ui/themes/gavia.css` |
| Gavia Dark | `gavia-dark` | `gavia-ui/themes/gavia-dark.css` |
| Classic, formerly White | `white` | `gavia-ui/themes/white.css` |
| Classic Dark, formerly Graphite | `graphite` | `gavia-ui/themes/graphite.css` |
| Newspaper | `newspaper` | `gavia-ui/themes/newspaper.css` |

For one theme, its CSS is enough. With several themes, import `white.css`
first: it sets a `:root` fallback. Selection on `html` also applies to
teleported overlays. Without explicit selection, the library keeps Classic
(`white`); `resolveWlToken` / `getWlThemeTokens` defaults are also preserved.

Primary Gavia / Gavia Dark themes use Gavia Sans 0.6 and shared geometry;
without `styles/fonts/gavia.css`, a system fallback applies. Classic / Classic Dark
keep system sans; Newspaper uses system text and serif headings.
Code uses the monospaced `--wl-mono` stack. [Font](font-gavia.md) ·
[Palette and setup](theme-gavia.md).

## Fixes and quality

- Refined Vue 3.4 support in declarations and SSR ids; Vue 3.5
  uses native ids. Vue 3.4 requires matching synchronous SSR tree order
  and hydration; asynchronous branches are not separately guaranteed.
- Select, MultiSelect and Autocomplete received list names and ARIA connections.
  WlAlert wraps actions within the available width while keeping text readable.
- The playground shows primary/additional themes, a day/night hero,
  a quick toggle and external information-card links. View Transitions
  provides one temporary page transition; the fallback uses hero crossfade,
  and `prefers-reduced-motion` disables transitions.
- “Quality and compatibility” shows actual unit tests,
  coverage, time, version and measurement source. These metrics do not replace
  browser/visual/axe results or publication confirmation.
- The release process checks the previous TypeScript/CSS/pt contract,
  installed archive, Node import, SSR/hydration, size and coverage;
  Changesets prepares versions, and CI retains tag-release previews.

After upgrading, check themes and custom overrides, fonts, ARIA/focus,
overlays and narrow alerts in your app. For SSR, insert
`context.teleports.body` before the app root; details and limitations:
[compatibility and checks](quality.md). [Release changes](../CHANGELOG.md).
