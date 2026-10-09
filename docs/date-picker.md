# DatePicker: a single date and a range

WlDatePicker selects one date or a period. This guide covers the model format,
manual input, date limits and keyboard interaction.

## Single date

`selectionMode` defaults to `single`. The existing `string | null` model
is preserved: an ISO `YYYY-MM-DD` value or no date.
The `dd.mm.yyyy` display does not change the model format.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { WlDatePicker } from "gavia-ui";
const date = ref<string | null>("2026-10-15");
</script>
<template>
  <WlDatePicker v-model="date" show-icon aria-label="Meeting date" />
</template>
```

## Start and end

With `selectionMode="range"`, the model is `WlDateRange | null`.
`WlDateRange` is an ISO-date tuple `[string, string | null]`.
Two inputs with `startLabel`/`endLabel` labels share one calendar panel.
The compatibility fallback uses Russian labels “От” and “До”.
Configure the English preset explicitly or pass labels as in this example.
See [localization](localization.md) for preset availability and setup.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { WlDatePicker, type WlDateRange } from "gavia-ui";
const period = ref<WlDateRange | null>(["2026-10-10", "2026-10-20"]);
</script>
<template>
  <WlDatePicker v-model="period" selection-mode="range" show-icon
    min-date="2026-10-01" max-date="2026-10-31"
    start-label="Start" end-label="End" aria-label="Trip period" />
</template>
```

1. The first calendar selection sets `[start, null]` and keeps the panel open.
2. The second completes the range and closes the panel. Dates selected in reverse
   order are sorted from earlier to later.
3. The next selection begins a new range. Intermediate days are highlighted.
4. Until the range is complete, the application may show instructions or prevent
   form submission. The component does not send business requests.

Change the model when switching `selectionMode`: pass a string for a single
date and a tuple for a range. The Docs example shows both modes.

## Manual input and clearing

`displayFormat` selects both display and parser: `dd.mm.yyyy` or `yyyy-mm-dd`.
`minDate`/`maxDate` include boundary days and constrain both ends of a range.
Empty or invalid bounds do not constrain selection.
Invalid or out-of-bounds input does not change the model;
blur/Enter restores the accepted value.

An empty start input clears the range to `null`. An empty end input returns
`[start, null]`. To remove both dates from the application, set the model to `null`.

## Focus and accessibility

- The focus ring covers the composite input and calendar button.
  `invalid` uses the theme’s error color and border tokens.
- Start and end inputs have separate labels and unique IDs.
  The supplied `id` belongs to the start; the second input gets an `-end` suffix.
  Native `name` uses the same suffix; `aria-describedby` is shared.
- ArrowDown opens the calendar; arrows move the date, Home/End move to week
  boundaries, PageUp/PageDown change the month, and Shift with those keys changes
  the year. Enter/Space select a day; Escape closes the calendar and restores focus.
- `disabled` blocks input and selection; native `readonly` prevents manual input
  while preserving calendar selection.
- Internal elements are configurable through `pt`;
  the API tab lists the implemented sections.

Import styles explicitly. Applications convert dates and time zones:
`toISOString().slice(0, 10)` may shift a local calendar day.
