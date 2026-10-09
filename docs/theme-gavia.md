# Gavia and Gavia Dark themes

Gavia is a light theme with a lake blue-gray primary action,
blue-gray selected states and warm decorative shades.
Gavia Dark uses cool-gray surfaces with a slight blue undertone
and a turquoise accent. Both use Gavia Sans.
Classic, Classic Dark and Newspaper are also available.
Classic / Classic Dark identifiers are `white` / `graphite`.
[Names and catalog compatibility](migration-themes.md).

## Light Gavia palette

| Role | Token | Gavia color |
| --- | --- | --- |
| Page background | `--wl-bg` | `#faf9f6` |
| Raised surface | `--wl-bg-raised` | `#fefdfb` |
| Secondary surface | `--wl-bg-soft` | `#eef2f3` |
| Main text | `--wl-text` | `#0f1a23` |
| Muted text | `--wl-text-muted` | `#5b6470` |
| Dividers | `--wl-border` | `#d5dfe3` |
| Strong borders | `--wl-border-2` | `#b8c7ce` |
| Primary action | `--wl-action-primary-bg` | `#3c7490` |
| Primary action hover | `--wl-action-primary-hover` | `#376b84` |
| Primary action active | `--wl-action-primary-active` | `#326179` |
| Primary action text | `--wl-action-primary-text` | `#ffffff` |
| Accent, focus and compact selection | `--wl-accent` | `#3c7490` |
| Accent text and links | `--wl-text-accent` | `#326179` |
| Accent hover | `--wl-accent-hover` | `#326179` |
| Selected item background | `--wl-accent-soft` | `#dfe8eb` |
| Selected item hover | `--wl-accent-soft-hover` | `#d3dfe4` |
| Text on dark accent | `--wl-on-accent` | `#ffffff` |
| Warm decorative accent | `--wl-accent-warm` | `#948775` |
| Soft warm accent | `--wl-accent-warm-soft` | `#efebe3` |
| Destructive action, errors and status icon | `--wl-danger` | `#ab4448` |
| Destructive action hover | `--wl-danger-hover` | `#963c3f` |
| Soft danger surface | `--wl-danger-soft` | `#f7eeed` |
| Soft danger surface hover | `--wl-danger-soft-hover` | `#f3e5e4` |
| Soft danger surface border | `--wl-danger-border` | `#e5c6c5` |

Main surfaces have a slight warm undertone; text and shadows use
dark blue-gray. Cards can be separated from the page with
`--wl-bg-raised` while keeping soft shadows.

The primary action uses lake blue `#3c7490` with white text. On hover,
it changes to `#376b84`; on press, to `#326179`. Focus uses `#3c7490`.
Links and accent text use darker `#326179`, which remains readable on soft
selected surfaces `#dfe8eb` and `#d3dfe4`.
Use `--wl-action-primary-*` for buttons and `--wl-text-accent` for links.

The muted dry-grass shade `#948775` is for small decorative details and illustrations,
roughly 5–10% of the design. Do not use it for primary actions or small
text. Use regular dark `--wl-text` on `--wl-accent-warm-soft`.
Intro badges, selected items and decorative icons use soft
blue-gray `--wl-accent-soft`; the warm role suits background illustrations.

Blue foundation tokens `--wl-blue-*` retain their color: a brand change
does not alter named colors. Success and warning use independent green and amber roles;
errors match danger #ab4448. Communicate every status
with text or an icon too.

The palette is based on a light lake reference.
Page background `#faf9f6` has a slight warm undertone.

## Gavia Dark

Choose Gavia Dark with `data-wl-theme="gavia-dark"` and the separate CSS file
`gavia-ui/themes/gavia-dark.css`. It defines dark surfaces and readable
text, action and status roles through the same token source. The light palette
above belongs to `gavia`; dark theme values are available through
`getWlThemeTokens("gavia-dark")`. Components and their DOM contract are shared.

| Role | Token | Gavia Dark |
| --- | --- | --- |
| Page background | `--wl-bg` | `#18191b` |
| Raised surface | `--wl-bg-raised` | `#222325` |
| Secondary surface | `--wl-bg-soft` | `#2c2d30` |
| Hover background | `--wl-bg-hover` | `#3c3d41` |
| Soft accent background | `--wl-accent-soft` | `#293c3f` |
| Soft accent background hover | `--wl-accent-soft-hover` | `#33484c` |
| Border | `--wl-border` | `#4b4a46` |
| Main text | `--wl-text` | `#eceee8` |
| Muted text | `--wl-text-muted` | `#b7bfc1` |
| Primary action | `--wl-action-primary-bg` | `#5faaab` |
| Links and focus | `--wl-text-accent` / `--wl-focus-color` | `#67bbbc` |
| Destructive action | `--wl-action-danger-bg` | `#ab4448` |

Page and regular card backgrounds are cool gray with a slight blue undertone.
Soft accent backgrounds use muted dark turquoise.
The turquoise accent appears on buttons, links, the logo, focus
and accent borders. A dark accent background and turquoise border distinguish the installation card.
Success, warning and error keep their colors and include
text or an icon. The home page uses a night lake with the moon and loon;
[source and prompts](brand/README.md#hero-background).

Gavia Dark was added in 0.10.0. Gavia Sans is the main font in both Gavia themes;
code uses `--wl-mono`. [Upgrade to 0.10.0](migration-0.10.0.md).

## Main font

Gavia and Gavia Dark use Gavia Sans 0.6 for text, headings and
controls through `--wl-font`; `--wl-font-heading` inherits this stack.
Import the separate `@font-face` CSS so the browser loads WOFF2.
Without it, the browser uses a system font. Code retains monospaced `--wl-mono`.

There are six weights (100, 300, 400, 500, 600, 700), each with upright and
oblique faces. [Specimens, setup and license](font-gavia.md).
The playground shows the typeface on the “Font” page (`?view=font`).

## Setup

Light Gavia and the typeface have been included in Gavia UI since 0.9.1:

```ts
import 'gavia-ui/styles/reset.css';
import 'gavia-ui/styles/fonts/gavia.css';
import 'gavia-ui/styles/base.css';
import 'gavia-ui/themes/gavia.css';
```

```html
<html lang="en" data-wl-theme="gavia">
```

For Gavia Dark, change the theme import to `gavia-ui/themes/gavia-dark.css` and
the attribute to `data-wl-theme="gavia-dark"`. Both use `styles/fonts/gavia.css`.

Both CSS files use `wl.tokens` and apply through their `data-wl-theme`.
Imports remain explicit. For theme switching, import the relevant CSS files and
change the attribute on the page root. Teleported overlays then receive
the same theme. A local section attribute works for regular nested components,
but an overlay teleported to `body` inherits the page theme.

Within the library, `base.css` and default
`resolveWlToken(name)` / `getWlThemeTokens()` values still correspond to Classic.
Specify Gavia or Gavia Dark explicitly.

```ts
import { getWlThemeTokens, resolveWlToken } from 'gavia-ui';

const page = resolveWlToken('--wl-bg', 'gavia');
const snapshot = getWlThemeTokens('gavia');
```

These functions return a shipped theme snapshot without reading the DOM or custom
overrides. A card in your own app can use:

```css
.feature-card {
  background: var(--wl-bg-raised);
  color: var(--wl-text);
  border: 1px solid var(--wl-border);
}
```

## Contrast and checks

Regular text is checked against a minimum 4.5:1 ratio; visible focus boundaries
against 3:1 on the adjacent surface. These are color-pair checks, not a guarantee
of whole-page accessibility. References: [WCAG 2.2 text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

| Gavia pair | Contrast |
| --- | --- |
| Main text / page | 16.73:1 |
| Muted text / page | 5.70:1 |
| White text / primary action | 5.13:1 |
| White text / action hover | 5.84:1 |
| White text / action active | 6.73:1 |
| Link / page | 6.39:1 |
| Link / raised surface | 6.62:1 |
| Focus / secondary surface | 4.55:1 |
| Main text / soft warm accent | 14.81:1 |

Table values are rounded for reading. The validator compares raw ratios
with thresholds before rounding. Approved pairs are checked in all five
themes; separate tests protect Gavia links and text on decorative
surfaces. Recalculate contrast after changing colors, text opacity or soft
surfaces.

The [source specification](../packages/ui-kit/tests/fixtures/gavia-palette.json)
protects exact palette values and semantic bindings.
Library theme identifiers are `gavia` and `gavia-dark`; the light theme retains `gavia`.

## Button radii

Gavia and Gavia Dark share button radii: xs/sm — 3 px, md — 4 px, lg — 5 px.
Icon buttons follow the same rule. Fields in both themes use 6 px;
cards use 8 px.
Classic, Classic Dark and Newspaper keep their existing theme values.

Foundation `--wl-dimension-btn-radius`, `--wl-dimension-btn-radius-sm` and
`--wl-dimension-btn-radius-lg` pass values through semantic `--wl-corner-button*`
to component `--wl-btn-radius*`. Override
`--wl-btn-radius`, `--wl-btn-radius-sm` or `--wl-btn-radius-lg` for a specific button.

## Field radii

Gavia and Gavia Dark fields use 6 px at every size through the existing chain
`--wl-dimension-input-radius` → `--wl-corner-input` → `--wl-input-radius`.
It is shared by input, textarea, select and composite fields. Override
`--wl-input-radius` locally. Existing values in other themes are preserved.

## Editing the theme

The only value source is `packages/ui-kit/tokens/source.json`. Gavia
overrides foundation palette, shadows and dimensions. Semantic roles reference
foundation, and component roles reference semantic. Four foundation roles,
`--wl-palette-action-primary-bg`, `--wl-palette-action-primary-hover`,
`--wl-palette-action-primary-active` and `--wl-palette-action-primary-text`, let you
configure actions independently of link colors. Gavia’s existing
semantic `--wl-action-primary-*` roles reference these foundation roles.
Classic, Classic Dark and Newspaper retain their earlier semantic aliases;
the new active state uses the previous semantic hover color.

The raised surface follows
`--wl-palette-bg-raised` → `--wl-bg-raised`. In other themes, it resolves
to the existing `--wl-bg`. Warm decorative roles use separate foundation tokens
`--wl-palette-accent-warm` and `--wl-palette-accent-warm-soft`.

After editing, run from the root:

```sh
pnpm tokens:sync
pnpm tokens:check
pnpm --filter gavia-ui exec vitest run tests/design-system.test.ts tests/token-validation.test.mjs
```

Synchronization updates the theme, typed catalog and contrast report.
`tests/fixtures/tokens-0.5.json` still protects 165 previous values
in Classic, Classic Dark and Newspaper. The new theme file is covered by the existing
`gavia-ui/themes/*.css` export.

When importing multiple themes, import `themes/white.css` first:
it also defines the `:root` fallback. Gavia and other named themes should
follow Classic so the selected attribute overrides the base palette.
