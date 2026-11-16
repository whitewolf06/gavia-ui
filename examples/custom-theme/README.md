# Custom theme starter

Run `pnpm install`, then `pnpm dev`. Production output: `pnpm build`.

This application imports the complete Gavia theme and then applies a blue brand
palette generated in [src/theme.css](src/theme.css). Both `data-wl-theme="gavia"` and
`data-wl-brand="my-brand"` are set on `html` in [src/main.ts](src/main.ts).
The brand selector changes 12 palette roles: compact accents, readable links,
soft selected surfaces and borders, and primary action background/hover/active/text.
Primary buttons have their own roles; changing only `--wl-accent` does not
recolor every action.

## Generate and check the CSS

The source is [theme.config.json](theme.config.json), a version 2 input-only
configuration. Change its palette or manual overrides, then run
`pnpm theme:generate`. Do not edit `src/theme.css` by hand. The
[build script](scripts/generate-theme.mjs) calls `createWlTheme` from
`gavia-ui/theme`, checks the configured contrast pairs and writes the CSS before
the Vite production build. These tools require the 1.2 release or its candidate;
the previously published 1.1 package does not have this entry point.

The installed CLI uses the same configuration and generator:

```sh
pnpm exec gavia-theme --config theme.config.json --output src/theme.css
pnpm theme:check
```

`npm run theme:generate` / `npm run theme:check` and the corresponding
`bun run` commands work too. The CLI requires Node 22.13 or later; its Node
requirement does not change the browser library's Vue peer requirement.

`--check` never writes output or creates directories. Exit codes are `0` for
current CSS and passing configured pairs, `1` for invalid arguments/configuration
or file errors, `2` for missing/stale CSS, and `3` for failed contrast. When both
CSS and contrast fail, both are reported and the exit code is `3`. Normal
generation also leaves output untouched when contrast fails.

The old version 1 export keeps its palette-only meaning: its generated
`overrides`, `semanticBindings` and `colorScheme` are ignored with a CLI warning.
To supply manual overrides, use a version 2 configuration. The JSON downloaded
from the updated constructor can be passed to this command without format edits.

The page shows primary, soft and link buttons, a checked checkbox and selected
tabs. Card slots supply its title/footer; `pt.content.class` adds application
layout without replacing component code.

## Scope and inheritance

Keep the base theme and brand layer on the **same element**. The full theme
declares semantic/component aliases there, so they resolve using the brand's
palette. A nested branded section needs both attributes on that section too;
putting only `data-wl-brand` on a descendant can inherit aliases already resolved
against its parent's palette. A nested `data-wl-theme="gavia"` without the brand
attribute restores ordinary Gavia.

Root attributes also cover overlays teleported to `body`. Overlays opened inside
a locally branded section still inherit the root theme, because they are rendered
outside that section. This starter's palette is for light Gavia; do not apply it
unchanged to Gavia Dark.

## Color-pair checks

The opaque hex colors in the starter were calculated with WCAG relative
luminance. Normal text needs at least 4.5:1; focus and meaningful state boundaries
need at least 3:1 against their adjacent surface.

| Pair | Contrast |
| --- | --- |
| White / primary, hover, active | 6.01 / 8.10 / 10.29:1 |
| Link / Gavia page, raised surface | 8.73 / 9.04:1 |
| Link / selected surface, selected hover | 7.96 / 7.38:1 |
| Hover link / selected hover | 6.50:1 |
| Focus / Gavia page, raised surface, secondary surface | 5.71 / 5.92 / 5.33:1 |
| Focus / selected surface, selected hover | 5.21 / 4.83:1 |
| Selected border / selected surface; hover border / selected hover | 3.42 / 4.15:1 |

White checkbox marks share the primary/hover contrast pairs. Recheck your own
palette, backgrounds and all states after edits. The configuration lists these
17 directed checks explicitly. These measurements cover the
listed pairs; they do not establish full application accessibility, disabled-state
readability, focus geometry or screen-reader acceptance.

See the [customization guide](../../docs/guide/theming.md#customize-a-theme)
for tokens, component props, slots, `pt` and application CSS. The existing
[Playground theme builder](../../docs/guide/theme-builder.md) can export CSS;
the public function and CLI generate the same CSS from the shared configuration.
