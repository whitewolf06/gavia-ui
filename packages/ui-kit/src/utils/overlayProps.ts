/** Consumer bundlers replace this literal; no Node type dependency is required. */
declare const process: { env: { NODE_ENV?: string } };
import { computed, type ComputedRef, getCurrentInstance, onBeforeUnmount, onMounted, ref, watch, watchEffect } from "vue";
import type { WlOverlayInitialFocus } from "../overlay-types";
import { isWlDevelopment } from "./development";

/** Keep 0.x spelling/defaults while allowing the normalized name to take precedence. */
export function useDismissible(
  component: string, preferred: ComputedRef<boolean | undefined>, legacy: ComputedRef<boolean>
): ComputedRef<boolean> {
  const instance = getCurrentInstance();
  let warned = false;
  watchEffect(() => {
    const value = legacy.value;
    if (isWlDevelopment() && process.env.NODE_ENV !== "production" && !warned && instance?.vnode.props?.dismissable !== undefined) {
      warned = true;
      console.warn(`${component}: dismissable is deprecated; use dismissible instead.`);
    }
    void value;
  });
  return computed(() => preferred.value ?? legacy.value);
}

export function resolveOverlayInitialFocus(value: WlOverlayInitialFocus | undefined, container: HTMLElement | null): HTMLElement | null {
  if (!container || value === undefined) return null;
  let target: HTMLElement | null | undefined;
  if (typeof value === "string") {
    try {
      target = container.querySelector<HTMLElement>(value);
    } catch {
      return null;
    }
  } else target = typeof value === "function" ? value() : value;
  if (!target?.isConnected || !container.contains(target) || target.matches(':disabled, input[type="hidden"]')
    || target.closest('[hidden], [aria-hidden="true"], [inert]')) return null;
  for (let ancestor: HTMLElement | null = target; ancestor; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    if (style.display === "none" || (ancestor === target && ["hidden", "collapse"].includes(style.visibility))) return null;
  }
  return target;
}

export function overlayWidth(value: string | number | undefined): string | undefined {
  return typeof value === "number" ? `${value}px` : value;
}

/** Observe a breakpoint only for consumers that request responsive fullscreen. */
export function useOverlayFullscreen(value: ComputedRef<boolean | "mobile" | undefined>): ComputedRef<boolean> {
  const mobile = ref(false);
  let mounted = false;
  let media: MediaQueryList | undefined;
  const update = (event?: MediaQueryListEvent) => {
    mobile.value = event?.matches ?? media?.matches ?? false;
  };
  function observe(): void {
    media?.removeEventListener?.("change", update);
    media = undefined;
    mobile.value = false;
    if (!mounted || value.value !== "mobile" || typeof window.matchMedia !== "function") return;
    media = window.matchMedia("(max-width: 639px)");
    update();
    media.addEventListener?.("change", update);
  }
  watch(value, observe);
  onMounted(() => {
    mounted = true;
    observe();
  });
  onBeforeUnmount(() => {
    mounted = false;
    media?.removeEventListener?.("change", update);
  });
  return computed(() => value.value === true || (value.value === "mobile" && mobile.value));
}
