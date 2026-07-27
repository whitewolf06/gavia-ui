import type {
  WlAlertVariant,
  WlBadgeVariant,
  WlButtonVariant,
  WlColorPickerSize,
  WlDensity,
  WlDrawerPosition,
  WlIconButtonVariant,
  WlIconName,
  WlMultiSelectDisplay,
  WlPillVariant,
  WlProgressVariant,
  WlSize,
  WlSizeSm,
  WlSpinnerSize,
  WlStatCardTone,
  WlSwitchSize,
  WlTagVariant
} from "../types";

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
  "danger",
  "danger-quiet",
  "soft-danger",
  "link"
] as const satisfies readonly WlButtonVariant[];

export const WL_ICON_BUTTON_VARIANTS = [
  "ghost",
  "secondary",
  "soft"
] as const satisfies readonly WlIconButtonVariant[];

export const WL_TAG_VARIANTS = [
  "gray",
  "blue",
  "green",
  "amber",
  "red"
] as const satisfies readonly WlTagVariant[];

export const WL_BADGE_VARIANTS = [
  "gray",
  "accent",
  "success",
  "warn",
  "danger"
] as const satisfies readonly WlBadgeVariant[];

export const WL_ALERT_VARIANTS = [
  "info",
  "ok",
  "warn",
  "err"
] as const satisfies readonly WlAlertVariant[];

export const WL_PROGRESS_VARIANTS = [
  "default",
  "ok"
] as const satisfies readonly WlProgressVariant[];

export const WL_PILL_VARIANTS = [
  "neutral",
  "info",
  "ok",
  "warn",
  "err"
] as const satisfies readonly WlPillVariant[];

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

export const WL_AVATAR_SIZES = ["24", "28", "32", "36", "48"] as const;

export const WL_AVATAR_PRESENCES = ["online", "busy", "offline"] as const;

export const WL_ICON_NAMES = [
  "check",
  "x",
  "plus",
  "minus",
  "search",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevron-up",
  "info",
  "warn",
  "edit",
  "trash",
  "bell",
  "user",
  "eye",
  "eye-off",
  "calendar",
  "home",
  "task",
  "note",
  "clock",
  "activity",
  "sparkle",
  "help",
  "settings",
  "panel",
  "upload",
  "file",
  "image",
  "music"
] as const satisfies readonly WlIconName[];
