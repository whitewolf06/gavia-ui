# Gavia UI public documentation

## Published content

GitHub Pages hosts the playground: home, Docs with guides for 53 components,
113 SVG icons, five themes, the design system, working examples with code
and six interface flows. The home page names the author, MIT license and
contributor links. Changelog reads history from the root CHANGELOG.md.
There is no separate documentation generator, router or new runtime dependency.

The showcase is published on GitHub Pages:
[Gavia UI](https://whitewolf06.github.io/gavia-ui/).
The canonical repository uses **Source: GitHub Actions**; the public URL and
production assets were checked after deployment on desktop and mobile.
The library is available on [public npm](https://www.npmjs.com/package/gavia-ui).
The first release, 0.7.0, was published on 2026-10-05 (Moscow);
the current confirmed release is 0.11.1. Install with `pnpm add gavia-ui@0.11.1`.
[Publication and validation history](releases.md).

## Publication setup

In `whitewolf06/gavia-ui`, open **Settings → Pages → Build and deployment**
and select **Source: GitHub Actions**. This is already configured in the
canonical repository. The repository owner or an agent authorized to publish
the site performs this action. No domain or DNS configuration is required.

The `pages` job in `.github/workflows/publish.yml` runs only on main pushes
in the canonical repository. It depends on `verify`, `browser` and `visual`:
checks must pass on the same commit. It then builds the library and playground
with `base=/gavia-ui/`, checks the production site in desktop/mobile Chromium
and uploads only `apps/playground/dist` through official Pages actions.

Before deployment, the SHA is checked against current main; rerunning an old
build must not replace newer documentation. Concurrency applies only to Pages.
PRs, forks and release tags do not publish the site. npm setup and publication
remain a separate process described in [releases.md](releases.md).

## Local production checks

```sh
pnpm build
pnpm build:pages
pnpm test:pages
```

The test starts its own Vite preview on port 4175. For manual inspection:

```sh
pnpm --filter gavia-ui-playground exec vite preview --base=/gavia-ui/ --host 127.0.0.1 --port 4175 --strictPort
```

Open `http://127.0.0.1:4175/gavia-ui/`. An existing preview can be supplied through
`GAVIA_PAGES_BASE_URL`. If Windows cannot run Playwright headless shell,
`GAVIA_E2E_CHROMIUM_CHANNEL=chromium` selects full pinned Chromium.
Ordinary `pnpm dev` keeps the root URL and requires no subpath.

## Navigation and history

- Home: `/gavia-ui/`.
- Docs: `/gavia-ui/?view=docs`.
- Foundations: `/gavia-ui/?view=docs&section=typography`, `section=layout`, `section=content`.
- First complete component page: `/gavia-ui/?view=docs&component=WlButton`.
- Component catalog: `/gavia-ui/?view=docs`; legacy `?view=components` opens Docs.
- Design system: `/gavia-ui/?view=system`.
- Changelog: `/gavia-ui/?view=changelog`.
- Direct history: `/gavia-ui/?view=changelog#project-changelog`.
- Legacy `/gavia-ui/?view=project` remains a compatible history URL.

Query navigation preserves the subpath. Refresh and Back/Forward work with one
index.html; no server fallback is required. Docs subsections link to their h2
anchors and preserve the query route. Vite handles the logo, CSS and lazy
examples without absolute filesystem paths. Changelog links to Markdown
documentation are converted to absolute GitHub URLs.

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
