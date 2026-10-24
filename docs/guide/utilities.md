# Pure utilities

Import pure helpers from `gavia-ui/utils`. They do not access Vue, the DOM,
storage or browser globals and can be used during SSR.

## Stable colors from names

`getWlColorFromString(name, palette?)` selects a color from an ordered palette.
It trims surrounding whitespace, normalizes the name to NFC and hashes Unicode
code points with 32-bit FNV-1a. The mapping is case-sensitive. The same name and
palette produce the same result on the server and client.

```ts
import {
  getWlColorFromString, WL_STRING_COLOR_PALETTE,
  type WlColorPalette
} from "gavia-ui/utils";

const outline = getWlColorFromString("Anna Mikhailova");
const brandColors: WlColorPalette<"coral" | "indigo"> = ["coral", "indigo"];
const brandOutline = getWlColorFromString("Anna Mikhailova", brandColors);
```

The frozen default `WL_STRING_COLOR_PALETTE` references `--wl-blue-500`,
`--wl-green-500`, `--wl-amber-500` and `--wl-red-500` through CSS `var()` values.
Import the library styles explicitly to resolve those tokens, or pass your own
CSS colors. A supplied palette must not be empty; an empty palette throws
`RangeError`. A readonly custom palette retains its string-literal return type.

This is a decorative mapping, not a unique identifier or a contrast guarantee.
Keep a visible or accessible name and choose foreground/background contrast
separately. The Avatar example uses the color for an outline.

## Binary file sizes and locale overrides

`formatWlBytes(locale, bytes)` keeps its existing two-argument behavior: binary
steps of 1024, automatic units up to terabytes and Intl short unit labels and
number punctuation. Invalid, infinite and negative input becomes zero.

```ts
import { formatWlBytes, type WlByteFormatOptions } from "gavia-ui/utils";

const automatic = formatWlBytes("en", 1536);
const options: WlByteFormatOptions = {
  maxUnit: "megabyte",
  unitLabels: { byte: "Б", kilobyte: "КБ", megabyte: "МБ" },
  decimalSeparator: ",",
  useGrouping: false,
  maximumFractionDigits: value => value >= 100 ? 0 : 1
};
formatWlBytes("en", 1536, options); // "1,5 КБ"
formatWlBytes("en", 1024 ** 3, options); // "1024 МБ"
```

The optional third argument does not change defaults. `maxUnit` accepts the
`WlByteUnit` names `byte`, `kilobyte`, `megabyte`, `gigabyte` and `terabyte`.
`unitLabels` replaces only specified unit labels; missing entries still use Intl.
Use custom labels such as `KiB` when your interface requires IEC notation.
`decimalSeparator` replaces decimal parts only, preserving grouping and unit
text. `maximumFractionDigits` accepts a number or a callback receiving the scaled
value and selected unit.

FileUpload uses this same formatter with its released 0.x locale labels and
decimal override, no grouping, the previous rounding and a megabyte cap.
The row slot's `size` and size-limit messages therefore keep the same contract.
Fractional limits below 1024 bytes retain their released raw decimal text, such
as `0.5 Б`, even when the locale requests a comma. This narrow compatibility
adapter does not change the pure formatter's rounding. Locale keys are not
removed by this consolidation.
