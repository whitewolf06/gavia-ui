import { nextTick, onBeforeUnmount, onMounted, ref, type Ref, watch } from "vue";
import type { WlPopoverAlign, WlPopoverPlacement, WlPopoverSide } from "../overlay-types";
import { addOverlayLayer, isTopOverlayLayer, ownsOverlayTarget, refreshOverlayLayers, removeOverlayLayer } from "./overlayStack";

export interface AnchoredOverlay {
  visible: Ref<boolean>;
  anchor: Ref<HTMLElement | null>;
  panel: Ref<HTMLElement | null>;
  style: Ref<Record<string, string>>;
  placement: Ref<WlPopoverSide>;
  arrowStyle: Ref<Record<string, string>>;
  show: (event?: Event) => void;
  hide: (event?: Event) => void;
  toggle: (event?: Event) => void;
}

type OverlayValue<T> = T | (() => T);
export interface WlAnchoredOverlayOptions {
  dismissible?: OverlayValue<boolean>;
  closeOnEscape?: OverlayValue<boolean>;
  placement?: OverlayValue<WlPopoverPlacement>;
  align?: OverlayValue<WlPopoverAlign>;
  offset?: OverlayValue<number>;
  /** Override geometry while retaining the real anchor for portal ownership and focus. */
  anchorRect?: () => Pick<DOMRect, "top" | "right" | "bottom" | "left" | "width" | "height"> | undefined;
  onOpen?: () => void;
  onClose?: () => void;
}

function valueOf<T>(value: OverlayValue<T> | undefined, fallback: T): T {
  return typeof value === "function" ? (value as () => T)() : value ?? fallback;
}

/** Position and dismissal shared by the kit's non-modal overlays. */
export function useAnchoredOverlay(options: WlAnchoredOverlayOptions = {}): AnchoredOverlay {
  const visible = ref(false);
  const anchor = ref<HTMLElement | null>(null);
  const panel = ref<HTMLElement | null>(null);
  const style = ref<Record<string, string>>({});
  const placement = ref<WlPopoverSide>("bottom");
  const arrowStyle = ref<Record<string, string>>({});
  let previouslyFocused: HTMLElement | null = null;
  let mounted = false;
  let listening = false;
  let opened = false;
  let frame: number | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let boundAnchor: HTMLElement | null = null;
  let boundPanel: HTMLElement | null = null;
  let positioningGeneration = 0;
  const refreshRequest = ref(0);
  let appliedRefresh = -1;
  const panelInlineLayers = new WeakMap<HTMLElement, { value: string; priority: string }>();
  let anchorLayer = 0;
  let panelLayer = 0;
  const layer = {
    token: Symbol("wl-anchored-overlay"),
    visible: () => visible.value,
    panel: () => panel.value,
    anchor: () => anchor.value
  };

  function readPanelLayer(element: HTMLElement): number {
    const value = element.style.getPropertyValue("z-index");
    const priority = element.style.getPropertyPriority("z-index");
    const helperLayer = style.value.zIndex;
    const ownsInlineLayer = helperLayer !== undefined && value === helperLayer;
    if (!ownsInlineLayer) panelInlineLayers.set(element, { value, priority });
    const original = panelInlineLayers.get(element);
    // A keyed panel can inherit our previous positioning style. Read its own CSS
    // layer, or the consumer's remembered inline layer, without feeding that
    // positioning result back into the next calculation.
    if (ownsInlineLayer) {
      if (original?.value) element.style.setProperty("z-index", original.value, original.priority);
      else element.style.removeProperty("z-index");
    }
    try {
      return Number.parseInt(getComputedStyle(element).zIndex, 10) || 0;
    } finally {
      if (ownsInlineLayer) element.style.setProperty("z-index", value, priority);
    }
  }

  function cacheLayers(): void {
    anchorLayer = 0;
    panelLayer = panel.value ? readPanelLayer(panel.value) : 0;
    for (let parent = anchor.value?.parentElement; parent; parent = parent.parentElement) {
      const value = Number.parseInt(getComputedStyle(parent).zIndex, 10);
      if (Number.isFinite(value)) anchorLayer = Math.max(anchorLayer, value);
    }
  }

  function position(): void {
    if (!visible.value || !mounted || !anchor.value || !panel.value) return;
    const rect = options.anchorRect?.() ?? anchor.value.getBoundingClientRect();
    const width = panel.value.offsetWidth || rect.width;
    const height = panel.value.offsetHeight;
    const rawOffset = valueOf(options.offset, 4);
    const offset = Number.isFinite(rawOffset) ? Math.max(0, rawOffset) : 4;
    const align = valueOf(options.align, "start");
    const requested = valueOf(options.placement, "auto");
    const room = { top: rect.top, bottom: window.innerHeight - rect.bottom, left: rect.left, right: window.innerWidth - rect.right };
    let side: WlPopoverSide = requested === "auto" ? "bottom" : requested;
    const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
    const needed = (side === "left" || side === "right" ? width : height) + offset + 4;
    if (room[side] < needed && room[opposite[side]] > room[side]) side = opposite[side];
    const cross = (start: number, length: number, panelLength: number) => align === "center"
      ? start + (length - panelLength) / 2
      : align === "end" ? start + length - panelLength : start;
    const preferredTop = side === "bottom" ? rect.bottom + offset : side === "top" ? rect.top - height - offset : cross(rect.top, rect.height, height);
    const preferredLeft = side === "right" ? rect.right + offset : side === "left" ? rect.left - width - offset : cross(rect.left, rect.width, width);
    const top = Math.max(4, Math.min(preferredTop, window.innerHeight - height - 4));
    const left = Math.max(4, Math.min(preferredLeft, window.innerWidth - width - 4));
    placement.value = side;
    arrowStyle.value = side === "top" || side === "bottom"
      ? { left: `${Math.max(8, Math.min(rect.left + rect.width / 2 - left, width - 8))}px` }
      : { top: `${Math.max(8, Math.min(rect.top + rect.height / 2 - top, height - 8))}px` };
    style.value = {
      position: "fixed", top: `${top}px`, left: `${left}px`, minWidth: `${rect.width}px`,
      zIndex: String(Math.max(panelLayer, anchorLayer + 1))
    };
  }

  function schedulePosition(): void {
    if (!mounted || !listening || !visible.value || !boundAnchor || !boundPanel
      || boundAnchor !== anchor.value || boundPanel !== panel.value || frame !== undefined) return;
    const generation = positioningGeneration;
    frame = window.requestAnimationFrame(() => {
      if (generation !== positioningGeneration) return;
      frame = undefined;
      if (boundAnchor === anchor.value && boundPanel === panel.value) position();
    });
  }

  function stopPositioning(): void {
    positioningGeneration += 1;
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
    resizeObserver?.disconnect();
    resizeObserver = undefined;
    boundAnchor = null;
    boundPanel = null;
  }

  function stopListening(): void {
    if (listening) {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKeydown);
      window.removeEventListener("resize", schedulePosition);
      window.removeEventListener("scroll", schedulePosition, true);
      listening = false;
    }
    stopPositioning();
  }

  function activate(): void {
    if (!mounted || listening) return;
    listening = true;
    addOverlayLayer(layer);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKeydown);
    window.addEventListener("resize", schedulePosition);
    window.addEventListener("scroll", schedulePosition, true);
  }

  // A synchronous visibility watcher can run before Vue has queued its render.
  // Finalize from the post-render ref handoff, when the panel and its children
  // exist. Later ref handoffs refresh positioning and portal ownership without
  // reopening the logical overlay or repeating the consumer's initial focus.
  function finishActivation(): void {
    if (!mounted || !visible.value || !listening) return;
    if (!anchor.value || !panel.value) {
      stopPositioning();
      refreshOverlayLayers();
      return;
    }
    if (boundAnchor === anchor.value && boundPanel === panel.value && appliedRefresh === refreshRequest.value) return;
    stopPositioning();
    boundAnchor = anchor.value;
    boundPanel = panel.value;
    appliedRefresh = refreshRequest.value;
    cacheLayers();
    position();
    refreshOverlayLayers();
    if (typeof ResizeObserver !== "undefined") {
      const generation = positioningGeneration;
      resizeObserver = new ResizeObserver(() => {
        if (generation === positioningGeneration) schedulePosition();
      });
      resizeObserver.observe(boundPanel);
      resizeObserver.observe(boundAnchor);
    }
    if (!opened) {
      opened = true;
      options.onOpen?.();
    }
  }

  function deactivate(notify = true): void {
    stopListening();
    removeOverlayLayer(layer);
    const wasOpened = opened;
    opened = false;
    if (wasOpened && notify) options.onClose?.();
  }

  function show(event?: Event): void {
    const target = event?.currentTarget ?? event?.target;
    if (target instanceof HTMLElement) anchor.value = target;
    previouslyFocused = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
      ? document.activeElement
      : anchor.value;
    if (!visible.value) {
      style.value = {};
      visible.value = true;
    } else {
      refreshRequest.value += 1;
    }
  }

  function hide(event?: Event): void {
    if (visible.value && event instanceof KeyboardEvent && event.key === "Escape") event.preventDefault();
    visible.value = false;
  }

  function toggle(event?: Event): void {
    if (visible.value) hide();
    else show(event);
  }

  function onPointer(event: PointerEvent): void {
    const dismissible = valueOf(options.dismissible, true);
    if (!visible.value || dismissible === false) return;
    const target = event.target;
    if (target instanceof Node && !ownsOverlayTarget(layer, target)) hide();
  }

  function onKeydown(event: KeyboardEvent): void {
    if (!event.defaultPrevented && visible.value && isTopOverlayLayer(layer)
      && event.key === "Escape" && valueOf(options.closeOnEscape, true) !== false) {
      event.preventDefault();
      hide(event);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    }
  }

  watch(visible, (open) => {
    if (open) activate();
    else deactivate();
  }, { flush: "sync" });
  watch([visible, anchor, panel, refreshRequest], finishActivation, { flush: "post" });
  watch(() => [valueOf(options.placement, "auto"), valueOf(options.align, "start"), valueOf(options.offset, 4)], () => {
    if (visible.value) schedulePosition();
  });
  onMounted(() => {
    mounted = true;
    if (visible.value) {
      activate();
      void nextTick(finishActivation);
    }
  });
  onBeforeUnmount(() => {
    mounted = false;
    deactivate(false);
  });
  return { visible, anchor, panel, style, placement, arrowStyle, show, hide, toggle };
}
