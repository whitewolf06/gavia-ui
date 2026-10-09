# Gavia UI 0.8: completing the replacement of external controls

Version 0.8.1 was published to npm on 2026-10-06 (Moscow). Version 0.8.0 was not
published to npm; upgrade directly from 0.7.1 to 0.8.1. The exact version,
integrity and installed archive in a Vue consumer were verified:
[confirmed release](releases.md#release-081).
Existing Wl* models, classes, CSS tokens and defaults are preserved.

```bash
pnpm add gavia-ui@0.8.1 vue
```

## Time and dates

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

## File selection without an internal list

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

## Numbers and icons

`WlNumberInput` keeps the previous min=0/max=99. For an open upper
bound, pass `:max="Infinity"` explicitly; infinite bounds do not appear
in aria-valuemax. Other business limits belong to the app.

`resolveWlIconName` returns a canonical typed name from a known
name or legacy icon string; unknown input returns undefined.
New SVGs are included in the shared generated catalog. Previous shapes and names
are preserved; new SVGs need no CSS or icon fonts.

## Consumer checks

Check typecheck/build, Date/ISO without day shifts, time clearing, ranges,
numbers above 99, synchronous file selection from a hidden component, cancellation and repeated
selection. Then check application upload/retry/limits, form models,
keyboard/focus, nested overlays, scrolling and icons on desktop/mobile
in every theme you use. Backend contracts need no changes.

`WlInput` always emits a string, including native `type="number"`:
a value of `120` stays a string until the app converts it; clearing yields
an empty string. Use `WlNumberInput` for a numeric model. Native IME composition
is preserved; input updates the model after composition ends.
