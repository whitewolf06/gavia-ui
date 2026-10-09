# Baseline before removing PrimeVue

The baseline was captured on September 27, 2026 from local `main` before changes
were moved to `codex/remove-primevue`. The original checkout remained unchanged.

| Previous implementation check | Result |
| --- | --- |
| `pnpm typecheck` | passed |
| `pnpm build` | passed |
| `pnpm test` | 25 files, 202 tests passed |
| `pnpm build:playground` | passed |
| `pnpm run pack` | passed |
| `pnpm verify:package` | passed |

`packages/ui-kit/tests/fixtures/public-contract-0.3.json` records 51 public
manifest entries: names, categories, props with types/values/defaults, slots,
events, models and `introducedIn`. Descriptive text is excluded.
The contract test compares 0.5 against this snapshot; icon additions are allowed
only if every previous name remains. A separate `icons-0.3.json` snapshot checks
the original drawings of 32 legacy icons. The only documented consumer markup
migration is PrimeVue `<Column>` inside `WlTable`:
use `columns` and `cell-*` (see `migration-0.5.md`).
