# Legato UI

From 1.2.0 onward the npm name is `legato-ui`. Existing applications can keep their
old imports with the dependency `"gavia-ui": "npm:legato-ui@^1.2.0"`.

A Vue 3 + TypeScript component library and design system. Plain CSS, seven themes,
explicit style imports and no runtime dependencies. Vue `^3.4.0` is the only
required peer. TypeScript consumers need TypeScript 5.4 or later.

Source and package archive version: **{{version}}**.
Prerelease versions use npm `next` after publication; opt in with `legato-ui@next`
or an exact candidate version. The ordinary install command below selects stable.
[Documentation](https://whitewolf06.github.io/legato-ui/docs/) ·
[Русский](https://whitewolf06.github.io/legato-ui/ru/docs/) ·
[Playground](https://whitewolf06.github.io/legato-ui/) ·
[Repository](https://github.com/whitewolf06/legato-ui) ·
[Changelog](https://github.com/whitewolf06/legato-ui/blob/main/CHANGELOG.md) ·
[Migration guides](https://github.com/whitewolf06/legato-ui/blob/main/docs/migration.md)

## Install

```sh
pnpm add legato-ui vue
# or
npm install legato-ui vue
# or
bun add legato-ui vue
```

Import CSS once in your application's entry point:

```ts
import "legato-ui/styles/reset.css";
import "legato-ui/styles/base.css";
import "legato-ui/styles/primitives.css";
import "legato-ui/styles/fonts/legato.css";
import "legato-ui/themes/legato.css";

document.documentElement.dataset.wlTheme = "legato";
```

```vue
<script setup lang="ts">
import { WlButton } from "legato-ui";
</script>

<template>
  <WlButton>Save changes</WlButton>
</template>
```

## Themes and customization

Legato (`legato`), Legato Dark (`legato-dark`), Gavia (`gavia`), Gavia Dark (`gavia-dark`), Classic (`white`), Classic Dark
(`graphite`) and Newspaper (`newspaper`) share the same components. Import the
corresponding `legato-ui/themes/<theme>.css` and set `data-wl-theme`.

Tokens use the stable `--wl-*` namespace. Props, slots and pass-through sections
let applications extend components; optional `WlConfig` supplies shared locale,
pt and motion settings. Services are isolated per Vue application.

`legato-ui/theme` exports the pure `createWlTheme` generator and
`parseWlThemeConfig` JSON reader. The optional `legato-theme` command generates
CSS or checks it in CI with `--check`; it requires Node 22.13+.
See the [customization guide](https://github.com/whitewolf06/legato-ui/blob/main/docs/guide/theming.md#generate-css-from-a-versioned-config)
for v2 configs, full/delta output and scoped contrast reports.

## Locale migration for 1.0

The 1.0 line uses English built-in text when locale configuration is omitted;
released 0.x versions used Russian. For a prerelease, follow the
[candidate migration](https://github.com/whitewolf06/legato-ui/blob/main/docs/migration.md#migration-1-0-rc-1).
To preserve Russian,
install the explicit preset in your application entry point:

```ts
import { WlConfig, wlLocaleRu } from "legato-ui";
app.use(WlConfig, { locale: wlLocaleRu });
```

Missing fields in a partial locale fall back to English. Customize Russian with
`{ ...wlLocaleRu, accept: "Продолжить" }`. Omitted/`undefined` text props follow the
current locale; explicit strings, including `""`, keep priority. See the
[localization guide](https://github.com/whitewolf06/legato-ui/blob/main/docs/guide/localization.md)
and [1.0 migration](https://github.com/whitewolf06/legato-ui/blob/main/docs/migration.md#migration-1-0-localization).

See the [architecture and public contracts](https://github.com/whitewolf06/legato-ui/blob/main/docs/maintainers/architecture.md),
[design system](https://github.com/whitewolf06/legato-ui/blob/main/docs/reference/design-system.md)
and [compatibility checks](https://github.com/whitewolf06/legato-ui/blob/main/docs/maintainers/quality.md).
The package also exports `manifest.json` and `design-tokens.json` for tooling.

## Legato Sans

Legato uses `"Legato Sans Core", "Legato Sans", ...` for compact ordinary
text and complete fallback for combining clusters. Firefox uses the complete face
to preserve mark placement. The stylesheet also registers Gavia Sans and Gavia for existing applications.

The npm package contains the WOFF2 web fonts and their OFL notices. TTF files and
the font QA report stay in the source repository. Download the full font family
from the [font page](https://whitewolf06.github.io/legato-ui/font/); release
attachments, when published, are listed in
[GitHub Releases](https://github.com/whitewolf06/legato-ui/releases).

## Contribute and report issues

[Contributing](https://github.com/whitewolf06/legato-ui/blob/main/CONTRIBUTING.md) ·
[Issues](https://github.com/whitewolf06/legato-ui/issues) ·
[Security policy](https://github.com/whitewolf06/legato-ui/blob/main/SECURITY.md)

Created by [Dmitry Gorbach](https://github.com/whitewolf06).
Components: MIT. Legato Sans (also distributed as Gavia Sans): SIL OFL 1.1; preserve the distributed font notices.
