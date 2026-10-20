# Localization

## Library locale

The optional `wlLocaleEn` preset is introduced in Gavia UI 0.12.0.
It is not available in 0.11.1 or earlier. Configure it in the application:

```ts
import { createApp } from "vue";
import { WlConfig, wlLocaleEn } from "gavia-ui";
import App from "./App.vue";

const app = createApp(App);
app.use(WlConfig, { locale: wlLocaleEn });
app.mount("#app");
```

`WlConfig` remains optional. The library keeps its Russian fallback
(`wlLocaleRu`) for compatibility; an English documentation site does not change
existing consumers’ defaults. The preset configures built-in labels and calendar
names. Translate application content, supplied props and slots in the app.

`WlLocaleInput` accepts partial readonly configuration. Normalization fills
known fields and ignores invalid known values. Set the application’s HTML `lang`
to match its language. Styles, themes and fonts remain explicit imports.

## Playground language

The Playground defaults to English. Query `lang=en` and `lang=ru` select
English and Russian. Switching language preserves `view`, `section`,
`component`, `theme` and the hash. For example:

- [English component guide](https://whitewolf06.github.io/gavia-ui/?view=docs&component=WlButton&lang=en)
- [Russian component guide](https://whitewolf06.github.io/gavia-ui/?view=docs&component=WlButton&lang=ru)

Language catalogs provide copy and search metadata. SFCs, component implementations,
manifest/API contracts, examples and recipes stay shared. Copied example text follows the selected Playground language. Built-in control
labels and calendar names follow the consumer app’s WlConfig; configure
locale: wlLocaleEn explicitly for English. Copying an SFC does not inject app configuration.

Documentation catalog and SEO maintenance are described in the
[Playground guide](../maintainers/playground.md#localization-and-seo-maintenance).
