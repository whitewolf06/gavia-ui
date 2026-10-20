export type WlSize = "xs" | "sm" | "md" | "lg";
export type WlSizeSm = "sm" | "md" | "lg";
export type WlDensity = "default" | "compact";
export type WlTone = "neutral" | "accent" | "info" | "success" | "warning" | "danger";

export type WlButtonVariant
  = | "primary"
    | "secondary"
    | "ghost"
    | "soft"
    | "danger"
    | "danger-quiet"
    | "soft-danger"
    | "link";

export type WlTagVariant = "gray" | "blue" | "green" | "amber" | "red";
export type WlBadgeVariant = "gray" | "accent" | "success" | "warn" | "danger";
export type WlAlertVariant = "info" | "ok" | "warn" | "err";
export type WlProgressVariant = "default" | "ok";

export type WlAvatarSize = 24 | 28 | 32 | 36 | 48;
export type WlAvatarPresence = "online" | "busy" | "offline";

export type WlMultiSelectDisplay = "comma" | "chip";

/** DatePicker mode; single keeps the original ISO string model. */
export type WlDatePickerSelectionMode = "single" | "range";
/** Inclusive ISO range. A null end means the first date has been selected. */
export type WlDateRange = [start: string, end: string | null];
export type WlDatePickerModel<Mode extends WlDatePickerSelectionMode = "single">
  = (Mode extends "range" ? WlDateRange : string) | null;

export type WlSwitchSize = "sm" | "md";
export type WlSpinnerSize = "sm" | "md" | "lg";
export type WlDrawerPosition = "left" | "right" | "top" | "bottom" | "full";

export type { WlIconName } from "./icons.generated";
import type { WlIconInput } from "./iconNames";
export type { WlIconInput } from "./iconNames";

export interface WlTabItem<Key extends string = string> {
  key: Key;
  label: string;
  icon?: WlIconInput;
  count?: number;
  disabled?: boolean;
  /** Native URL for a tab that also navigates when activated. */
  href?: string;
  /** Router destination consumed by the configured WlLink adapter. */
  to?: unknown;
}

export type WlIconButtonVariant = "ghost" | "secondary" | "soft";
export type WlPillVariant = "neutral" | "info" | "ok" | "warn" | "err";

export interface WlSegmentedOption<Value extends string = string> {
  label: string;
  value: Value;
  icon?: WlIconInput;
  disabled?: boolean;
}

export interface WlBreadcrumbItem {
  key?: string | number;
  label: string;
  to?: unknown;
  href?: string;
  icon?: WlIconInput;
}

export interface WlStepItem {
  label: string;
  key?: string | number;
  description?: string;
  disabled?: boolean;
  error?: boolean;
}

export type { WlTableCellSlotProps, WlTableColumn, WlTableFieldColumn, WlTableFieldKey, WlTableRow, WlTableSlots, WlTableVirtualColumn } from "./table-types";

export type WlStatCardTone = WlTone;

export type WlColorPickerSize = "sm" | "md";

export type WlCalendarEventTone = "blue" | "gray";

export interface WlCalendarEvent {
  /** Stable key when multiple events can share a label. */
  id?: string;
  /** ISO date "YYYY-MM-DD". */
  date: string;
  label: string;
  tone?: WlCalendarEventTone;
}

export type WlFileRejectReason = "type" | "size" | "count";

export interface WlFileReject {
  file: File;
  reason: WlFileRejectReason;
}

export type WlThemeName = "gavia" | "white" | "graphite" | "newspaper" | "gavia-dark";

export type { WlAccordionItem, WlAccordionSlots, WlCommandPaletteExpose, WlCommandPaletteGroup, WlCommandPaletteItem, WlMenuExpose, WlMenuItem, WlMenuItemBase, WlSidebarExpose, WlSidebarGroup, WlSidebarItem } from "./navigation-types";
export type { WlDatePickerLocale } from "./locale-types";

export type { WlTableClass, WlTableHeaderSlotProps, WlTableRowClass, WlTableRowKey, WlTableSelectionMode, WlTableSort, WlTableSortDirection, WlTableSortFn } from "./table-types";
