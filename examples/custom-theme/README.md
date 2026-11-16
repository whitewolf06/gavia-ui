# Custom theme starter

Run `pnpm install`, then `pnpm dev`. Production output: `pnpm build`.

This application imports the complete Gavia theme and then applies a blue brand
palette in [src/theme.css](src/theme.css). Both `data-wl-theme="gavia"` and
`data-wl-brand="my-brand"` are set on `html` in [src/main.ts](src/main.ts).
The brand selector changes 12 palette roles: compact accents, readable links,
soft selected surfaces and borders, and primary action background/hover/active/text.
Primary buttons have their own roles; changing only `--wl-accent` does not
recolor every action.

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
palette, backgrounds and all states after edits. These measurements cover the
listed pairs; they do not establish full application accessibility, disabled-state
readability, focus geometry or screen-reader acceptance.

See the [customization guide](../../docs/guide/theming.md#customize-a-theme)
for tokens, component props, slots, `pt` and application CSS. The existing
[Playground theme builder](../../docs/guide/theme-builder.md) can export CSS;
no public theme-generation function or CLI is required for this example.
