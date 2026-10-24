# Design tokens

Gavia UI uses CSS custom properties in the `--wl-*` namespace. Foundation tokens
hold source values; semantic tokens name their role; component tokens apply that
role to a component. Follow foundation → semantic → component when adding roles.

Override semantic or component roles in application CSS to customize the kit.
Themes are separate token files selected with `data-wl-theme`; components do not
need to be copied or forked. Keep text and surface roles together and check
contrast, focus and disabled states in the themes your application supplies.

The package exports `gavia-ui/design-tokens.json` for tools. The
[design-system reference](../reference/design-system.md) documents typography,
spacing, surfaces, states and contrast expectations. CSS layers remain
`wl.reset`, `wl.tokens` and `wl.components`; styles are explicit imports.

For repository contributions, edit only
[`tokens/source.json`](../../packages/ui-kit/tokens/source.json), then run
`pnpm tokens:sync` and `pnpm tokens:check`. Generated CSS, JSON and TypeScript are
not hand-maintained. Existing compatibility fixture values cannot be changed
without a reviewed migration.
