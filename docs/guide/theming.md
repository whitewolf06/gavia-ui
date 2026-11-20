# Themes and customization

Legato is the default light theme in the Playground. It uses indigo for actions,
burgundy and saffron accents, and Legato Sans. To opt in, import
`legato-ui/styles/fonts/legato.css` and `legato-ui/themes/legato.css`, then set
`data-wl-theme="legato"`. The Playground pairs it with Legato Dark in system mode.
Import `legato-ui/themes/legato-dark.css` and select `data-wl-theme="legato-dark"`
for the dark version. Both use the same font stylesheet. To follow the system
in an application, import both theme files and pass
`{ themes: { light: "legato", dark: "legato-dark" } }` to `useWlTheme`.

Gavia is a light theme with a lake blue-gray primary action,
blue-gray selected states and warm decorative shades.
Gavia Dark uses cool-gray surfaces with a slight blue undertone
and a turquoise accent. Both use Gavia Sans.
Classic, Classic Dark and Newspaper are also available.
Classic / Classic Dark identifiers are `white` / `graphite`.
[Names and catalog compatibility](../migration.md#migration-themes).

## Customize a theme

Start with a shipped theme, add your brand palette, then use component props,
slots and `pt` for individual details. The complete
[custom-theme starter](../../examples/custom-theme/README.md) uses this CSS-only
path; it does not require a theme generator, build plugin or global configuration.

### 1. Load a base theme and the brand layer

Import the files once in your application entry point. The reset is optional;
Gavia's font file is needed for Gavia Sans.

```ts
import 'legato-ui/styles/reset.css';
import 'legato-ui/styles/base.css';
import 'legato-ui/styles/fonts/gavia.css';
import 'legato-ui/themes/gavia.css';
import './theme.css';
```

Select both the base and the brand on the **same element**:

```html
<html lang="en" data-wl-theme="gavia" data-wl-brand="my-brand">
```

The starter's [`theme.css`](../../examples/custom-theme/src/theme.css) declares
the palette under `[data-wl-theme="gavia"][data-wl-brand="my-brand"]` in
`@layer wl.tokens`. Import it after the shipped theme. Components keep their
public classes, tokens and behavior.
The starter generates this file from `theme.config.json`; edit the config and
regenerate, or keep a separate hand-authored brand stylesheet.

### 2. Recolor the complete interaction palette

The starter changes these existing foundation roles. Their semantic and
component aliases are already declared by the complete Gavia theme.

| Roles in the starter | Purpose |
| --- | --- |
| `--wl-palette-accent`, `--wl-palette-accent-hover` | Checked controls, active indicators and focus |
| `--wl-palette-text-accent` | Readable accent text and links |
| `--wl-palette-accent-soft`, `--wl-palette-accent-soft-hover` | Soft actions and selected backgrounds |
| `--wl-palette-accent-border`, `--wl-palette-accent-border-hover` | Borders on soft accent surfaces |
| `--wl-palette-on-accent` | Marks/text on compact accent fills |
| `--wl-palette-action-primary-bg`, `--wl-palette-action-primary-hover`, `--wl-palette-action-primary-active`, `--wl-palette-action-primary-text` | Primary button background, hover, press and text |

Primary actions have their own palette roles in Gavia and Gavia Dark. Changing
only `--wl-accent` leaves those action colors unchanged. Set the full action
family and check its text contrast in all three states. Keep links, selection
and focus readable on the surfaces where the application uses them. Status
colors such as success, warning and danger can retain the base theme's meaning.

This example is a light Gavia palette. A dark brand needs its own values and
contrast checks; reusing the light values for Gavia Dark is not a dark theme.

### 3. Keep aliases in the correct scope

Every shipped theme declares the complete foundation → semantic → component
chain. A CSS `var()` reference resolves where its custom property is declared;
descendants inherit that computed value. Therefore put the base theme and its
brand on the same element, including for a locally branded section:

```html
<section data-wl-theme="gavia" data-wl-brand="my-brand">
  <!-- Branded components -->
  <section data-wl-theme="gavia">
    <!-- Ordinary Gavia; the complete base theme restores its aliases -->
  </section>
</section>
```

Putting only `data-wl-brand` on a descendant can leave semantic/component aliases
resolved against the parent's palette. Do not invent a new `data-wl-theme` value
for a layer containing only differences: import a complete shipped theme and
combine both selectors as above. New tokens added to that theme remain available
without freezing an exported full CSS snapshot.

Overlays teleported to `body` inherit the document theme, not a local section's
attributes. Apply the brand to `html` when overlays must share it. The
[theme-builder guide](theme-builder.md) describes its existing CSS export and
JSON format; the JSON is not loaded by the component library at runtime.

### 4. Customize a component without copying it

Choose the smallest applicable extension point:

| Need | Extension |
| --- | --- |
| Supported layout, size or behavior | Documented props, such as `WlCard.padding` |
| Content, an icon or an item renderer | Named/scoped slots in the component API |
| An existing visual role | Local semantic/component CSS custom properties |
| Attributes or a class on an internal section | The documented `pt` section |
| Application layout or additional elements | Your own class/CSS and markup |

For example, the starter uses Card's title/footer slots and
`:pt="{ content: { class: 'brand-content' } }"`. Its `.brand-content` class owns
the grid and gap; component CSS continues to own Card itself. An ordinary
application stylesheet outside the library layers can override styles without
`!important` or selector chains.

Optional `WlConfig.pt` shares defaults across one Vue application; an instance's
`pt` can refine them. Classes and styles merge in the order
`createWlPt()` defaults → `WlConfig.pt` → instance `pt`. Section callbacks receive
documented context, not arbitrary component props or private state. Use the API
table for the component's available sections, slots and tokens.

### 5. Verify the surfaces and states you use

Check primary default/hover/active text, links on page/raised/selected surfaces,
compact checked marks, soft selected text/borders and keyboard focus. The
starter [records its measured pairs](../../examples/custom-theme/README.md#color-pair-checks):
normal text is checked at 4.5:1 and focus/state boundaries at 3:1. Recalculate
after changing colors, opacity or backgrounds. Inspect disabled/invalid states,
keyboard use, local-theme resets and teleported overlays separately; a list of
passing color pairs is not a complete accessibility assessment.

For token lookup and targeted overrides, see [design tokens](tokens.md). To change
the library's shipped themes, use the separate
[maintainer token procedure](../maintainers/tokens.md).

## Generate CSS from a versioned config

The 1.2 additions provide a pure entry point, `legato-ui/theme`, and a Node CLI.
They are optional; existing CSS imports and component APIs stay the same.
The entry does not import Vue, the DOM or Node modules.

```ts
import { createWlTheme } from 'legato-ui/theme';

const result = createWlTheme({
  schemaVersion: 2,
  name: 'my-brand',
  baseTheme: 'gavia',
  palette: { primary: '#245bd1' },
  overrides: { '--wl-card-padding-inline': '1.25rem' },
  mode: 'delta'
});
// result.css, result.overrides, result.contrast
```

`palette` accepts any subset of `background`, `surface`, `softSurface`, `text`,
`mutedText`, `border`, `primary` and `link`. Omitted roles use the base palette;
colors are opaque `#rgb` or `#rrggbb`. The generator applies the base, palette
changes and then manual `overrides`, without changing your input object.
Overrides use existing `--wl-*` token names. Unknown references, cycles and
declaration/selector injection are rejected. Values cannot contain `!important`;
the generated reduced-motion rules retain priority over duration overrides.
References use `var(--wl-token)` without a CSS fallback.

| Mode | CSS selector | Application setup |
| --- | --- | --- |
| `full` (default) | `[data-wl-theme="my-brand"]` | Select the new name; the CSS contains a complete base snapshot |
| `delta` | `[data-wl-theme="gavia"][data-wl-brand="my-brand"]` | Import the complete base theme and keep both attributes on the same element |

Both modes retain a reduced-motion block. Delta follows the local-theme and
Teleport rules above. Full CSS freezes the token snapshot at generation time;
regenerate it when updating the library. Keep the config as the source of truth.

The result's `overrides` are the **computed** delta, including derived values.
They are not a replacement for the config's manual `overrides`. The contrast
report includes resolved foreground/background colors, ratio, threshold and
`passes`. Optional `contrastPairs` selects token pairs and thresholds; otherwise
the existing builder pairs are checked. These pairs must resolve to opaque HEX
colors. A failed pair is reported without replacing your selected colors; this
report does not certify all component states or application accessibility.

### Generate and check from the command line

Save the input object as JSON. The Playground's **Download config** button exports
this same v2 format, so no format conversion is needed:

```sh
pnpm exec legato-theme --config my-brand.theme.json --output src/theme.css
pnpm exec legato-theme --config my-brand.theme.json --output src/theme.css --check
```

The CLI requires Node 22.13+; it does not add a Node runtime requirement to browser
components. It calls the same public generator. `--check` compares the exact CSS
and checks the selected contrast pairs without writing files or directories.
Exit codes are `0` for success, `1` for arguments/configuration/IO errors, `2` for
stale or missing CSS and `3` for failed contrast. When both checks fail, contrast
takes priority and both failures are reported.

`parseWlThemeConfig(value)` validates and normalizes JSON input for build scripts.
New configs use `schemaVersion: 2` and contain only user settings. Older v1 exports
are still read as name, base theme and all eight palette colors. Their derived
`colorScheme`, `overrides` and `semanticBindings` are ignored, as before; the CLI
prints a migration warning. To make a former derived value a manual override,
move it deliberately into a v2 config rather than changing the version alone.

The [starter](../../examples/custom-theme/README.md) uses one config for its build
script and CLI checks. For repository changes to shipped themes, continue using
the maintainer token procedure rather than adding generated CSS by hand.

## Reactive theme preferences

`useWlTheme` from `legato-ui/composables` resolves light, dark and system
preferences after mount. Its `themes` option accepts a static `{ light, dark }`
pair or a reactive getter returning that pair. To keep an explicitly selected
theme independent of OS changes, map both entries to the selected name.
Omitting `target` applies the result to the document root; `target: () => null`
only resolves the theme, allowing an application to own its snapshot transition.

`resolveWlTheme(preference, pair, isDark)` performs the same resolution without
DOM or storage access for SSR or early initialization. `wlThemeInitScript`
accepts a static pair for an inline pre-paint script; reactive getters cannot
be serialized into that script. Storage is optional and failures do not prevent
local switching. The Playground retains its five choices, URLs and preferences
while using the public composable for OS changes.

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
`legato-ui/themes/gavia-dark.css`. It defines dark surfaces and readable
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
[source and prompts](../brand/README.md#hero-background).

Gavia Dark was added in 0.10.0. Gavia Sans is the main font in both Gavia themes;
code uses `--wl-mono`. [Upgrade to 0.10.0](../migration.md#migration-0-10-0).

## Main font

Gavia and Gavia Dark use Gavia Sans 0.6 for text, headings and
controls through `--wl-font`; `--wl-font-heading` inherits this stack.
Import the separate `@font-face` CSS so the browser loads WOFF2.
Without it, the browser uses a system font. Code retains monospaced `--wl-mono`.

There are six weights (100, 300, 400, 500, 600, 700), each with upright and
oblique faces. [Specimens, setup and license](font-legato.md).
The playground shows the typeface on the “Font” page (`?view=font`).

## Setup

The original `gavia-ui` package has included the light Gavia theme and its typeface since 0.9.1.

```ts
import 'legato-ui/styles/reset.css';
import 'legato-ui/styles/fonts/gavia.css';
import 'legato-ui/styles/base.css';
import 'legato-ui/themes/gavia.css';
```

```html
<html lang="en" data-wl-theme="gavia">
```

For Gavia Dark, change the theme import to `legato-ui/themes/gavia-dark.css` and
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
import { getWlThemeTokens, resolveWlToken } from 'legato-ui';

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
with thresholds before rounding. Approved pairs are checked in all seven
themes; separate tests protect Gavia links and text on decorative
surfaces. Recalculate contrast after changing colors, text opacity or soft
surfaces.

The [source specification](../../packages/ui-kit/tests/fixtures/gavia-palette.json)
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

For application overrides, start with [Customize a theme](#customize-a-theme)
and the [token guide](tokens.md). To change shipped
theme values or add token roles to the library, follow the
[maintainer token procedure](../maintainers/tokens.md).

When importing multiple themes, import `themes/white.css` first:
it also defines the `:root` fallback. Gavia and other named themes should
follow Classic so the selected attribute overrides the base palette.
