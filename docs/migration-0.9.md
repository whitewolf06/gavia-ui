# Gavia UI 0.9: font and new theme

Update the dependency to published version 0.9.1:

```bash
pnpm add gavia-ui@0.9.1 vue
```

Wl component names, CSS classes, tokens and import paths are preserved.
Vue is the only required peer; there are no runtime dependencies.
White remains this release’s base theme. For Gavia, import CSS
and choose the theme explicitly:

```ts
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css";
import "gavia-ui/themes/gavia.css";

document.documentElement.dataset.wlTheme = "gavia";
```

Gavia Sans changes typography only in Gavia. For White, Graphite or
Newspaper, keep the corresponding theme import and data-wl-theme.
Font CSS is not imported automatically from JavaScript. Gavia
also selects precise rendering through new `--wl-type-text-rendering`
(based on `--wl-font-text-rendering`); other theme settings are preserved.
The previous Gavia CSS family remains an alias for Gavia Sans; paths
gavia-ui/styles/fonts/gavia.css and gavia-ui/fonts/gavia/* are preserved.
Font files use the separate SIL OFL 1.1 license; UI kit code uses MIT.

WlDatePicker retains its default YYYY-MM-DD|null string model.
For new selectionMode="range", use WlDateRange
([start, end|null]) and do not pass a range into single mode.

[Font setup](font-gavia.md) · [Changelog](../CHANGELOG.md) ·
[Publication checks](releases.md)

## Subsequent compatible 0.9.x fixes

New semantic tokens --wl-text-accent/--wl-text-accent-hover separate text color
from the primary button background. If you override a custom palette, check
their contrast on bg/bg-raised/accent-soft; previous token names are preserved.
Graphite accent text is lighter for readability on soft surfaces.
Styling through --wl-accent still applies to background accents.
