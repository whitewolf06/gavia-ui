import { nextTick, onBeforeUnmount, onMounted, type Ref, watch } from "vue";
import { lockBodyScroll } from "./bodyScrollLock";
import { addOverlayLayer, canRestoreOverlayFocus, isTopFocusTrapLayer, isTopOverlayLayer, ownedOverlayPanels, refreshOverlayLayers, removeOverlayLayer } from "./overlayStack";

const FOCUSABLE_SELECTOR = [
  'a[href]:not([aria-disabled="true"])',
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "area[href]",
  '[contenteditable]:not([contenteditable="false"])',
  "details > summary:first-of-type",
  "audio[controls]",
  "video[controls]",
  "iframe",
  "object",
  "embed",
  "[tabindex]"
].join(", ");

function resolveFlag(value: boolean | (() => boolean) | undefined, fallback: boolean): boolean {
  return typeof value === "function" ? value() : (value ?? fallback);
}

export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
    if (element.matches(':disabled, [aria-disabled="true"], input[type="hidden"]')
      || (element.hasAttribute("tabindex") && element.tabIndex < 0)
      || element.closest('[hidden], [aria-hidden="true"], [inert]')) return false;
    for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      if (style.display === "none" || (ancestor === element
        && (style.visibility === "hidden" || style.visibility === "collapse"))) return false;
      if (ancestor.tagName === "DETAILS" && !ancestor.hasAttribute("open")) {
        const summary = ancestor.querySelector(":scope > summary");
        if (!summary?.contains(element)) return false;
      }
    }
    return true;
  });
}

function getInitialFocusTarget(container: HTMLElement | null): HTMLElement | null {
  const focusable = getFocusableElements(container);
  const autofocus = focusable.find((element) => element.hasAttribute("autofocus"));
  return autofocus ?? focusable[0] ?? container;
}

export function trapOverlayFocus(event: KeyboardEvent, container: HTMLElement | null, portals: HTMLElement[] = []): void {
  if (!container) return;
  const containers = [container, ...portals];
  const focusable = [...new Set(containers.flatMap(getFocusableElements))];
  const containsFocus = containers.some((element) => element.contains(document.activeElement));
  if (!focusable.length) {
    event.preventDefault();
    container.focus();
    return;
  }

  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;
  if (
    event.shiftKey
    && (document.activeElement === first
      || document.activeElement === container
      || !containsFocus)
  ) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !containsFocus)) {
    event.preventDefault();
    first.focus();
  }
}

export interface WlOverlayLifecycleOptions {
  visible: Ref<boolean>;
  container: Ref<HTMLElement | null>;
  enabled?: () => boolean;
  initialFocus?: () => HTMLElement | null | undefined;
  closeOnEscape?: boolean | (() => boolean);
  trapFocus?: boolean | (() => boolean);
  /** Isolate background content only for actual modal surfaces. */
  modal?: boolean | (() => boolean);
  /** Inline mobile surfaces keep their sibling dismissal backdrop available. */
  backdrop?: () => HTMLElement | null;
  lockScroll?: boolean | (() => boolean);
  restoreFocus?: boolean;
  onBeforeOpen?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
}

/** Shared lifecycle for modal surfaces owned by Gavia UI. */
export function useOverlayLifecycle(options: WlOverlayLifecycleOptions): {
  requestClose: () => void;
} {
  let mounted = false;
  let active = false;
  let opened = false;
  let lifecycleId = 0;
  let previouslyFocused: HTMLElement | null = null;
  let releaseBodyScroll: (() => void) | undefined;
  const layer = {
    token: Symbol("wl-overlay"),
    visible: () => active && options.visible.value,
    panel: () => options.container.value,
    anchor: () => previouslyFocused,
    trapFocus: () => resolveFlag(options.trapFocus, true),
    modal: () => resolveFlag(options.modal, options.container.value?.getAttribute("aria-modal") === "true"),
    backdrop: options.backdrop
  };

  function requestClose(): void {
    if (options.visible.value) options.visible.value = false;
  }

  async function activate(): Promise<void> {
    if (active) return;
    if (options.enabled && !options.enabled()) {
      requestClose();
      return;
    }

    const activationId = ++lifecycleId;
    active = true;
    previouslyFocused
      = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    addOverlayLayer(layer);
    document.addEventListener("keydown", onGlobalKeydown);
    if (resolveFlag(options.lockScroll, false)) releaseBodyScroll = lockBodyScroll();
    options.onBeforeOpen?.();

    await nextTick();
    if (!active || activationId !== lifecycleId || !options.visible.value) return;
    refreshOverlayLayers();
    const target
      = options.initialFocus?.()
        ?? getInitialFocusTarget(options.container.value);
    target?.focus();
    opened = true;
    options.onOpen?.();
  }

  async function deactivate(shouldRestoreFocus = true): Promise<void> {
    if (!active) return;
    lifecycleId += 1;
    const deactivationId = lifecycleId;
    active = false;
    const focusToRestore = previouslyFocused;
    previouslyFocused = null;
    removeOverlayLayer(layer);
    document.removeEventListener("keydown", onGlobalKeydown);
    releaseBodyScroll?.();
    releaseBodyScroll = undefined;
    if (opened) options.onClose?.();
    opened = false;

    await nextTick();
    if (
      !active
      && mounted
      && deactivationId === lifecycleId
      && shouldRestoreFocus
      && canRestoreOverlayFocus(layer, focusToRestore)
      && options.restoreFocus !== false
      && focusToRestore?.isConnected
    ) {
      focusToRestore.focus();
    }
  }

  function onGlobalKeydown(event: KeyboardEvent): void {
    if (
      !active
      || event.defaultPrevented
    ) {
      return;
    }
    if (event.key === "Escape" && !isTopOverlayLayer(layer)) return;
    if (event.key === "Escape" && resolveFlag(options.closeOnEscape, true)) {
      event.preventDefault();
      event.stopPropagation();
      requestClose();
    } else if (event.key === "Tab" && isTopFocusTrapLayer(layer)) {
      // Preserve the parent surface's normal cycle, but do not steal focus from
      // interactive content rendered in one of its owned body portals.
      const portals = options.container.value?.contains(document.activeElement) ? [] : ownedOverlayPanels(layer);
      trapOverlayFocus(event, options.container.value, portals);
    }
  }

  watch(options.visible, async (isVisible, wasVisible) => {
    if (!mounted) return;
    if (isVisible) await activate();
    else if (wasVisible) await deactivate();
  });
  watch(() => [options.container.value, layer.modal()], () => {
    if (active) refreshOverlayLayers();
  }, { flush: "post" });
  watch(() => resolveFlag(options.lockScroll, false), (locked) => {
    if (!active) return;
    if (locked && !releaseBodyScroll) releaseBodyScroll = lockBodyScroll();
    else if (!locked) {
      releaseBodyScroll?.();
      releaseBodyScroll = undefined;
    }
  }, { flush: "post" });

  onMounted(async () => {
    mounted = true;
    if (options.visible.value) await activate();
  });

  onBeforeUnmount(() => {
    const ownedFocus = canRestoreOverlayFocus(layer, previouslyFocused);
    mounted = false;
    lifecycleId += 1;
    document.removeEventListener("keydown", onGlobalKeydown);
    removeOverlayLayer(layer);
    releaseBodyScroll?.();
    releaseBodyScroll = undefined;
    if (active && ownedFocus && options.restoreFocus !== false && previouslyFocused?.isConnected) {
      previouslyFocused.focus();
    }
    active = false;
    opened = false;
    previouslyFocused = null;
  });

  return { requestClose };
}
