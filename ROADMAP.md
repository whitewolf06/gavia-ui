# Gavia UI roadmap

The review programme is in progress. All recommendations, including the
post-1.0 list, are accepted into [the implementation backlog](review/PLAN.md).
The backlog records task status; this roadmap describes direction and does not
claim that pending code, checks, releases or owner acceptance are complete.

## Now

- Resolve accessibility, list selection, unique IDs, overlay focus and service
  lifecycle defects while retaining Vue 3.4/3.5 compatibility.
- Establish maintainable tooling, component scaffolding, public Playground
  imports, separate test projects and canonical package documentation.
- Improve component depth, shared utilities and public contracts with focused
  checks. Preserve unrelated changes and historical compatibility fixtures.
- Prepare CI, package and deployment changes for review. Full builds, archives,
  browser/visual suites and actual workflow runs remain separately authorized
  validation, not an automatic result of editing configuration.

## Next

- Complete remaining family contracts, typed slots, table behavior, navigation
  adaptation, accessible names and examples documented in the review backlog.
- Finish documentation routes, real API metadata, search, recipes and starter
  applications, preserving existing query links and explicit CSS imports.
- Agree on and document 1.0 API migrations: semantic tones, normalized pt names,
  `dismissible` and an English fallback. Introduce compatibility aliases and
  development warnings in 0.x before removing them in 1.0.
- Add the planned control groups, Tooltip component, menu nesting/ContextMenu,
  Toolbar and TagsInput, then prepare an RC with manual accessibility and owner
  acceptance evidence. Release versions and publication dates require agreement.

## Later

- Implement the complete accepted post-1.0 component backlog, including DataTable,
  VirtualList, Tree, Descriptions, List and the remaining NEW-12…24 items.
- Add selective icon/component CSS imports, Stylelint, browser-mode and mutation
  testing, role-based test improvements and a reusable ESLint configuration.
- Review Linux visual baseline candidates separately. Windows/Chromium remains
  the primary screenshot environment; Docker does not replace those PNGs.

## Non-goals

- Application business logic, requests, router/store ownership or API clients in
  library runtime dependencies. Vue stays the only required peer.
- React, Tailwind, CSS-in-JS, component forks for themes or automatic style imports.
- Unannounced public namespace/contract changes, automatic fixture replacement,
  commits, pushes, tags, package publication or external announcements.
- Treating successful source checks, a build or a tag as deployment, registry,
  screen-reader or owner-acceptance proof.

The [documentation index](docs/README.md) separates user guides and maintainer
procedures. Historical implementation stages are preserved in
[the stage ledger](docs/maintainers/history.md); previous publication evidence is
in [the release ledger](docs/maintainers/release-history.md).
