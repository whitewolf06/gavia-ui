# Gavia UI releases

Published versions, check results and release procedure.
Changes are in the [changelog](../CHANGELOG.md); source versions are in root
package.json and `packages/ui-kit/package.json`. Repository: `whitewolf06/gavia-ui`.
Package: `gavia-ui`; registry: `https://registry.npmjs.org`.
Creator and maintainer: [Dmitry Gorbach](https://github.com/whitewolf06).
[GitHub Pages playground](https://whitewolf06.github.io/gavia-ui/) ·
[npm package](https://www.npmjs.com/package/gavia-ui). First npm release: 0.7.0.

## Release 0.12.0

[gavia-ui@0.12.0](https://www.npmjs.com/package/gavia-ui/v/0.12.0) was published
on 2026-10-09 (Moscow) from tag `v0.12.0`. The tag points to
`8b2be7996ebd0519b36c48f429daee046a28c310`.
[Release CI](https://github.com/whitewolf06/gavia-ui/actions/runs/37937733062)
passed its Node 18/24, four-browser, visual, packed-consumer and publish gates.
The unit report contains 695 passed and 0 skipped tests;
the four browser projects report 523 passed, 0 passed after retry and 3 skipped scenarios.
Desktop/mobile visual checks report 24 passed and 0 skipped scenarios across five themes.
[Pages CI smoke](https://github.com/whitewolf06/gavia-ui/actions/runs/37936117108)
reports 18 passed and 0 skipped desktop/mobile scenarios on the same source revision.

Browser skips: quality-presentation.spec.ts — quality home summary and documentation pass automated WCAG checks in five themes (mobile-chromium, firefox, webkit): Axe runs once; routing and layout use all browser projects.

CI coverage: 98.55% lines, 89.31% branches and 86.62% functions.

0.12.0 adds the optional `wlLocaleEn` preset and configurable built-in control
text. Library applications keep the Russian fallback; explicitly supplied props
still take precedence. English is now the default Playground language, with
EN/RU URL navigation, shared component/API/example sources and localized search
and changelog. Public GitHub Markdown documentation uses English.

The header keeps the links that fit and moves trailing destinations to More.
Mobile uses one compact row with equal 44 px icon controls and a language selector;
desktop Search and Theme controls share a 120 px width. Route titles,
descriptions, canonical/hreflang links and a sitemap were added. Documentation
remains a client-rendered SPA; static HTML is the English home-page fallback.
The author story now includes the personal website.
[Upgrade details](migration-0.12.0.md) describe the locale configuration and compatibility boundaries.
Public component names, classes, tokens and import paths are preserved.

The registry confirmed 0.12.0 and latest=0.12.0. The downloaded npm archive
matches the integrity checked by the publish job:

```text
sha512-pXoeICeEoWzQigeHz9N/bYkllefT6QjwpHWmlCpsJxwRP4QJ52sIp/53DKFeSKnz2Sd8z3jVAV2jryC8BKMOwg==
```

Its SHA256 is `4984326524aadc44bed493c88b6cc6514a91eb1560f4f155eb8c635b9e3400ca`.
Vue remains the only library peer; there are no runtime dependencies.

npm metadata includes a [provenance attestation](https://registry.npmjs.org/-/npm/v1/attestations/gavia-ui@0.12.0).

```bash
pnpm add gavia-ui@0.12.0 vue
# or
npm install gavia-ui@0.12.0 vue
# or
bun add gavia-ui@0.12.0 vue
```

[GitHub Release](https://github.com/whitewolf06/gavia-ui/releases/tag/v0.12.0) includes the saved Playground archive and checksum. The downloaded preview was checked for version 0.12.0, commit `8b2be7996ebd0519b36c48f429daee046a28c310` and relative asset paths. Its SHA256 is `467b0d25b5fc78f6631e0baadfbe7d167401247e02c34195cc830064da18db19`.

Installation commands and `publishedVersion` were updated after npm verification.
The release tag and published archive are preserved. Pages smoke evidence and
npm publication evidence are recorded separately.

## Release 0.11.1

[gavia-ui@0.11.1](https://www.npmjs.com/package/gavia-ui/v/0.11.1) was published
on 2026-10-09 (Moscow) through OIDC from tag `v0.11.1`. The tag points to
`314ff975d63ea61781955369ac1c853e4e6fd5cf`.
[Release CI](https://github.com/whitewolf06/gavia-ui/actions/runs/37869226103)
passed: Node 18/24, 686 unit tests, 515 browser scenarios in four projects
and 24 desktop/mobile visual scenarios across five themes. The quality-page
axe check ran in desktop Chromium and was skipped in the other three projects.
CI line coverage was 98.44%, branches 89.25%, functions 86.51%.

0.11.1 fixes breadcrumb separator spacing and WlPill alignment.
The main light Gavia accent is `#3c7490`; hover,
active and accent text shades were updated. Gavia Dark is preserved.
Playground and documentation copy was revised; saved documentation section
links scroll to the requested section immediately.
Props, events, slots, class/token names and import paths are preserved.
Upgrade details: [0.11.1 migration](migration-0.11.1.md).

The registry confirmed 0.11.1 and latest=0.11.1. npm metadata includes
a [provenance attestation](https://registry.npmjs.org/-/npm/v1/attestations/gavia-ui@0.11.1)
signed by the publish job. The downloaded npm archive integrity matches the archive
checked by that job:

```text
sha512-4jx4h3BFcn0H/LIrzGPLilG6YCl3UwLKXZOpF/605+814dNiUYtYexXMbvsjtnQ2i91P4Xbkb1WbFtqPQDa6Fg==
```

npm archive SHA256:
`7ba2cc3efc5647727b5cad4751086190a71c746e10d6da44ed9c987f20050ccc`.
The downloaded archive separately passed pnpm consumer checks with Vue 3.4.38 and TypeScript 5.8.3:
21 API fixtures, 59 SFC examples, Node import/SSR and desktop/mobile hydration
with stable IDs and working events. CI also checked npm with Vue 3.4.0 /
TypeScript 5.4.5 and Bun with Vue 3.5.40. Vue remains the only required peer;
there are no runtime dependencies.

```bash
pnpm add gavia-ui@0.11.1 vue
# or
npm install gavia-ui@0.11.1 vue
# or
bun add gavia-ui@0.11.1 vue
```

[GitHub Release](https://github.com/whitewolf06/gavia-ui/releases/tag/v0.11.1)
contains the playground archive and checksum. The downloaded archive was verified:
version 0.11.1, commit `314ff975d63ea61781955369ac1c853e4e6fd5cf` and relative
asset paths matched. Playground archive SHA256:
`098f1630c65d1e2fd03c190d5750bde3ea972dfcf2289487c5234c4a5374e5ad`.
[GitHub Pages CI](https://github.com/whitewolf06/gavia-ui/actions/runs/37869226619)
on the same commit passed 18 production-build scenarios and updated
the [public playground](https://whitewolf06.github.io/gavia-ui/).

Repository installation commands and `publishedVersion` were updated after
npm confirmation; the tag and published npm archive remain unchanged.

<a id="выпуск-0110"></a>

## Release 0.11.0

[gavia-ui@0.11.0](https://www.npmjs.com/package/gavia-ui/v/0.11.0) was published
on 2026-10-08 (Moscow) through OIDC from tag `v0.11.0`. The tag points to
`9d736240a285ec1be2f07b5b6f294af300c88cd2`.
[Release CI](https://github.com/whitewolf06/gavia-ui/actions/runs/37815367172)
passed: Node 18/24, 686 unit tests, 515 browser scenarios in four projects
and 24 desktop/mobile visual scenarios across five themes. Three axe checks
were skipped outside Chromium; there were no failures or test retries. CI line
coverage was 98.44%, branches 89.25%, functions 86.51%.

0.11.0 refines public TypeScript contracts for all 53 components:
models, options/resolvers, table columns/slots, navigation event payloads, pt,
DOM attributes, locale and exposed refs. TypeScript 5.4+ is required.
Changes requiring code updates are described in the [0.11 migration](migration-0.11.0.md).
Classes, CSS tokens, theme paths and component names are preserved.

The registry confirmed 0.11.0 and latest=0.11.0; the published package includes provenance.
The downloaded npm archive integrity matched the archive checked by the publish job:

```text
sha512-4VPUdfQevTLW/yt1CrmwWlqQBPlTfyV/TcJB8duvBpMWJ0fRbZBdZ1LrCIO/27NOa1uaYJ/1PZuq2xkpu8sLeg==
```

npm archive SHA256: `044c5690cef325241e6163dfd17848f8348ca931bb7a0e8d883fca2a0bf4b894`. Before publication, the archive passed strict
compilation of 21 API fixtures and 59 SFCs, Node import/SSR and desktop/mobile hydration.
Minimum Vue 3.4.0 / TypeScript 5.4.5 were checked through npm; Vue 3.5.40 through
Bun. pnpm was also checked locally. Vue is the only required peer;
there are no runtime dependencies or bundled Vue/PrimeVue.

```bash
pnpm add gavia-ui@0.11.0 vue
# or
npm install gavia-ui@0.11.0 vue
# or
bun add gavia-ui@0.11.0 vue
```

[GitHub Release](https://github.com/whitewolf06/gavia-ui/releases/tag/v0.11.0)
contains the playground archive and checksum. Playground archive SHA256:
`5c5c1e095b0761a2bb81348d9e744f2112433bd320e1e71dcc74845e4b877d69`. Public status and installation commands were updated after
npm confirmation; the tag and published package remain unchanged.

## Release 0.10.0

[gavia-ui@0.10.0](https://www.npmjs.com/package/gavia-ui/v/0.10.0) was published
on 2026-10-08 (Moscow) through OIDC from the new annotated tag `v0.10.0`.
The tag points to `0a51fdd6c6c061c4c4184355f2f71d0cb2401794`;
[CI and publication](https://github.com/whitewolf06/gavia-ui/actions/runs/37760199005)
completed successfully: Node 18/24, 617 unit tests, 515 browser scenarios
and 24 desktop/mobile visual scenarios across five themes. Three browser
axe checks were intentionally skipped outside Chromium; there were no repeated failures.
CI line coverage was 98.28%; this is a unit measurement, separate from browser/visual checks.

Primary themes are Gavia and new Gavia Dark with Gavia Sans. Additional themes are
Classic, Classic Dark and Newspaper; previous `white` / `graphite` identifiers
and CSS paths are preserved. Public theme catalog changes and setup are described
in the [0.10 migration](migration-0.10.0.md).

The registry confirmed exact version 0.10.0 and latest=0.10.0. The downloaded
npm archive integrity matches the archive checked by the publish job:

```text
sha512-pUIS8m9NyksMtVfwT+1R1a4n4aMMQ+S4s/EgCXhsIWS34r3xgJiT7HsT/HhlSPase81eGq9zm+93lXGCizhO4w==
```

npm archive SHA256: `11e0c7fbe80ba84526590a81f9dfee5e45b6ddaec34f8813da3fcbc326cc05cf`.
The published archive separately passed typecheck and build in a clean Vue consumer,
including 59 SFC examples, Node import, SSR/hydration and Chromium desktop/mobile.
All 24 Gavia Sans 0.6 files and MIT / SIL OFL 1.1 licenses were checked.
Vue remains the only required peer; there are no runtime dependencies or bundled
Vue/PrimeVue. The WlButton scenario was 24,685 gzip bytes with Vue, within budget.

```bash
pnpm add gavia-ui@0.10.0 vue
# or
npm install gavia-ui@0.10.0 vue
# or
bun add gavia-ui@0.10.0 vue
```

[GitHub Release](https://github.com/whitewolf06/gavia-ui/releases/tag/v0.10.0)
contains `gavia-ui-playground-0.10.0.tgz` and its checksum.
Playground archive SHA256: `61465f239e809d31c47c9e736aadfd6756e96585d3ccc3e78375edfa380e1500`.
The tag and published package remain unchanged. Playground npm status and installation
commands were updated in a separate commit after public registry confirmation
and downloaded archive checks. The public playground was reviewed across five themes at
1280 and 390 px: fonts, backgrounds, toggle, overflow and
browser errors. Subsequent updates run through a separate Pages job.

## Release 0.9.1

[gavia-ui@0.9.1](https://www.npmjs.com/package/gavia-ui/v/0.9.1) was published
on 2026-10-07 (Moscow) through OIDC from the new annotated tag `v0.9.1`.
The tag points to `ccb4634b3b74995e4e0a2776ab81dbc4bf874064`;
[CI and publication](https://github.com/whitewolf06/gavia-ui/actions/runs/37666981278)
completed successfully: Node 18/24, 591 unit tests, 416 browser scenarios
and 12 desktop/mobile visual scenarios for White, Graphite and Newspaper.

The registry confirmed exact version 0.9.1 and latest=0.9.1. The downloaded
npm archive integrity matches the archive checked by the publish job:

```text
sha512-2EjRy64x9eKcxXJPupR3TKFDxQ/9NmNNz/HaPNIFaFThJzRdpTZ50fvplC//D8/f7QIY3ERWFuI/MPoK+GnvrQ==
```

npm archive SHA256: `9aa5f3ace3b4bb893a85660c007cb136bfb9a4b74508d20f05c18f25d654733e`.
The published archive separately passed typecheck and build in a clean Vue consumer,
including 59 SFC examples and 24 accepted Gavia Sans 0.6 files. Vue remains
the only required peer; there are no runtime dependencies or bundled Vue/PrimeVue.
The archive retains MIT for the UI kit and SIL OFL 1.1 with font copyright notices.

```bash
pnpm add gavia-ui@0.9.1 vue
```

[0.9 migration](migration-0.9.md) · [Font](font-gavia.md) ·
[Changelog](../CHANGELOG.md).
Playground npm status and installation commands were updated only after registry
and consumer smoke checks; published archive documents remain unchanged.
Successful npm publication does not replace a separate GitHub Pages check.
Documentation and images were reviewed before release: no clearly obsolete
unowned artifacts were found; brand sources, licenses and history are preserved.

<a id="выпуск-081"></a>

## Release 0.8.1

[gavia-ui@0.8.1](https://www.npmjs.com/package/gavia-ui) was published on 2026-10-06
(Moscow) through OIDC from new tag `v0.8.1`. The tag points to release commit
`b9bb7c0b9ad5fb17969380dbeb2c912ded1e131e`;
[CI and publish job](https://github.com/whitewolf06/gavia-ui/actions/runs/37393295542)
completed successfully: Node 18/24, 426 unit tests, 236 browser scenarios
and 12 desktop/mobile visual scenarios across three themes.

The public registry confirmed exact version `0.8.1` and `latest=0.8.1`.
The downloaded npm archive integrity matches the archive checked by the publish job:

```text
sha512-Z06BySdUXD9H57QW9txzwybIsDhqz5sZT9sj++XZm9yTZlB94UzNz28j1kn15rGAFrZVv2hui4r8m5ydnpMj1w==
```

npm archive SHA256: `737b03a12c2a64af8f2b0d348536c78f8899bcbfde1d2086e7c389a0fb157f24`.
The published archive separately passed typecheck and build in a clean Vue consumer,
including all 59 example sources. Vue remains the only required peer;
there are no runtime dependencies or PrimeVue/PrimeIcons. npm provides a provenance
attestation; this record does not claim cryptographic verification of it.

```bash
pnpm add gavia-ui@0.8.1 vue
```

Version 0.8.0 was not published to npm; its previous tag remains unchanged.
There is no republication of 0.8.1 or tag movement. Current status
in the canonical README and playground is updated in a separate commit after npm checks;
documents inside the published archive remain unchanged.
Successful npm publication does not replace a separate GitHub Pages check.

## Release 0.7.1

[gavia-ui@0.7.1](https://www.npmjs.com/package/gavia-ui) was published on 2026-10-05
(Moscow) from tag `v0.7.1`. This is the first confirmed OIDC release:
[CI and publish job](https://github.com/whitewolf06/gavia-ui/actions/runs/37240730020) completed successfully.

An anonymous public registry check confirmed exact version 0.7.1 and
`latest=0.7.1`. The downloaded npm archive integrity matches the checked
CI archive; a clean Vue consumer without npm tokens passed typecheck and build.

Cross-platform checks compare the full LICENSE text strictly after
normalizing CRLF → LF; every other character is preserved.

Full SRI of the checked CI archive and published package:

```text
sha512-NhO0dWe0EBPLm1vxlfX81DID75FEC27xJvmDzNPeCDiDr11zUtlHBKPx+ry8iDaHs/QkBFlm4H0xykb+JmeH/Q==
```

```bash
pnpm add gavia-ui@0.7.1 vue
```

0.7.1 is not republished. The manual 0.7.0 release history
is preserved. Successful npm publication does not replace a separate GitHub Pages check.

## First release 0.7.0

The first public npm release, **gavia-ui@0.7.0**, was published manually
on 2026-10-05 (Moscow). The registry confirmed the exact version and checked archive integrity,
MIT, author and Vue as the only required peer. Installation in a Vue app:

```bash
pnpm add gavia-ui@0.7.0
```

The 0.7.0 entry dated 2026-10-05 describes the agreed changes.
The historical 0.6.0 entry dated 2026-10-01 and previous `v0.6.0` tag are preserved.

## Checks before the first release

These checks were performed before the first publication:

1. Root/library versions matched `0.7.0`; the commit was pushed
   to the canonical public repository. Local builds, typecheck,
   310 unit tests, archive/icon/token checks passed. CI for release commit
   `0b7d4cc` passed Node 18/24, 176 browser scenarios,
   78 screenshot comparisons and production Pages build checks.
2. `packages/ui-kit/gavia-ui-0.7.0.tgz` was checked:
   MIT and changelog included, no bundled Vue or runtime dependencies,
   isolated consumer with one Vue passed typecheck and build.
3. Immediately before publishing, check the npm name and version.
   If `gavia-ui@0.7.0` already exists, do not republish:
   first establish its owner and the published archive’s origin.
4. The first package is published from the maintainer’s npm account: use
   `npm login --registry=https://registry.npmjs.org` with 2FA enabled.
   A GitHub account does not replace an npm account.
5. Publish the exact checked archive with `--access public`.
   Do not add `--provenance` to a local publication: it needs a cloud runner.

Dependencies and builds use pnpm. npm CLI is used only
for authentication and publishing the checked archive:

```bash
# The first manual release command, already completed:
npm publish ./gavia-ui-0.7.0.tgz --registry=https://registry.npmjs.org --access public
```

Published 0.7.0 integrity matches the checked archive:

```
sha512-a2ZP8NFBJ+gAZ17MNNJ0yrhmYyO1lK7Q0FJBs7ST0+oUYSCF4KpCsDPi1TneljKCb4kl5evngr/GpXfzI9FmrQ==
```

0.7.0 is not republished. Published archive README and changelog
remain unchanged; current status lives in the repository’s canonical README
and these documents. Installation in a clean consumer is checked separately
from successful publish execution.

## First release and tags

Checked `gavia-ui@0.7.0` has already been published manually. Subsequent releases
use Trusted Publisher through OIDC. The first release has a separate
agreed exception: the publish job
skips tag **`v0.7.0`**, because that version is released manually.
After npm confirmation, the tag can be pushed for history:

```bash
git tag -a v0.7.0 -m "Gavia UI 0.7.0"
git push origin v0.7.0
```

Before pushing, confirm that the first-tag exception exists in the tagged commit’s
workflow. Tag checks still run, but `npm publish`
does not repeat 0.7.0. One version in one registry is published once.
Do not move or delete previous `v0.6.0`.

The next release receives a new tag and is published through CI.
GitHub Pages site publication and npm package publication are separate operations;
success in one does not confirm the other. Site details: [hosting.md](hosting.md).

## Trusted publisher for subsequent releases

Trusted Publisher is configured for the canonical repository and workflow:

- GitHub owner: `whitewolf06`.
- Repository: `gavia-ui`.
- Workflow: `publish.yml`.
- Permission: direct `npm publish`.

Configuration was confirmed by successfully creating the npm-side link.
Trusted publishing requires npm CLI >=11.5.1 and Node >=22.14.0.
The publish job uses Node 24 and OIDC without a persistent npm token.
The first OIDC release, 0.7.1, was confirmed by a successful
[publish job](https://github.com/whitewolf06/gavia-ui/actions/runs/37240730020) and matching public npm integrity.
Subsequent releases follow the same checks; 0.7.1 success does not establish
future publication success in advance.

## Playground version

Source version in the header and project card is read automatically from
the library manifest. `publishedVersion` in `project-info.ts` separately stores
the last confirmed npm version: currently `0.12.0`. npm links and installation
commands use that version.

Update `publishedVersion` only after checking the new exact version
and archive integrity in npm. Preparing the next package.json version
does not change the confirmed installation version.

## Subsequent releases

1. Update version, changelog and migration; run checks.
2. After commit approval, push main.
3. After explicit publication authorization, create a new annotated tag
   for the next version, for example:

```bash
git tag -a v0.12.1 -m "Gavia UI 0.12.1"
git push origin v0.12.1
```

This is an example for the next patch release. Use it after agreeing
on 0.12.1 and updating package.json.
The workflow repeats Node 18/24, browser and visual baseline checks.
Publication is allowed only from `whitewolf06/gavia-ui`, only for a tag
matching the package version, and after all checks. Regular pushes and PRs
run checks without publishing the package.

A CI release requires a successful publish job in addition to an available exact
version, archive and consumer installation. Pushing a tag
alone does not confirm publication.

## Compatibility and license

The first public-name upgrade is described in the [0.7 migration](migration-0.7.md).
Public `Wl*` names, classes and tokens are preserved. Rebrand details:
[Gavia UI migration](migration-gavia.md).
Both LICENSE files must match; the package changelog differs only in absolute
documentation links.

The previous package remains a separate GitHub Packages package.
GitHub repository transfers preserve old npm scopes and may break repository links
and inherited permissions. Check existing consumer access;
do not delete earlier versions or revoke their tokens.

Sources:
[MIT](https://opensource.org/license/mit),
[GitHub repository transfer](https://docs.github.com/en/repositories/creating-and-managing-repositories/transferring-a-repository),
[GitHub Packages permissions](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages),
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

## API 0.11 contracts

0.11.0 is published. Agreed type changes are checked through a separate
migration contract: baseline 0.9.1 is preserved, and additional API losses
block the gate. The contract is scoped to 0.11.x and does not automatically
apply to later minors. Results: [quality.md](quality.md).

## Preparation with Changesets

1. `pnpm changeset`: select gavia-ui, patch/minor and describe the change.
2. `pnpm changeset:status`: inspect the plan without changing versions.
3. `pnpm release:version`: apply the plan and synchronize root/package versions and
   both changelogs. Complete the generated migration-VERSION.md; remove TODO,
   describe required steps and mark Breaking changes if present. Nothing is published.
4. Run checks, review the diff and agree on the specific release. New tag
   `vVERSION` starts the existing OIDC workflow for the exact checked archive.

Prepare prereleases on a separate branch: `pnpm changeset pre enter beta`,
then `pnpm release:version`. The workflow publishes alpha/beta/rc.N only under npm
`next`; stable versions use `latest`. Exit with
`pnpm changeset pre exit`, then prepare the stable version and run full checks.
Do not run `changeset publish`: publication stays in the archive-checking OIDC job.
Source preparation does not update publishedVersion automatically.

Changeset `#` and `##` headings automatically shift below the release heading;
nesting is preserved, and fenced code is unchanged. Setext headings
(`===` / `---` underlines), unclosed fences and nesting exceeding six
Markdown levels are rejected before version changes.
Use ATX `#` headings and close fences before preparing a version.

## Release previews

After a successful npm job, tag CI builds the playground with a relative base,
creates gavia-ui-playground-VERSION.tgz and SHA256, saves an artifact and attaches
the archive to GitHub Release; prereleases are marked accordingly. The archive allows
comparison of different releases. Pages is not updated by this step.
Extract the archive, start a local HTTP server and open the preview:
query navigation and theme selection work.
Locally: `pnpm --filter gavia-ui-playground build --base=./`,
`pnpm release:preview`. CI still checks contract compatibility.

GitHub Release documentation links point to `vVERSION`, including
prereleases from separate branches. The npm package changelog links
to current `main` documentation. Archive metadata contains commit and
`dirty`: this flag marks uncommitted tracked / nonignored untracked files;
ignored build results do not affect it.
