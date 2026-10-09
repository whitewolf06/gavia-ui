# Gavia UI icons

Each drawing comes from `packages/ui-kit/icons/<name>.svg`. A single
`pnpm icons:sync` run validates every file and updates `src/icons.generated.ts`:
the drawing registry, `WlIconName` and `WL_ICON_NAMES` for the showcase.
`pnpm icons:check` runs the same validation and fails if the generated file is stale.
Do not edit the registry manually.

The initial batch came from previous `WlIcon` drawings and 46 SVG symbols
in the historical HTML prototype. Git retains that prototype; the current
drawing source is the [SVG catalog](../packages/ui-kit/icons).
Stable public names are preserved. For example, `i-cal` maps to `calendar`,
`i-clip` to `paperclip`, `i-mic` to `microphone`, `i-msg` to `message`,
`i-zap` to `lightning` and `i-chev-*` to `chevron-*`.
The playground shows all icons from `WL_ICON_NAMES`.

Version 0.8 expanded the catalog to 113 names with original Gavia drawings:
states, documents, media, catalogs and navigation. Earlier drawings are preserved;
no fonts, external catalogs or network resources are used.

## Consumer names

`resolveWlIconName(value?: string | null): WlIconName | undefined` is a pure
display function. It accepts a canonical name, a known alias, `pi-name` and
the legacy `pi pi-name` notation. For example, `pencil` and `pi pi-pencil`
resolve to `edit`, `sparkles` to `sparkle` and `zap` to `lightning`.
Unknown names and arbitrary CSS classes return `undefined`.
The function does not change stored values: the application decides whether
to normalize names when loading or saving data.

`WlIcon` and public icon props accept `WlIconInput`, so a legacy string can be
passed without casting to the canonical union. `WlIcon` renders SVG for known names
and keeps its default slot for unknown names. Applications can choose a fallback
icon based on the result of `resolveWlIconName`.
Use `WlSpinner` or `WlButton.loading` for loading indicators; `spin` is not a drawing
name. `size` sets the dimensions; color is inherited through `currentColor`.

## Drawing rules

- Canvas and `viewBox`: `0 0 24 24`. The outer `<svg>` contains only
  `xmlns="http://www.w3.org/2000/svg"` and `viewBox`; `WlIcon` sets its size.
- Default stroke: `currentColor`, width `1.5`, round caps and joins.
  Keep lines legible at 16, 20 and 24 px. Do not hardcode colors in SVG.
- Allowed elements: `path`, `circle`, `rect`, `line`, `polyline`, `polygon`,
  `ellipse`, `g` and geometry attributes from `scripts/validate-icon.mjs`.
  Scripts, styles, `<use>`, images, external links, `url(...)` and handlers are forbidden.
- Filenames use lowercase Latin letters, digits and hyphens and start with a letter.
  Renaming an already published name requires a migration note.

## Batch workflow

1. Compare requested names with `WL_ICON_NAMES` or `icons/*.svg` files.
   Make one list of missing names, remove duplicates and check for existing aliases.
2. Prepare the entire SVG batch in a consistent style, using the existing
   SVG catalog and live [WlIcon example](../apps/playground/src/design-system/examples/WlIcon.vue).
   Do not generate one file per agent run.
3. Put files in `packages/ui-kit/icons`, run `pnpm icons:sync`,
   then `pnpm icons:check` and `pnpm typecheck`.
4. Open the playground Icons section and review the whole batch in all five themes
   at 16, 20 and 24 px. Check contrast, alignment and legibility at mobile width.
5. If a new component needs a missing name, add its SVG to the same directory and
   repeat steps 3–4. The generator accepts new files without source-code changes.

`WlIcon` renders its internal SVG through `v-html` only from the generated
registry. Element and attribute validation in `icons:sync` is therefore part
of the package security boundary.
