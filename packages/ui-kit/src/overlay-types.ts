/** Imperative control of an anchored popover. A DOM event supplies its anchor. */
export interface WlPopoverExpose {
  show: (event?: Event) => void;
  hide: (event?: Event) => void;
  toggle: (event?: Event) => void;
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
  default?: (props: Pick<WlFilterBarExpose, "open" | "close" | "clear">) => unknown;
  leading?: (props: {}) => unknown;
  actions?: (props: Pick<WlFilterBarExpose, "clear" | "close">) => unknown;
  footer?: (props: Pick<WlFilterBarExpose, "apply" | "clear" | "close">) => unknown;
  summary?: (props: Pick<WlFilterBarExpose, "clear">) => unknown;
}
