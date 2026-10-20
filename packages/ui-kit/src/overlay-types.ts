/** Imperative control of an anchored popover. A DOM event supplies its anchor. */
export type WlOverlaySize = "sm" | "md" | "lg" | "full";
export type WlOverlayInitialFocus = string | HTMLElement | (() => HTMLElement | null | undefined);
export type WlPopoverPlacement = "auto" | "top" | "right" | "bottom" | "left";
export type WlPopoverSide = Exclude<WlPopoverPlacement, "auto">;
export type WlPopoverAlign = "start" | "center" | "end";
export type WlPopoverTrigger = "manual" | "click" | "hover" | "focus";

export interface WlPopoverExpose {
  show: (event?: Event) => void;
  hide: (event?: Event) => void;
  toggle: (event?: Event) => void;
}

export interface WlPopoverTriggerSlotProps extends WlPopoverExpose {
  visible: boolean;
  attrs: Record<string, unknown>;
}

/** Filter-bar actions honor its disabled state and emit the corresponding public events. */
export interface WlFilterBarExpose {
  open: () => void;
  close: () => void;
  toggle: () => void;
  clear: () => void;
  apply: () => void;
}

export interface WlFilterBarSlots {
  /** Filter controls with the panel's open, close and clear actions. */
  default?: (props: Pick<WlFilterBarExpose, "open" | "close" | "clear">) => unknown;
  /** Content before the filter controls. */
  leading?: (props: {}) => unknown;
  /** Custom actions with the clear and close callbacks. */
  actions?: (props: Pick<WlFilterBarExpose, "clear" | "close">) => unknown;
  /** Mobile panel footer with apply, clear and close callbacks. */
  footer?: (props: Pick<WlFilterBarExpose, "apply" | "clear" | "close">) => unknown;
  /** Active-filter summary with a clear callback. */
  summary?: (props: Pick<WlFilterBarExpose, "clear">) => unknown;
}
