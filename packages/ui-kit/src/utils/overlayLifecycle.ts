import { nextTick, onBeforeUnmount, onMounted, watch, type Ref } from "vue";
import { lockBodyScroll } from "./bodyScrollLock";
import { addOverlayLayer, isTopOverlayLayer, removeOverlayLayer } from "./overlayStack";

const FOCUSABLE_SELECTOR = [
  'a[href]:not([aria-disabled="true"])',
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(", ");

const overlayStack: symbol[] = [];

function removeFromStack(token: symbol): void {
  const index = overlayStack.lastIndexOf(token);
  if (index >= 0) overlayStack.splice(index, 1);
}

function resolveFlag(value: boolean | (() => boolean) | undefined, fallback: boolean): boolean {
  return typeof value === "function" ? value() : (value ?? fallback);
}

export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute("hidden") &&
      element.getAttribute("aria-hidden") !== "true" &&
      !element.closest("[inert]")
  );
}

function getInitialFocusTarget(container: HTMLElement | null): HTMLElement | null {
  const focusable = getFocusableElements(container);
  const autofocus = focusable.find((element) => {
    if (
      !element.hasAttribute("autofocus") ||
      element.tabIndex < 0 ||
      element.matches(':disabled, [aria-disabled="true"], input[type="hidden"]') ||
      element.closest('[hidden], [aria-hidden="true"]')
    ) {
      return false;
    }
    for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      if (
        style.display === "none" ||
        (ancestor === element && (style.visibility === "hidden" || style.visibility === "collapse"))
      ) {
        return false;
      }
    }
    return true;
  });
  return autofocus ?? focusable[0] ?? container;
}

export function trapOverlayFocus(event: KeyboardEvent, container: HTMLElement | null): void {
  if (!container) return;
  const focusable = getFocusableElements(container);
  if (!focusable.length) {
    event.preventDefault();
    container.focus();
    return;
  }

  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;
  if (
    event.shiftKey &&
    (document.activeElement === first ||
      document.activeElement === container ||
      !container.contains(document.activeElement))
  ) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
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
  const token = Symbol("wl-overlay");
  let mounted = false;
  let active = false;
  let opened = false;
  let lifecycleId = 0;
  let previouslyFocused: HTMLElement | null = null;
  let releaseBodyScroll: (() => void) | undefined;
  const layer = { visible: () => active && options.visible.value, panel: () => options.container.value, anchor: () => previouslyFocused };

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
    previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    removeFromStack(token);
    overlayStack.push(token);
    addOverlayLayer(layer);
    if (resolveFlag(options.lockScroll, false)) releaseBodyScroll = lockBodyScroll();
    options.onBeforeOpen?.();

    await nextTick();
    if (!active || activationId !== lifecycleId || !options.visible.value) return;
    const target =
      options.initialFocus?.() ??
      getInitialFocusTarget(options.container.value);
    target?.focus();
    opened = true;
    options.onOpen?.();
  }

  async function deactivate(shouldRestoreFocus = true): Promise<void> {
    if (!active) return;
    lifecycleId += 1;
    active = false;
    const focusToRestore = previouslyFocused;
    previouslyFocused = null;
    removeFromStack(token);
    removeOverlayLayer(layer);
    releaseBodyScroll?.();
    releaseBodyScroll = undefined;
    if (opened) options.onClose?.();
    opened = false;

    await nextTick();
    if (
      !active &&
      shouldRestoreFocus &&
      options.restoreFocus !== false &&
      focusToRestore?.isConnected
    ) {
      focusToRestore.focus();
    }
  }

  function onGlobalKeydown(event: KeyboardEvent): void {
    if (
      !active ||
      event.defaultPrevented ||
      overlayStack[overlayStack.length - 1] !== token
    ) {
      return;
    }
    if (event.key === "Escape" && !isTopOverlayLayer(layer)) return;
    if (event.key === "Escape" && resolveFlag(options.closeOnEscape, true)) {
      event.preventDefault();
      event.stopPropagation();
      requestClose();
    } else if (event.key === "Tab" && resolveFlag(options.trapFocus, true)) {
      trapOverlayFocus(event, options.container.value);
    }
  }

  watch(options.visible, async (isVisible, wasVisible) => {
    if (!mounted) return;
    if (isVisible) await activate();
    else if (wasVisible) await deactivate();
  });

  onMounted(async () => {
    mounted = true;
    document.addEventListener("keydown", onGlobalKeydown);
    if (options.visible.value) await activate();
  });

  onBeforeUnmount(() => {
    mounted = false;
    lifecycleId += 1;
    document.removeEventListener("keydown", onGlobalKeydown);
    removeFromStack(token);
    removeOverlayLayer(layer);
    releaseBodyScroll?.();
    releaseBodyScroll = undefined;
    if (active && options.restoreFocus !== false && previouslyFocused?.isConnected) {
      previouslyFocused.focus();
    }
    active = false;
    opened = false;
    previouslyFocused = null;
  });

  return { requestClose };
}
