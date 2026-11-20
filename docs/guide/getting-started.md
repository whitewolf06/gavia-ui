# Getting started

Legato UI supports Vue `^3.4.0`. Vue is the only required peer; the library has no
runtime dependency on a router, store or API client. TypeScript users need
TypeScript 5.4 or later. Repository development is separate and uses pnpm with
Node 22.13+ in the Node 22 line or Node 24.

The commands below target Legato UI 1.2.0 and later. For an existing
`gavia-ui@1.1.0` project, see the [package rename and npm alias](../migration.md#migration-1-2).

```sh
pnpm add legato-ui vue
# or: npm install legato-ui vue
# or: bun add legato-ui vue
```

Import styles explicitly in your application entry point:

```ts
import "legato-ui/styles/reset.css";
import "legato-ui/styles/base.css";
import "legato-ui/styles/primitives.css";
import "legato-ui/styles/fonts/legato.css";
import "legato-ui/themes/legato.css";

document.documentElement.dataset.wlTheme = "legato";
```

Set the root attribute in server-rendered HTML when using SSR; browser-only entry
code must run in the browser. Legato uses Legato Sans. The font stylesheet also supports the Gavia and Gavia Dark themes. [Other themes](theming.md) share the component code and public tokens.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { WlButton } from "legato-ui";

const count = ref(0);
</script>

<template>
  <WlButton @click="count++">Saved: {{ count }}</WlButton>
</template>
```

Configure locale, pass-through defaults and motion with optional `WlConfig`.
Application requests and domain state remain in the application. Continue with
[localization](localization.md), [TypeScript](typescript.md),
[accessibility](accessibility.md) and [SSR](ssr.md).
