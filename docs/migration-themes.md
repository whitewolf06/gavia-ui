# Theme names and Gavia Dark

Gavia Dark and new Classic / Classic Dark labels were added in 0.10.0.
Existing four-theme setup continues to work when upgrading from 0.9.1.
[Upgrade guide for 0.10.0](migration-0.10.0.md).

## Names and identifiers

| UI and catalog label | `data-wl-theme`, `WlThemeName` | CSS import |
| --- | --- | --- |
| Gavia | `gavia` | `gavia-ui/themes/gavia.css` |
| Gavia Dark | `gavia-dark` | `gavia-ui/themes/gavia-dark.css` |
| Classic, formerly White | `white` | `gavia-ui/themes/white.css` |
| Classic Dark, formerly Graphite | `graphite` | `gavia-ui/themes/graphite.css` |
| Newspaper | `newspaper` | `gavia-ui/themes/newspaper.css` |

Classic / Classic Dark are display names. Identifiers
`white` / `graphite`, CSS paths, `theme=white` / `theme=graphite` parameters,
token values and existing catalog order are preserved.
Do not replace identifiers with `classic` / `classic-dark`.
Library base values and default `resolveWlToken` /
`getWlThemeTokens` arguments remain Classic (`white`); the playground defaults to Gavia.

## Catalog and types

`wlDesignThemes` gained a fifth entry, Gavia Dark, with `name: "gavia-dark"`.
The public readonly tuple grew from four to five entries; literal labels
`"White"` / `"Graphite"` changed to `"Classic"` / `"Classic Dark"`.
Code fixing the old tuple length or exact old label type needs changes.
Preserved identifiers do not guarantee compatibility of such inferred types.
Historical contract snapshots are not rewritten to make a check pass.

Use `WlDesignTheme` / `WlThemeName` and `name` to select a theme,
and `label` for display. Do not tie business logic to a label or index:

```ts
import { wlDesignThemes, type WlDesignTheme, type WlThemeName } from "gavia-ui";

const themes: readonly WlDesignTheme[] = wlDesignThemes;
const selectedTheme: WlThemeName = "gavia-dark";
const selected = themes.find((theme) => theme.name === selectedTheme);
```

## Gavia Dark setup

```ts
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/themes/gavia-dark.css";

document.documentElement.dataset.wlTheme = "gavia-dark";
```

Both Gavia themes use Gavia Sans. Classic, Classic Dark and Newspaper
retain their typography. Without font CSS, both Gavia themes use a system
fallback; library JavaScript does not load CSS automatically.

To switch among all five themes, import `themes/white.css` first, then
`themes/graphite.css`, `themes/newspaper.css`, `themes/gavia.css` and
`themes/gavia-dark.css`. Select the theme on `html` so teleported overlays
inherit it. Previous URLs and saved drafts using `white` / `graphite`
need no renaming.

Before upgrading, check selection of all five themes, `theme` links, contrast, fonts,
control states and open overlays. [Themes](theme-gavia.md) ·
[catalog and tokens](design-system.md#themes-and-compatibility) · [check methodology](quality.md).
