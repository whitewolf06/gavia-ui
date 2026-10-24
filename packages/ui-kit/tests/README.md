# Library tests

Keep library behavior separate from the documentation application. Playground
tests live in `apps/playground/tests`; browser scenarios live in its `e2e`
directory.

| Directory | Purpose |
| --- | --- |
| `components/` | Focused component behavior, keyboard interaction and rendering |
| `contracts/` | Public API, ARIA, native attributes, services, SSR and compatibility |
| `utils/` | Reusable focus, scrolling, ID and overlay behavior |
| `assets/` | Tokens, icons, authored fonts and their distribution contracts |
| `types/` | Compile-only consumer fixtures, including deliberate type errors |
| `fixtures/` | Historical compatibility snapshots and source fixtures |

Vitest discovers `tests/**/*.test.ts` and `tests/**/*.test.mjs`. Strict library
typechecking includes every `tests/**/*.ts` and `tests/**/*.tsx`, including
`@ts-expect-error` assertions; moving a fixture must not disable its checks.
Keep immutable compatibility snapshots in place. The shared `setup.ts`, mounting
types, export parser and Node declarations remain at the test root. Additional
review regression suites can stay at the root while their owning changes are
in progress; new component suites belong in `components/`.

Run affected suites from the repository root, for example:

```sh
pnpm --filter gavia-ui exec vitest run tests/components/field.test.ts tests/contracts/field-slot-contracts.test.ts
pnpm --filter gavia-ui typecheck
```

Use the Node environment for filesystem and asset checks; use the DOM
environment for interaction contracts. Select suites that exercise changed
behavior. Full tests, coverage, builds and installed-archive checks require a
separate user instruction under [the repository contract](../../../AGENTS.md).
