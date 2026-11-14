import { Ref } from 'vue';
import { useOverlayLifecycle, WlOverlayLifecycleOptions } from "../utils/overlayLifecycle.js";
/** Full overlay lifecycle: participates in the same focus, Escape and inert stack as kit components. */
export declare const useWlOverlay: typeof useOverlayLifecycle;
export type { WlOverlayLifecycleOptions };
export declare function useWlFocusTrap(options: WlOverlayLifecycleOptions): {
    requestClose: () => void;
};
export declare function useWlDismiss(options: WlOverlayLifecycleOptions): {
    requestClose: () => void;
};
/** Reference-counted with the library's dialogs; multiple callers cannot unlock one another. */
export declare function useWlScrollLock(active: Ref<boolean>): void;
