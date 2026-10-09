# Upgrade from API 0.3 to 0.5

Version 0.5 preserves Vue 3, public `Wl*` components, their props, events,
slots, `v-model`, `wl-*` classes, tokens, `data-wl`, icon names and shapes.
The package no longer needs PrimeVue or PrimeIcons. Before removing these dependencies,
check whether other application code uses them.

Examples use the current package name; import changes are described
in the [Gavia UI migration guide](migration-gavia.md).

## Application initialization

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
attributes are replaced. See the section list in [architecture](architecture.md#themes-and-public-dom).

## Popup motion

In 0.5, dialogs, drawers, menus, selection panels, toasts and tooltips
animate when opening and closing. To keep the previous immediate
behavior, set `app.use(WlConfig, { motion: false })`. For one
component, use `:motion="false"`; the local value takes priority
over the app setting. For tooltips, use
`v-wl-tooltip="{ value: 'Help', motion: false }"`. The system setting
`prefers-reduced-motion: reduce` shortens transitions.

## Table columns

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

## Consumer checks

### Design system

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
[design-system.md](design-system.md).

1. Update the configuration import and install the services you use.
2. Replace `<Column>` inside `WlTable` with `columns`/`cell-*`.
3. If your app uses PrimeVue or PrimeIcons independently, keep those
   dependencies for that code; Gavia UI no longer imports them.
4. Build the app; check keyboard and focus in dropdowns and
   modals, date selection, tables, toasts and all themes you use.

The basic public contracts of 51 components are checked against the manifest;
the 0.5 archive is also built in an isolated Vue consumer.

## Design system examples

The public component API is preserved. The playground adds copyable Vue examples
for every component and six working recipes. Example code is checked against
the package archive. WlFileUpload errors also receive `role="alert"` for
screen reader announcements; existing events, models and list markup are preserved.
Positioned overlays account for their parent control’s layer. This fixes
selection inside a mobile filter panel without changing public props.
WlButton sets focus before the click handler, including in Safari,
so Dialog/Drawer closing returns focus to the opening button. Programmatic
props, events and disabled/loading blocking are preserved.
