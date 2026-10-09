# Gavia UI 0.7.0: migration to the public name

[gavia-ui@0.7.0](https://www.npmjs.com/package/gavia-ui) was published
on 2026-10-05 (Moscow) as the first release under the new name on public npm.
The [GitHub Pages playground](https://whitewolf06.github.io/gavia-ui/) is published.
Source is in the [personal public repository](https://github.com/whitewolf06/gavia-ui).
Creator and maintainer: [Dmitry Gorbach](https://github.com/whitewolf06).

## Required package-path change

`@whitelife-core/ui-kit` and `gavia-ui` are separate packages in different registries.
After the repository move, replace the installed dependency manually.

In the consumer app:

```bash
pnpm remove @whitelife-core/ui-kit
pnpm add gavia-ui@0.7.0 vue
```

Replace the previous identifier in all JS/TS imports, CSS subpaths,
tests and alias settings. Do not keep both libraries
in one app’s dependencies.

```ts
import { WlButton, WlInput, WlConfig, wlLocaleRu } from "gavia-ui";

// Styles remain explicit imports, in the same order.
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/themes/white.css";

// Optional layout and typography primitives.
import "gavia-ui/styles/primitives.css";
```

Remove the old GitHub Packages scope mapping and PAT from app configuration
if other packages do not use them. The new name installs
from `https://registry.npmjs.org` without GitHub authentication.

You can also build an archive from source:

```bash
# In the Gavia UI checkout:
pnpm install
pnpm build
pnpm run pack
# In the consumer app:
pnpm add /absolute/path/to/gavia-ui/packages/ui-kit/gavia-ui-0.7.0.tgz vue
```

## Preserved contracts

- Public `Wl*` exports, type names, props, events, models and slots.
- `WlConfig`, `createWlPt`, locale, tooltip, services and composables.
- SVG icon names, `wl-*` classes, `--wl-*` tokens, `data-wl` and `data-size`.
- White, Graphite and Newspaper themes; Vue 3 is the only required peer
  (`^3.4.0`), with no runtime dependencies.
- Explicit CSS imports, `pt` order and motion configuration.

Upgrading from API 0.6.0 needs no additional component configuration.
The design system, PrimeVue removal and previous initialization changes
are described in the [0.6 migration](migration-0.6.md). For a 0.3 consumer,
also follow the [PrimeVue removal guide](migration-0.5.md):
replace PrimeVue `<Column>` with `columns` and `cell-*` slots.

## Documentation and diagnostics

The playground includes “About the project” with author, license and the changelog
from the root source. The published playground is available on
[GitHub Pages](https://whitewolf06.github.io/gavia-ui/?view=project);
the [hosting guide](hosting.md) explains its build and updates.

The local browser check variable is `GAVIA_E2E_BASE_URL`.
Catalog diagnostics use Gavia UI. If your app
checks full error strings or uses the old environment variable,
update those checks. See the [name migration](migration-gavia.md).

## Application checks

1. Check the lockfile, absence of the previous dependency, typecheck and production build.
2. Check explicit style imports, selected theme and custom tokens.
3. Check forms and models, keyboard, focus, nested overlays and scrolling.
4. Check dates, tables, toasts and confirmations.

Tag `v0.6.0` and its historical commit are preserved. The first manual npm release,
0.7.0, and subsequent OIDC releases are described in [releases.md](releases.md).
