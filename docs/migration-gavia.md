# Migration to Gavia UI

Gavia UI is a component library and design system for Vue 3.
Repository: `https://github.com/whitewolf06/gavia-ui`.
The first package, [gavia-ui@0.7.0](https://www.npmjs.com/package/gavia-ui), was published
to public npm on 2026-10-05 (Moscow).
The new-name upgrade is described in the [0.7 migration](migration-0.7.md);
documentation is available on [GitHub Pages](https://whitewolf06.github.io/gavia-ui/).

## Updating the npm dependency

1. Remove the previous library dependency from the app and add `gavia-ui`.
2. Replace the previous package identifier in imports with `gavia-ui`:
   component and type names are preserved.
3. Update CSS subpaths the same way.
4. Remove the previous scope mapping and GitHub PAT for this package
   if other GitHub Packages dependencies do not need them.

```bash
# Remove the previous dependency with pnpm remove <package-name> first.
pnpm add gavia-ui@0.7.0 vue
```

```ts
import { WlButton, WlConfig } from "gavia-ui";
import "gavia-ui/styles/base.css";
```

`Wl*` components, props, events, models, slots, `WlConfig`, services,
`createWlPt`, SVG icon names, `wl-*` classes, `--wl-*` CSS tokens,
`data-wl`, `data-size` and theme keys are preserved. Application setup,
`pt` merging, motion and explicit CSS imports do not change.

Old published versions belong to the previous GitHub Packages scope.
Moving a repository does not rename a package or automatically make it
public. Installation still requires GitHub authentication; after the move,
check access to the previous package separately. Existing tags
retain their original commits and are not moved.

## Tool and diagnostic names

The local running-preview check variable is `GAVIA_E2E_BASE_URL`.
Update it in your browser-test commands.

Catalog errors use `Unknown Gavia UI token`,
`Unknown Gavia UI theme` and `Circular Gavia UI token` with the token or theme name.
Error types and triggering conditions are preserved. If your app checked
the full error text, update that check.

## From earlier versions

Initialization and PrimeVue Column changes are described in
the [migration from 0.3](migration-0.5.md); design system features are
in the [0.6 migration](migration-0.6.md). Apply these as well if your consumer
still uses a pre-0.6 version. Examples use the current `gavia-ui` path;
migrate behavior and the package identifier together.

## Consumer checks

Check TypeScript, production build, themes and local tokens.
Check form models, keyboard, focus return, nested overlays,
scrolling, dates, tables and toasts. The app supplies the Vue 3 peer;
no other UI packages are required.

## Typeface name

The font is **Gavia Sans**, the theme is **Gavia**, and the package is **Gavia UI**. New styles use `font-family: "Gavia Sans", sans-serif`. Public paths `gavia-ui/styles/fonts/gavia.css` and `gavia-ui/fonts/gavia/*` are preserved; the previous CSS name `Gavia` is registered as a compatibility alias. Internal TTF/WOFF2 names changed to Gavia Sans without changing outlines, metrics or kerning. Standalone download: `Gavia-Sans-0.6.zip`.
