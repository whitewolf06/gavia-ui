import type { WlByteFormatOptions, WlByteUnit, WlColorPalette } from "../../src/utils";
import { formatWlBytes, getWlColorFromString, WL_STRING_COLOR_PALETTE } from "../../src/utils";

const labels: Partial<Record<WlByteUnit, string>> = { kilobyte: "KiB" };
export const byteOptions: WlByteFormatOptions = {
  maxUnit: "megabyte", unitLabels: labels, decimalSeparator: ",", useGrouping: false,
  maximumFractionDigits: (value, unit) => unit === "byte" || value >= 100 ? 0 : 1
};
export const existingBytes: string = formatWlBytes("en", 1024);
export const releasedByteFormatter: (locale: string, bytes: number) => string = formatWlBytes;
export const configuredBytes: string = formatWlBytes("ru", 1536, byteOptions);
const palette: WlColorPalette<"coral" | "indigo"> = ["coral", "indigo"];
export const color: "coral" | "indigo" = getWlColorFromString("Ada", palette);
export const tokenColor: typeof WL_STRING_COLOR_PALETTE[number] = getWlColorFromString("Ada");
export const optionalPaletteColor: typeof WL_STRING_COLOR_PALETTE[number] = getWlColorFromString("Ada", undefined);

// @ts-expect-error Binary scaling uses the existing Intl unit names.
formatWlBytes("en", 1024, { maxUnit: "kibibyte" });
// @ts-expect-error Unit-label keys must refer to a supported byte unit.
formatWlBytes("en", 1024, { unitLabels: { pixels: "px" } });
// @ts-expect-error A precision callback must return a number.
formatWlBytes("en", 1024, { maximumFractionDigits: () => "one" });
// @ts-expect-error Names are strings, not numeric identifiers.
getWlColorFromString(42);
// @ts-expect-error The shared token palette is readonly.
WL_STRING_COLOR_PALETTE.push("red");
