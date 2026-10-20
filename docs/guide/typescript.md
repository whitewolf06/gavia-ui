# TypeScript contracts

Use the public `gavia-ui` exports with TypeScript 5.4 or later and strict template
checking. Generic selection, row/column and navigation types follow the supplied
models; inspect each component guide for its actual props and slots. Source
checks and installed-archive declarations are verified separately.

## Selection and suggestions

`WlSelect` / `WlMultiSelect` infer model types from `options` and `optionValue`.
Without a resolver, the model stores `TOption`; with a key, the field type;
with a function, its result type. `NoInfer` prevents an incompatible model
from widening option types. Readonly lists are accepted and never mutated.

`WlSelectModel<Option, Resolver>` includes `null` for cleared selection; `WlMultiSelectModel<Option, Resolver>` is an array. Omitting a Select model is allowed; MultiSelect retains its `[]` default.

`WlAutocompleteModel<Option>` is `Option | string | null`: free input returns a string, selection returns a suggestion. `multiple` uses `WlAutocompleteModel<Option, true>` — `Option[] | null`. A dynamic boolean mode requires both model branches. Single `optionLabel` functions also handle strings; a field key applies to object suggestions, while free text displays directly. In single mode, external `null` / `undefined` clears text; in multiple, `[]` / `null` clears selection. Typed option slots expose the original option and selection state; consult the component guide for additional behavior.

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

## Table

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

## pt sections

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

## Linked models and navigation

`WlRadio<Value>` infers the domain from the group model; `value` must match it. An omitted model retains `undefined`; update emits Value without adding undefined to the domain. `null` / `undefined` are valid updates when explicitly included in Value. `WlSegmented<Value>` infers its domain from options and keeps a `null` default; `WlTabs<Item>` infers keys from items and keeps an empty `""` default. Narrow models account for these initial states.

`WlSidebarItem<Data>` / `WlCommandPaletteItem<Data>` and component generics retain data and extra item fields in select events and slots. Groups accept readonly items; `keywords` is also readonly. Sidebar connects the active key to Item["key"]; an optional input does not add undefined to key updates. The second Sidebar/CommandPalette generic retains extra group fields in events and slots; regular use infers them from groups. Existing key fields in Sidebar item/footer-item slots are preserved. Narrow unknown business data at the application boundary.

WlAccordion<Item> retains extra item fields in slots, and openKeys accepts item keys. WlMenu<Item> passes the full item to command. For a strict callback, use an interface extending WlMenuItem<MyItem>. Menu, Accordion, Breadcrumbs, Steps, Calendar and color-palette descriptors accept readonly arrays.

For refs, use WlMenuExpose, WlPopoverExpose, WlFilePickerExpose, WlFilterBarExpose, WlSidebarExpose / WlCommandPaletteExpose with their documented methods. Generic SFCs expose callable contracts; existing `InstanceType<typeof Component>` may no longer fit. Component names, DOM, CSS and runtime services are unchanged.

## Native attributes, events and models

Public type-only facades preserve original props, slots, events and ref methods. They create no runtime wrappers and do not turn DOM attributes into props. Text fields accept name/form/required/maxlength; textarea also accepts rows/cols/wrap. Input and keyboard events receive Event/KeyboardEvent, not a model value. Components control kit size, value and checked. Field class/style/data attributes reach the wrapper; id/ARIA and listeners reach the control. `WlFieldSlotProps` describes label, hint and error connections: explicitly connect inputId to id and ariaDescribedby to aria-describedby.

Select/MultiSelect are proxy controls: their attributes do not promise native required/readonly/text validation. name preserves existing serialization: Select uses the hidden input’s string value, MultiSelect uses displayed selection text. Submit typed values through application v-model. NavItem accepts target/rel/download with href when it renders a link. FilePicker does not promise autofocus for its hidden input; choose() is called from a user action. TimePicker retains minute precision, so native step does not override 60 seconds.

Input/PasswordInput/Textarea support string `.trim`; CommandPalette query also supports `.trim`. `.number` breaks their string contract, and `.lazy` is not implemented. Date, selection, array, number, file, boolean and key models do not support built-in modifiers. Use `WlTextModelModifiers` / `WlNoModelModifiers` and convert domain values in your app. Compile-only fixtures check unsupported cases, including actual Vue v-model usage.

## Locale, services and overlays

`WlLocaleInput` accepts a partial locale with readonly names. Known labels are string; application extensions remain unknown. `normalizeWlLocale()` ignores undefined and invalid known values, checks seven weekday names, twelve months and firstDayOfWeek 0–6. `WlResolvedLocale` contains all known fields; the previous minimal `WlLocale` remains valid. The Russian fallback is preserved for compatibility; choose English explicitly through `WlConfig` with `locale: wlLocaleEn`.

`useWlToast({ group: "editor" })` targets the matching WlToast; clear() clears only that group. Confirm accepts group in options; closeGroup(group) closes only its request. Existing close() remains global. Drawer/Popover/Menu/Toast consumer class/style/data/ARIA are explicitly forwarded to their existing DOM root inside Teleport. FilterBar uses the shared SSR-compatible id generator.

## Runtime value protection

Disabled Select/MultiSelect/Autocomplete do not change models through open lists, chips or delayed complete events. NumberInput/Pagination block delayed commits after disabling. Single FileUpload accepts one file and rejects others with reason=count; an invalid replacement retains the previous selection. The component neither deletes disk files nor uploads them.

Pagination normalizes page numbers/count to integers; siblings is capped at 100. NumberInput keeps ±Infinity as an absent bound, replaces NaN and incorrectly directed infinite bounds, and changes step ≤ 0 / nonfinite to 1. Reversed ranges collapse to minimum. Slider, Progress, StatCard and FilterBar counts do not emit NaN/Infinity into CSS/ARIA. TimePicker ignores invalid HH:mm bounds and retains overnight ranges. The number type alone does not guarantee these constraints.

## Compatibility and migration

Narrowing unknown models, callback labels handling free strings, explicit virtual columns, key domains, modifiers and callable generics change the TypeScript contract. They require a separate minor release in 0.x and a Breaking changes note; they cannot be included in a patch as “types only”.

Declarations use built-in `NoInfer` and require TypeScript 5.4 or newer
([official release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type)).
Keep strict template checking enabled. Source checks and declaration checks
against an installed package are separate; maintainers verify Vue 3.4 and 3.5
consumers before a release.

Replace `ref<unknown>(null)` with the field domain, such as `ref<number | null>(null)`; use `ref<number[]>([])` for MultiSelect. Keep mutable application arrays separate from readonly component descriptors. Do not hide errors by casting to `any`.

For applications moving from the 0.9.1 contract, follow the
[0.11 consumer migration](../migration.md#migration-0-11-0). It covers the
multiple Autocomplete model, readonly navigation payloads, custom pass-through
extensions, explicit range DatePicker mode and typed selection models.
Historical consumer snapshots and validation procedures belong to the
[maintainer compatibility guide](../maintainers/quality.md).

For version-specific transitions see [migration](../migration.md); maintainers
follow the [compatibility procedures](../maintainers/quality.md).
