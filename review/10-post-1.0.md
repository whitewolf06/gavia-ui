# Phase 10: individual post-1.0 tasks

Status: **planned and queued; no implementation or validation is claimed here**.
This expands every item in [PLAN.md, phase 10](PLAN.md#фаза-10--после-10).
Start this wave after the accepted 1.0 release; do not use it to postpone an
unresolved pre-1.0 defect. Parent T10.1–T10.13 groups remain in the
[implementation ledger](IMPLEMENTATION.md); IDs below identify individual work.

Sources: [new components](04-new-components.md),
[performance](07-performance-and-bundle.md), [lint](02-code-style-and-lint.md)
and [testing](09-testing.md). Estimates, component counts and bundle figures in
the original review are historical observations and must be remeasured.

## Shared completion contract

Each task remains Queued until its own evidence is recorded. Implementation
requires public types, a manifest entry where applicable, applicable pt/CSS
sections, an executable copyable SFC, English/Russian guides, focused tests,
an Unreleased entry and a changeset. Changed contracts need migrations.
Preserve Vue `^3.4.0`, strict TypeScript, app isolation, explicit CSS imports,
the existing namespaces and five themes. Data, requests, routing and business
rules stay in the consumer.

Record code readiness, targeted test/typecheck results, pending full checks,
manual acceptance and publication separately. Installed-archive, production
browser, five-theme desktop/mobile and Windows screenshot checks run under a
separate authorized verification. Review image diffs before updating PNGs.
No task receives measured performance or screen-reader acceptance from this
planning document.

## Components

### T10.NEW-07 — WlDataTable (parent T10.2)

- Dependencies: completed Table row-key/sort/selection contract, pagination,
  overlay infrastructure; T10.NEW-08 before any optional row virtualization.
- Deliver: controlled data, sort, selection and page updates; sticky header,
  fixed columns, expanded rows, loading and empty states. Decide in a small RFC
  whether to compose WlTable or extend it without widening its simple default.
- Accept: stable keyed cell state after row reorder; sort/selection/page emit
  once; disabled rows remain unchanged; expansion and sticky columns work at
  narrow widths and zoom; no built-in requests or application data store.
- Evidence: typed row/column/slot fixtures, reorder and event regressions,
  keyboard/ARIA and five-theme production browser results, measured large-data
  fixture with and without optional virtualization.

### T10.NEW-08 — WlVirtualList and list integration (parent T10.1)

- Dependencies: public ResizeObserver/scroll helpers, stable option identity
  and active-option ownership from the listbox work.
- Deliver: fixed-height vertical rows, explicit viewport/overscan controls and
  scroll-to-index; opt-in Select/MultiSelect/Autocomplete integration. Track
  variable-height rows as a separate follow-up rather than silently approximating.
- Accept: bounded rendered rows for a large fixture, correct scroll extent,
  stable keys after updates, visible/mounted active option during keyboard
  navigation, empty/disabled states, SSR-safe import and cleanup on unmount.
- Evidence: viewport/resize/scroll regression tests, real-browser long-list
  keyboard and accessible-name checks, before/after render and memory measures.

### T10.NEW-09 — WlTree (parent T10.3)

- Dependencies: roving focus, stable IDs/keys, selection and typeahead helpers.
- Deliver: typed readonly node descriptors, controlled expansion/selection,
  lazy-child state supplied by the application and documented Tree View keys.
- Accept: parent/child navigation, Home/End/typeahead, disabled nodes, correct
  treeitem level/expanded/selected states, focus retained through node changes
  and no fetch logic. Record WlTreeSelect as a dependent later subtask using
  the shared tree and anchored overlay; do not claim it ships with Tree.
- Evidence: recursive type fixtures, keyboard/state/ID tests and manual tree
  screen-reader results on desktop/mobile before acceptance.

### T10.NEW-10 — WlDescriptions (parent T10.4)

- Dependencies: responsive layout tokens; clipboard helper for optional copying.
- Deliver: semantic dl/dt/dd, one-to-three-column responsive layout and typed
  label/value slots; configurable copy action with accessible feedback.
- Accept: long/empty values, custom slots and narrow layouts preserve term/value
  relationships; copying does not change selection or leak application logic.
- Evidence: semantic rendering/slot fixtures, clipboard failure/retry tests
  where enabled, and long-content screenshots in five themes.

### T10.NEW-11 — WlList / WlListItem (parent T10.4)

- Dependencies: WlAvatar, WlLink and listbox/roving behavior for opt-in selection.
- Deliver: avatar, title, subtitle, description and actions slots; explicit
  static-list, link and selectable modes with their own semantics.
- Accept: static content does not acquire a false interactive role; link and
  selectable modes expose appropriate keyboard/selection behavior; nested
  actions remain usable; stable keys retain item state on reorder.
- Evidence: mode-specific type/role tests and keyboard/mobile long-content cases.

### T10.NEW-12 — WlKbd (parent T10.5)

- Dependencies: keyboard typography tokens and localized shortcut descriptions.
- Deliver: semantic kbd presentation for single keys and combinations; live
  Menu/CommandPalette examples without binding application shortcuts globally.
- Accept: readable compact/normal appearance, platform labels supplied by the
  consumer, no repeated screen-reader shortcut announcement.
- Evidence: semantic/slot fixtures and five-theme examples at zoom.

### T10.NEW-13 — WlCopyButton (parent T10.5)

- Dependencies: clipboard composable, announcer and named Button/IconButton.
- Deliver: idle/pending/copied/error feedback, explicit text source and retry.
- Accept: one write per activation, failure preserved for retry, no module-level
  clipboard access, no timer after unmount and one accessible result message.
- Evidence: success/rejection/unmount tests, strict callback types and browser
  permission/secure-context cases; never assume the clipboard always succeeds.

### T10.NEW-14 — WlInputOtp / WlPinInput (parent T10.6)

- Dependencies: field/native-attribute contracts and focus helpers; settle one
  public name before export, retaining any subsequently needed alias.
- Deliver: configurable code length, full-code paste, caret/arrow/delete behavior
  and autocomplete=one-time-code; validation remains in the consumer.
- Accept: partial/complete/invalid/disabled states, leading zeros, paste
  normalization, backspace and mobile autofill; an understandable accessible
  name/value without treating the numeric code as an arithmetic number.
- Evidence: model/native-attribute fixtures, paste/focus tests, real-device
  mobile autofill and screen-reader protocol with actual versions.

### T10.NEW-15 — WlStepper (parent T10.6)

- Dependencies: Steps, field contracts and panel focus/ID behavior.
- Deliver: controlled step navigation with content slots and explicit async
  validation hooks; the consumer owns persistence and business validation.
- Accept: cancellation/error/retry, blocked/disabled steps, backward navigation,
  hidden panel semantics and stable form state when revisiting a step.
- Evidence: typed hook/slot fixtures, async race/state tests and keyboard/focus
  production scenarios, including nested form controls.

### T10.NEW-16 — WlAvatarGroup (parent T10.7)

- Dependencies: WlAvatar and locale/plural/count helpers.
- Deliver: stacked avatars, maximum visible count and a customizable overflow
  indicator with a complete accessible description.
- Accept: zero/one/many items, stable keys, long names, failed images, overflow
  count and translated labels; visual overlap does not remove information.
- Evidence: count/slot tests, accessibility output and five-theme narrow layouts.

### T10.NEW-17 — WlSplitter (parent T10.7)

- Dependencies: pointer/keyboard/resize helpers and appropriate focus tokens.
- Deliver: horizontal/vertical resizable panels with a focusable separator,
  controlled sizes, constraints and optional collapse behavior.
- Accept: pointer cancellation, keyboard resizing, min/max limits, meaningful
  separator orientation/value, viewport changes and listener cleanup; no DOM
  access during import and no lost content when constrained.
- Evidence: constraint/event tests, real pointer and keyboard browser scenarios,
  zoom/narrow layouts and screen-reader separator checks.

### T10.NEW-18 — WlSkipLink (parent T10.8)

- Dependencies: WlLink and shared focus-visible styling.
- Deliver: a link visible on focus targeting consumer-provided main content.
- Accept: first-keyboard access, correct destination/focus, existing URL hash
  behavior and visible focus in every theme; no hardcoded application IDs.
- Evidence: keyboard destination tests in plain and router consumers plus
  desktop/mobile layout checks.

### T10.NEW-19 — WlVisuallyHidden (parent T10.8)

- Dependencies: existing wl-visually-hidden CSS contract.
- Deliver: a semantic wrapper with an optional element choice, using the
  established hiding rule rather than an independent duplicate.
- Accept: text remains in the accessibility tree, takes no visible layout space
  and does not create an unlabeled focusable trap; native attributes still pass.
- Evidence: type/attribute fixtures and real-browser visual/accessible output.

### T10.NEW-20 — WlRelativeTime / WlTime (parent T10.8)

- Dependencies: Intl formatting utilities and locale; choose/document names.
- Deliver: time datetime with configurable absolute/relative display and
  controlled refresh behavior; an absolute accessible explanation is available.
- Accept: invalid dates, timezone/locale changes, unit boundaries and SSR
  hydration without clock drift warnings; no orphan interval after unmount.
- Evidence: frozen-clock/locale/cleanup tests and explicit SSR/consumer fixtures.

### T10.NEW-21 — WlBanner (parent T10.9)

- Dependencies: Alert semantics, tone and dismissible migration decisions.
- Deliver: full-width status/banner layout with action and dismissal slots;
  decide whether it is an Alert variant before adding a redundant component.
- Accept: controlled dismissal, visible message/actions, intentional live-region
  priority and no duplicate announcements; no cookie or consent business logic.
- Evidence: type/event/live-region tests and sticky/narrow five-theme examples.

### T10.NEW-22 — WlRating (parent T10.9)

- Dependencies: confirmed application use case, radio/focus/locale utilities.
- Deliver: controlled rating with explicit interactive/read-only contracts,
  accessible value labels and documented increment/range behavior.
- Accept: keyboard and touch selection, clear/disabled/invalid states and
  readable values independent of star color; no requests or review aggregation.
- Evidence: value/role fixtures, keyboard tests and mobile screen-reader checks.
  The recommendation stays queued if the usage prerequisite is not yet met.

### T10.NEW-23 — WlDateTimePicker (parent T10.10)

- Dependencies: accepted DatePicker/TimePicker models and shared overlay stack.
- Deliver: one composed panel with explicit timezone/model and commit/cancel
  semantics, localized labels and consistent bound validation.
- Accept: date/time boundaries, invalid inputs, disabled times, cancellation,
  nested focus and DST cases for any promised timezone contract; preserve
  chosen values and never silently infer an unsupported timezone conversion.
- Evidence: model/bound fixtures, date/time edge-case tests, keyboard/mobile
  browser scenarios and SSR hydration.

### T10.NEW-24 — WlThemeSwitcher (parent T10.10)

- Dependencies: useWlTheme, locale and an accessible selection control.
- Deliver: light/dark/system selection with configurable theme mappings and
  opt-in persistence; reusable outside the Playground.
- Accept: live system-preference changes, unknown stored values, isolated app
  instances, disabled state, SSR-safe import and listener disposal; preserve
  all existing supplied theme identifiers.
- Evidence: preference/storage/listener tests, SSR fixtures and two-app demo.

## Performance and tooling

### T10.PERF-5 — Selective internal icons (parent T10.11)

- Dependencies: stable icon source/generator and accepted bundle-size tooling.
- Deliver: named generated SVG exports and a small internal renderer; migrate
  internal fixed icons while preserving WlIcon's public dynamic name map.
- Accept: no missing icons or new HTML injection surface; dynamic public names
  and aliases still work; unrelated icons disappear from a minimal consumer.
- Evidence: generator/resolver tests, before/after installed consumer bundles,
  fresh gzip measurements and reviewed five-theme icon screenshots.

### T10.PERF-6 — Component CSS entry points (parent T10.11)

- Dependencies: complete CSS dependency inventory, layer and token contracts.
- Deliver: explicit token and component CSS subpaths with the aggregate
  base.css remaining compatible; document dependencies and import order.
- Accept: each selective import supplies required shared styles; aggregate
  geometry, layers and consumer overrides remain stable; no automatic JS CSS
  side effects, missing exports or accidental duplicate rule payload.
- Evidence: installed-archive subpath consumers, selective/aggregate fixture
  comparison, fresh CSS size reports and five-theme Windows visual diffs.

### T10.LINT-2 — Stylelint (parent T10.12)

- Dependencies: selected supported dev-only tool versions and CSS entry layout.
- Deliver: scoped configuration for namespace, specificity, important usage,
  hardcoded colors and duplicate selectors/properties. Token sources/reset and
  intentional selectors need narrow documented allowances.
- Accept: meaningful invalid/valid fixtures detect contract violations; retain
  non-overlapping structural layer/token tests; no unsafe bulk CSS autofix.
- Evidence: targeted rule fixtures, scoped lint output, followed by separately
  authorized full checks and visual comparison for any semantic CSS change.

### T10.LINT-PACKAGE — Reusable ESLint configuration (parent T10.12)

- Dependencies: stable local config, supported Node 22.13+/24 and documented
  framework/parser boundaries.
- Deliver: dev-tool workspace package intended as @whitewolf06/eslint-config
  with a typed factory and opt-in Vue/a11y/Playwright groups; local repository
  restrictions remain configurable rather than leaking consumer paths.
- Accept: Vue and plain TypeScript fixtures, ESM/flat-config imports, justified
  CallbackInference exceptions and ES2020 compatibility; dangerous replaceAll,
  template import deletion and Playwright assertion autofixes stay disabled.
- Evidence: fixture lint results, config consumer typechecks and packed-tool
  smoke after authorization. Package publication requires its own approval.

### T10.TEST-6 — Vitest Browser Mode (parent T10.13)

- Dependencies: compatible Vitest/Playwright provider versions and browser CI
  caching; retain focused Node/jsdom projects.
- Deliver: isolated real-browser component tests for anchored positioning,
  nested focus/traps, body-scroll compensation, tooltips and ResizeObserver.
- Accept: edge flip/scroll/resize and transition behavior without zero-geometry
  mocks; closed/unmounted instances leave no listeners or portals; production
  Playground E2E remains as consumer coverage.
- Evidence: reproducible headed/headless Chromium runs with pinned environment
  and failure artifacts, plus cross-engine E2E for the affected contract.

### T10.TEST-7 — Behavior queries by role/name (parent T10.13)

- Dependencies: agreed role-query helper or a justified dev-only testing tool.
- Deliver: new and migrated behavioral suites query public roles and names;
  retain dedicated class/data/CSS compatibility assertions where appropriate.
- Accept: an inaccessible or wrongly named control causes a meaningful test
  failure; no reduced assertion count, broad conditional expectations or
  selector fallback that hides a missing role.
- Evidence: before/after scenario inventory, strict test/type checks and a
  deliberate local role/name regression demonstrating the suite catches it.

### T10.TEST-10 — Opt-in mutation testing (parent T10.13)

- Dependencies: stable focused tests and compatible Stryker/Vitest tooling.
- Deliver: an explicitly invoked release experiment for utils and key Select,
  DatePicker and overlay paths; no recurring heavyweight CI job by default.
- Accept: scoped exclusions have reasons, surviving mutants are triaged into
  meaningful behavior gaps, and equivalent mutants are recorded separately.
  Measure a baseline before choosing a score target; do not claim the review's
  suggested 80% as an achieved result.
- Evidence: exact SHA/config, killed/survived/timeout/equivalent counts, runtime,
  report link and tests added for real gaps. Execution needs separate approval.

## Dependency order and evidence record

Start independent small primitives once 1.0 is accepted. VirtualList precedes
optional data/list virtualization; Tree precedes a later TreeSelect; utility,
locale and focus foundations precede their consumers. Selective CSS, icons and
test-tool upgrades should land as separate reviewable changes with fresh
measurements. No component wave requires raising the Vue peer minimum.

For each ID, append source paths, test/type results, pending heavy checks,
consumer/browser/manual evidence, contract migration and eventual commit/PR
reference to the implementation ledger. A prepared checklist is a planning
artifact; mark implementation or verification complete only when it exists.
