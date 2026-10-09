import { WlIconInput } from './iconNames';
export type WlSize = "xs" | "sm" | "md" | "lg";
export type WlSizeSm = "sm" | "md" | "lg";
export type WlDensity = "default" | "compact";
export type WlButtonVariant = "primary" | "secondary" | "ghost" | "soft" | "danger" | "danger-quiet" | "soft-danger" | "link";
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
export type WlDatePickerModel<Mode extends WlDatePickerSelectionMode = "single"> = (Mode extends "range" ? WlDateRange : string) | null;
export type WlSwitchSize = "sm" | "md";
export type WlSpinnerSize = "sm" | "md" | "lg";
export type WlDrawerPosition = "left" | "right" | "top" | "bottom" | "full";
export type { WlIconName } from './icons.generated';
export type { WlIconInput } from './iconNames';
export interface WlTabItem<Key extends string = string> {
    key: Key;
    label: string;
    icon?: WlIconInput;
    count?: number;
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
    label: string;
    to?: string;
    href?: string;
    icon?: WlIconInput;
}
export interface WlStepItem {
    label: string;
}
export type { WlTableRow, WlTableColumn, WlTableFieldColumn, WlTableVirtualColumn, WlTableFieldKey, WlTableCellSlotProps, WlTableSlots } from './table-types';
export type WlStatCardTone = "accent" | "success";
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
export type { WlMenuItemBase, WlMenuItem, WlMenuExpose, WlAccordionItem, WlAccordionSlots, WlSidebarItem, WlSidebarGroup, WlSidebarExpose, WlCommandPaletteItem, WlCommandPaletteGroup, WlCommandPaletteExpose } from './navigation-types';
export type { WlDatePickerLocale } from './locale-types';
