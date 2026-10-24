# Maintaining tokens and themes

The only source of shipped token values is
`packages/ui-kit/tokens/source.json`. Gavia overrides foundation palette,
shadows and dimensions. Semantic roles reference foundation; component roles
reference semantic. Follow the role, contrast and compatibility rules in the
[design system](../reference/design-system.md).

The foundation roles `--wl-palette-action-primary-bg`,
`--wl-palette-action-primary-hover`, `--wl-palette-action-primary-active` and
`--wl-palette-action-primary-text` configure actions independently of links.
Gavia's `--wl-action-primary-*` semantic roles reference them. Classic,
Classic Dark and Newspaper retain their historical semantic aliases; their
active state uses the previous semantic hover color.

Raised surfaces use `--wl-palette-bg-raised` → `--wl-bg-raised`; themes without
an override resolve to `--wl-bg`. Warm decorative roles have separate
`--wl-palette-accent-warm` and `--wl-palette-accent-warm-soft` foundation tokens.

After editing the source, run from the repository root:

```sh
pnpm tokens:sync
pnpm tokens:check
pnpm --filter gavia-ui exec vitest run tests/assets/design-system.test.ts tests/assets/token-validation.test.mjs
```

Synchronization updates generated CSS, the typed catalog and the contrast
report. Inspect the generated diff. The frozen
`packages/ui-kit/tests/fixtures/tokens-0.5.json` protects earlier values in
Classic, Classic Dark and Newspaper; do not rewrite the fixture to silence a
compatibility failure. Theme CSS is covered by `gavia-ui/themes/*.css`.

Preview affected states in all five themes. Browser and visual checks require
separate authorization, and PNG changes require inspection of their diffs.
Consumer overrides are described in [the theming guide](../guide/theming.md).
