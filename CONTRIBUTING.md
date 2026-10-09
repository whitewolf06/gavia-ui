# Contributing to Gavia UI

Before making changes, read the [repository rules](agents.md)
and [architecture](docs/architecture.md). The project uses Vue 3,
strict TypeScript, plain CSS and pnpm.

1. Create a branch from the current main.
2. Preserve public props, emits, slots, v-model, `Wl*`, classes, tokens and data attributes.
3. When behavior changes, add a working playground example and checks for that behavior.
4. Add icons in SVG batches through `icons:sync`; update tokens through `tokens:sync`.
5. Record user-visible changes under “Unreleased” in both changelog copies and add a `pnpm changeset` for the release version and notes.
6. Run the checks required by `agents.md`. Update visual baselines after reviewing the diff.
7. Describe the result, validation and required upgrade actions in the PR.

MIT is stored at the root and in the package; both license texts must match.
For a release, update the root and library versions, changelog and migration.
Publication requires a separate explicit instruction; a successful push
does not confirm a release.

Patch/minor rules, supported browsers and validation limits are described
in [quality.md](docs/quality.md). Changesets, browser axe and V8 coverage
are development and validation tools. They are not included in package runtime.
