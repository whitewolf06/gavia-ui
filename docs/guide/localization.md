# Localization

## Library locale for 1.0

The 1.0 source uses English built-in text when `WlConfig` is absent or its locale
is omitted. This is a breaking change from the Russian fallback in released 0.x
versions. The source package version remains 0.12.1 until a separate release;
these notes do not announce a published 1.0 package. The optional English preset
was introduced in 0.12.0. To keep Russian labels, configure the consuming application:

```ts
import { createApp } from "vue";
import { WlConfig, wlLocaleRu } from "gavia-ui";
import App from "./App.vue";

const app = createApp(App);
app.use(WlConfig, { locale: wlLocaleRu });
app.mount("#app");
```

`WlConfig` remains optional. Use `wlLocaleEn` when explicitly selecting English,
or omit locale configuration. The preset configures built-in labels and calendar
names. Translate application content, supplied props and slots in the app. The
library does not choose a locale from the browser or the page's HTML `lang`.

`WlLocaleInput` accepts partial readonly configuration. Missing or invalid known
values fall back to English, including when a partial object has
`localeCode: "ru-RU"`. To customize Russian, spread the complete preset first:

```ts
app.use(WlConfig, {
  locale: { ...wlLocaleRu, accept: "Продолжить" }
});
```

Normalization checks weekday/month array lengths and `firstDayOfWeek` 0–6.
Set the application's HTML `lang` to match its language. Styles, themes and fonts
remain explicit imports.

## Text overrides and reactive changes

Built-in text props are optional. Omit a prop or pass `undefined` to use the
current locale; supply a string to override it. An explicit empty string remains
empty and does not restore a default. Keep a meaningful accessible name when
overriding names or descriptions. Resolved labels are not written back into the
public props: an omitted text prop remains `undefined` on the component instance.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { WlDatePicker } from "gavia-ui";
const date = ref<string | null>(null);
</script>

<template>
  <!-- The calendar uses the app locale; placeholder is an application override. -->
  <WlDatePicker v-model="date" placeholder="YYYY-MM-DD" display-format="yyyy-mm-dd"
    aria-label="Meeting date" show-icon />
</template>
```

Within a component in the same Vue application, use the public configuration API:

```ts
import { useWlConfig, wlLocaleEn, wlLocaleRu } from "gavia-ui";
const configuration = useWlConfig();
configuration.setLocale(wlLocaleRu);
configuration.setLocale(wlLocaleEn);
configuration.setLocale(undefined); // Restore the English fallback.
```

Components resolve omitted text reactively. Explicit text props keep their value
through locale changes. Configuration is isolated per Vue application and SSR
request; do not share mutable configuration across requests. The internal
`useWlLocaleText` helper has been removed; library components read the normalized
locale with `useWlLocale()` instead of inspecting raw vnode props. Consumers use
the public configuration API rather than importing internal source modules.

## Playground language

The Playground selects a valid `lang=en` or `lang=ru` query first, then the
canonical path's language, the saved preference and the first supported browser
language. English is the final fallback. Switching language preserves `view`, `section`,
`component`, `theme` and the hash. For example:

- [English component guide](https://whitewolf06.github.io/gavia-ui/?view=docs&component=WlButton&lang=en)
- [Russian component guide](https://whitewolf06.github.io/gavia-ui/?view=docs&component=WlButton&lang=ru)

Language catalogs provide copy and search metadata. SFCs, component implementations,
manifest/API contracts, examples and recipes stay shared. Copied example text follows the selected Playground language. Built-in control
labels and calendar names follow the consumer app's `WlConfig`; configure
`locale: wlLocaleRu` explicitly for Russian. The Playground explicitly selects
either preset when its language changes. Copying an SFC does not inject app
configuration.

Documentation catalog and SEO maintenance are described in the
[Playground guide](../maintainers/playground.md#localization-and-seo-maintenance).
