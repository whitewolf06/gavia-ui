# Component scaffold templates

Run `pnpm new:component Scratch --category misc --dry-run` from the repository
root to inspect changes. Omit `--dry-run` to create a scaffold. Both `Scratch`
and `WlScratch` produce `WlScratch`; all manifest categories are supported.

`--since <version>` sets the first-release metadata. Its default is the current
library package version; choose the intended release before publishing. `--root`
is available for isolated fixtures or an explicitly selected checkout.

The generator preflights all changes and rejects collisions, unknown categories,
unexpected registry shapes and symlink targets before writing. It does not
install dependencies, build, run checks, commit or create a changeset.

Generated files include the SFC, public native contract/export, pt root section,
structured manifest entry, introduction version, CSS block, live example,
documentation example and registry/accessibility/pt metadata, EN/RU strings and
unit/browser TODOs. Existing registries are extended at their named declarations;
they are not parsed with a broad closing-bracket replacement.

This is a neutral container scaffold. Replace its DOM and ARIA with the actual
component semantics, finish family-specific behavior and tests, improve the
documentation, and add a changeset and changelog entry before review. Russian
placeholder copy is intentionally factual: it describes the unfinished scaffold.
