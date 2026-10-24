# Nuxt starter

Run `pnpm install`, then `pnpm dev`. Production output: `pnpm build`.
The plugin creates configuration for each application / SSR request. Keep data
fetching, routing and stores in the consuming application. Nuxt 4 uses Vue 3.5;
this does not raise the UI library's Vue 3.4 peer minimum.

Before release, verify this installed consumer's SSR HTML and hydration separately.

The plugin explicitly selects `wlLocaleEn`. The 1.0 source uses English when
locale is omitted; released 0.x packages used Russian. To retain Russian across
that migration, change `app/plugins/gavia.ts` to import `wlLocaleRu` and install:

```ts
nuxtApp.vueApp.use(WlConfig, { locale: wlLocaleRu });
```

Keep this call inside `defineNuxtPlugin` so each SSR request gets its own
configuration. Use `{ ...wlLocaleRu, accept: "Продолжить" }` for selected overrides;
missing fields in a partial locale fall back to English in the 1.0 source.
The source migration does not change the dependency version or publish a release.
