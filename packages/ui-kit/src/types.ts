export type WlSize = "xs" | "sm" | "md" | "lg";
export type WlSizeSm = "sm" | "md" | "lg";
export type WlDensity = "default" | "compact";

export type WlButtonVariant =
  | "primary"
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

export type WlSwitchSize = "sm" | "md";
export type WlSpinnerSize = "sm" | "md" | "lg";
export type WlDrawerPosition = "left" | "right" | "top" | "bottom" | "full";

import type { WlIconName } from "./icons.generated";
export type { WlIconName } from "./icons.generated";

export interface WlTabItem {
  key: string;
  label: string;
  icon?: WlIconName;
  count?: number;
}

export type WlIconButtonVariant = "ghost" | "secondary" | "soft";
export type WlPillVariant = "neutral" | "info" | "ok" | "warn" | "err";

export interface WlSegmentedOption {
  label: string;
  value: string;
  icon?: WlIconName;
  disabled?: boolean;
}

export interface WlBreadcrumbItem {
  label: string;
  to?: string;
  href?: string;
  icon?: WlIconName;
}

export interface WlMenuItem {
  key?: string;
  label?: string;
  icon?: WlIconName;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  separator?: boolean;
  header?: string;
  command?: (item: WlMenuItem) => void;
}

export interface WlSidebarItem {
  key: string;
  label: string;
  icon?: WlIconName;
  badge?: number | string;
  href?: string;
  disabled?: boolean;
  /** Произвольные данные потребителя; UI-kit их не интерпретирует. */
  data?: unknown;
}

export interface WlSidebarGroup {
  id: string;
  label?: string;
  separator?: boolean;
  items: WlSidebarItem[];
}

export interface WlCommandPaletteItem {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  icon?: WlIconName;
  shortcut?: string;
  href?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  disabled?: boolean;
  /** Произвольные данные потребителя; UI-kit их не интерпретирует. */
  data?: unknown;
}

export interface WlCommandPaletteGroup {
  id: string;
  label: string;
  items: WlCommandPaletteItem[];
  /** Показывать группу до ввода запроса. Удобно для быстрых ссылок. */
  showWhenEmpty?: boolean;
  /** Переопределяет локальную фильтрацию для этой группы; false подходит внешним результатам. */
  filter?: boolean;
}

export interface WlAccordionItem {
  key: string;
  title: string;
  content?: string;
  disabled?: boolean;
}

export interface WlStepItem {
  label: string;
}

export interface WlTableColumn {
  key: string;
  label: string;
  numeric?: boolean;
  width?: string | number;
}

export type WlTableRow = Record<string, unknown>;

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

/** Calendar locale shape accepted by WhiteUI configuration. */
export interface WlDatePickerLocale {
  firstDayOfWeek?: number;
  dayNames?: string[];
  dayNamesShort?: string[];
  dayNamesMin?: string[];
  monthNames?: string[];
  monthNamesShort?: string[];
  [key: string]: unknown;
}

export type WlFileRejectReason = "type" | "size" | "count";

export interface WlFileReject {
  file: File;
  reason: WlFileRejectReason;
}

export type WlThemeName = "white" | "graphite" | "newspaper";
