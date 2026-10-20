# Review implementation: 0.x compatibility

This change set is under development. Code checks, release verification and
publication are recorded separately in [the execution ledger](../review/IMPLEMENTATION.md).
No release or publication is implied by these notes.

Vue `^3.4.0` remains the peer contract. The root-scoped ID allocator works on
Vue 3.4 and 3.5; IDs are opaque and must not be persisted or used as business keys.
Tabs now create instance-specific tab/panel pairs. Consumers using old generated
tab IDs should use the component's public model and native ARIA relationships.

## Notifications and confirmation

Use `show(summary, options)` with a semantic `tone`. The existing
`ok/info/warn/err(summary, detail?)` calls remain valid, and
`success/warning/error` aliases accept options and return a message ID:

```ts
const toast = useWlToast();
const id = toast.show("Saving", { tone: "accent", life: 0 });
toast.update(id, { summary: "Saved", tone: "success", life: 5000 });
toast.dismiss(id);
const result = await useWlConfirm().confirm({ message: "Continue?" });
```

An explicit tone takes precedence over the helper name or legacy `severity`.
Legacy messages without tone remain accepted. Their severity maps to the matching
tone; neutral/accent project to `severity: "info"` for existing slots and adapters.
Explicit legacy severity calls warn once per application in development. Toast PT
message/icon callbacks receive resolved `tone`, legacy `severity` and message `id`.

Toast defaults are 5 seconds, or 8 seconds for danger. Use `life: 0` for sticky
messages. Hover/focus pause independently; each host limits its group to five
messages by default. The outer region no longer announces the same content twice:
individual messages own `status`/`alert`. Keep one host per displayed group.
`toast.promise()` preserves the promise result or rejection and updates one ID;
dismissing that ID prevents its later reappearance. Settlement starts the configured
terminal lifetime even when loading and result use the same tone. An explicit
terminal `life: 0` keeps the result sticky.

Confirm retains accept/reject callbacks and also resolves to a boolean. Closing,
replacement and unmount resolve false without invoking a rejection callback;
explicit user rejection retains the callback. Hosts can customize message/footer slots.
Use `confirm({ message: "Delete?", tone: "danger" })` for a destructive action.
Confirmation requests accept every `WlTone`; omitted tone keeps the normal accent
action. `confirmDanger(options)` remains a danger alias, and an explicit
`options.tone` takes precedence. Consumer-provided store entries may retain their
existing `danger` flag: it supplies the appearance only when `tone` is omitted.
The dialog and action expose `data-tone`; confirmation PT callbacks receive the
resolved `context.tone` and `context.danger` without changing section names.

Existing consumer implementations of `WlToastApi` and `WlConfirmApi` retain their
released callback signatures. The installed helpers return the richer
`WlToastController` and `WlConfirmController` types, with message IDs and Promise
results. Prefer inferred helper returns, or annotate the controller when using
these additions; old adapters do not have to implement the new methods.

## Lists, fields and live messages

Options support typed slots, `optionKey` and `optionDisabled`. Select and single
Autocomplete support `clearable`. A pointer click now emits one selection.
Forward `field.labelId` to `aria-labelledby` for a control whose native element
does not receive its name through `label[for]`. Field renders hint and error
together; forward the entire `field.ariaDescribedby` string. `announceError` opts
into live validation. Alert's information/success messages use status; warnings
and errors use alert. `live="off"` renders a static message.

`selectedItems` accepts either its released string template or plural forms with
an `other` entry. Existing FileUpload decimal/unit overrides remain effective in
0.x through the shared `formatWlBytes` formatter, retaining binary 1024 steps,
rounding and the megabyte cap. Existing two-argument calls still use Intl labels;
the optional third argument adds explicit labels, decimal/grouping/precision
overrides and a unit cap. Fractional FileUpload limits below 1024 bytes keep their
released raw decimal text independently of the locale decimal override.
See [pure utilities](guide/utilities.md). The default locale remains
Russian until the separately versioned 1.0 migration.

## Stable tables and routing

Supply a stable `rowKey` before enabling table selection or rearranging stateful
rows. The released index fallback remains available. `sort` is controlled;
without `sortFn` the component emits changes and leaves row ordering to the app.
Selection stores row keys and preserves keys outside the current page.

Install `WlConfig` with `linkComponent: RouterLink` for location objects. `WlLink`
uses the router's custom slot contract; no router becomes a library dependency.
String `to` values fall back to native hrefs; location objects need an adapter.
Modified clicks and native external links retain browser behavior.

## Semantic tone and overlay aliases

Use `tone: neutral | accent | info | success | warning | danger` for semantic
color. Existing status variants remain aliases in 0.x and warn when explicitly
used in development. Shape/appearance stays a separate component variant.
Use `dismissible`; the released `dismissable` spelling remains an alias until 1.0.

All overlays participate in one stack. Modal backgrounds become inert, including
inline surfaces, while descendant portals retain their ownership and focus.
Consumer-owned inert attributes survive closing the modal.

## New entry points

`gavia-ui/utils` supplies pure Intl, color, date, number and attrs functions and
does not depend on Vue or DOM. `gavia-ui/composables` supplies Vue-dependent
theme, disclosure, clipboard, keyboard, live-region, list and overlay helpers.
Use `useWlOverlay` for one combined custom overlay lifecycle; focus and dismissal
wrappers are alternatives for narrower needs, not simultaneous registrations
for the same panel. Styles continue to require explicit CSS imports.

The early theme script supports light/dark/system preferences and storage blocked
by the browser. It selects tokens only; applications still import the two theme
CSS files. Default component behavior remains SSR-safe.

## Canonical pass-through names

Application configuration accepts `table`, `input`, `switch`, `segmented`,
`pagination`, `progress`, `radio`, `breadcrumbs` and `tabs`. The released
`datatable`, `inputtext`, `toggleswitch`, `selectbutton`, `paginator`, `progressbar`,
`radiobutton`, `breadcrumb`, `tablist`/`tabpanels`/`tabpanel` keys remain aliases.
For Tabs, use `tabs.panels.root` and `tabs.panel.root`; local props use
`pt.panels.root` and `pt.panel.root`.

Nested canonical names are `closeButton`, `chip`, `item`, `filter`, `inputText`,
`prevButton` and `nextButton`; their `pc*` spellings remain accepted. Within each
layer canonical attributes follow legacy attributes; instance settings follow
application settings. Class/style merge. Explicit legacy overrides warn once in
development; generated defaults stay silent. Remove aliases only in the 1.0
migration after a released deprecation period.

## Documentation paths and new controls

English pages use `/docs/…`; Russian pages use `/ru/docs/…` below the deployment
base. Existing `?view=…&component=…`, `section` and `lang` links still resolve and
normalize to paths. Query theme preferences and anchors remain supported.
Prerendering is a separate production-browser operation after `build:pages`;
authored routes and crawler resources do not establish deployment evidence.

`WlTooltip` remains the released directive in 0.x. Use `WlTooltipComponent` for
the new controlled hover/focus component, or the explicit `WlTooltipDirective`
alias when registering directives. At 1.0 the component can take `WlTooltip`
after the documented import migration.

Checkbox without `value` retains its boolean model. Supplying `value` opts into
the array model; CheckboxGroup/RadioGroup are labelled fieldsets. TagsInput
models strings; checked menu item state remains owned by the application.
DatePicker remains Gregorian ISO date-only; disabled dates validate range
endpoints. TimePicker models wall-clock `HH:mm[:ss]`; `hourFormat="auto"` keeps
the native browser presentation. Datetime composition is a post-1.0 task.

## Packaging and release evidence

Package README/LICENSE/CHANGELOG copies are generated during prepack from canonical
root documents. npm includes web fonts and their notices; desktop font ZIPs are
prepared separately. Node16/NodeNext declaration rewriting is implemented, but
actual built declarations, consumer checks, publint and attw still require the
separate release verification command. The same applies to bundle measurements,
five-theme browser/visual checks and NVDA/VoiceOver acceptance.
