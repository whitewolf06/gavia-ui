# Gavia UI architecture

## Package boundaries

`packages/ui-kit` contains Vue 3 components, types, manifest, themes and CSS.
`apps/playground` demonstrates them and supports browser checks.
Routes, API, state management and business rules belong to the app.
The only required peer is `vue`; it is not bundled into ESM.

Entry point `src/index.ts` exports stable `Wl*` names. All 53
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

<a id="контракты-типов-данных"></a>

## Data type contracts

Type changes were released in 0.11.0. Release preparation locally checked
source, playground and installed archives with Vue 3.4.0 / TypeScript 5.4.5
and Vue 3.5.40 / TypeScript 5.8.3. Unit tests, SSR and a browser
consumer also passed. Compatibility with the previous API is checked separately from new types.

### Selection and suggestions

`WlSelect` / `WlMultiSelect` infer model types from `options` and `optionValue`.
Without a resolver, the model stores `TOption`; with a key, the field type;
with a function, its result type. `NoInfer` prevents an incompatible model
from widening option types. Readonly lists are accepted and never mutated.

`WlSelectModel<Option, Resolver>` includes `null` for cleared selection; `WlMultiSelectModel<Option, Resolver>` is an array. Omitting a Select model is allowed; MultiSelect retains its `[]` default.

`WlAutocompleteModel<Option>` is `Option | string | null`: free input returns a string, selection returns a suggestion. `multiple` uses `WlAutocompleteModel<Option, true>` — `Option[] | null`. A dynamic boolean mode requires both model branches. Single `optionLabel` functions also handle strings; a field key applies to object suggestions, while free text displays directly. In single mode, external `null` / `undefined` clears text; in multiple, `[]` / `null` clears selection. `forceSelection` and custom option slots are not implemented.

```ts
import { ref } from "vue";
import type { WlAutocompleteModel, WlSelectModel } from "gavia-ui";
interface Material { id: number; label: string; }
const options: readonly Material[] = [{ id: 1, label: "Wood" }];
const selected = ref<WlSelectModel<Material, "id">>(null);
const suggested = ref<WlAutocompleteModel<Material>>(null);
const label = (item: Material | string) => typeof item === "string" ? item : item.label;
```

```vue
<WlSelect v-model="selected" :options="options" option-label="label" option-value="id" />
<WlAutocomplete v-model="suggested" :suggestions="options" :option-label="label" />
```

An explicit generic does not set runtime mode. Public exports require `optionValue` for an explicit resolver type, `multiple` for a mode other than default false, and `selectionMode` for DatePicker range. The type facade references the same component without a render wrapper; Vue context, events, slots and expose are preserved. Regular templates infer generics from props.

### Table

`WlTable<Row>` accepts a readonly object array. The row interface
needs no index signature. Slot `cell-<field>` receives `row: Row`
and `value: Row[field]`. Virtual-column values remain `unknown`:
narrow them or use known `row` fields.

```ts
import type { WlTableColumn } from "gavia-ui";
interface Material { id: number; label: string; }
const columns = [
  { key: "label", label: "Name" },
  { key: "actions", label: "Actions", kind: "virtual" }
] as const satisfies readonly WlTableColumn<Material, "actions">[];
```

WlTableColumn<Row> is a row field or an explicitly marked virtual column. The second generic limits virtual-column names; regular fields are always checked against keyof Row. The component infers Row from value, and columns do not widen it: a typo does not become a virtual field. For typed rows, replace broad WlTableColumn[] with readonly WlTableColumn<MyRow>[] or satisfies. Legacy WlTableRow dictionaries retain broad keys.

### pt sections

`WlPt<"select">` and equivalent component types suggest known sections while allowing dynamic extensions. Use `WlPtStrict` / `WlPtConfigStrict` through `satisfies` to check section names and nested nodes for typos.

```ts
import type { WlPtStrict } from "gavia-ui";
const selectPt = {
  root: { "aria-describedby": "material-help" },
  option: ({ context }) => ({ class: { selected: context.selected } })
} satisfies WlPtStrict<"select">;
```

`WlPtConfig` retains open dynamic entries and arbitrary extension values; known sections have precise types. `createWlPt()` no longer promises that every unknown key contains a DOM-attribute tree: custom extensions remain unknown and must be narrowed before reading.

A leaf section accepts attributes or a function returning attributes. Nested `pcChip`, `pcInputText` and similar nodes are section objects, not functions. A callback receives only `{ context }` with the actual supplied flags; props and internal state are not exposed. `class` / `style` and merge order are unchanged. The tooltip directive applies class/style and primitive attributes; unlike Vue component sections, its pt does not attach DOM events or vnode hooks.

### Linked models and navigation

`WlRadio<Value>` infers the domain from the group model; `value` must match it. An omitted model retains `undefined`; update emits Value without adding undefined to the domain. `null` / `undefined` are valid updates when explicitly included in Value. `WlSegmented<Value>` infers its domain from options and keeps a `null` default; `WlTabs<Item>` infers keys from items and keeps an empty `""` default. Narrow models account for these initial states.

`WlSidebarItem<Data>` / `WlCommandPaletteItem<Data>` and component generics retain data and extra item fields in select events and slots. Groups accept readonly items; `keywords` is also readonly. Sidebar connects the active key to Item["key"]; an optional input does not add undefined to key updates. The second Sidebar/CommandPalette generic retains extra group fields in events and slots; regular use infers them from groups. Existing key fields in Sidebar item/footer-item slots are preserved. Narrow unknown business data at the application boundary.

WlAccordion<Item> retains extra item fields in slots, and openKeys accepts item keys. WlMenu<Item> passes the full item to command. For a strict callback, use an interface extending WlMenuItem<MyItem>. Menu, Accordion, Breadcrumbs, Steps, Calendar and color-palette descriptors accept readonly arrays.

For refs, use WlMenuExpose, WlPopoverExpose, WlFilePickerExpose, WlFilterBarExpose, WlSidebarExpose / WlCommandPaletteExpose with their documented methods. Generic SFCs expose callable contracts; existing `InstanceType<typeof Component>` may no longer fit. Component names, DOM, CSS and runtime services are unchanged.

### Native attributes, events and models

Public type-only facades preserve original props, slots, events and ref methods. They create no runtime wrappers and do not turn DOM attributes into props. Text fields accept name/form/required/maxlength; textarea also accepts rows/cols/wrap. Input and keyboard events receive Event/KeyboardEvent, not a model value. Components control kit size, value and checked. Field class/style/data attributes reach the wrapper; id/ARIA and listeners reach the control. `WlFieldSlotProps` describes label, hint and error connections: explicitly connect inputId to id and ariaDescribedby to aria-describedby.

Select/MultiSelect are proxy controls: their attributes do not promise native required/readonly/text validation. name preserves existing serialization: Select uses the hidden input’s string value, MultiSelect uses displayed selection text. Submit typed values through application v-model. NavItem accepts target/rel/download with href when it renders a link. FilePicker does not promise autofocus for its hidden input; choose() is called from a user action. TimePicker retains minute precision, so native step does not override 60 seconds.

Input/PasswordInput/Textarea support string `.trim`; CommandPalette query also supports `.trim`. `.number` breaks their string contract, and `.lazy` is not implemented. Date, selection, array, number, file, boolean and key models do not support built-in modifiers. Use `WlTextModelModifiers` / `WlNoModelModifiers` and convert domain values in your app. Compile-only fixtures check unsupported cases, including actual Vue v-model usage.

### Locale, services and overlays

`WlLocaleInput` accepts a partial locale with readonly names. Known labels are string; application extensions remain unknown. `normalizeWlLocale()` ignores undefined and invalid known values, checks seven weekday names, twelve months and firstDayOfWeek 0–6. `WlResolvedLocale` contains all known fields; the previous minimal `WlLocale` remains valid. The Russian fallback is preserved for compatibility; choose English explicitly through `WlConfig` with `locale: wlLocaleEn`.

`useWlToast({ group: "editor" })` targets the matching WlToast; clear() clears only that group. Confirm accepts group in options; closeGroup(group) closes only its request. Existing close() remains global. Drawer/Popover/Menu/Toast consumer class/style/data/ARIA are explicitly forwarded to their existing DOM root inside Teleport. FilterBar uses the shared SSR-compatible id generator.

### Runtime value protection

Disabled Select/MultiSelect/Autocomplete do not change models through open lists, chips or delayed complete events. NumberInput/Pagination block delayed commits after disabling. Single FileUpload accepts one file and rejects others with reason=count; an invalid replacement retains the previous selection. The component neither deletes disk files nor uploads them.

Pagination normalizes page numbers/count to integers; siblings is capped at 100. NumberInput keeps ±Infinity as an absent bound, replaces NaN and incorrectly directed infinite bounds, and changes step ≤ 0 / nonfinite to 1. Reversed ranges collapse to minimum. Slider, Progress, StatCard and FilterBar counts do not emit NaN/Infinity into CSS/ARIA. TimePicker ignores invalid HH:mm bounds and retains overnight ranges. The number type alone does not guarantee these constraints.

### Compatibility and migration

Narrowing unknown models, callback labels handling free strings, explicit virtual columns, key domains, modifiers and callable generics change the TypeScript contract. They require a separate minor release in 0.x and a Breaking changes note; they cannot be included in a patch as “types only”.

New declarations use built-in NoInfer and require TypeScript 5.4 or newer ([official release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type)). The archive passed local strict compilation with Vue 3.4.0 + TypeScript 5.4.5 and Vue 3.5.40 + TypeScript 5.8.3: strictTemplates and TSX enabled, skipLibCheck disabled. Vue 3.5.40 was checked on desktop/mobile and SSR hydration.

Replace `ref<unknown>(null)` with the field domain, such as `ref<number | null>(null)`; use `ref<number[]>([])` for MultiSelect. Keep mutable application arrays separate from readonly component descriptors. Do not hide errors by casting to `any`.

The 0.9.1 snapshot and consumer remain unchanged. The agreed 0.11 migration contract covers only the multiple Autocomplete model, specific readonly navigation selection-payload fields, unknown arbitrary createWlPt extensions, required selectionMode for range DatePicker and one replacement of Select ref<unknown> with ref<number | null> in the copied example. The gate compares the full adapted contract; original differences stay in the report. Other props/events/slots/expose and the complete CSS/exports/tokens/pt inventory are checked without exceptions. Generic modes are compared by corresponding branches; Table uses the previous WlTableRow dictionary domain. Permission is scoped to the baseline and 0.11 version, not future releases. [Practical consumer steps](migration-0.11.0.md).

<a id="темы-и-публичный-dom"></a>

## Themes and public DOM

The design system is described in [design-system.md](design-system.md). Its source is
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

Sections with standard values in `createWlPt()`:

| Configuration key | Sections |
| --- | --- |
| `checkbox` | `input`, `box`, `icon` |
| `radiobutton` | `input`, `box`, `icon` |
| `toggleswitch` | `input`, `slider`, `handle` |
| `select` | `label`, `clearIcon`, `dropdown`, `dropdownIcon`, `overlay`, `listContainer`, `list`, `option`, `optionLabel`, `emptyMessage` |
| `multiselect` | `labelContainer`, `label`, `clearIcon`, `chipItem`, `pcChip.root`, `pcChip.label`, `pcChip.removeIcon`, `dropdown`, `dropdownIcon`, `overlay`, `header`, `pcFilter.root`, `filterIcon`, `listContainer`, `list`, `option`, `optionLabel`, `emptyMessage` |
| `autocomplete` | `inputMultiple`, `chipItem`, `pcChip.root`, `pcChip.label`, `pcChip.removeIcon`, `input`, `inputChip`, `dropdown`, `dropdownIcon`, `overlay`, `listContainer`, `list`, `option`, `emptyMessage` |
| `card` | `header`, `body`, `caption`, `title`, `subtitle`, `content`, `footer` |
| `dialog` | `mask`, `header`, `title`, `headerActions`, `content`, `footer`, `pcCloseButton.root`, `pcCloseButton.icon` |
| `confirmdialog` | `mask`, `header`, `title`, `content`, `icon`, `message`, `footer` |
| `drawer` | `mask`, `header`, `title`, `content`, `footer`, `pcCloseButton.root`, `pcCloseButton.icon` |
| `progressbar` | `value`, `label` |
| `avatar` | `label`, `image` |
| `tag` | `label` |
| `divider` | `content` |
| `tablist`, `tabpanels`, `tabpanel` | `content`, `tabList`, `activeBar`; `root`; `root` |
| `tooltip` | `root`, `text`, `arrow` |
| `selectbutton` | `pcToggleButton.root`, `pcToggleButton.content` |
| `breadcrumb` | `list`, `item`, `separator` |
| `menu` | `list`, `submenuLabel`, `item`, `itemContent`, `itemLink`, `separator` |
| `popover` | `content` |
| `toast` | `message`, `messageContent`, `messageIcon`, `messageText`, `summary`, `detail`, `closeButton`, `closeIcon` |
| `datatable` | `table`, `thead`, `tbody`, `bodyRow`, `emptyMessage`, `emptyMessageCell`, `mask`, `loadingIcon` |
| `datepicker` | `pcInputText.root`, `startLabel`, `endLabel`, `endInput`, `rangeHint`, `dropdown`, `dropdownIcon`, `panel`, `calendarContainer`, `calendar`, `header`, `title`, `selectMonth`, `selectYear`, `pcPrevButton.root`, `pcPrevButton.icon`, `pcNextButton.root`, `pcNextButton.icon`, `dayView`, `monthView`, `month`, `yearView`, `year`, `tableHeaderCell`, `weekDay`, `dayCell`, `day` |

Sections apply where the matching DOM exists. For example,
dialog `footer` appears when the `footer` slot exists. Historical Select/MultiSelect default `clearIcon` entries remain for configuration compatibility, but components currently do not resolve those DOM sections, and they are excluded from strict section types.

## Checking a change

`@playwright/test` is pinned to `1.58.2`: Vitest checks contracts and logic;
browser scenarios check focus, overlay positioning, mobile
width, five themes and the complete icon set. Playground `vue-tsc` checks
consumer templates during development.

In jsdom tests, get `node:fs` paths through `fileURLToPath` and `URL`
from `node:url`. This environment’s global `URL` belongs to jsdom and is not
accepted by Node 18 file APIs; pass a string path.

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

In a clean checkout, build before type checks and browsers:
the playground uses public package types and entry points from `dist`.
For demo request/progress tests, install Playwright Clock
before the scenario and pause it after the example loads. Advance time
explicitly; cancellation must check intermediate progress and the absence of late
results. A click must not race a short loading timer.
The grouped playground check budget covers page loading and three actions
per lazy example. Individual state checks retain a
5-second timeout; new examples increase only the overall group budget.

`pnpm test:visual` compares PNGs against accepted five-theme baselines on desktop/mobile;
Windows/Chromium baselines and environment are described in `docs/design-system.md`.
The playground separates responsibilities: ComponentExplorer reads contracts and controls
applicable props; an SFC example contains component integration; RecipeGallery
selects recipes; each recipe owns its draft and demo
data; CodePanel only displays/copies code. Recipe requests and
business rules are excluded from library runtime.

Additional contract, archive, SSR, coverage and size checks are described in [quality.md](quality.md).
