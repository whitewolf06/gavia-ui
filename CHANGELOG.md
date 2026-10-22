# Changelog

What changed in Gavia UI and what to consider when upgrading.
Versions before the rebrand used the previous package name.
The history was reconstructed from release Git tags and migration notes.
Historical generated Changeset paragraphs are preserved in [the maintainer archive](docs/maintainers/changeset-history.md).

## Unreleased

### Changed

- Keep rendered documentation visible while the next Playground page and its translations load.

## 1.0.0-rc.1 — prepared

An opt-in candidate for npm `next`; publication date is pending.
Follow the [1.0 upgrade guide](docs/migration.md#migration-1-0-rc-1).

### Breaking changes

- Built-in text falls back to English; install `WlConfig` with `wlLocaleRu` to keep Russian ([localization](docs/migration.md#migration-1-0-localization)).
- Use canonical PT names and separate `iconButton` overrides from `button` ([PT mapping](docs/migration.md#migration-1-0-public-api)).
- Replace status variants with semantic `tone` and overlay `dismissable` with `dismissible` ([appearance and dismissal](docs/migration.md#semantic-tone-appearance-and-dismissal)).
- Import the Tooltip component as `WlTooltip`, register `WlTooltipDirective`, and provide names for icon actions ([Tooltip and names](docs/migration.md#tooltip-imports-and-action-names)).

### Added

- Add CheckboxGroup, RadioGroup, Tooltip, nested menus, ContextMenu, Toolbar and TagsInput.
- Add pure utilities through `gavia-ui/utils` and Vue helpers through `gavia-ui/composables`.
- Add optional router adaptation through WlLink and controlled Table sorting/selection with stable row keys.
- Add typed option slots, disabled options, stable keys and clearable single selection.
- Add Toast IDs, updates, promise messages, actions, positions and pause/queue controls; confirmation also returns a Promise.
- Add Gavia Sans variable weights 100–700, real italic and a live Playground weight slider.
- Add canonical documentation routes, prerendering, full-text search, recipes and starter applications.

### Changed

- Normalize configuration reactively and isolate locale, services and generated IDs per Vue application.
- Share overlay stacking, modal inert/focus ownership and active-only positioning listeners.
- Use one copyable SFC source for examples and source-derived public API metadata.
- Ship WOFF2 web fonts in npm and provide licensed TTF desktop downloads separately.
- Preserve Vue 3.4+, TypeScript 5.4+, five themes and explicit CSS imports.

### Fixed

- Correct listbox keyboard navigation, active-option scrolling and duplicate click selection.
- Give Tabs unique tab/panel relationships and support disabled, vertical and retained/lazy panels.
- Restore anchored-panel positioning and focus after rendering, rebinding and reopening.
- Correct Alert/Field/Steps semantics and avoid duplicate Toast announcements.
- Reset settled Toast lifetimes and consistently cancel replaced confirmation requests.
- Support native Node16/NodeNext ESM declarations and independent installed-package consumers.

### Deprecated / removed

- Remove the 0.x PT/status/dismissal aliases in the major candidate; use the [canonical-name migration](docs/migration.md#migration-1-0-public-api).
- Remove internal locale adapters and Russian prop defaults; public locale overrides remain optional.
- Exclude TTF desktop files and font QA reports from npm ([font assets](docs/migration.md#migration-package-assets)).

## 0.12.1 — 2026-10-12

- The Playground follows the system color scheme and supported browser language on first visit, remembers manual choices, and offers a System theme option. Explicit language/theme links keep their priority.
- Home metrics link to the component, icon, token and theme sections. Documentation components are sorted alphabetically within each group and can be filtered with a local search field.

## 0.12.0 — 2026-10-09

- Added an optional wlLocaleEn preset and EN/RU Playground localization with English by default and language URLs; GitHub Markdown documentation now uses English.
- Expanded the author story in the Playground and README, including the personal website.
- Added route-specific titles, descriptions, canonical/hreflang links and a sitemap; public documentation remains a client-rendered SPA.
- The Playground header keeps navigation links that fit and moves trailing links to More; mobile uses one row with 44 px Search/Theme controls with centered icons, a 68 px EN/RU selector and the Menu button at the far right. Desktop Search and Theme share a 120 px width, with Search text aligned left.

## 0.11.1 — 2026-10-09

- Revised playground, README and documentation copy: shorter descriptions, clearer instructions and limitations.
- Opening a saved playground documentation link now scrolls to the requested section immediately.
- Fixed breadcrumb separator spacing and WlPill alignment.
- Changed the main accent in light Gavia to `#3c7490`; updated hover, active and accent text shades.

## 0.11.0 — 2026-10-08

### Public API typing

- Select/MultiSelect connect options, optionValue, model and update events through generics; resolvers no longer use any, and readonly lists are supported.
- Autocomplete distinguishes free single input from suggestion arrays; fixed lost text when option-label uses a key and a stale field after an external null/undefined reset.
- Table infers Row from value and checks regular columns against row keys; virtual columns require kind: "virtual". Cell slots retain the field type.
- pt provides section and context suggestions; WlPtStrict / WlPtConfigStrict catch typos through satisfies while allowing dynamic configuration.
- Radio/Segmented/Tabs connect the model to its domain; Sidebar/CommandPalette retain item/data types in events and slots. Added Expose types for ref methods and WlTooltipValue.
- Public generic exports require the actual resolver/mode prop when an explicit non-default generic is used, including DatePicker range.
- Menu/Accordion connect callbacks, keys and slots to the full item; Sidebar/CommandPalette retain extra group fields. Descriptor collections accept readonly.
- DOM attributes/events are typed without new runtime props; Field scoped slots and Menu/Popover/FilePicker/FilterBar ref methods received public contracts.
- Models describe modifiers: trim is supported only by text fields and CommandPalette query. Locale normalization is safe; known keys are no longer unknown.
- Confirm/Toast received scoped group helpers; Teleport component attrs reach the DOM. FilterBar uses an SSR id.
- Fixed single FileUpload, selection retention after a rejected replacement, disabled bypasses and NaN/Infinity in numeric UI.
- Positive and negative API fixtures were checked against source and installed archives on Vue 3.4 / TypeScript 5.4 and Vue 3.5; local results and check boundaries are in the [quality documentation](docs/quality.md).

### Breaking changes

- Unknown models and callback labels without free-text handling require an explicit data type. Navigation descriptor collections are readonly; generic SFCs may require replacing InstanceType with an Expose contract.
- An explicit generic range DatePicker requires the actual selectionMode="range"; other models and handlers are preserved.
- Virtual columns must be marked explicitly; Menu/Accordion/Sidebar keys and callbacks are checked against data. The new declarations require TypeScript 5.4+.
- The historical 0.9.1 fixture stays unchanged. A scoped contract records the agreed 0.11 migration; new API losses still block the gate. [0.11 migration](docs/migration-0.11.0.md).

## 0.10.0 — 2026-10-08

### Themes

- README presents Gavia / Gavia Dark as the primary themes and Classic / Classic Dark / Newspaper as additional themes; each lists its identifier and explicit CSS import.
- Added a compact ghost sun/moon WlIconButton in the hero’s upper right corner: a tinted 32 px icon, a 44 × 44 px interaction area, no background box in the normal state and a visible keyboard focus ring. Gavia ↔ Gavia Dark, Classic ↔ Classic Dark; Newspaper switches to Classic Dark and returns on the next click.
- Day and night hero backgrounds are preloaded and remain two layers of the same composition: light themes use day and both dark themes use night. Theme switching uses one temporary full-page transition when View Transitions API is available; other browsers keep the hero crossfade. The night layer appears once loaded; prefers-reduced-motion disables transitions.
- Forest and reeds in home information cards remain visible in dark themes; cards retain dark backgrounds. Links to documentation, Issues and the GitHub guide in these cards open in a new tab and have an external-link icon.
- Gavia Dark received a night hero with the moon at the original sun position, soft blue light and the same loon; surfaces use cool gray with a slight blue undertone, and the main turquoise accent is stronger and slightly bluer. The installation card keeps its colored border and uses a dark turquoise accent background.
- Refined the cool undertone in only six Gavia Dark fills: page background, raised and secondary surfaces, hover and two soft accent backgrounds.
- The “Clarity in every detail” heading on the font page follows the selected theme’s typeface; Gavia Sans specimens keep their own font.
- Narrow WlAlert messages with action and close controls retain a readable text width; actions wrap within the available component width.
- Added Gavia Dark (`gavia-dark`, `themes/gavia-dark.css`) with Gavia Sans; the catalog contains five themes.
- White / Graphite display as Classic / Classic Dark. Identifiers `white` / `graphite`, CSS paths, original theme values and catalog positions are preserved.
- `wlDesignThemes` expanded from four to five entries; literal labels changed. Use `WlDesignTheme` / `WlThemeName` and `name` rather than fixing the old tuple length or label. [Theme migration](docs/migration-themes.md).

### Checks and compatibility

- The actual public TypeScript/CSS/pt contract is protected by the 0.9.1 snapshot; the existing Vue consumer is checked.
- Added Gavia visual baselines with real Gavia Sans and axe checks for WCAG 2.2 AA.
- The archive runs in a browser on desktop/mobile; Node import, SSR/hydration and WlButton size are checked separately.
- Fixed Vue 3.4 support: declarations and SSR ids work with the minimum peer; Vue 3.5 retains native ids.
- Select/MultiSelect/Autocomplete connect controls and named lists through ARIA.
- Added --wl-text-accent/--wl-text-accent-hover and a foundation value for readable accent text; Graphite retains its original primary action color.
- Removed unused token/component catalogs from the single-button bundle; public exports are preserved.
- CI measures coverage against baseline thresholds; added overlay close-cancellation checks.
- Added “Quality and compatibility” in the playground, a home summary and search/footer links. Coverage, measurement date and source come from a real report; the README badge uses the saved repository snapshot, while the published playground uses its CI build report.
- WlStatCard labels use the theme’s readable text token.
- Playground coverage uses WlProgress percentage bars on a 0–100% scale; colors, radii and animation come from the theme.
- Changesets prepares versions, prereleases use npm next, and tag-release previews are stored separately.
- pnpm, npm and Bun installation options are available in the playground and README; added Issue templates and browser/version policy.

## 0.9.1 — 2026-10-07

This release includes the 0.9 branch changes and corrected browser checks.
Version 0.9.0 was not published to npm; upgrade directly from 0.8.1 to 0.9.1.

### Added

- Gavia Sans 0.6: Cyrillic and Latin, 6 weights, 12 upright/oblique faces, TTF/WOFF2. Explicit exports for font CSS and files; SIL OFL 1.1 license. The previous Gavia CSS family and import paths are preserved.
- Gavia theme with a warm background, primary color #294451 and danger #ab4448. Gavia Sans is used only in Gavia; White, Graphite and Newspaper retain their typography. The library’s base theme remains White.
- Playground font page: Russian/English text, numbers, all weights and a custom text specimen. Download Gavia-Sans-0.6.zip from the page and footer: 12 TTF, 12 WOFF2, CSS and licenses.
- Theme builder: 8 key colors, live components, contrast checks, local drafts and JSON/CSS export.
- Full guides for 53 components: interactive controls, copyable SFCs, API, accessibility and introduced version. Icons and themes are grouped in documentation; previous gallery URLs retain their redirects.
- WlDatePicker: optional selectionMode="range" with an ISO range and shared calendar. Single mode and the string model are preserved.
- Foundations documentation: typography, layout, copy and responsiveness with working examples. CSS primitives gained container variants, a divider, local scrolling and layer isolation.
- Shared page headers built with WlPageHeader/WlBreadcrumbs; a photographic home page with installation, metrics, sections and author. README uses the current logo, a graphic header and brief setup instructions.

### Fixed

- Gavia and font specimens retain exact tabular number widths in Linux Chromium; rendering settings moved into theme tokens. Approved font files are unchanged.
- Documentation browser checks wait for the mobile menu rebuild to finish; dependency installation prefers Ubuntu archive and has its own timeout.

- Browser CI is split into four jobs; large SVG checks are split by theme with all states preserved. The number test checks set width and font loading; Gavia Sans source files are unchanged.

- The home page inherits the selected theme’s fonts, colors, radii and states; images and layout are shared. Installation and the 2×2 metrics use one grid and responsive spacing.
- Header: 20 px title, logo alignment, distinct design-system and theme-builder icons, favicon in Gavia’s primary color. The compact menu supports keyboard navigation and focus return.
- Short API and “Accessibility” tabs no longer stretch to the sidebar’s height. The side catalog sticks below the header; icons, categories and item spacing are aligned.
- The active table-of-contents item uses a small chevron and smooth 8 px shift; reduced motion is respected, and scrolling does not change the URL.
- WlPopover examples separate controls from nested dialog values; the copyable SFC keeps the same spacing. DatePicker focus covers the field and calendar button together.
- The font page uses current UI kit components; previous versions, comparisons, duplicate text specimens and the global Ctrl+S interception were removed from the presentation.

## 0.8.1 — 2026-10-06

This release includes the 0.8 branch changes and the nested overlay fix.
Version 0.8.0 was not published to npm; upgrade directly from 0.7.1 to 0.8.1.

### Added

- `WlTimePicker`: local HH:mm/null time, minute precision, bounds and native attributes.
- `WlFilePicker`: stateless File[] selection, a trigger slot and synchronous choose()/clear(); the app owns uploads and limits.
- `WlDatePicker.displayFormat`: Russian display by default and ISO display with matching manual input; the ISO model is preserved.
- Expanded the SVG catalog and added typed `resolveWlIconName` for canonical and legacy names.

### Fixed
- Nested pickers/menus inside Popover and Dialog preserve the parent overlay when an item is chosen in a teleported list. Escape closes only the top layer and returns focus; Dialog retains its local Tab trap.
- `WlInput` retains a string model with `type="number"`, including clearing; native IME composition avoids premature commits.
- `WlTimePicker` shows focus and invalid outlines when the keyboard moves into internal segments of the native time control.

- `verify:package` handles Windows and Linux line endings in LICENSE while comparing license content strictly.
- Infinite `WlNumberInput` bounds do not reach aria-valuemin/aria-valuemax; default max=99 is preserved.

[Consumer upgrade](docs/migration-0.8.md). Existing models, classes,
tokens and defaults are preserved; new components are imported explicitly.

## 0.7.1 — 2026-10-05

### Fixed

- `WlCheckbox` checked and indeterminate marks use SVG icons instead of font characters: their shapes and alignment match across three themes.
- Disabled `WlCheckbox` and `WlRadio` retain their appearance on hover.
- `WlSelect`, `WlMultiSelect` and `WlAutocomplete` disclosure arrows use aligned SVG icons instead of text characters.

### Changed

- Removed nine completed HTML prototypes; working examples remain in the Vue playground, and source icons remain in the SVG catalog.
- The roadmap and icon instructions link to live SFC examples and the SVG catalog. Prototype history remains in Git. README starts with a prominent link to the public demo.

## 0.7.0 — 2026-10-05

The first release under the new name on public npm. Setup instructions
and publication status are in [README](https://github.com/whitewolf06/gavia-ui/blob/main/README.md).

### Added

- Added an “About the project” playground page: author, license, instructions and the full changelog from one source.
- Added the documentation build and browser checks for GitHub Pages; site publication depends on all checks for the same commit.
- Added the full MIT text to the repository and library archive.
- Added the changelog and maintenance rules.

### Changed

- The new project name is Gavia UI; the mark is a loon shaped like a G with an eye.
- Documentation and metadata were prepared for `whitewolf06/gavia-ui`.
- New package name `gavia-ui` on public npm: installation without a GitHub token after the first release.
- Updated imports, workspace, CI and the [package-name migration](docs/migration-gavia.md).
- Removed the previous brand from descriptions, demo data and prototypes.
- The local preview variable is `GAVIA_E2E_BASE_URL`; catalog error messages
  use Gavia UI. The migration lists these changes.
- Local browser checks support the full pinned Chromium through `GAVIA_E2E_CHROMIUM_CHANNEL`.

### Compatibility

- Public `Wl*` names, props, events, models, slots, icon names, `wl-*` classes
  and `--wl-*` tokens are preserved.

The required package-path change and consumer checks are described in
the [0.7 migration](docs/migration-0.7.md). Application setup and the
0.6.0 design system are preserved.

## 0.6.0 — 2026-10-01

### Added

- Design system: 416 tokens, White / Graphite / Newspaper themes and contrast checks.
- Layout and typography primitives, a JSON catalog and typed token APIs.
- Live SFC examples for 51 components, 47 SVG icons and six UI recipes.
- Contract, browser and visual checks; consumer smoke on Node 18 and 24.

### Changed

- PrimeVue and PrimeIcons were fully removed. Vue 3 is the only required peer; there are no runtime dependencies.
- Configuration, tooltip, toast and confirmation behavior is implemented within the library.
- Optional overlay motion respects `prefers-reduced-motion`.
- Public component contracts and previous tokens are preserved.

### Fixed

- Scroll blocking when opening Dialog/Drawer, focus return and nested overlay layers.
- Search focus and contrast for buttons, hints and error text.
- Reading CSS files in Node 18 tests and CI scenario timeouts.

Application setup and table changes are described in the
[0.6 migration](docs/migration-0.6.md) and [migration from 0.3](docs/migration-0.5.md).
Work labeled 0.4/0.5 was included in 0.6.0; it has no separate release tags.

## 0.3.0 — 2026-08-09

- Strengthened component contracts and added page layout primitives.

## 0.2.1 — 2026-07-30

- Added the Newspaper theme.
- Switched the playground to lazy-loaded demos.

## 0.2.0 — 2026-07-27

- Added the composite Sidebar and expanded composite examples.
- Added command palette, version navigation, selection/confirmation APIs and the manifest.

## 0.1.0 — 2026-07-19

- First Vue 3 + TypeScript workspace: package, playground, themes and tokens.
- Basic components, navigation, overlays, table, calendar, date selection and file upload.
- Configured publication of the previous package to GitHub Packages.

## Maintenance rules

Record changes under “Unreleased” first. At release, move them under the
version and actual publication date. Record features, fixes and required
upgrade steps; breaking changes require a migration note.
Root and package changelogs must have the same content; package documentation
links are absolute. Verify publication separately from pushing the tag.
