# Gavia UI

A Vue 3 + TypeScript component library and design system. Plain CSS, five themes,
explicit style imports and no runtime dependencies. Vue `^3.4.0` is the only
required peer. TypeScript consumers need TypeScript 5.4 or later.

Source and package archive version: **{{version}}**.
[Playground and documentation](https://whitewolf06.github.io/gavia-ui/) ·
[Repository](https://github.com/whitewolf06/gavia-ui) ·
[Changelog](https://github.com/whitewolf06/gavia-ui/blob/main/CHANGELOG.md) ·
[Migration guides](https://github.com/whitewolf06/gavia-ui/blob/main/docs/migration.md)

## Install

```sh
pnpm add gavia-ui vue
# or
npm install gavia-ui vue
# or
bun add gavia-ui vue
```

Import CSS once in your application's entry point:

```ts
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/themes/gavia.css";

document.documentElement.dataset.wlTheme = "gavia";
```

```vue
<script setup lang="ts">
import { WlButton } from "gavia-ui";
</script>

<template>
  <WlButton>Save</WlButton>
</template>
```

## Themes and customization

Gavia (`gavia`), Gavia Dark (`gavia-dark`), Classic (`white`), Classic Dark
(`graphite`) and Newspaper (`newspaper`) share the same components. Import the
corresponding `gavia-ui/themes/<theme>.css` and set `data-wl-theme`.

Tokens use the stable `--wl-*` namespace. Props, slots and pass-through sections
let applications extend components; optional `WlConfig` supplies shared locale,
pt and motion settings. Services are isolated per Vue application.

See the [architecture and public contracts](https://github.com/whitewolf06/gavia-ui/blob/main/docs/maintainers/architecture.md),
[design system](https://github.com/whitewolf06/gavia-ui/blob/main/docs/design-system.md)
and [compatibility checks](https://github.com/whitewolf06/gavia-ui/blob/main/docs/quality.md).
The package also exports `manifest.json` and `design-tokens.json` for tooling.

## Gavia Sans

The npm package contains the WOFF2 web fonts and their OFL notices. TTF files and
the font QA report stay in the source repository. Download the full font family
from the [font page](https://whitewolf06.github.io/gavia-ui/?view=font); release
attachments, when published, are listed in
[GitHub Releases](https://github.com/whitewolf06/gavia-ui/releases).

## Contribute and report issues

[Contributing](https://github.com/whitewolf06/gavia-ui/blob/main/CONTRIBUTING.md) ·
[Issues](https://github.com/whitewolf06/gavia-ui/issues) ·
[Security policy](https://github.com/whitewolf06/gavia-ui/blob/main/SECURITY.md)

Created by [Dmitry Gorbach](https://github.com/whitewolf06).
Components: MIT. Gavia Sans: SIL OFL 1.1; preserve the distributed font notices.
