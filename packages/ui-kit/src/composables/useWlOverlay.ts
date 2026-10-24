import { onBeforeUnmount, type Ref, watch } from "vue";
import { lockBodyScroll } from "../utils/bodyScrollLock";
import { useOverlayLifecycle, type WlOverlayLifecycleOptions } from "../utils/overlayLifecycle";

/** Full overlay lifecycle: participates in the same focus, Escape and inert stack as kit components. */
export const useWlOverlay = useOverlayLifecycle;
export type { WlOverlayLifecycleOptions };

export function useWlFocusTrap(options: WlOverlayLifecycleOptions) {
  return useOverlayLifecycle({ lockScroll: false, modal: false, ...options, trapFocus: true });
}

export function useWlDismiss(options: WlOverlayLifecycleOptions) {
  return useOverlayLifecycle({ lockScroll: false, ...options, trapFocus: false, modal: false });
}

/** Reference-counted with the library's dialogs; multiple callers cannot unlock one another. */
export function useWlScrollLock(active: Ref<boolean>): void {
  let release: (() => void) | undefined;
  watch(active, (locked) => {
    if (locked && !release)
      release = lockBodyScroll();
    if (!locked) {
      release?.();

      release = undefined;
    }
  }, { immediate: true });
  onBeforeUnmount(() => {
    release?.();

    release = undefined;
  });
}
