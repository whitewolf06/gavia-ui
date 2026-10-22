import type {
  WlAvatarSize,
  WlButtonVariant,
  WlColorPickerSize,
  WlDensity,
  WlDrawerPosition,
  WlIconButtonVariant,
  WlMultiSelectDisplay,
  WlSize,
  WlSizeSm,
  WlSpinnerSize,
  WlStatCardTone,
  WlSwitchSize,
  WlTagColor,
  WlTone
} from "../types";
export { WL_ICON_NAMES } from "../icons.generated";

/** Рантайм-списки допустимых значений enum-пропсов (зеркало union-типов из types.ts). */

export const WL_SIZES = ["xs", "sm", "md", "lg"] as const satisfies readonly WlSize[];
export const WL_SIZES_SM = ["sm", "md", "lg"] as const satisfies readonly WlSizeSm[];
export const WL_DENSITIES = ["default", "compact"] as const satisfies readonly WlDensity[];

export const WL_MULTISELECT_DISPLAYS = [
  "comma",
  "chip"
] as const satisfies readonly WlMultiSelectDisplay[];

export const WL_BUTTON_VARIANTS = [
  "primary",
  "secondary",
  "ghost",
  "soft",
  "link"
] as const satisfies readonly WlButtonVariant[];

export const WL_ICON_BUTTON_VARIANTS = [
  "ghost",
  "secondary",
  "soft"
] as const satisfies readonly WlIconButtonVariant[];

export const WL_TAG_COLORS = [
  "gray",
  "blue",
  "green",
  "amber",
  "red"
] as const satisfies readonly WlTagColor[];

export const WL_TONES = [
  "neutral",
  "accent",
  "info",
  "success",
  "warning",
  "danger"
] as const satisfies readonly WlTone[];

export const WL_SWITCH_SIZES = ["sm", "md"] as const satisfies readonly WlSwitchSize[];
export const WL_SPINNER_SIZES = ["sm", "md", "lg"] as const satisfies readonly WlSpinnerSize[];

export const WL_DRAWER_POSITIONS = [
  "left",
  "right",
  "top",
  "bottom",
  "full"
] as const satisfies readonly WlDrawerPosition[];

export const WL_STAT_CARD_TONES = [
  "accent",
  "success"
] as const satisfies readonly WlStatCardTone[];

export const WL_COLOR_PICKER_SIZES = [
  "sm",
  "md"
] as const satisfies readonly WlColorPickerSize[];

export const WL_AVATAR_SIZES = [24, 28, 32, 36, 48] as const satisfies readonly WlAvatarSize[];

export const WL_AVATAR_PRESENCES = ["online", "busy", "offline"] as const;
