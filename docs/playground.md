# Playground and documentation

## Languages and shared sources

Public GitHub Markdown, including README, guides and the root CHANGELOG.md,
is English-only. The Playground defaults to English and supports a complete
Russian interface through `lang=en` and `lang=ru`. Missing or invalid language
values use English. Switching language preserves the current route, theme,
query parameters and hash; Back/Forward restores the language from the URL.

EN and RU use the same SFCs, API contracts, examples and recipes. Localised
presentation metadata does not rename props, events, slots, exports, CSS classes,
tokens or route identifiers. The Playground reads the English root changelog
and applies a Russian prose overlay when RU is selected; release versions,
dates, links and code remain shared.

The library keeps its Russian fallback locale for compatibility. English
applications explicitly configure `wlLocaleEn` through `WlConfig`. The
Playground's language selection configures the library locale as well as site
copy; it does not change the library's default for other consumers.
See [localization](localization.md) for preset availability and consumer setup.

## Quality and compatibility

The `?view=docs&section=quality` section shows unit coverage, supported
environments, SSR and version rules. It uses the shared documentation heading,
breadcrumbs and menu. The home page summarises the same measurement; footer
links and search lead to the detailed report.

Home shows the fraction of successful unit tests and line coverage. Docs shows
line, statement, branch and function coverage. WlProgress percentage bars use
a 0–100% scale, a text value and an accessible label. Colours and radii come
from the theme; bar entrance motion respects `prefers-reduced-motion`.

The data source is `apps/playground/src/project/quality-report.generated.json`.
Run `pnpm test:coverage`, then `pnpm quality:update`: counts and percentages
come from Vitest/V8 JSON reports, and the date comes from the test start time.
The README SVG badge uses the same data. Metrics describe unit coverage of
source code; browser, visual and Axe checks are listed separately. A local
report from a modified checkout is labelled as a working build rather than a
published release.

Node 24 in CI generates the JSON after successful tests. Pages and the
Playground archive restore it from an artifact of the same workflow; package
version and Git revision are checked before building. Tests do not need to be
repeated just to display the report.

## Pages and routes

Home (`/`) contains the installation command, current version, sections and
author information. Docs (`?view=docs`) combines foundations, appearance and
guides for every public component. The design system (`?view=system`) contains
tokens, contracts and composite scenarios. Changelog (`?view=changelog`) reads
the root CHANGELOG.md; the previous `?view=project` route remains compatible.

Theme builder (`?view=theme-builder`) lets you create a palette and check it on
live components. The draft stays in the current browser. Choosing a base resets
colours; changing the header theme changes page appearance while preserving
the example palette. See [theme builder](theme-builder.md).

Docs sections:

- `section=typography` — text roles, hierarchy and structure;
- `section=layout` — containers, columns, spacing, adaptation and layers;
- `section=responsive` — breakpoints, local configuration, container queries and behaviour;
- `section=content` — labels, instructions and content states;
- `section=icons` — full SVG catalogue, sizes and accessibility;
- `section=colors` — semantic colours, themes and alpha;
- `section=quality` — coverage, supported environments and compatibility;
- `component=WlButton` and other manifest names — component guides.

The separate Components page was removed after all 53 guides moved to Docs.
The old `?view=components` route opens Docs; `#component-WlTimePicker` and other
component names open their respective guide. `#pg-colors` and `#pg-icons` map
to the appearance sections. Query routes preserve the GitHub Pages subpath
`/gavia-ui/` and require no Vue Router. The public component directory in
`packages/ui-kit` remains part of the library.

## Playground theme

The default is light Gavia, with near-white surfaces and a lake-slate primary
action. The selector offers five themes: Gavia, Gavia Dark, Classic, Classic
Dark and Newspaper. Its list and labels come from the public `wlDesignThemes`
catalogue.

The `theme` parameter preserves direct links. For example,
`/gavia-ui/?view=docs&section=colors&theme=white` loads Classic;
`theme=graphite` loads Classic Dark, and `theme=gavia-dark` loads Gavia Dark.
The displayed Classic / Classic Dark names do not rename legacy query or CSS
identifiers. Selecting a theme updates this parameter while preserving the
section, hash and other parameters. Back/Forward restores the page's theme.
Invalid values use Gavia. All CSS files are imported explicitly before Vue
starts.

The top right of the first screen has a ghost `WlIconButton` with a 32 px sun
or moon icon and a 44 × 44 px hit area. Its regular state has no background;
a visible outline marks focus. It switches Gavia ↔ Gavia Dark and Classic ↔
Classic Dark. From Newspaper it switches to Classic Dark; selecting it again
returns to Newspaper. The icon indicates the destination light or dark theme.

The library retains Classic as the base values in `styles/base.css` and the
JavaScript resolver default. To use Gavia in an application, explicitly import
`themes/gavia.css` and set `data-wl-theme="gavia"` on `html`. For Gavia Dark,
use `themes/gavia-dark.css` and `data-wl-theme="gavia-dark"`. Both use Gavia
Sans. See the [theme guide](theme-gavia.md). The Docs installation example uses
Classic (`white`) and the confirmed npm version. Gavia Dark is included in
0.10.0; see [catalogue compatibility](migration-themes.md).

Home uses two preloaded images of the same lake panorama with a loon: daytime
for Gavia, Classic and Newspaper; nighttime for Gavia Dark and Classic Dark.
Both layers remain in the DOM. When the View Transitions API is available,
theme switching creates one transition for the whole page. Otherwise colour
tokens apply immediately and the hero image crossfades. The night layer appears
after its image loads. `prefers-reduced-motion: reduce` disables the page
transition and crossfade.

Introductory text sits on a clear card using the selected theme's background
colour. Installation and the 2×2 metric grid follow below, adapting to narrow
screens. Usage and participation panels have decorative light images of a
forest and grain heads. Content, links, installation commands and counts use
the same sources in every theme. Images contain no text and are hidden from
screen readers.

In Gavia, text over photographs uses the primary dark colour. Project-card
background images have 0.5 opacity, and links keep their underline. This keeps
text readable over dark areas of the forest and grain images; there is no
separate white panel over the first screen.

## Component page

Every guide has Examples, API and Accessibility tabs. Section links sit
immediately below the tabs and refer to the visible panel. The sidebar starts
with Getting started and permanent links to six sections: installation,
interface foundations, components, tokens, icons and migration. These links
reach the corresponding overview anchor from any guide. The nav is named
Getting started sections; the book icon uses the theme's semantic accent.
Main categories use SVG icons from the existing set. Component catalogue rows
stay compact while retaining visible focus and a touch hit area.

- The first example has controls on the left and a live SFC with expanded code
  on the right; columns stack on narrow screens. ComponentExplorer in
  documentation mode uses the same canonical examples and `consumerSource`.
  Toggles, enum controls and important string/number settings reflect the
  example's actual props. Menu.popup and Autocomplete.multiple have separate
  working scenarios. Reset restores initial settings and the model. In the
  design system, Explorer keeps its compact layout.
- Further examples compare variants, sizes and states, demonstrate slots and
  show real component scenarios. Each is a separate working SFC that also
  supplies the copyable source.
- Collections, callbacks, complex models and pt are edited in the copyable
  SFC; the panel explains which parameters belong to that scenario. Scalar
  fields use Gavia UI controls, numbers remain numbers, and code receives the
  same values as the live example.
- Props, defaults, events, slots and v-model come from the public manifest.
  Pt sections are listed from the component's actual `useWlPt` calls.
- Accessibility guidance describes the actual model, keys, labels and errors;
  unsupported props are not added just to make every guide look alike.
- Tabs support arrows/Home/End and retain example state. A named API or
  accessibility anchor opens the corresponding tab.
- On the WlCommandPalette page, the Playground's global Ctrl K is disabled so
  the shortcut setting controls only the demonstrated component. Header
  search still works by clicking its button.
- Toast and ConfirmDialog use one service container each in App.vue. Examples
  call the composable; instructions show how to register the service.

## Module boundaries

- `HomePage.vue` — home and installation from package metadata.
- `App.vue` — History API, theme, language, search, shared header and service containers.
- `DocsPage.vue` — right sidebar, categories, guide selection and anchors. The
  component catalogue remains a plain list without search or a count.
- `documentation/catalog.ts` — manifest groups and foundation metadata.
- `documentation/ComponentDocumentation.vue` — shared guide structure;
  `DocumentationTabs.vue` — accessible tabs; `DocumentationContract.vue` — API.
- `documentation/components/registry.ts` — lazy live SFCs and their raw sources;
  `inputs.ts`/`showcase.ts` — titles, descriptions and accessibility rules.
- `documentation/components/inputs` and `showcase` — 52 extended SFCs;
  `documentation/button` — five detailed WlButton scenarios.
- `documentation/components/pt-sections.ts` — actual pt sections. Update the
  relevant entry and documentation when DOM/`useWlPt` changes.
- `design-system/examples` — 53 canonical controlled examples. Explorer and
  Docs share them; library implementations are not copied.
- `documentation/foundations` — foundation pages and 18 working SFCs. Layout
  explains containers, proportions, nesting and stacking contexts. See the
  [primitive contract](primitives.md). The separate [responsive guide](responsiveness.md)
  covers viewport, local tokens, container queries and matchMedia with SSR/cleanup.
- `documentation/assets` — icons and colours. Icon/token registries are the
  only list sources. The SVG catalogue shows the selected size; colours are
  resolved for the current theme and preserve alpha.
- `i18n/index.ts` and `i18n/messages` — shared Vue I18n and EN/RU message
  catalogues. Technical code fragments remain literal; named parameters are
  interpolated. Documentation metadata translates at read time.
- `documentation/manifest.ts` — localised presentation descriptions for the
  shared manifest, without changing package API names, types or defaults.
- `CodeHighlight.vue` — small lossless tokenizer without HTML injection.
  CodePanel copies the original `consumerSource`. Its top-right button appears
  on hover/focus and stays visible on touch.
- `scripts/example-source.mjs` — shared export transformation for the
  Playground and isolated package consumer. It resolves literal example
  translation keys to EN/RU text and removes the private Playground hook, so
  exported SFCs do not depend on the site's i18n implementation.
- `navigation.ts` — query and legacy-anchor parsing, canonical URL creation.
  `usePageAnchor.ts` restores anchors after loading a page.

Horizontal links below tabs navigate within the page and do not highlight on
scroll. Shared tabs have no bottom divider; the selected tab uses background
and text colour only.

## Active subsection

`useDocumentationScrollspy` observes only the content column. It collects
visible h2 elements with id and accounts for root `scroll-padding-top` and the
active tab. The previous heading remains active until the next; the final
visible section is highlighted near the document end. MutationObserver and
ResizeObserver update geometry after lazy loading, code changes and tab
switches. Scroll/resize events are batched through requestAnimationFrame;
observers and listeners are removed when the page closes.

Foundation and appearance side outlines use `aria-current="location"`, a
visible theme colour and a small left chevron with a smooth text shift and no
background. Subsections align with their parent; `prefers-reduced-motion`
disables motion. Selecting a link changes the URL; scrolling does not.

## Responsive header

On desktop, navigation adapts to the actual available width. Visible links
keep their original order; trailing links move into a WlMenu popup under
“More” (“Ещё” in Russian), starting with Changelog, then Theme builder.
Search and theme controls each use 120 px; Search text is left-aligned like
an input label.

At viewport widths of 760 px or less, navigation uses a WlDrawer menu.
The header stays in one row with the brand, Search and Theme controls,
language selector and menu button. Search and Theme use 44 × 44 px
icon-only controls with centered icons. The menu button stays at the far right;
the language selector is immediately before it.

Language selection uses a 68 px WlSelect with the short labels EN/RU.
WlDrawer handles Escape, the backdrop and focus restoration. When the viewport
returns to desktop layout, the drawer closes and focus moves to visible navigation.

## SEO

The runtime updates title, description, Open Graph/Twitter metadata, canonical
URL and EN/RU/x-default hreflang links for the current route and language.
Static HTML provides an English home-page fallback, JSON-LD and Open
Graph/Twitter tags. The Playground build generates `sitemap.xml` with EN/RU
home, section and component URLs and their language alternates.

There is no prerender or SSR for Playground pages. Query routes receive the
same static English home HTML; route-specific metadata is applied only after
JavaScript starts. Social bots that do not execute JavaScript therefore see
the English home preview, including when following a Russian or component URL.

## Adding and checking examples

1. Compare the source component, public manifest and actual pt sections.
2. Add a canonical example and extended SFC in the appropriate category.
   `consumerSource` replaces the internal import and preview binding, resolves
   the documented literal `t('examples.key')` pattern, and removes
   `usePlaygroundI18n` from exported code. Keep exportable examples within that
   pattern; their default export language is English, and the Playground
   clipboard follows the selected EN/RU language.
3. Add descriptions and component-specific accessibility rules to metadata,
   with matching EN/RU messages.
4. Check copied code as a gavia-ui SFC consumer.
5. After a separate command authorising pre-release checks, run typecheck,
   the Playground build, affected-section checks, regression and visual baselines.

Targeted Vitest checks cover the manifest, consumer-code compilation, legacy
routes and active-heading selection. E2E checks real navigation through all
53 components, files/dates/overlays, 320 px, five themes and scrollspy. See the
[DatePicker contract: single date and range](date-picker.md).

Record Docs changes under Unreleased in both changelogs. Keep the public root
changelog in English and update its Russian Playground overlay when needed.
New dependencies, version changes, commits and publishing require separate
agreement.

When importing multiple themes, import `themes/white.css` first: it also sets
the `:root` fallback. Gavia and other named themes must follow Classic so the
selected attribute overrides the base palette.

Home and the documentation overview offer pnpm/npm/Bun. The command uses the
latest confirmed npm version; copying follows the selected package manager.
