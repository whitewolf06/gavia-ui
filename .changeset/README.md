# Changesets for Gavia UI

Use `pnpm changeset` to describe a user-visible package change and select patch/minor/major.
`pnpm changeset:status` previews the plan. `pnpm release:version` applies it and
synchronizes workspace/package versions and the canonical root changelog. The
prepack hook generates package README/LICENSE/CHANGELOG copies. Versioning does
not publish, commit or push; run it only on the owner's explicit release command.

Source **1.0.0-rc.1** is prepared in Changesets 3 RC mode. Consumed candidate
notes are retained in `pre/` and `pre.json` records `mode: pre`, `tag: rc`.
Keep those notes for stable promotion. Version metadata does not establish
verification or publication; see the [candidate record](../docs/maintainers/release-candidate.md).

Development supports Node 22.13+ on22.x and Node 24. ESLint, Changesets, Playwright,
Vitest/V8, publint and attw are development tools and never runtime dependencies.

## Prepared tooling rationale for the eventual commit

New commits still need the user's separate approval. Include the applicable
reasons below when committing these dependency changes; this note does not
create a commit or authorize one.

| Dependency group | Reason |
| --- | --- |
| ESLint, `@eslint/js`, `typescript-eslint`, `eslint-plugin-vue`, `vue-eslint-parser` | Check strict TypeScript and Vue SFC contracts with the repository's flat config. |
| `@stylistic/eslint-plugin`, Perfectionist and unused-imports | Apply the agreed formatting/import policy while keeping dangerous rewrites disabled. |
| Vue accessibility, Vitest, Playwright, Node, RegExp and Unicorn plugins | Check the corresponding source, interaction tests and tooling without a library runtime dependency. |
| `globals`, `eslint-plugin-jsonc`, `jsonc-eslint-parser` | Declare actual browser/Node environments and validate package/configuration JSON. |
| Root TypeScript | Parse public API, declaration and scaffolding contracts through the TypeScript AST instead of evaluating source. |
| `publint`, `@arethetypeswrong/cli` | Inspect the exact packed ESM distribution and Node16/NodeNext declarations after authorized packaging. |
| Playground `vue-router` | Provide hosted documentation paths/history; portable archives retain query navigation. The library has no router dependency. |
| Playground `sharp` | Derive responsive WebP artwork from retained authored sources with a reproducible hash manifest. It is a development tool only. |

Keep future major Vite/Vitest/TypeScript upgrades in compatible, separately
verified groups. Node 22.13+ and 24 are the development matrix; the library's Vue
3.4 peer and minimum consumer contracts remain independent.
The lint plugins enforce TypeScript/Vue boundaries, accessibility, regex safety,
import organization and test contracts; formatter autofixes are kept separate
from semantic behavior changes. New package-lint tools validate the actual
installed archive during the separately authorized release checks.

Vue 3.4.38 and Vue Test Utils2.4.6 remain pinned in the library to verify the lower
supported source/declaration line. Playground uses Vue 3.5; installed consumers
exercise Vue 3.4/3.5, including the peer lower bound. Root TypeScript 5.8.3 matches
library tooling; TypeScript 5.4 remains the consumer minimum.
