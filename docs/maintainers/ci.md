# CI, Pages and release workflows

`ci.yml` verifies PRs and main pushes and is reused by `publish.yml` for version
tags. It retains the Node 22.13/24 checks, four browser projects, canonical
Windows visuals and installed-package consumers (npm + Vue 3.4.0/TypeScript
5.4.5, Bun + Vue 3.5). Playground tests have their own Vitest project. The exact
packed archive is checked with publint and attw's `esm-only` profile; declaration
resolution failures are not suppressed.

`pnpm verify:types <exact-archive.tgz>` discovers every JS, declaration and JSON
entry point from that archive and runs attw without ignored error rules. CSS and
font exports are assets, inspected by the archive/consumer checks rather than
treated as executable TypeScript modules. Newly added JS entries are discovered
automatically.

Shared workspace setup lives in `.github/actions/setup`; browser setup caches
Playwright binaries by OS, engine and lockfile while still installing Linux
system dependencies. CI builds the Playground with `GAVIA_E2E_BUILD=1` so it can
exercise both the public app and `e2e.html` through Vite preview. Public Pages
builds omit the synthetic fixture. Local development may still use `pnpm dev`.

## Pages provenance

`pages.yml` listens for completed **CI** runs. Only a successful canonical main
push is eligible. It checks out the triggering `head_sha`, downloads quality data
from that exact `run_id`, validates the report against that revision, builds and
tests `/gavia-ui/`, and checks current main again immediately before deployment.
PRs, forks, tags, failed runs and stale revisions cannot deploy.

The Pages deployment job needs `pages: write` and `id-token: write`; the npm
publication job has a separate scoped OIDC grant. Checks use read permissions.
Do not replace the exact source-run artifact download with a latest-artifact
lookup. Provenance policy regression tests cover wrong repositories, PR success,
failed runs, stale main, mismatched checkout and invalid run identity.

## Release setup and owner checks

`publish.yml` runs the reusable checks on a version tag, verifies the exact
publication archive in a browser consumer, records its integrity, publishes that
archive and prepares versioned Playground and verified TTF font attachments.
Prereleases keep the `next` channel. The historical `v0.7.0` tag remains excluded.
Creating a tag, publishing or attaching assets requires separate authorization.

The release workflow keeps the existing **`publish.yml`** filename so the npm
trusted-publisher workflow contract is preserved. Review required status-check
names after the CI split. These external settings have not been changed by
repository edits. Publication still needs a registry read-back; Pages needs a
public URL check. A local build or workflow definition is not evidence of either.

Official action refs were resolved read-only on 2026-10-17 and are recorded in
`.github/action-pins.json`. Annotated tags are peeled to commits. Renovate can
propose reviewed digest updates; its app/dashboard/settings are separate owner
setup and have not been enabled by adding `renovate.json`.

## Supplemental Linux visual checks

Windows/Chromium PNGs in `visual-baselines/` remain canonical. The official
Playwright Noble image uses the exact pinned `@playwright/test` version and
separate `visual-baselines-linux/` PNGs. Docker builds its own dependencies and
production app; host `node_modules`, sources and Windows baselines are not mounted
writable. Only Linux snapshots and `.tmp/visual-linux/` results are bind-mounted.

After explicit authorization for heavy checks, run:

```sh
pnpm test:visual:docker
pnpm test:visual:docker --project mobile
```

The comparison mount is read-only and uses `--update-snapshots=none`. Each crop
also saves an unaccepted `review-*.png` under `.tmp/visual-linux/`, including when
its expected baseline is missing. Archive that directory before another run:
Playwright clears the result directory when it starts.

Inspect every changed image in all themes and viewports before adopting it under
`visual-baselines-linux/`, then rerun the comparison. Record the reviewed path,
dimensions, hash and reason for each new reference. The explicit
`--update-snapshots` flag makes only the Linux baseline mount writable; inspect
those candidates before retaining them. Windows PNGs remain separate. The manual
**Supplemental Linux visuals** workflow offers the same explicit flag and
uploads candidate PNGs/diffs for review; it does not commit them or replace the
primary visual gate.

Docker builds, container runs, full test suites, package lint against a real
archive and GitHub workflow execution remain separate verification steps. The
configuration and pure argument/provenance tests alone do not prove runtime CI.
