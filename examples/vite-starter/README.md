# Vite starter

Run `pnpm install`, then `pnpm dev`. Production output: `pnpm build`.
Styles and locale are selected explicitly in `src/main.ts`; the form uses only
public package exports. Vue ^3.4.0 remains supported.

The starter explicitly selects `wlLocaleEn`, so its English labels work with the
released 0.x package and the 1.0 source. The 1.0 source also uses English when
configuration is omitted. For Russian, replace the preset import and installation
in `src/main.ts` with `wlLocaleRu`:

```ts
import { WlConfig, wlLocaleRu } from "gavia-ui";
// Keep the starter's createApp(App) call and explicit style imports.
createApp(App).use(WlConfig, { locale: wlLocaleRu }).mount("#app");
```

Customize a Russian locale with `{ ...wlLocaleRu, accept: "Продолжить" }`.
Missing fields in a partial locale use English in the 1.0 source. This source
migration does not change the dependency version or announce a published 1.0.
