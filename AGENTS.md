# AGENTS.md — Gavia UI

This is the shared contract for anyone changing this repository. Read
`AGENTS.local.md` too when it exists; it describes the local workstation and is
not committed. Explicit user instructions for the current task take priority.

## 1. Project and repository map

Gavia UI is an independent Vue 3 component library and design system.
`packages/ui-kit` is the published package; `apps/playground` is its documentation
site and interaction test bench. Business logic belongs in consumer applications.

| Path | Purpose |
| --- | --- |
| `packages/ui-kit/src/components/` | Vue SFCs, component exports and typed native/generic contracts |
| `packages/ui-kit/src/manifest/` | Public props, slots, events, model and introduction-version metadata |
| `packages/ui-kit/src/composables/`, `src/utils/`, `src/services/` | Reusable behavior, utilities and app-scoped state |
| `packages/ui-kit/src/pt-types.ts` | Pass-through section contracts |
| `packages/ui-kit/styles/`, `themes/` | Explicitly imported CSS and five theme files |
| `packages/ui-kit/tokens/source.json` | Canonical token source for generated CSS, JSON and TypeScript |
| `packages/ui-kit/icons/` | Canonical SVG icon sources |
| `packages/ui-kit/tests/` | Unit, contract and compile-only consumer tests; immutable compatibility fixtures |
| `apps/playground/src/design-system/examples/`, `recipes/` | Live examples and copyable source; application scenarios |
| `apps/playground/src/documentation/`, `src/i18n/messages/` | Component guides and English/Russian documentation text |
| `apps/playground/e2e/` | Browser interaction, accessibility, visual and Pages checks |
| `scripts/`, `.github/` | Release tooling, verification, workflows and community templates |
| `docs/` | Architecture, design system, quality, migrations and maintainer procedures |

## 2. Stack, dependencies and architecture

- Vue 3 + strict TypeScript, Vite library mode for the package and Vite for the
  Playground. Use pnpm for repository installation; no npm, Yarn or Bun installs.
  Consumer fixtures may intentionally verify other package managers.
- Development supports Node 22.13+ in the Node 22 line and Node 24. Preserve the
  library's Vue peer `^3.4.0`, its minimum consumer and the Vue 3.4/3.5 matrix.
- Use plain CSS and CSS custom properties. No React, Tailwind or CSS-in-JS.
- Vue is the library's only required peer and is external to its bundle. Keep
  PrimeVue and PrimeIcons out of source, dependencies and the packed archive.
- Do not add Pinia, Vue Router, API clients, Markdown/Mermaid, consumer code or
  business logic to library runtime dependencies. Explain new devDependencies
  in the eventual commit description. Playground-only tools stay in Playground.
- Components own DOM, props and emits; small composables own shared selection,
  focus and positioning behavior; services own app-scoped state. Depend on type
  contracts and extend through props, slots and `pt`. See `docs/maintainers/architecture.md`.
- Within `packages/ui-kit`, use relative imports, never `@/` aliases. Do not touch
  DOM or `window` during module import; use lifecycle hooks.
- Build ESM with declarations. Preserve every subpath in the package's `exports`:
  `.`, `styles/base.css`, `styles/reset.css`, `styles/primitives.css`,
  `styles/fonts/gavia.css`, `themes/*.css`, `fonts/gavia/*`, `manifest.json`,
  `design-tokens.json`, `utils`, `composables` and `package.json`. Update this list with added subpaths;
  exports changes require compatibility and migration review.

## 3. Tokens, themes and public contracts

- Every custom property uses `--wl-*`. Keep token direction foundation → semantic
  → component. Same-layer semantic aliases are allowed without cycles; unknown
  references and reverse dependencies are forbidden.
- Edit only `packages/ui-kit/tokens/source.json`, then run `pnpm tokens:sync`.
  Generated token CSS blocks, themes, primitives, JSON catalog and
  `tokens.generated.ts` must not be edited by hand. Run `pnpm tokens:check`.
- New token roles need a purpose, type and theme values; text/surface and focus
  pairs need contrast checks. Preserve `tests/fixtures/tokens-0.5.json`; changing
  historical values requires a migration. See `docs/reference/design-system.md`.
- Themes are token overrides in separate CSS files, selected with `data-wl-theme`
  or explicit imports. Ship Gavia (`gavia`), Gavia Dark (`gavia-dark`), Classic
  (`white`), Classic Dark (`graphite`) and Newspaper (`newspaper`). Keep `white`,
  `graphite` and CSS paths stable. Do not fork component code for a theme.
- Consumers import reset and styles explicitly; never import CSS from JS/TS.
  Preserve `wl.reset`, `wl.tokens`, `wl.components` cascade layers, stable `wl-*`
  classes, low specificity and consumer overrides. No selector chains or
  `!important` in component CSS.
- Supported axes depend on the component family. For input controls, align
  `size`, `density`, `disabled`, `invalid` and `pt` where applicable; status
  components use semantic `tone`; containers expose relevant sections through
  `pt`. Do not claim every component already supports every axis. Actual SFCs,
  native/generic contracts and manifest entries are the source of truth. Extend
  existing families through their documented compatibility migration.
- Preserve props, event payloads, slots, v-model, exposed methods, `class`,
  `style`, data attributes (`data-wl`, `data-variant`, `data-size` where relevant),
  tokens, public exports and pt sections. In 0.x, a breaking change needs a minor,
  a Breaking changes notice and migration guide; after 1.0 it needs a major.
- `WlConfig` is optional and service state is isolated per Vue application.
  `pt` stays open: `createWlPt()` defaults → `WlConfig.pt` → instance `pt`, merging
  `class` and `style`. Motion uses global `WlConfig.motion` and local `motion` and
  respects `prefers-reduced-motion`. Check entry, exit, reopening, focus and DOM
  cleanup when changing overlays.
- Every public component has a working SFC in the Playground examples directory.
  Showcase and copyable code share one source. Recipes keep requests in the app
  and demonstrate applicable states, errors, cancellation and retry.

## 4. Daily checks and recipes

Targeted checks are allowed after meaningful changes. Choose checks for the
affected behavior; do not create tests that merely repeat implementation or for
trivial documentation edits.

```sh
pnpm --filter gavia-ui exec vitest run tests/<affected>.test.ts
pnpm --filter gavia-ui typecheck
pnpm exec eslint path/to/changed-file.vue
pnpm tokens:check
pnpm icons:check
```

Use direct ESLint invocation for selected files; `pnpm lint <paths>` may still
lint `.` through its script. Apply formatting only to the intended files and keep
bulk formatting separate from behavior changes. Do not invoke a build implicitly
when a check needs a built artifact; report the dependency instead.

Heavy checks require a separate explicit user instruction: builds (including the
library), packing, full `test`, coverage, E2E, visual, Pages, package/consumer
verification and related full verification scripts. An already running check may
finish. Do not start another heavy run without authorization. Report pending checks.

### Add a component

1. Add the SFC, export and native/generic public types in `src/components/`.
2. Add the category manifest, applicable pt sections and component CSS. Use the
   component generator when provided; its output still needs this checklist.
3. Add the live example and guide; update documentation in English and Russian.
4. Cover meaningful behavior, keyboard/ARIA, empty/disabled states and unique IDs
   for repeated instances. Add compile-only fixtures for generic/public types.
   Add browser scenarios for interactions; run them only with authorization.
5. Add an Unreleased entry to the root changelog and a changeset for a user-visible
   package change. Do not independently bump versions during a feature change.

### Add a prop, slot or event

Update SFC → typed contract → applicable pt sections → manifest → live example
and EN/RU guide → meaningful test → changelog and changeset. Include a migration
for a changed public contract; preserve unrelated inference helpers such as
`CallbackInference` unless their consumer behavior has been verified.

### Tokens, icons, bugs and baselines

- Tokens: source JSON → `tokens:sync` → contrast review → `tokens:check` → inspect
  the affected theme examples. Do not edit generated output directly.
- Icons: add source SVGs in `packages/ui-kit/icons`, run `pnpm icons:sync` and
  `pnpm icons:check`; follow `docs/reference/icons.md`.
- Bugs: add a focused regression test when behavior warrants one, fix the cause,
  and run the affected tests. Keep unrelated refactors separate.
- Visual baselines: inspect expected/actual/diff before any PNG update and follow
  `docs/reference/design-system.md`. Never update snapshots automatically after a failure.
  Keep baseline review separate from running a newly authorized verification.

## 5. Definition of Done and conventions

- Public types, manifest, examples and applicable EN/RU documentation agree.
- Meaningful targeted checks pass; report any failures and pending heavy checks.
- User-visible changes have a root changelog Unreleased entry and a changeset.
  Root `LICENSE` and `CHANGELOG.md` are canonical. Package LICENSE, changelog and
  README are ignored artifacts generated by `prepack`; edit the README template
  in `scripts/templates/package/`, never the generated package copies.
- Report code readiness, automated checks, manual acceptance and publication as
  separate states. A build, push or tag does not prove publication or owner UAT.
- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`,
  `chore:`); one logical change per commit. Prepare a concrete result for review
  before requesting approval to commit. Formatting gets a separate commit when
  authorized; record its actual hash in `.git-blame-ignore-revs` afterwards.
- Public technical documentation and community templates are in English; the
  site retains full Russian documentation. Existing local language is not a
  reason for unrelated translation or mass formatting.

## 6. Release checklist — only on explicit request

```sh
pnpm build
pnpm typecheck
pnpm test
pnpm build:playground
pnpm run pack
pnpm verify:package
pnpm verify:dependencies
pnpm icons:check
pnpm tokens:check
pnpm test:e2e
pnpm test:visual
```

Also follow `docs/maintainers/quality.md`: `pnpm verify:compatibility`, `pnpm test:coverage`,
`pnpm verify:package:browser`, `pnpm test:release-tools` and
`pnpm test:quality-report`. Run configured lint and declaration/size checks as
applicable. Inspect the tar contents: Vue must not be bundled. Use `pnpm run pack`
for the library; plain root `pnpm pack` invokes pnpm's workspace-root packaging.

Verify interactions on desktop/mobile in all five themes. Primary visual
baselines are Windows/Chromium (CI: windows-2022), using real Gavia Sans for both
Gavia themes. Linux browser interaction coverage is separate. Docker/Linux visual
checks are supplemental and use separate baselines; never replace Windows PNGs
with Linux output. NVDA/VoiceOver and owner acceptance need separate evidence.

Pages is a static build of the existing Playground, with no additional framework
or library runtime dependencies. On explicit authorization for public-showcase
preflight, also run `pnpm build:pages` and `pnpm test:pages`: `/gavia-ui/`,
desktop/mobile and direct query links. The UI reads the root changelog and links
to canonical repository docs. Pages deploys from `main` only after verify,
browser and visual gates for the same commit; PRs and tags do not deploy it.
Confirm actual publication at the public URL separately from the build.

Release notes include version, publication date and required migration. Preserve
immutable compatibility fixtures; a migration note alone does not waive a gate.

## 7. Actions requiring separate authorization

- Never publish (`npm publish` / `pnpm publish`) without a separate explicit
  instruction. Pushes and external announcements also require user authorization.
- Never commit automatically. Show the result and wait for explicit commit
  approval, unless the user allowed automatic commits in this session only.
- Never rename public classes, tokens or exports without a migration note.
- Never commit `node_modules`, `dist`, `*.tgz`, `.tools/`, `.pnpm-store/` or local
  workstation settings. Preserve unrelated edits and processes.

## 8. Author style for Russian content

Apply `dima-voice` only when creating or editing Russian content for the site or
project (page copy, UI text, publications), or when the user directly requests
their author style. Do not apply it to ordinary answers, explanations, task
discussion or progress/result reports solely because they are in Russian.

Choose the appropriate chat, work or content mode. Default to lively, careful
language without profanity and preserve facts, limits and meaning. Current user
instructions and the project's specific style rules take priority. Do not
stylize source code, technical identifiers or exact quotations. Read `SKILL.md`
and only the examples for the selected mode; reuse instructions across a series
of edits while available in context. Do not load Telegram archives or analysis.
