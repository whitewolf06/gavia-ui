# Released compatibility fixture

`contract.json` and `declarations/` record the built Gavia UI 0.9.1 release
(`releaseCommit` identifies tag `v0.9.1`). The declaration hashes protect the
historical fixture, not the current generated declarations. Existing 0.3 and
0.5 snapshots remain unchanged.

`consumer.vue` exercises previous props, typed event handlers, named/scoped slots,
models, generic single/range DatePicker modes, exposed methods and app-level pt.
It is compiled against the current built package without rewriting its API usage.

From the repository root, after building the library:

```sh
pnpm verify:compatibility
node --test scripts/check-compatibility.test.mjs
```

The gate uses TypeScript assignability rather than comparing declaration text.
It allows added optional inputs and wider accepted variants; it rejects removed
public names, narrower inputs, newly required inputs, incompatible callbacks,
slots and exposed methods. CSS classes, token names, theme names, data-wl values,
package export conditions and default pt section paths must remain available.
Token values and private implementation declarations may change. Browser tests
cover runtime behavior; this fixture does not replace interaction tests.

For a subsequent stable release, capture its built, tagged release checkout into
a new fixture directory. Existing baselines cannot be overwritten:

```sh
node scripts/check-compatibility.mjs --capture-baseline 0.9.2 /path/to/released/checkout
```

The gate selects the most recent stable fixture. The capture carries forward the
previous consumer, which should be supplemented with API added in that release.
Do not capture candidate changes merely to silence an incompatibility failure.
