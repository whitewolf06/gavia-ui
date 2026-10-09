# Upgrading to Gavia UI 0.12.0

0.12.0 adds an optional English locale and bilingual Playground documentation.
Existing applications keep the Russian UI defaults. Public component names,
props, events, slots, classes, tokens and import paths are preserved.

## Update

```bash
pnpm add gavia-ui@0.12.0
```

Keep the existing explicit imports for styles and themes.

## Optional English locale

```ts
import { WlConfig, wlLocaleEn } from "gavia-ui";

app.use(WlConfig, { locale: wlLocaleEn });
```

The locale covers default control labels, empty states, calendar navigation,
upload feedback and other built-in messages. Explicit component text props
keep priority over locale defaults. Partial custom locales remain supported;
missing fields fall back to the configured base locale. The existing
`WlResolvedLocale` type keeps the added control fields optional so older custom
locale objects remain valid.

See [localization](localization.md) for locale configuration and text overrides.
The library does not require vue-i18n; that dependency belongs only to Playground.

## Documentation and Playground

Repository Markdown is now maintained in English. Playground has English and
Russian content, with English as the default. Use `lang=en` or `lang=ru` in a
Playground URL; switching language preserves the selected theme, route and anchor.

The header fits navigation into a More menu when space runs out. On mobile,
search and theme selection use centered icon controls, EN/RU stays compact,
and the navigation button appears at the far right.

Page titles, descriptions, social metadata, canonical and alternate links,
structured data and a sitemap are included. Playground remains a static SPA;
metadata updates in the browser and does not provide server-rendered pages.
