# Getting started

Gavia UI supports Vue `^3.4.0`. Vue is the only required peer; the library has no
runtime dependency on a router, store or API client. TypeScript users need
TypeScript 5.4 or later. Repository development is separate and uses pnpm with
Node 22.13+ in the Node 22 line or Node 24.

```sh
pnpm add gavia-ui vue
# or: npm install gavia-ui vue
# or: bun add gavia-ui vue
```

Import styles explicitly in your application entry point:

```ts
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/themes/gavia.css";

document.documentElement.dataset.wlTheme = "gavia";
```

Set the root attribute in server-rendered HTML when using SSR; browser-only entry
code must run in the browser. Gavia and Gavia Dark use the supplied Gavia Sans
web fonts. [Other themes](theming.md) share the component code and public tokens.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { WlButton } from "gavia-ui";

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
