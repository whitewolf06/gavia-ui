import { Ref } from 'vue';
export interface AnchoredOverlay {
    visible: Ref<boolean>;
    panel: Ref<HTMLElement | null>;
    style: Ref<Record<string, string>>;
    show: (event?: Event) => void;
    hide: (event?: Event) => void;
    toggle: (event?: Event) => void;
}
/** Position and dismissal shared by the kit's non-modal overlays. */
export declare function useAnchoredOverlay(options?: {
    dismissable?: () => boolean;
    closeOnEscape?: () => boolean;
    onOpen?: () => void;
    onClose?: () => void;
}): AnchoredOverlay;
