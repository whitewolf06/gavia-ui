# Contributing to Gavia UI

Start with the [repository contract](AGENTS.md), [architecture](docs/maintainers/architecture.md)
and [design system](docs/reference/design-system.md). Gavia UI uses Vue 3, strict TypeScript,
plain CSS and pnpm. Read the [Code of Conduct](CODE_OF_CONDUCT.md); report
vulnerabilities through [the security policy](SECURITY.md).

## Set up a checkout

Use Node 22.13+ in the Node 22 line or Node 24 and the pnpm version pinned in
`package.json`. Development is pnpm-only; npm and Bun commands in consumer
documentation are for applications installing the published package.

```sh
corepack enable
pnpm install --frozen-lockfile
```

Corepack is optional if the pinned pnpm is already available. A portable pnpm
installation also works. Local store or workstation settings belong in ignored
`AGENTS.local.md` / `.npmrc.local`, not shared configuration. pnpm does not load
`.npmrc.local` automatically: pass `--store-dir=<local-path>` or explicitly
select it as the user config for the current shell session. Do not change a
contributor's global npm configuration as part of setup.

Create a branch from current `main` (`codex/` is the default prefix for agents).
Preserve unrelated edits. The Playground resolves public `gavia-ui` imports to
library source for HMR and typechecking, so it can start without a library build:

```sh
pnpm dev
```

Installed-archive checks separately validate built declarations and published
subpaths. Builds require the user's separate explicit instruction when an agent
performs them.

## Architecture in five minutes

The [repository map](AGENTS.md#1-project-and-repository-map) lists the main paths.
Tokens flow from foundation to semantic to component roles. The generator writes
CSS, JSON and TypeScript from `packages/ui-kit/tokens/source.json`. Reset, tokens
and components use explicit CSS layers; themes override token values.

Components own markup and their public Vue contract. Composables share selection,
focus and positioning; services keep state within one Vue application. `pt`
combines defaults, application configuration and instance sections without
copying components. The manifest documents that public API, and the Playground
renders working SFC examples from the same source users copy. The library keeps
Vue external and does not depend on an application's router, store or requests.

## Change a component

Use the [component recipe](AGENTS.md#add-a-component). The component generator,
when available, creates a starting point rather than a finished implementation.
For a new component or public option, keep these parts aligned:

1. SFC, exports, native/generic types and appropriate reusable behavior.
2. Category manifest, applicable pt sections and CSS using existing tokens.
3. Working SFC example and English/Russian guide. Demonstrate applicable loading,
   empty, invalid and disabled states; recipes show error, cancellation and retry.
4. Meaningful behavior, keyboard/ARIA and compile-only inference checks. Consider
   repeated instances, SSR/hydration, focus and cleanup for IDs or overlays.
5. An Unreleased entry in the root changelog and a changeset for a
   user-visible package change. Public incompatibilities need a migration guide.

Component families expose relevant axes; do not assume every component accepts
every `size`, `density`, `variant`, `tone` or `pt` option. Read its SFC, public
types and manifest first. Preserve `Wl*`, `wl-*`, `--wl-*` and public subpaths.

Edit tokens only in their source, then run `pnpm tokens:sync` and
`pnpm tokens:check`. Add source SVGs before `pnpm icons:sync` /
`pnpm icons:check`; see [icon contribution rules](docs/reference/icons.md). Never patch
generated CSS, token catalogs or icon maps by hand.

## Verify the affected behavior

Use focused checks while iterating:

```sh
pnpm --filter gavia-ui exec vitest run tests/<affected>.test.ts
pnpm --filter gavia-ui typecheck
pnpm exec eslint path/to/changed-file.vue
```

Run token/icon checks when their inputs change. Direct ESLint paths keep the
check scoped; passing paths to a script containing `eslint .` can still lint the
whole repository. Keep formatter changes separate from behavior changes.

The lint policy keeps both 140-column length rules as warnings and enforces the
other active rules as errors. Long literal payloads, URLs and generated fixtures
retain their bytes; both length rules exempt strings/template literals. Local
render-function test fixtures may define multiple components in one file.
Optional SFC props intentionally retain undefined defaults. Document native or
delegated keyboard handling beside a node-specific accessibility exception;
do not add artificial handlers or disable a rule for an entire component.
Intentional browser-capability skips also need a local explanation.

Do not run an unrestricted autofix over template Teleport/Transition adapters
or inference helpers. The existing safeguards for ES2020 `replaceAll`, unused
Vue built-in adapters and Playwright string-ID assertions remain in the flat
config. A user's no-runs instruction also suspends focused lint and knip; source
repairs alone do not prove a zero-error or <=50-warning result.

Builds, packing, complete unit/coverage runs, package/consumer verification,
browser/visual and Pages runs are heavy checks. Agents run them only after a
separate explicit instruction. The complete release checklist is in
[AGENTS.md](AGENTS.md#6-release-checklist--only-on-explicit-request) and
[quality.md](docs/maintainers/quality.md). Use `pnpm run pack` for the library; plain root
`pnpm pack` packages the workspace root.

Visual checks cover desktop/mobile in Gavia, Gavia Dark, Classic, Classic Dark and
Newspaper. Windows/Chromium is the primary visual baseline; both Gavia themes use
real Gavia Sans. Docker/Linux checks are supplemental and need separate baselines.
Never replace Windows PNGs with Linux screenshots. Before updating any baseline,
inspect expected/actual/diff and follow the
[design-system procedure](docs/reference/design-system.md). Record manual screen-reader and
owner acceptance separately from automated results.

The [CI and Docker guide](docs/maintainers/ci.md) describes the supplemental
`pnpm test:visual:docker` command, explicit Linux baseline generation and its
separate result paths. Docker/container runs are heavy checks too.

## Prepare a pull request

Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`),
one logical change per commit. Agents show the result before asking for explicit
commit approval unless automatic commits were authorized for this session.

For a package change, run `pnpm changeset`, select `gavia-ui`, choose patch or
minor and describe the resulting user behavior. Patch preserves the public
contract; a 0.x minor may include a documented breaking change and migration.
After 1.0, incompatibilities need a major. Do not bump versions merely to prepare
a PR. Maintainers apply approved changesets with `pnpm release:version` during
release preparation; it does not publish.

Explain the problem, resulting behavior and verification in the PR. Include
screenshots for visual changes, EN/RU documentation status, compatibility/migration
notes and pending checks. The root MIT license and changelog are canonical;
package copies and the compact README are generated by the package `prepack`
hook. Edit `scripts/templates/package/README.md.tpl` for the npm README.
Never commit `node_modules`, build output, archives or local tooling.

Bulk formatting belongs in a separate approved commit. Once its real commit hash
exists, maintainers may add it to `.git-blame-ignore-revs`; do not invent a hash.
If that file is present, opt in locally with:

```sh
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

## Community and releases

Bug reports and feature requests use the English
[issue forms](https://github.com/whitewolf06/gavia-ui/issues/new/choose). Include
a minimal reproduction and the installed Gavia UI/Vue versions. Questions and
RFCs may use [Discussions](https://github.com/whitewolf06/gavia-ui/discussions)
when enabled; the issue forms remain available otherwise. Labels and starter
issue drafts are prepared in [.github/COMMUNITY_SETUP.md](.github/COMMUNITY_SETUP.md).
Their presence does not enable repository settings or create issues.

Release, push, package publication and external announcements require separate
authorization. Pages is built from the existing Playground at `/gavia-ui/` and
deploys from `main` only after gates for the same commit. A successful local
build, push or tag is not proof of package publication, live Pages or manual UAT.
