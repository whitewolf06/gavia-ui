<!-- DRAFT from review/12-agent-rules.md. Replaces agents.md after review. -->
# AGENTS.md — Gavia UI

Rules for anyone (AI agent or human) changing this repository.
If `AGENTS.local.md` exists, read it too: it describes the local machine (not committed).

## 1. Project

Gavia UI is a Vue 3 + TypeScript component library and design system:
53 components, 113 icons, 447 design tokens, five themes, zero runtime dependencies.
`packages/ui-kit` is the published package `gavia-ui`; `apps/playground` is the documentation site and test bench.

## 2. Repository map

| Path | What |
|---|---|
| `packages/ui-kit/src/components/Wl*.vue` | components (one SFC each) |
| `packages/ui-kit/src/components/{native,generic}-contracts.ts` | public typed component contracts |
| `packages/ui-kit/src/manifest/*` | machine-readable component manifest (source for docs) |
| `packages/ui-kit/src/utils/*`, `src/composables/*`, `src/services/*` | shared behavior, public composables, app-scoped services |
| `packages/ui-kit/styles/base.css` | component CSS (`@layer wl.components`) |
| `packages/ui-kit/tokens/source.json` | design-token source → generated CSS/JSON/TS |
| `packages/ui-kit/icons/*.svg` | icon sources → `icons.generated.ts` |
| `packages/ui-kit/tests/` | unit, contract and type tests (Vitest) |
| `apps/playground/src/design-system/examples/` | one live example SFC per component (also the copyable code) |
| `apps/playground/src/documentation/` | component guides; texts in `src/i18n/messages/*.{en,ru}.json` |
| `apps/playground/e2e/` | Playwright: interaction (4 browsers), a11y (axe), visual baselines |
| `scripts/` | release, compatibility and package-verification tooling |
| `docs/` | guides (`guide/`, `reference/`) and maintainer docs (`maintainers/`) |

Files named `*.generated.*` are written by scripts. Never edit them by hand.

## 3. Hard rules

- **Stack:** Vue 3, strict TypeScript, Vite library mode, plain CSS with custom properties, pnpm. No React, Tailwind, CSS-in-JS.
- **Dependencies:** `vue` is the only peer; no runtime dependencies. Never add Pinia, Vue Router, API clients, Markdown/Mermaid or PrimeVue to the library. Every new devDependency needs a reason in the commit message.
- **Tokens:** only `--wl-*`; layers foundation → semantic → component; edit `tokens/source.json`, then `pnpm tokens:sync`.
- **CSS:** keep `@layer wl.reset, wl.tokens, wl.components`; one class per selector; no `!important`.
- **Components:** no DOM access at module import time; `pt` merges defaults → `WlConfig.pt` → local `pt`; text comes from the locale, props only override.
- **Public contract** = props, events, slots, v-model, expose, exports, `wl-*` classes, `data-wl*` attributes, tokens, pt sections. Changing it requires a migration note; breaking changes only in a minor (0.x) with a migration guide.
- **Styles are never imported from JS**: consumers import CSS explicitly.

## 4. Daily workflow

Run **fast checks** after each meaningful change (allowed and expected):

```bash
pnpm exec vitest run <affected test files>
pnpm --filter gavia-ui typecheck
pnpm lint:fix <changed files>
pnpm tokens:check      # when tokens changed
pnpm icons:check       # when icons changed
```

Run **heavy checks only when the user asks** (usually before a release):
`build:playground`, `build:pages`, `run pack`, `verify:*`, `test:e2e`, `test:visual`, `test:pages`, `test:coverage`.
List any heavy check you skipped in your report.

Note: plain `pnpm pack` at the root packs the workspace. Use `pnpm run pack`.

## 5. Recipes

### New component
Prefer `pnpm new:component <Name> --category <inputs|data|containers|navigation|feedback|composites|misc>`.
Manual checklist:
1. `src/components/Wl<Name>.vue` + export in `components/index.ts` + typed contract.
2. Manifest entry (`src/manifest/<category>.ts`), pt sections (`pt-types.ts`), CSS in `styles/base.css`.
3. Example `apps/playground/src/design-system/examples/Wl<Name>.vue` (states: default, disabled, invalid, loading/empty where applicable).
4. Guide page + texts in **both** `documentation.en.json` and `documentation.ru.json`.
5. Unit test `tests/components/Wl<Name>.test.ts` (behavior, keyboard, ARIA, unique IDs when mounted twice).
6. E2E for interaction if it has keyboard/overlay behavior.
7. "Unreleased" entry in `CHANGELOG.md` + `pnpm changeset`.

### New prop / slot / event
SFC → typed contract → pt section (if new DOM) → manifest → example and docs (en/ru) → unit test → changelog + changeset.

### Token change
`tokens/source.json` → `pnpm tokens:sync` → contrast check passes → `pnpm tokens:check` → review colors page.

### Bug fix
Write the failing test first, then fix.

### Visual baselines
Never update PNGs automatically after a failure. Inspect expected/actual/diff, confirm the change is intended, then update (see `docs/maintainers/visual-baselines.md`).

## 6. Definition of Done

- Changed behavior is covered by a test; fast checks pass.
- Example and docs updated in English and Russian.
- Changelog "Unreleased" entry and changeset added for user-visible changes.
- Report lists what changed, what was verified, and which heavy checks are pending.

## 7. Never

- Publish (`npm publish` / `pnpm publish`) without an explicit user instruction.
- Commit without the user's approval of the result (unless the user allowed auto-commits for this session).
- Edit generated files, historical compatibility fixtures, or visual baselines without review.
- Rename public classes, tokens or exports without a migration note.
- Commit `node_modules`, `dist`, `*.tgz`, `.tools/`, `.pnpm-store/`.

## 8. Release checklist (on explicit request)

```bash
pnpm lint && pnpm build && pnpm typecheck && pnpm test
pnpm verify:compatibility && pnpm test:release-tools && pnpm test:quality-report
pnpm verify:dependencies && pnpm icons:check && pnpm tokens:check
pnpm build:playground && pnpm run pack && pnpm verify:package
pnpm test:e2e && pnpm test:visual
pnpm build:pages && pnpm test:pages
```

The packed archive must not contain Vue. Pages deploy from `main` only after all CI gates pass; confirm publication by the public URL.

## 9. Conventions

- Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore(release):`); one logical change per commit.
- Code style is enforced by ESLint (`pnpm lint:fix`); do not format by hand.
- Public English everywhere (code, docs, tests, issues). Russian lives in `*.ru.json` and the Russian site.
