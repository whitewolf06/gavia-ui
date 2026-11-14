import { Ref } from 'vue';
import { WlPopoverAlign, WlPopoverPlacement, WlPopoverSide } from "../overlay-types.js";
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
/** Position and dismissal shared by the kit's non-modal overlays. */
export declare function useAnchoredOverlay(options?: WlAnchoredOverlayOptions): AnchoredOverlay;
export {};
