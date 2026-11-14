import { ComputedRef } from 'vue';
import { WlOverlayInitialFocus } from "../overlay-types.js";
export declare function resolveOverlayInitialFocus(value: WlOverlayInitialFocus | undefined, container: HTMLElement | null): HTMLElement | null;
export declare function overlayWidth(value: string | number | undefined): string | undefined;
/** Observe a breakpoint only for consumers that request responsive fullscreen. */
export declare function useOverlayFullscreen(value: ComputedRef<boolean | "mobile" | undefined>): ComputedRef<boolean>;
