# Upgrade to Gavia UI 0.11.0

Gavia UI 0.11.0 is published to npm. Types are more precise, so upgrading
may require code changes. Check models, handlers and slots
against the examples below.

## Breaking changes: linked models and collections

Vue 3.4+ and TypeScript 5.4+ are required: declarations use built-in NoInfer.
Classes, CSS tokens, theme paths and component names are preserved. Styles remain
explicit imports. Do not hide model errors by casting to any.

### Select and MultiSelect

Previously, ref<unknown> allowed values of the wrong type. The model type is now
inferred from options and optionValue: without a resolver, the full object;
with a key, the field type; with a function, its result type. The model must match
the options type. This check does not prove that a value is present in the loaded list.
A cleared Select uses null; MultiSelect stores an array.

Before:

```ts
const selected = ref<unknown>(null);
```

After:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { WlSelect, WlMultiSelect } from "gavia-ui";
import type { WlSelectModel, WlMultiSelectModel } from "gavia-ui";
interface Material { id: number; name: string; }
const options: readonly Material[] = [{ id: 1, name: "Material" }];
const selected = ref<WlSelectModel<Material, "id">>(null);
const selectedMany = ref<WlMultiSelectModel<Material, "id">>([]);
</script>
<template>
  <WlSelect v-model="selected" :options="options" option-label="name" option-value="id" />
  <WlMultiSelect v-model="selectedMany" :options="options" option-label="name" option-value="id" />
</template>
```

Here, selected is number | null and selectedMany is number[]. The
update:modelValue handler accepts the same domain. Omitting the Select model is allowed;
if your app separately uses undefined as an initial state, include it
in your ref. MultiSelect keeps its original [] default.

### Autocomplete

Single mode allows free text: the model is Suggestion | string | null.
Multiple stores Suggestion[] | null. With a dynamic boolean multiple, the model
must cover both modes. forceSelection support was not added.

```ts
import { ref } from "vue";
import type { WlAutocompleteModel } from "gavia-ui";
interface Suggestion { id: number; name: string; }
const selected = ref<WlAutocompleteModel<Suggestion>>(null);
const selectedMany = ref<WlAutocompleteModel<Suggestion, true>>([]);
const selectedDynamic = ref<WlAutocompleteModel<Suggestion, boolean>>(null);
function label(value: Suggestion | string): string {
  return typeof value === "string" ? value : value.name;
}
```

In single mode, callback optionLabel must handle the user’s string. You can keep
option-label="name": free strings display directly.
Pass multiple to the component for selectedMany. In single mode, external null/undefined
clears text; in multiple, []/null clears selection. String input is no longer lost
with a label key.

### DatePicker: range mode

Previously, an explicit range generic allowed omission of selectionMode, although
a generic cannot switch runtime behavior. Range now requires
the actual prop. Specify the mode for a WlDateRange | null model:

```vue
<WlDatePicker v-model="range" selection-mode="range" />
```

DatePicker models, handlers and slots retain their types. Without range,
the component still uses single mode; an explicit type must match the mode.

### Table

A regular column must reference an existing string key of Row. Mark action
or computed columns with kind: "virtual". For specific rows, replace
broad WlTableColumn[] with WlTableColumn<MyRow>[] or satisfies.

```ts
import type { WlTableColumn } from "gavia-ui";
interface Material { id: number; name: string; }
const columns = [
  { key: "name", label: "Name" },
  { key: "actions", label: "Actions", kind: "virtual" }
] as const satisfies readonly WlTableColumn<Material, "actions">[];
```

WlTable infers Row from value. In cell-name, value is string; in virtual
cell-actions it remains unknown: use known row fields or
narrow the value. The old dictionary WlTableRow keeps broad string keys.

### Navigation and events

Sidebar/CommandPalette retain additional item/data/group fields in events
and slots. Group descriptors accept readonly items; CommandPalette keywords are also
readonly. Menu/Accordion/Tabs/Radio/Segmented check callbacks and models against
the data domain. A mistyped key or incompatible handler now produces a type error.

With literal options, the Segmented model must store the corresponding value union
plus null; Tabs uses the key union plus an empty string for its initial state.
For example, replace ref<string | null> with ref<"list" | "grid" | null>;
for two Tabs, use ref<"overview" | "details" | "">.

Selection handlers must not mutate group.items or item.keywords from the payload.
To change a list, keep application state separately or copy it:

```ts
import type { WlCommandPaletteItem } from "gavia-ui";
function copyKeywords(item: WlCommandPaletteItem): string[] {
  return [...(item.keywords ?? [])];
}
```

Replace group.items.sort(...) with [...group.items].sort(...).
Replace item.keywords?.push("tag") with [...(item.keywords ?? []), "tag"]
and update your own application state.

Readonly applies to descriptor collections read by the component.
Your data types are preserved; this is not full DeepReadonly.

### pt sections and extensions

Known pt sections provide suggestions and actual contexts. Dynamic keys
remain allowed. createWlPt() returns unknown for arbitrary extensions:
do not access it as a DOM-attribute tree without narrowing. For custom
metadata, keep a typed variable in your app.

```ts
import { createWlPt } from "gavia-ui";
import type { WlPtStrict } from "gavia-ui";
const selectPt = {
  option: ({ context }) => ({ class: { selected: context.selected } })
} satisfies WlPtStrict<"select">;
const appMetadata = { feature: "editor" };
const pt = createWlPt({ select: selectPt, appMetadata });
// Typed application metadata is available through appMetadata.
```

WlPtStrict/WlPtConfigStrict provide explicit checks through satisfies. They do not replace
the default open configuration. Nested pcChip/pcInputText are nodes, not callbacks
for the entire tree. Tooltip uses a directive: its pt accepts DOM attributes,
but not Vue listeners, vnode hooks or key/ref. Existing default clearIcon values in Select
and MultiSelect are preserved; there are no separate applied clearIcon DOM sections.

### Modifiers, DOM attributes and refs

Input/PasswordInput/Textarea and CommandPalette query support .trim.
.number/.lazy are not implemented for them; selection, date, file, number, boolean
and key models do not support built-in modifiers. Convert domain values
in your app and remove unsupported modifiers.

Native attrs/events match the actual control. input/change handlers
receive Event; keyboard handlers receive KeyboardEvent. Model values arrive through
update:modelValue. The component manages kit size/value/checked. For Field, explicitly
connect inputId to id and ariaDescribedby to aria-describedby.

DatePicker uses minDate/maxDate instead of native min/max; readonly limits
text input, while disabled blocks all selection. Remove step from TimePicker:
it uses 60 seconds. WlNavItem renders a link for a nonempty href; an empty
string switches it to a button, so pass target/rel with a nonempty link.

A generic component may be callable rather than a constructor: InstanceType does not fit
every export. Use the public Expose contract for imperative methods:

```ts
import { ref } from "vue";
import type { WlSidebarExpose } from "gavia-ui";
const sidebar = ref<WlSidebarExpose | null>(null);
function showNavigation(): void { sidebar.value?.openMobile(); }
```

WlCommandPaletteExpose, WlMenuExpose, WlPopoverExpose,
WlFilePickerExpose and WlFilterBarExpose are also available. With an explicit generic, pass
the matching actual prop: optionValue resolver, multiple or
selectionMode="range". A type without its corresponding mode does not change runtime.

## Behavior fixes

Disabled blocks selection through open lists/chips and delayed handlers.
Single FileUpload accepts one file; a rejected replacement preserves the previous selection.
NaN/Infinity and invalid numeric bounds are normalized before CSS/ARIA output.
Locale accepts partial readonly configuration, ignoring invalid known fields.
Teleport attrs reach the existing DOM root; FilterBar uses an SSR id.
Toast/Confirm gained targeted group helpers; existing Confirm close()
remains global. These changes are listed in the [changelog](../CHANGELOG.md).

## Compatibility checks

The API 0.9.1 snapshot and original Vue consumer remain unchanged. Preparing
0.11 uses a separate, version-scoped migration contract: only
the multiple Autocomplete model, specific readonly navigation selection-payload fields,
arbitrary createWlPt result extensions, required selectionMode for
range DatePicker and one Select ref adjustment.
Original differences remain in the report. The adapted contract is checked in full:
any additional loss of a prop/event/slot/ref/CSS/token blocks the gate.

New TS/Vue/TSX examples are checked separately against the installed archive on
Vue 3.4 / TypeScript 5.4 and Vue 3.5. Type checks do not replace unit, SSR, browser
or visual application review. Local results and check boundaries:
[quality and compatibility](quality.md#checking-new-public-contracts).
