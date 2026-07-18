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

export type WlSwitchSize = "sm" | "md";
export type WlSpinnerSize = "sm" | "md" | "lg";
export type WlDrawerPosition = "left" | "right" | "top" | "bottom" | "full";

export type WlIconName =
  | "check"
  | "x"
  | "plus"
  | "minus"
  | "search"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "chevron-up"
  | "info"
  | "warn"
  | "edit"
  | "trash"
  | "bell"
  | "user"
  | "eye"
  | "eye-off";

export interface WlTabItem {
  key: string;
  label: string;
  icon?: WlIconName;
  count?: number;
}

export type WlThemeName = "white" | "graphite";
