# Gavia UI architecture

## Package boundaries

`packages/ui-kit` contains Vue 3 components, types, manifest, themes and CSS.
`apps/playground` demonstrates them and supports browser checks.
Routes, API, state management and business rules belong to the app.
The only required peer is `vue`; it is not bundled into ESM.

Entry point `src/index.ts` exports stable `Wl*` names. Public
components are described in `src/manifest`. Relative imports connect files
inside the package; `@/` aliases are not used there. Consumers import styles
explicitly: `styles/reset.css`, `styles/base.css` and a theme file.

## Responsibility boundaries and SOLID

- **Single responsibility.** A component handles props, events, slots and
  markup. `utils/options.ts` handles selection and keyboard behavior;
  `utils/anchoredOverlay.ts` handles panel anchoring and dismissal;
  `utils/overlayLifecycle.ts` handles modal focus and scrolling. Services store
  toast/confirmation state per Vue app.
- **Open/closed.** Props define variants, slots define content, `pt` configures
  internal DOM sections, and `--wl-*` tokens define appearance. New themes
  override tokens rather than copy components.
- **Liskov substitution.** Replacing an implementation preserves its
  public `v-model`, props, emits, slots, `wl-*` classes, `data-wl` and states.
  Contract tests and the manifest check this boundary.
- **Interface segregation.** Components accept only the props they need;
  optional `WlConfig`, `WlToastService` and `WlConfirmationService`
  are installed separately. Simple fields should not depend on overlays.
- **Dependency inversion.** Composables receive state through Vue `provide`/
  `inject` and typed service contracts. Shared behavior does not import
  concrete components. Two Vue apps on the same page therefore do not share
  toast queues or confirmation requests.

Components do not access `window`/`document` on import, so the package
can be imported on a server. DOM access occurs after mounting
or in handlers. For a new component, first describe its public contract
in the manifest, then implement and check props/model, events/slots,
keyboard/focus, mobile screens and SSR when applicable.

## Data type contracts

Consumer setup and examples live in the [TypeScript guide](../guide/typescript.md).
The public source types and manifest define each component's supported generic
modes, attributes, slots and events. Archive declarations are checked separately
with Node16/NodeNext resolution and strict consumer compilation.

Type changes that narrow the consumer contract require a migration and the
appropriate release version. The [consolidated migration guide](../migration.md)
records historical 0.11 decisions; its documented compatibility allowance is
scoped to that baseline and version. New changes do not inherit that allowance.

### Vue compiler internals and upgrades

`components/generic-contracts.ts` and `components/native-contracts.ts` read the
generated SFC result's internal `__ctx` field to retain typed slots, emits and
exposed methods for generic components. This is a Vue tooling implementation
detail, not a stable public Vue API. A compiler update can change that shape
without a corresponding runtime breaking change. The type-only overloads and
`CallbackInference` parameters also preserve consumer inference; do not remove
them as unused code without checking their template and TSX behavior.

The prepared toolchain pins both projects to `vue-tsc`/`@vue/language-core`
3.3.13 and TypeScript 6.0.3. The preceding checked compiler was 2.2.12 with
TypeScript 5.8.3; those results do not validate the new pins. Source and lockfile
are updated; dependencies have not been installed and checks are deferred.
The upstream 3.3.13 code generator still emits `__ctx` with slots/emit/expose.
Consumer compilation must nevertheless confirm the exact declarations.

TypeScript 7.0 has no stable programmatic API, which this generator, Vue tools,
ESLint and API extraction need. Keep the compatible JavaScript compiler on 6.x
instead of adding a second compiler or weakening types. The consumer minimum
remains TypeScript 5.4. See [Microsoft's transition guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/).
Keep package specifiers and lockfile importers in sync. Treat future compiler
upgrades as a separate change from component behavior or formatting:

1. Review Vue language-tools release notes and compare the generated generic SFC
   signatures, especially `__ctx`, slots, emits, expose and optional arguments.
2. With verification authorized, run strict library and Playground typechecks,
   generic template/TSX fixtures and deliberate invalid-model/slot/event cases.
   A clean runtime build alone cannot detect weakened inference.
3. Build and pack the candidate, then check the installed archive with minimum
   and current Vue/TypeScript consumers, Node16/NodeNext declaration resolution,
   publint and attw. Preserve historical compatibility fixtures and review any
   declaration diff; never clear an upgrade by weakening those checks.
4. Record the exact old/new compiler versions and consumer results before
   accepting the pin. Revisit this internal-field dependency when Vue exposes a
   supported generic-component contract that preserves the same inference.

The other prepared groups are Vite 8.3.4/plugin-vue 6.0.10/Vitest and V8 coverage
5.0.5/vite-plugin-dts 5.1.2, jsdom 29.1.1 and Changesets 3.0.3. Declaration
generation explicitly selects the Vue processor and installs its language-core
peer. Vite uses Rolldown options and the existing shared-runtime chunk policy;
the size probe uses Oxc. Vitest retains the preceding mock lifecycle explicitly.
jsdom 30 requires a newer Node minimum, so 29 remains the selected line under
Node 22.13+/24. Registry engine/peer resolution and lockfile authoring are not
test/build/consumer acceptance; all named checks remain pending.

## Themes and public DOM

The design system is described in [design-system.md](../reference/design-system.md). Its source is
`tokens/source.json`; the generator checks references and contrast and creates
CSS, a typed catalog and JSON. `src/design-system` contains only data
and pure resolution functions: it needs no DOM or Vue state.
Optional typography/layout CSS primitives are imported explicitly.
The playground reads the same catalogs and manifest while owning
its demo scenarios. Pattern business rules are excluded from the package.

Foundation → semantic → component is the CSS-token reference direction. All
variables start with `--wl-`. Layers `wl.reset`, `wl.tokens` and `wl.components`
keep the cascade predictable. `wl-*` classes and `data-wl`, `data-size`,
`data-variant` are part of the contract. New public names require
migration notes.

`pt` configures attributes of specific DOM sections. Each section follows
`createWlPt()` → `WlConfig.pt` → instance `pt`. `class` and `style`
merge; other attributes at the last level replace previous values.
Section callbacks receive `{ context }` with element state. Existing
`pc*` names remain for compatibility with previous `pt` configuration,
although Gavia UI now creates those elements.

Overlay transitions use Vue `Transition`/`TransitionGroup` and
`--wl-dur-*` tokens. `WlConfig.motion` sets the Vue app default;
local `motion` takes priority. The tooltip accepts the same parameter
in its directive object. Motion must not change models, open/close events,
focus stack or service-message lifetime. After closing, the element
leaves the DOM; with `prefers-reduced-motion: reduce`, duration is nearly zero.
`utils/bodyScrollLock.ts` maintains a shared modal lock count and reserves
existing scrollbar space; closing the last overlay restores
the original inline page styles.

Current section names and default attributes are defined in
[`src/theme.ts`](../../packages/ui-kit/src/theme.ts) and
[`src/pt-types.ts`](../../packages/ui-kit/src/pt-types.ts). Component guides expose the applicable
sections from shared documentation metadata. A section applies only when its
DOM exists, such as a dialog footer supplied through a slot. Keep compatibility
migrations explicit when normalizing section names. The 1.0 source resolves only
canonical PT keys; historical 0.x aliases are documented in the migration guide.

## Checking a change

`@playwright/test` is pinned to `1.58.2`: Vitest checks contracts and logic;
browser scenarios check focus, overlay positioning, mobile
width, five themes and the complete icon set. Playground `vue-tsc` checks
consumer templates during development.

In jsdom tests, get `node:fs` paths through `fileURLToPath` and `URL`
from `node:url`. This environment’s global `URL` belongs to jsdom and is not
accepted by Node file APIs; pass a string path.

`pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm build:playground`,
`pnpm run pack`, `pnpm verify:package`, `pnpm verify:dependencies`,
`pnpm icons:check`, `pnpm test:e2e`.
Additionally, `pnpm tokens:check` checks five themes and generated output.
`verify:package` installs the archive into an isolated consumer with one Vue,
checks types and builds, including every copyable SFC example and recipe.
These share the copy source rather than keeping separate markup.
Browser tests cover Chromium, Firefox, WebKit,
mobile Chromium and theme snapshots. A passing static build does not replace
interaction checks.

The Playground imports public package names through exact source aliases during
development and typechecking. A build is required for production browser checks
and installed-archive validation, and remains gated by the explicit check command.
For demo request/progress tests, install Playwright Clock
before the scenario and pause it after the example loads. Advance time
explicitly; cancellation must check intermediate progress and the absence of late
results. A click must not race a short loading timer.
The grouped playground check budget covers page loading and three actions
per lazy example. Individual state checks retain a
5-second timeout; new examples increase only the overall group budget.

`pnpm test:visual` compares PNGs against accepted five-theme baselines on desktop/mobile;
Windows/Chromium baselines and environment are described in
[visual baseline maintenance](visual-baselines.md).
The playground separates responsibilities: ComponentExplorer reads contracts and controls
applicable props; an SFC example contains component integration; RecipeGallery
selects recipes; each recipe owns its draft and demo
data; CodePanel only displays/copies code. Recipe requests and
business rules are excluded from library runtime.

Additional contract, archive, SSR, coverage and size checks are described in [quality.md](quality.md).
