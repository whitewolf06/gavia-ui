# Legato UI public documentation

## Published content

The documentation build contains home, Docs with guides for every public component,
113 SVG icons, seven themes, the design system, working examples with code
and six interface flows. The home page names the author, MIT license and
contributor links. Changelog reads history from the root CHANGELOG.md.
Vue Router belongs to the Playground; the library keeps Vue as its only required peer.
Hosted documentation has canonical English/Russian paths and a separate prerender step.

The [Legato UI Playground](https://whitewolf06.github.io/legato-ui/) is live.
Existing [Gavia UI links](https://whitewolf06.github.io/gavia-ui/) redirect to the corresponding Legato pages.
The canonical repository uses **Source: GitHub Actions**. Confirm the public URL
and production assets on desktop and mobile after each deployment; local builds
and browser results do not establish publication.
The last Gavia release is [gavia-ui@1.1.0](https://www.npmjs.com/package/gavia-ui/v/1.1.0).
Legato releases start at 1.2.0 under the npm name `legato-ui`.
The first release, 0.7.0, was published on 2026-10-05 (Moscow).
The home page uses `pnpm add legato-ui` for installation. The package name and version
come from the [published package record](../../apps/playground/src/project/published-package.json).
[Publication and validation history](releases.md).

## Publication setup

In `whitewolf06/legato-ui`, open **Settings → Pages → Build and deployment**
and select **Source: GitHub Actions**. This is already configured in the
canonical repository. The repository owner or an agent authorized to publish
the site performs this action. No domain or DNS configuration is required.

The `pages` job in `.github/workflows/pages.yml` follows a successful `CI` run
from a main push in the canonical repository. Verify, browser, Windows visual and
installed-consumer checks must pass on that same commit. It checks out the
triggering SHA and downloads quality data from that exact run, then builds the library and playground
with `base=/legato-ui/`, checks the production site in desktop/mobile Chromium
and uploads only `apps/playground/dist` through official Pages actions.

Before deployment, the SHA is checked against current main; rerunning an old
build must not replace newer documentation. Pages has its own concurrency group;
CI checks and releases use separate groups.
PRs, forks and release tags do not publish the site. npm setup and publication
remain a separate process described in [releases.md](releases.md).

## GitHub rename and the old Playground address

Before tagging 1.2.0, build and check Pages under `/legato-ui/`. Run
`node scripts/legacy-pages.mjs` after `pnpm build:pages`. It prepares
`.tmp/legacy-pages/gavia-ui/` with redirects for the English and Russian paths
in the build manifest and copies the font ZIPs for direct downloads.

Stage that directory under `gavia-ui/` in the publication source of the
owner site `whitewolf06/whitewolf06.github.io`. Coordinate its deployment with the
rename and the first successful Pages deployment on the renamed repository.
GitHub redirects repository, issue and pull request links automatically. Project
Pages needs the old path to be served separately. Creating a new repository
under the old name would also take over GitHub's repository redirects.
[GitHub repository rename behavior](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository).

Verify both public addresses, a Russian component link with its anchor, a legacy
query link and a font download. Then tag the reviewed commit for the release.

## Local production checks

```sh
pnpm build
pnpm build:pages
pnpm pages:prerender
pnpm test:pages
```

The test starts its own Vite preview on port 4175. For manual inspection:

```sh
pnpm --filter legato-ui-playground exec vite preview --base=/legato-ui/ --host 127.0.0.1 --port 4175 --strictPort
```

Open `http://127.0.0.1:4175/legato-ui/`. An existing preview can be supplied through
`GAVIA_PAGES_BASE_URL`. If Windows cannot run Playwright headless shell,
`GAVIA_E2E_CHROMIUM_CHANNEL=chromium` selects full pinned Chromium.
Ordinary `pnpm dev` keeps the root URL and requires no subpath.

## Navigation and history

- Home: `/legato-ui/`.
- Docs: `/legato-ui/docs/`.
- Foundations: `/legato-ui/docs/typography/`, `/legato-ui/docs/layout/`, `/legato-ui/docs/content/`.
- Components: `/legato-ui/docs/components/WlButton/`.
- Component catalog: `/legato-ui/docs/`; legacy `?view=components` opens Docs.
- Design system: `/legato-ui/system/`.
- Changelog: `/legato-ui/changelog/`.
- Direct history: `/legato-ui/changelog/#project-changelog`.
- Legacy `/legato-ui/?view=project` remains a compatible history URL.

Russian paths add `/ru/` after the deployment prefix, for example
`/legato-ui/ru/docs/theming/`. Legacy query links still resolve to the corresponding
hosted path while preserving theme, extra parameters and real heading anchors.
Prerendering writes known English/Russian routes into standalone HTML; a host
serving only the SPA build must provide its own fallback for direct deep links.
Relative-base portable builds keep query navigation and do not require a history fallback.
See [Playground development](playground.md) for build modes and prerender checks.
Vite handles assets without absolute filesystem paths. Changelog Markdown links
resolve to the canonical GitHub documentation.

After deployment, open the public URL and check assets, navigation and an example.
A successful build alone does not confirm that the site is accessible.

## Updates

First record user-visible changes under “Unreleased” in the root changelog
and synchronize the package copy with absolute links. Page versions come from
package metadata; do not infer the release date from the build date.
After an approved commit/push to main, the site updates only if CI succeeds.

## Other hosting if needed

The same static build works on Cloudflare Pages or Netlify. For a domain root,
run `pnpm build:playground` and publish `apps/playground/dist`.
Changing hosting does not require component changes.
The current showcase uses GitHub Pages.

Official instructions:
[Vite / GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages),
[GitHub / custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
