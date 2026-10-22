# Gavia UI migration guide

Choose the section for the version or contract you are changing. Historical
sections describe that release; they do not report current validation or a new
publication. Stable public namespaces remain `Wl*`, `wl-*` and `--wl-*`.

The active review programme's additional contracts are documented in
[its migration notes](migration-review-programme.md); follow their stated
implementation and verification status.

- [Upgrading from 0.12.1 to 1.0.0-rc.1](#migration-1-0-rc-1)
- [1.0 localization: English fallback](#migration-1-0-localization)
- [1.0 public API: canonical names](#migration-1-0-public-api)
- [Package documentation and font assets](#migration-package-assets)
- [Upgrading to Gavia UI 0.12.1](#migration-0-12-1)
- [Upgrading to Gavia UI 0.12.0](#migration-0-12-0)
- [Upgrade to Gavia UI 0.11.1](#migration-0-11-1)
- [Upgrade to Gavia UI 0.11.0](#migration-0-11-0)
- [Upgrade to Gavia UI 0.10.0](#migration-0-10-0)
- [Gavia UI 0.9: font and new theme](#migration-0-9)
- [Gavia UI 0.8: completing the replacement of external controls](#migration-0-8)
- [Gavia UI 0.7.0: migration to the public name](#migration-0-7)
- [Design system 0.6.0: changes and migration](#migration-0-6)
- [Upgrade from API 0.3 to 0.5](#migration-0-5)
- [Baseline before removing PrimeVue](#baseline-0-3)
- [Migration to Gavia UI](#migration-gavia)
- [Theme names and Gavia Dark](#migration-themes)

<a id="migration-1-0-rc-1"></a>
## Upgrading from 0.12.1 to 1.0.0-rc.1

**Prepared on 2026-10-22; publication and exact-candidate verification pending.**
The root and library source versions are `1.0.0-rc.1`. This candidate contains
breaking changes and is intended for npm **`next`**. The currently published
stable version is 0.12.1, as observed on 2026-10-22; preparing this document
does not change the registry.

The owner approved an RC transition on 2026-10-22, replacing the original plan
for an intervening 0.x release with aliases and warnings. No such warning release
is claimed. The two-to-four-week feedback period starts only after confirmed RC
publication. Stable 1.0 requires feedback disposition and its own release approval.
See the [accepted transition](rfc/0001-public-api-1.0.md#accepted-rc-transition--2026-10-22).

After publication, opt into this exact candidate in a consumer application:

```sh
pnpm add gavia-ui@1.0.0-rc.1 vue
```

`gavia-ui@next` follows the candidate channel after publication. Keep the exact
version above when reproducing an RC issue. Consumers staying on stable continue
using the ordinary package name. Vue `^3.4.0` and TypeScript 5.4+ remain supported.

Upgrade application code together:

1. Configure `WlConfig` with `wlLocaleRu` if the app relies on Russian built-in
   text. Follow [English fallback and text overrides](#migration-1-0-localization).
2. Replace legacy PT component/section names, status variants and `dismissable`;
   move shared IconButton overrides to `pt.iconButton`. Follow the complete
   [canonical-name mapping](#migration-1-0-public-api).
3. Import the component as `WlTooltip` and register `WlTooltipDirective` as the
   directive. Supply accessible names for icon-prop actions.
4. Keep CSS imports, `Wl*`, `wl-*`, `--wl-*` and the five theme identifiers.
   The existing font CSS now enables the 100–700 variable Gavia Sans files;
   accepted static files remain the conditional fallback.
5. Review public utility/composable imports and the
   [additional component/service migrations](migration-review-programme.md).
   Keep requests, routing and business state in the application.

Before adopting a candidate in an application, run its own strict types and
exercise changed labels, PT customizations, keyboard/focus behavior and SSR
hydration where used. Maintainer release evidence for this exact version remains
pending in the [candidate checklist](maintainers/release-candidate.md).

<a id="migration-1-0-localization"></a>
## 1.0 localization: English fallback

**Breaking change included in the prepared 1.0.0-rc.1 source.** Publication and
verification of the exact candidate remain pending. Earlier scoped acceptance
is retained in the review ledger; it does not certify this versioned archive.

Without `WlConfig`, or with an omitted locale, built-in control labels and calendar
names now use `wlLocaleEn`. Existing applications that rely on implicit Russian
text must install the Russian preset in their application entry point:

```ts
import { createApp } from "vue";
import { WlConfig, wlLocaleRu } from "gavia-ui";
import App from "./App.vue";

createApp(App).use(WlConfig, { locale: wlLocaleRu }).mount("#app");
```

For Nuxt or another SSR host, install configuration inside the per-application
plugin/request setup. Do not move mutable locale state to a module singleton.
The library does not infer its locale from browser language or HTML `lang`.

### Partial locales and custom text

Missing or invalid known fields in a partial locale fall back to **English**.
Setting only `localeCode: "ru-RU"` changes formatting metadata; it does not supply
Russian translations. Spread the full preset before overriding selected labels:

```ts
app.use(WlConfig, {
  locale: { ...wlLocaleRu, accept: "Продолжить", reject: "Вернуться" }
});
```

Component text props keep priority over locale text. Omitted props and explicit
`undefined` follow the active locale, including reactive changes through
`useWlConfig().setLocale(...)`; an explicit string, including `""`, stays an
override. Keep meaningful accessible names when suppressing text. Calling
`setLocale(undefined)` restores the English fallback for that application only.

Russian strings have been removed from component prop defaults. Their public
inputs remain optional strings, but an omitted prop read through a component
ref is now `undefined`; the rendered text is resolved from the locale. Remove
code that inspects prop defaults to discover translated labels. Application
content, supplied slots and custom prop strings are still translated by the app.

The internal `useWlLocaleText` helper has been removed. Library components resolve
text directly from the normalized `useWlLocale()` result with nullish fallback;
they no longer inspect raw vnode props. This is not a new public import: consumer
applications continue to use `WlConfig`, `useWlConfig` and the exported presets.

Before release, check omitted/undefined/custom/empty text, changing EN/RU while
mounted, independent Vue applications and repeated/concurrent SSR with hydration.
Check built-in labels as well as visible content in your app. These instructions
do not claim that those acceptance checks have run.

The companion [public API migration](#migration-1-0-public-api) removes the
0.x aliases and renames Tooltip exports. See the
[localization guide](guide/localization.md) and [1.0 RFC](rfc/0001-public-api-1.0.md).

<a id="migration-1-0-public-api"></a>
## 1.0 public API: canonical names

**Breaking API included in the prepared 1.0.0-rc.1 source.** Candidate verification
and publication remain pending. The owner-approved [RC transition](#migration-1-0-rc-1)
replaces the originally planned 0.x warning release. Keep these removals in the
major candidate channel; no intermediate compatibility publication is claimed.

### Pass-through configuration

Use these component keys in `WlConfig.pt`, `WlPt` and `WlPtStrict`:

| Removed 0.x key | 1.0 key |
| --- | --- |
| `datatable` | `table` |
| `inputtext` | `input` |
| `toggleswitch` | `switch` |
| `selectbutton` | `segmented` |
| `paginator` | `pagination` |
| `progressbar` | `progress` |
| `radiobutton` | `radio` |
| `breadcrumb` | `breadcrumbs` |
| `tablist` | `tabs` |
| `tabpanels.root`, `tabpanel.root` | `tabs.panels.root`, `tabs.panel.root` |

For local Tabs props use `pt.panels.root` and `pt.panel.root`. Nested section
objects use `closeButton`, `chip`, `item`, `filter`, `inputText`, `prevButton` and
`nextButton` instead of their `pc*` spellings. For example:

```ts
// Before: pt: { datatable: { root: attrs }, dialog: { pcCloseButton: { root: attrs } } }
app.use(WlConfig, {
  pt: { table: { root: attrs }, dialog: { closeButton: { root: attrs } } }
});
```

`iconButton` no longer inherits `button` overrides. Move shared action styles
explicitly to both keys when both components should receive them. The order
defaults → application → instance, class/style merging, callback context and
existing `wl-*` CSS classes stay the same. Open PT extension keys remain allowed;
removed aliases have no built-in meaning. Use strict PT types to catch typos.

### Semantic tone, appearance and dismissal

Alert, Badge, Pill and Progress use `tone` with
`neutral | accent | info | success | warning | danger`; remove their `variant`
prop and translate the old values as follows:

| Component | Former variant → tone |
| --- | --- |
| Alert | `info` → `info`, `ok` → `success`, `warn` → `warning`, `err` → `danger` |
| Badge | `accent` → `accent`, `gray` → `neutral`, `success` → `success`, `warn` → `warning`, `danger` → `danger` |
| Pill | `neutral` → `neutral`, `info` → `info`, `ok` → `success`, `warn` → `warning`, `err` → `danger` |
| Progress | `default` → `accent`, `ok` → `success` |

Tag uses `color` for its palette axis; replace `variant` with `color` while
keeping `gray | blue | green | amber | red`. Other strings retain the existing
native color attribute behavior and use the gray appearance.

Button appearance remains `primary | secondary | ghost | link | soft`.
Migrate `danger` to `variant="primary" tone="danger"`, `danger-quiet` to
`variant="ghost" tone="danger"`, and `soft-danger` to
`variant="soft" tone="danger"`. Keep appearance and meaning separate.
The exported `WlAlertVariant`, `WlBadgeVariant`, `WlPillVariant` and
`WlProgressVariant` types are removed; use `WlTone`. `WlTagVariant` becomes
`WlTagColor`.

Dialog, Drawer and Popover accept `dismissible`; replace `dismissable` in
templates, bindings and prop types. Existing Toast severity adapters and helper
methods, and confirmation `confirmDanger`, remain supported. This migration
does not remove those independent service contracts.

### Tooltip imports and action names

`WlTooltip` is now the component. Import `WlTooltipDirective` for directive
registration. Replace component imports and tags named `WlTooltipComponent`:

```ts
import { WlTooltip, WlTooltipDirective } from "gavia-ui";
app.directive("tooltip", WlTooltipDirective);
```

```vue
<WlTooltip content="Changes are saved automatically">
  <WlIconButton icon="save" aria-label="Save" />
</WlTooltip>
```

An `icon` prop on `WlIconButton` now requires a typed accessible-name source:
`ariaLabel`, native `aria-label`/`aria-labelledby`, or an explicitly named
`pt.root`. Without an `icon` prop, a default slot can supply action text and a
custom icon. TypeScript cannot prove the rendered slot text, a referenced DOM
label or a name supplied by global PT. Runtime development warnings remain to
detect empty names and unresolved references. Tooltip text, count and dot
descriptions do not name the action.

The canonical component source/example is `WlTooltip.vue`. Old documentation
query links naming `WlTooltipComponent` are normalized to `WlTooltip`; this URL
compatibility does not restore the removed package export.

<a id="migration-package-assets"></a>
## Package documentation and font assets

The npm archive now contains Gavia Sans WOFF2 web fonts, their licenses, FONTLOG
and face manifest. TTF files and `qa-report.json` remain in the source repository
and are excluded from the npm archive.

Applications importing `gavia-ui/styles/fonts/gavia.css` need no change. If you
previously imported a TTF or QA report through `gavia-ui/fonts/gavia/*`, obtain
it from the repository or the full font download instead. The font page still
builds its archive from repository sources and includes both TTF and WOFF2:
[Gavia Sans download](https://whitewolf06.github.io/gavia-ui/?view=font).
Prepared font ZIP attachments can be published with a GitHub Release after
separate authorization; this change does not publish an attachment.

Root `LICENSE` and `CHANGELOG.md` are canonical. Package LICENSE, changelog and
README are generated during `pnpm run pack` by `prepack` and are not maintained
as tracked copies. Maintainers edit `scripts/templates/package/README.md.tpl`
for the npm README. Package changelog documentation links remain absolute.

The declaration generator normalizes relative type imports to explicit ESM
specifiers, including directory indices and Vue declaration modules. Public
package imports stay the same. Installed-archive Node16/NodeNext checks remain
part of the separately authorized package verification before release.


<a id="migration-0-12-1"></a>
## Upgrading to Gavia UI 0.12.1

This patch updates the public Playground and documentation. Library props,
events, slots, classes, tokens, theme identifiers and import paths are unchanged.
Consumers do not need to update application code or locale configuration.

<a id="migration-0-12-1-playground-preferences"></a>
### Playground preferences

On first visit, the Playground follows the system colour scheme using the
Gavia/Gavia Dark pair and chooses the first supported browser language (EN/RU).
Unsupported languages fall back to English. Manual choices are saved in local
storage; valid `theme` and `lang` URL parameters take priority over saved choices.
`theme=system` keeps the automatic mode, including changes to the OS colour scheme.
The existing five named themes remain available for manual selection.

<a id="migration-0-12-1-documentation-navigation"></a>
### Documentation navigation

The four home metrics link to components, icons, tokens and themes. Components
are sorted by name within their existing groups. The documentation sidebar has
a local search by component name and description, with clear and empty states;
the same catalogue is used on desktop and mobile.


<a id="migration-0-12-0"></a>
## Upgrading to Gavia UI 0.12.0

0.12.0 adds an optional English locale and bilingual Playground documentation.
Existing applications keep the Russian UI defaults. Public component names,
props, events, slots, classes, tokens and import paths are preserved.

<a id="migration-0-12-0-update"></a>
### Update

```bash
pnpm add gavia-ui@0.12.0
```

Keep the existing explicit imports for styles and themes.

<a id="migration-0-12-0-optional-english-locale"></a>
### Optional English locale

```ts
import { WlConfig, wlLocaleEn } from "gavia-ui";

app.use(WlConfig, { locale: wlLocaleEn });
```

The locale covers default control labels, empty states, calendar navigation,
upload feedback and other built-in messages. Explicit component text props
keep priority over locale defaults. Partial custom locales remain supported;
missing fields fall back to the configured base locale. The existing
`WlResolvedLocale` type keeps the added control fields optional so older custom
locale objects remain valid.

See [localization](guide/localization.md) for locale configuration and text overrides.
The library does not require vue-i18n; that dependency belongs only to Playground.

<a id="migration-0-12-0-documentation-and-playground"></a>
### Documentation and Playground

Repository Markdown is now maintained in English. Playground has English and
Russian content, with English as the default. Use `lang=en` or `lang=ru` in a
Playground URL; switching language preserves the selected theme, route and anchor.

The header fits navigation into a More menu when space runs out. On mobile,
search and theme selection use centered icon controls, EN/RU stays compact,
and the navigation button appears at the far right.

Page titles, descriptions, social metadata, canonical and alternate links,
structured data and a sitemap are included. Playground remains a static SPA;
metadata updates in the browser and does not provide server-rendered pages.


<a id="migration-0-11-1"></a>
## Upgrade to Gavia UI 0.11.1

0.11.1 is a patch release with styling and documentation fixes.
Props, events, slots, public class/token names and import paths are preserved.
Type changes from 0.11.0 are described in the [0.11.0 migration](migration.md#migration-0-11-0).

<a id="migration-0-11-1-update"></a>
### Update

```bash
pnpm add gavia-ui@0.11.1
```

After upgrading, import styles and themes the same way. These fixes belong
to the library CSS; no application overrides are required.

<a id="migration-0-11-1-styling"></a>
### Styling

- Breadcrumb separators have equal spacing on both sides.
- WlPill aligns text with the dot and takes its content width.
  For a full-width label, set `style="width: 100%"` explicitly.
- The main accent in light Gavia changed to `#3c7490`; hover is `#376b84`
  and active is `#326179`. Accent text and links use `#326179`
  to keep readable contrast on soft selected surfaces.
  Use `--wl-text-accent` for custom links and `--wl-action-primary-*`
  for primary actions. Gavia Dark and other themes retain their palettes.

Playground and documentation copy was revised. Saved documentation section links
open with the requested section scrolled into view.


<a id="migration-0-11-0"></a>
## Upgrade to Gavia UI 0.11.0

Gavia UI 0.11.0 is published to npm. Types are more precise, so upgrading
may require code changes. Check models, handlers and slots
against the examples below.

<a id="migration-0-11-0-breaking-changes-linked-models-and-collections"></a>
### Breaking changes: linked models and collections

Vue 3.4+ and TypeScript 5.4+ are required: declarations use built-in NoInfer.
Classes, CSS tokens, theme paths and component names are preserved. Styles remain
explicit imports. Do not hide model errors by casting to any.

<a id="migration-0-11-0-select-and-multiselect"></a>
#### Select and MultiSelect

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

<a id="migration-0-11-0-autocomplete"></a>
#### Autocomplete

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

<a id="migration-0-11-0-datepicker-range-mode"></a>
#### DatePicker: range mode

Previously, an explicit range generic allowed omission of selectionMode, although
a generic cannot switch runtime behavior. Range now requires
the actual prop. Specify the mode for a WlDateRange | null model:

```vue
<WlDatePicker v-model="range" selection-mode="range" />
```

DatePicker models, handlers and slots retain their types. Without range,
the component still uses single mode; an explicit type must match the mode.

<a id="migration-0-11-0-table"></a>
#### Table

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

<a id="migration-0-11-0-navigation-and-events"></a>
#### Navigation and events

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

<a id="migration-0-11-0-pt-sections-and-extensions"></a>
#### pt sections and extensions

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

<a id="migration-0-11-0-modifiers-dom-attributes-and-refs"></a>
#### Modifiers, DOM attributes and refs

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

<a id="migration-0-11-0-behavior-fixes"></a>
### Behavior fixes

Disabled blocks selection through open lists/chips and delayed handlers.
Single FileUpload accepts one file; a rejected replacement preserves the previous selection.
NaN/Infinity and invalid numeric bounds are normalized before CSS/ARIA output.
Locale accepts partial readonly configuration, ignoring invalid known fields.
Teleport attrs reach the existing DOM root; FilterBar uses an SSR id.
Toast/Confirm gained targeted group helpers; existing Confirm close()
remains global. These changes are listed in the [changelog](../CHANGELOG.md).

<a id="migration-0-11-0-compatibility-checks"></a>
### Compatibility checks

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
[quality and compatibility](maintainers/quality.md#checking-new-public-contracts).


<a id="migration-0-10-0"></a>
## Upgrade to Gavia UI 0.10.0

Version 0.10.0 adds a fifth theme, Gavia Dark, and renames White and Graphite
to Classic and Classic Dark. It updates compatibility and quality checks,
the playground and narrow alert layouts. Publication and check results
are recorded in the [release history](maintainers/releases.md).

<a id="migration-0-10-0-breaking-changes-theme-catalog-types"></a>
### Breaking changes: theme catalog types

`wlDesignThemes` is a public readonly tuple. In 0.10.0 it has five entries
instead of four; literal labels `"White"` / `"Graphite"` changed to `"Classic"` /
`"Classic Dark"`. Code relying on the exact tuple length, an old label type or
using a label as an identifier needs changes. Add `gavia-dark` to exhaustive
`WlThemeName` branches.

Identifiers `white` / `graphite`, previous CSS paths and the four themes’ positions
are preserved. Gavia Dark is appended to the public catalog; playground grouping
does not change its order. Select themes through `name` and
use `label` for display:

```ts
import { wlDesignThemes, type WlDesignTheme, type WlThemeName } from "gavia-ui";

const themes: readonly WlDesignTheme[] = wlDesignThemes;
const selectedTheme: WlThemeName = "gavia-dark";
const selected = themes.find((theme) => theme.name === selectedTheme);
```

[Detailed catalog migration](migration.md#migration-themes). Old query links and drafts
using `white` / `graphite` need no renaming. Historical
contract snapshots are preserved.

<a id="migration-0-10-0-installation-and-setup"></a>
### Installation and setup

Vue `^3.4.0` remains the only required peer. The UI kit has no
runtime dependencies; setup needs neither PrimeVue nor PrimeIcons. The consumer’s
package manager does not change the API:

```bash
pnpm add gavia-ui@0.10.0 vue
# or
npm install gavia-ui@0.10.0 vue
# or
bun add gavia-ui@0.10.0 vue
```

Reset, CSS and fonts are imported explicitly. To switch among all five themes:

```ts
import { createApp } from "vue";
import App from "./App.vue";
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/themes/white.css";
import "gavia-ui/themes/graphite.css";
import "gavia-ui/themes/newspaper.css";
import "gavia-ui/themes/gavia.css";
import "gavia-ui/themes/gavia-dark.css";

document.documentElement.dataset.wlTheme = "gavia";
createApp(App).mount("#app");
```

| Theme | `data-wl-theme` | Package CSS |
| --- | --- | --- |
| Gavia | `gavia` | `gavia-ui/themes/gavia.css` |
| Gavia Dark | `gavia-dark` | `gavia-ui/themes/gavia-dark.css` |
| Classic, formerly White | `white` | `gavia-ui/themes/white.css` |
| Classic Dark, formerly Graphite | `graphite` | `gavia-ui/themes/graphite.css` |
| Newspaper | `newspaper` | `gavia-ui/themes/newspaper.css` |

For one theme, its CSS is enough. With several themes, import `white.css`
first: it sets a `:root` fallback. Selection on `html` also applies to
teleported overlays. Without explicit selection, the library keeps Classic
(`white`); `resolveWlToken` / `getWlThemeTokens` defaults are also preserved.

Primary Gavia / Gavia Dark themes use Gavia Sans 0.6 and shared geometry;
without `styles/fonts/gavia.css`, a system fallback applies. Classic / Classic Dark
keep system sans; Newspaper uses system text and serif headings.
Code uses the monospaced `--wl-mono` stack. [Font](guide/font-gavia.md) ·
[Palette and setup](guide/theming.md).

<a id="migration-0-10-0-fixes-and-quality"></a>
### Fixes and quality

- Refined Vue 3.4 support in declarations and SSR ids; Vue 3.5
  uses native ids. Vue 3.4 requires matching synchronous SSR tree order
  and hydration; asynchronous branches are not separately guaranteed.
- Select, MultiSelect and Autocomplete received list names and ARIA connections.
  WlAlert wraps actions within the available width while keeping text readable.
- The playground shows primary/additional themes, a day/night hero,
  a quick toggle and external information-card links. View Transitions
  provides one temporary page transition; the fallback uses hero crossfade,
  and `prefers-reduced-motion` disables transitions.
- “Quality and compatibility” shows actual unit tests,
  coverage, time, version and measurement source. These metrics do not replace
  browser/visual/axe results or publication confirmation.
- The release process checks the previous TypeScript/CSS/pt contract,
  installed archive, Node import, SSR/hydration, size and coverage;
  Changesets prepares versions, and CI retains tag-release previews.

After upgrading, check themes and custom overrides, fonts, ARIA/focus,
overlays and narrow alerts in your app. For SSR, insert
`context.teleports.body` before the app root; details and limitations:
[compatibility and checks](maintainers/quality.md). [Release changes](../CHANGELOG.md).


<a id="migration-0-9"></a>
## Gavia UI 0.9: font and new theme

Update the dependency to published version 0.9.1:

```bash
pnpm add gavia-ui@0.9.1 vue
```

Wl component names, CSS classes, tokens and import paths are preserved.
Vue is the only required peer; there are no runtime dependencies.
White remains this release’s base theme. For Gavia, import CSS
and choose the theme explicitly:

```ts
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/styles/primitives.css";
import "gavia-ui/themes/gavia.css";

document.documentElement.dataset.wlTheme = "gavia";
```

Gavia Sans changes typography only in Gavia. For White, Graphite or
Newspaper, keep the corresponding theme import and data-wl-theme.
Font CSS is not imported automatically from JavaScript. Gavia
also selects precise rendering through new `--wl-type-text-rendering`
(based on `--wl-font-text-rendering`); other theme settings are preserved.
The previous Gavia CSS family remains an alias for Gavia Sans; paths
gavia-ui/styles/fonts/gavia.css and gavia-ui/fonts/gavia/* are preserved.
Font files use the separate SIL OFL 1.1 license; UI kit code uses MIT.

WlDatePicker retains its default YYYY-MM-DD|null string model.
For new selectionMode="range", use WlDateRange
([start, end|null]) and do not pass a range into single mode.

[Font setup](guide/font-gavia.md) · [Changelog](../CHANGELOG.md) ·
[Publication checks](maintainers/releases.md)

<a id="migration-0-9-subsequent-compatible-09x-fixes"></a>
### Subsequent compatible 0.9.x fixes

New semantic tokens --wl-text-accent/--wl-text-accent-hover separate text color
from the primary button background. If you override a custom palette, check
their contrast on bg/bg-raised/accent-soft; previous token names are preserved.
Graphite accent text is lighter for readability on soft surfaces.
Styling through --wl-accent still applies to background accents.


<a id="migration-0-8"></a>
## Gavia UI 0.8: completing the replacement of external controls

Version 0.8.1 was published to npm on 2026-10-06 (Moscow). Version 0.8.0 was not
published to npm; upgrade directly from 0.7.1 to 0.8.1. The exact version,
integrity and installed archive in a Vue consumer were verified:
[confirmed release](maintainers/release-history.md#release-081).
Existing Wl* models, classes, CSS tokens and defaults are preserved.

```bash
pnpm add gavia-ui@0.8.1 vue
```

<a id="migration-0-8-time-and-dates"></a>
### Time and dates

`WlTimePicker` uses local `HH:mm | null` time without Date,
seconds or a time zone. Its control is native `input type="time"`;
appearance depends on the browser. `minTime`/`maxTime` use HH:mm, including
overnight ranges (22:00–02:00). Clearing returns null; out-of-range input
does not change the model and resets on blur/Enter. `disabled`, `invalid`,
`size`, `density`, `pt` and native attributes work as with other fields.

```vue
<WlTimePicker v-model="time" id="start-time" min-time="08:00" max-time="18:00" />
```

`WlDatePicker` still stores ISO YYYY-MM-DD. New `displayFormat`
selects display and manual-input parsing: `dd.mm.yyyy` (the previous default)
or `yyyy-mm-dd`. For ISO display, pass a matching placeholder:

```vue
<WlDatePicker v-model="date" display-format="yyyy-mm-dd" placeholder="yyyy-mm-dd" />
```

When adapting Date, use local getFullYear/getMonth/getDate;
`toISOString().slice(0, 10)` may shift the day. Server-side date
and time conversion belongs to the app.

<a id="migration-0-8-file-selection-without-an-internal-list"></a>
### File selection without an internal list

`WlFilePicker` is stateless: it does not store a file list. The `select` event returns File[]
from one selection. `accept` helps the browser filter the picker dialog.
The app controls types, sizes, count, deduplication, previews, uploads and retries.
Cancellation emits no `select` and does not change the app’s list.
The native input resets after the event, allowing the same file to be chosen again.

```vue
<WlFilePicker ref="picker" multiple accept="image/*" @select="receiveFiles" />
```

Ref methods `choose()`/`clear()` are synchronous. Call choose directly
from a click handler: an await before it may lose browser activation.
`clear()` resets only the native input. Replace the button through the
`trigger` slot with `{ choose, clear, disabled, attrs }`; forward attrs to the button
for inherited id/aria/focus handlers. Or hide the component with
`hidden` and call choose from an external button. The native input is always hidden and
tabindex=-1; the app provides the external button’s accessible name.

Existing `WlFileUpload` retains its drop zone, File[] model, limits, reject
and deduplication. It serves a different use case: do not combine it
with application file-accumulation policy when you need only a picker.

<a id="migration-0-8-numbers-and-icons"></a>
### Numbers and icons

`WlNumberInput` keeps the previous min=0/max=99. For an open upper
bound, pass `:max="Infinity"` explicitly; infinite bounds do not appear
in aria-valuemax. Other business limits belong to the app.

`resolveWlIconName` returns a canonical typed name from a known
name or legacy icon string; unknown input returns undefined.
New SVGs are included in the shared generated catalog. Previous shapes and names
are preserved; new SVGs need no CSS or icon fonts.

<a id="migration-0-8-consumer-checks"></a>
### Consumer checks

Check typecheck/build, Date/ISO without day shifts, time clearing, ranges,
numbers above 99, synchronous file selection from a hidden component, cancellation and repeated
selection. Then check application upload/retry/limits, form models,
keyboard/focus, nested overlays, scrolling and icons on desktop/mobile
in every theme you use. Backend contracts need no changes.

`WlInput` always emits a string, including native `type="number"`:
a value of `120` stays a string until the app converts it; clearing yields
an empty string. Use `WlNumberInput` for a numeric model. Native IME composition
is preserved; input updates the model after composition ends.


<a id="migration-0-7"></a>
## Gavia UI 0.7.0: migration to the public name

[gavia-ui@0.7.0](https://www.npmjs.com/package/gavia-ui) was published
on 2026-10-05 (Moscow) as the first release under the new name on public npm.
The [GitHub Pages playground](https://whitewolf06.github.io/gavia-ui/) is published.
Source is in the [personal public repository](https://github.com/whitewolf06/gavia-ui).
Creator and maintainer: [Dmitry Gorbach](https://github.com/whitewolf06).

<a id="migration-0-7-required-package-path-change"></a>
### Required package-path change

`@whitelife-core/ui-kit` and `gavia-ui` are separate packages in different registries.
After the repository move, replace the installed dependency manually.

In the consumer app:

```bash
pnpm remove @whitelife-core/ui-kit
pnpm add gavia-ui@0.7.0 vue
```

Replace the previous identifier in all JS/TS imports, CSS subpaths,
tests and alias settings. Do not keep both libraries
in one app’s dependencies.

```ts
import { WlButton, WlInput, WlConfig, wlLocaleRu } from "gavia-ui";

// Styles remain explicit imports, in the same order.
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/themes/white.css";

// Optional layout and typography primitives.
import "gavia-ui/styles/primitives.css";
```

Remove the old GitHub Packages scope mapping and PAT from app configuration
if other packages do not use them. The new name installs
from `https://registry.npmjs.org` without GitHub authentication.

You can also build an archive from source:

```bash
# In the Gavia UI checkout:
pnpm install
pnpm build
pnpm run pack
# In the consumer app:
pnpm add /absolute/path/to/gavia-ui/packages/ui-kit/gavia-ui-0.7.0.tgz vue
```

<a id="migration-0-7-preserved-contracts"></a>
### Preserved contracts

- Public `Wl*` exports, type names, props, events, models and slots.
- `WlConfig`, `createWlPt`, locale, tooltip, services and composables.
- SVG icon names, `wl-*` classes, `--wl-*` tokens, `data-wl` and `data-size`.
- White, Graphite and Newspaper themes; Vue 3 is the only required peer
  (`^3.4.0`), with no runtime dependencies.
- Explicit CSS imports, `pt` order and motion configuration.

Upgrading from API 0.6.0 needs no additional component configuration.
The design system, PrimeVue removal and previous initialization changes
are described in the [0.6 migration](migration.md#migration-0-6). For a 0.3 consumer,
also follow the [PrimeVue removal guide](migration.md#migration-0-5):
replace PrimeVue `<Column>` with `columns` and `cell-*` slots.

<a id="migration-0-7-documentation-and-diagnostics"></a>
### Documentation and diagnostics

The playground includes “About the project” with author, license and the changelog
from the root source. The published playground is available on
[GitHub Pages](https://whitewolf06.github.io/gavia-ui/?view=project);
the [hosting guide](maintainers/hosting.md) explains its build and updates.

The local browser check variable is `GAVIA_E2E_BASE_URL`.
Catalog diagnostics use Gavia UI. If your app
checks full error strings or uses the old environment variable,
update those checks. See the [name migration](migration.md#migration-gavia).

<a id="migration-0-7-application-checks"></a>
### Application checks

1. Check the lockfile, absence of the previous dependency, typecheck and production build.
2. Check explicit style imports, selected theme and custom tokens.
3. Check forms and models, keyboard, focus, nested overlays and scrolling.
4. Check dates, tables, toasts and confirmations.

Tag `v0.6.0` and its historical commit are preserved. The first manual npm release,
0.7.0, and subsequent OIDC releases are described in [releases.md](maintainers/releases.md).


<a id="migration-0-6"></a>
## Design system 0.6.0: changes and migration

Version 0.6.0 combines PrimeVue removal and the new design system.
Vue 3 remains the only required peer. There are no runtime dependencies.

<a id="migration-0-6-release-contents"></a>
### Release contents

- 51 native Vue components, 47 SVG icons and White, Graphite, Newspaper themes.
- 416 typed tokens with foundation → semantic → component layers,
  one JSON source and reference, contrast and generation checks.
- Optional layout and typography classes in `styles/primitives.css`;
  `design-tokens.json` and exports for reading values without the DOM.
- Copyable SFC examples for every component and six working recipes:
  content list, profile, settings, content card, project wizard
  and attachment upload. Examples are checked in an installed package consumer.
- Optional overlay motion, reduced motion support, stable page width
  during scroll blocking and fixes for focus and overlay layers.
- Contract tests, browser scenarios and 78 visual baselines across three themes
  on desktop/mobile. CI checks the package on Node 18 and 24.

<a id="migration-0-6-upgrade-from-published-03"></a>
### Upgrade from published 0.3

Follow the [PrimeVue removal guide](migration.md#migration-0-5):
move configuration to `WlConfig`, install the services you use
on the Vue app, and replace PrimeVue `<Column>` inside `WlTable`
with `columns` and `cell-*` slots. These initialization changes also apply to 0.6.0.

Public `Wl*` exports, models, props, events, slots, SVG icon names,
`wl-*` classes and previous CSS tokens are preserved. `pt` order:
defaults → app configuration → component instance.

<a id="migration-0-6-upgrade-from-working-05"></a>
### Upgrade from working 0.5

No additional configuration is required. Styles remain
explicit imports. For new layout classes, add:

```ts
import "gavia-ui/styles/primitives.css";
```

The existing 165 CSS tokens keep their names and resolved values in every theme.
For contrast, primary/danger use new `--wl-action-primary-*` and
`--wl-action-danger-*` roles. Hint text uses `--wl-text-muted`;
destructive text uses `--wl-text-danger`; keyboard focus has an explicit ring.
For custom action styling, set background, hover and text together.

Motion is enabled by default. For immediate transitions, use
`app.use(WlConfig, { motion: false })` or local `:motion="false"`.
`prefers-reduced-motion` is respected automatically.

`WlButton` sets focus before the click handler so Dialog/Drawer
return it to the opening button in Safari. `WlFileUpload` errors are announced
through `role="alert"`. Dropdown panels account for their parent’s layer.

<a id="migration-0-6-application-checks-after-upgrading"></a>
### Application checks after upgrading

1. Update to a version with API 0.6. If moving to the new name,
   follow the [Gavia UI migration](migration.md#migration-gavia): the first public npm release
   under the new name is [gavia-ui@0.7.0](https://www.npmjs.com/package/gavia-ui).
2. Check builds, types and the themes you use, including custom action tokens.
3. Check forms, keyboard, overlay opening/closing and focus return,
   page scrolling, dates, tables and toast/confirmation services.
4. Compare dense and narrow screens against the [design system rules](reference/design-system.md).

Examples simulate saves and errors locally. Connect
your app’s API, validation and business rules when adopting them. After upgrading,
check actual screens with their data and assistive technologies;
library automation does not replace that review.


<a id="migration-0-5"></a>
## Upgrade from API 0.3 to 0.5

Version 0.5 preserves Vue 3, public `Wl*` components, their props, events,
slots, `v-model`, `wl-*` classes, tokens, `data-wl`, icon names and shapes.
The package no longer needs PrimeVue or PrimeIcons. Before removing these dependencies,
check whether other application code uses them.

Examples use the current package name; import changes are described
in the [Gavia UI migration guide](migration.md#migration-gavia).

<a id="migration-0-5-application-initialization"></a>
### Application initialization

Previously, Gavia UI received configuration through PrimeVue:

```ts
import PrimeVue from "primevue/config";
import { createWlPt, wlLocaleRu } from "gavia-ui";
app.use(PrimeVue, { unstyled: true, pt: createWlPt(), locale: wlLocaleRu });
```

Gavia UI configuration now goes to `WlConfig`:

```ts
import {
  WlConfig, WlToastService, WlConfirmationService, wlLocaleRu
} from "gavia-ui";

app.use(WlConfig, { locale: wlLocaleRu, pt: {
  button: { root: { "data-test": "app-button" } }
} });
app.use(WlToastService);         // when using WlToast/useWlToast
app.use(WlConfirmationService);  // when using WlConfirmDialog/useWlConfirm
```

`WlConfig` is optional: the Russian locale and standard
`pt` map apply by default. Install services on each Vue app using
their components. Service state is not shared between apps.
Styles remain explicit imports: reset, base, selected theme.

`createWlPt(overrides)` is preserved. Pass global overrides
through `WlConfig.pt`; they apply after standard sections. Instance
`pt` applies last. `class` and `style` merge; other
attributes are replaced. See the section list in [architecture](maintainers/architecture.md#themes-and-public-dom).

<a id="migration-0-5-popup-motion"></a>
### Popup motion

In 0.5, dialogs, drawers, menus, selection panels, toasts and tooltips
animate when opening and closing. To keep the previous immediate
behavior, set `app.use(WlConfig, { motion: false })`. For one
component, use `:motion="false"`; the local value takes priority
over the app setting. For tooltips, use
`v-wl-tooltip="{ value: 'Help', motion: false }"`. The system setting
`prefers-reduced-motion: reduce` shortens transitions.

<a id="migration-0-5-table-columns"></a>
### Table columns

`WlTable` accepts `columns: WlTableColumn[]` and `value`. Override a cell
through `cell-<key>` with `{ row, value }`.

```vue
<WlTable :value="rows" :columns="[
  { key: 'name', label: 'Name' },
  { key: 'amount', label: 'Amount', numeric: true, width: 120 }
]">
  <template #cell-amount="{ value }">{{ formatAmount(value) }}</template>
</WlTable>
```

If your previous markup placed PrimeVue `<Column>` in the default
`WlTable` slot, move their fields to `columns` and body templates to `cell-*`.
This is the only documented consumer markup change
related to PrimeVue. Empty `columns` preserves the default slot for arbitrary
content, but no longer builds a table from `<Column>`.

<a id="migration-0-5-consumer-checks"></a>
### Consumer checks

<a id="migration-0-5-design-system"></a>
#### Design system

All previous CSS token names and resolved values are preserved. Added
a typed catalog, `design-tokens.json` and optional
`styles/primitives.css`; import the latter explicitly. Primary/danger
buttons use new `--wl-action-primary-*` / `--wl-action-danger-*`
roles for contrast. Their text is dark in Graphite; danger in White
uses a darker surface. Error text and quiet destructive actions
use `--wl-text-danger`; keyboard focus has an explicit ring.
Field hints, table headings/empty state and `WlEmpty` descriptions
use `--wl-text-muted` for readable contrast.
When overriding action colors, set bg/hover/text together. Existing dimensions
and public component contracts are preserved. Full rules:
[design-system.md](reference/design-system.md).

1. Update the configuration import and install the services you use.
2. Replace `<Column>` inside `WlTable` with `columns`/`cell-*`.
3. If your app uses PrimeVue or PrimeIcons independently, keep those
   dependencies for that code; Gavia UI no longer imports them.
4. Build the app; check keyboard and focus in dropdowns and
   modals, date selection, tables, toasts and all themes you use.

The basic public contracts of 51 components are checked against the manifest;
the 0.5 archive is also built in an isolated Vue consumer.

<a id="migration-0-5-design-system-examples"></a>
### Design system examples

The public component API is preserved. The playground adds copyable Vue examples
for every component and six working recipes. Example code is checked against
the package archive. WlFileUpload errors also receive `role="alert"` for
screen reader announcements; existing events, models and list markup are preserved.
Positioned overlays account for their parent control’s layer. This fixes
selection inside a mobile filter panel without changing public props.
WlButton sets focus before the click handler, including in Safari,
so Dialog/Drawer closing returns focus to the opening button. Programmatic
props, events and disabled/loading blocking are preserved.


<a id="baseline-0-3"></a>
## Baseline before removing PrimeVue

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


<a id="migration-gavia"></a>
## Migration to Gavia UI

Gavia UI is a component library and design system for Vue 3.
Repository: `https://github.com/whitewolf06/gavia-ui`.
The first package, [gavia-ui@0.7.0](https://www.npmjs.com/package/gavia-ui), was published
to public npm on 2026-10-05 (Moscow).
The new-name upgrade is described in the [0.7 migration](migration.md#migration-0-7);
documentation is available on [GitHub Pages](https://whitewolf06.github.io/gavia-ui/).

<a id="migration-gavia-updating-the-npm-dependency"></a>
### Updating the npm dependency

1. Remove the previous library dependency from the app and add `gavia-ui`.
2. Replace the previous package identifier in imports with `gavia-ui`:
   component and type names are preserved.
3. Update CSS subpaths the same way.
4. Remove the previous scope mapping and GitHub PAT for this package
   if other GitHub Packages dependencies do not need them.

```bash
# Remove the previous dependency with pnpm remove <package-name> first.
pnpm add gavia-ui@0.7.0 vue
```

```ts
import { WlButton, WlConfig } from "gavia-ui";
import "gavia-ui/styles/base.css";
```

`Wl*` components, props, events, models, slots, `WlConfig`, services,
`createWlPt`, SVG icon names, `wl-*` classes, `--wl-*` CSS tokens,
`data-wl`, `data-size` and theme keys are preserved. Application setup,
`pt` merging, motion and explicit CSS imports do not change.

Old published versions belong to the previous GitHub Packages scope.
Moving a repository does not rename a package or automatically make it
public. Installation still requires GitHub authentication; after the move,
check access to the previous package separately. Existing tags
retain their original commits and are not moved.

<a id="migration-gavia-tool-and-diagnostic-names"></a>
### Tool and diagnostic names

The local running-preview check variable is `GAVIA_E2E_BASE_URL`.
Update it in your browser-test commands.

Catalog errors use `Unknown Gavia UI token`,
`Unknown Gavia UI theme` and `Circular Gavia UI token` with the token or theme name.
Error types and triggering conditions are preserved. If your app checked
the full error text, update that check.

<a id="migration-gavia-from-earlier-versions"></a>
### From earlier versions

Initialization and PrimeVue Column changes are described in
the [migration from 0.3](migration.md#migration-0-5); design system features are
in the [0.6 migration](migration.md#migration-0-6). Apply these as well if your consumer
still uses a pre-0.6 version. Examples use the current `gavia-ui` path;
migrate behavior and the package identifier together.

<a id="migration-gavia-consumer-checks"></a>
### Consumer checks

Check TypeScript, production build, themes and local tokens.
Check form models, keyboard, focus return, nested overlays,
scrolling, dates, tables and toasts. The app supplies the Vue 3 peer;
no other UI packages are required.

<a id="migration-gavia-typeface-name"></a>
### Typeface name

The font is **Gavia Sans**, the theme is **Gavia**, and the package is **Gavia UI**. New styles use `font-family: "Gavia Sans", sans-serif`. Public paths `gavia-ui/styles/fonts/gavia.css` and `gavia-ui/fonts/gavia/*` are preserved; the previous CSS name `Gavia` is registered as a compatibility alias. Internal TTF/WOFF2 names changed to Gavia Sans without changing outlines, metrics or kerning. Standalone download: `Gavia-Sans-0.6.zip`.


<a id="migration-themes"></a>
## Theme names and Gavia Dark

Gavia Dark and new Classic / Classic Dark labels were added in 0.10.0.
Existing four-theme setup continues to work when upgrading from 0.9.1.
[Upgrade guide for 0.10.0](migration.md#migration-0-10-0).

<a id="migration-themes-names-and-identifiers"></a>
### Names and identifiers

| UI and catalog label | `data-wl-theme`, `WlThemeName` | CSS import |
| --- | --- | --- |
| Gavia | `gavia` | `gavia-ui/themes/gavia.css` |
| Gavia Dark | `gavia-dark` | `gavia-ui/themes/gavia-dark.css` |
| Classic, formerly White | `white` | `gavia-ui/themes/white.css` |
| Classic Dark, formerly Graphite | `graphite` | `gavia-ui/themes/graphite.css` |
| Newspaper | `newspaper` | `gavia-ui/themes/newspaper.css` |

Classic / Classic Dark are display names. Identifiers
`white` / `graphite`, CSS paths, `theme=white` / `theme=graphite` parameters,
token values and existing catalog order are preserved.
Do not replace identifiers with `classic` / `classic-dark`.
Library base values and default `resolveWlToken` /
`getWlThemeTokens` arguments remain Classic (`white`); the playground defaults to Gavia.

<a id="migration-themes-catalog-and-types"></a>
### Catalog and types

`wlDesignThemes` gained a fifth entry, Gavia Dark, with `name: "gavia-dark"`.
The public readonly tuple grew from four to five entries; literal labels
`"White"` / `"Graphite"` changed to `"Classic"` / `"Classic Dark"`.
Code fixing the old tuple length or exact old label type needs changes.
Preserved identifiers do not guarantee compatibility of such inferred types.
Historical contract snapshots are not rewritten to make a check pass.

Use `WlDesignTheme` / `WlThemeName` and `name` to select a theme,
and `label` for display. Do not tie business logic to a label or index:

```ts
import { wlDesignThemes, type WlDesignTheme, type WlThemeName } from "gavia-ui";

const themes: readonly WlDesignTheme[] = wlDesignThemes;
const selectedTheme: WlThemeName = "gavia-dark";
const selected = themes.find((theme) => theme.name === selectedTheme);
```

<a id="migration-themes-gavia-dark-setup"></a>
### Gavia Dark setup

```ts
import "gavia-ui/styles/reset.css";
import "gavia-ui/styles/fonts/gavia.css";
import "gavia-ui/styles/base.css";
import "gavia-ui/themes/gavia-dark.css";

document.documentElement.dataset.wlTheme = "gavia-dark";
```

Both Gavia themes use Gavia Sans. Classic, Classic Dark and Newspaper
retain their typography. Without font CSS, both Gavia themes use a system
fallback; library JavaScript does not load CSS automatically.

To switch among all five themes, import `themes/white.css` first, then
`themes/graphite.css`, `themes/newspaper.css`, `themes/gavia.css` and
`themes/gavia-dark.css`. Select the theme on `html` so teleported overlays
inherit it. Previous URLs and saved drafts using `white` / `graphite`
need no renaming.

Before upgrading, check selection of all five themes, `theme` links, contrast, fonts,
control states and open overlays. [Themes](guide/theming.md) ·
[catalog and tokens](reference/design-system.md#themes-and-compatibility) · [check methodology](maintainers/quality.md).

