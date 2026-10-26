<a id="archived-section-1"></a>

# Historical generated Changeset notes

Archived on 2026-10-27. This record preserves earlier implementation, preparation or release evidence; its dated statuses and commands are historical. Use the [documentation index](../README.md) for current guides and the [archive index](README.md) for context.


Preserved verbatim from the duplicate generated sections of the root changelog.
Canonical release summaries remain in [CHANGELOG.md](../../CHANGELOG.md). These notes are historical, not current acceptance evidence.

<a id="archived-section-2"></a>

## 0.12.1 — prepared


Make the Playground follow the system theme and supported browser language on first visit, with persistent manual choices and explicit URL overrides. Apply the theme before first paint and preserve automatic mode in navigation and history.

Link home metrics to their documentation sections, sort components alphabetically within each group, and add a local component search with clear and empty states on desktop and mobile.

<a id="archived-section-3"></a>

## 0.12.0 — 2026-10-09


Add the optional wlLocaleEn preset and configurable built-in control text while preserving the Russian fallback and explicit component-prop priority.

Make English the default Playground language, with EN/RU URL navigation, shared examples and API, and translated search and changelog. Publish GitHub Markdown documentation in English.

Add route metadata and a sitemap for the client-rendered documentation SPA, expand the author story, and adapt header navigation to the available width with compact one-row mobile controls.

<a id="archived-section-4"></a>

## 0.11.1 — 2026-10-09


Styling and documentation fixes. Public API, class names, tokens and import paths are preserved.

<a id="archived-section-5"></a>

## 0.11.0 — 2026-10-08


Refine public TypeScript contracts for all components: linked selection models,
table keys, payload/slots, native attrs/events, pt and exposed refs. Add
safe input normalization and checks for disabled controls.

Breaking changes: TypeScript 5.4+, domain models instead of unknown, handling
the Autocomplete free string, explicit virtual columns, readonly navigation
descriptor collections, explicit selectionMode for range DatePicker and checks
for supported v-model modifiers. Upgrade
guide: [0.11 migration](../migration-0.11.0.md).

<a id="archived-section-6"></a>

## 0.10.0 — 2026-10-08


Add Gavia Dark with Gavia Sans, matching Gavia geometry, an accessible dark lake palette, and explicit themes/gavia-dark.css import. Rename display labels White and Graphite to Classic and Classic Dark while preserving the white/graphite identifiers, CSS paths and original catalogue positions. The public theme catalogue now contains five entries; see docs/migration-themes.md for literal tuple and label consumers.

Use a subtly blue moonlit night version of the original lake hero in both Gavia Dark and Classic Dark, keeping the moon at the original sun position. In Gavia Dark, use cool-gray dark backgrounds at comparable luminance, with a soft, slightly blue undertone for neutral surfaces. Strengthen the turquoise brand accent and shift it slightly toward blue for primary actions, links, the logo and focus while preserving status colors. Give the installation card a muted dark turquoise accent fill with a distinct turquoise border, matching the role of the light Gavia accent surface.

Refine only six Gavia Dark background fills: `--wl-bg` #18191b, `--wl-bg-raised` #222325, `--wl-bg-soft` #2c2d30, `--wl-bg-hover` #3c3d41, `--wl-accent-soft` #293c3f and `--wl-accent-soft-hover` #33484c.

Keep the home forest and reeds illustrations visible on dark surfaces using theme-aware image blending. Mark the project-card GitHub documentation and contribution links as external and open them in a new tab.

Keep narrow WlAlert messages readable by wrapping actions when an icon, action and close control share the available width.

Add a ghost sun/moon WlIconButton in the hero’s upper right corner, with a tinted 32 px icon, a 44 × 44 px interaction area and no boxed background in its normal state, for Gavia ↔ Gavia Dark and Classic ↔ Classic Dark; Newspaper switches to Classic Dark and back to Newspaper. Keep both day/night images mounted and preloaded with the same composition: all light themes use day and both dark themes use night. Use one temporary full-page transition when View Transitions API is available, with hero crossfade as the fallback. Show the night layer once loaded; prefers-reduced-motion disables the transitions.

API 0.9.1 compatibility checks, Gavia Sans visual baselines, WCAG 2.2 AA accessibility,
installed archive browser checks, SSR/hydration, size budgets and coverage.
Public names and setup are preserved.


Fixed Vue 3.4 support: declarations and SSR ids work
with the minimum peer. Lists received accessible names and ARIA connections. Graphite
accent text is more readable; primary button colors are preserved. The
single-button app bundle no longer retains unused catalogs.
npm and Bun installation was added to the playground and is checked against the archive.
