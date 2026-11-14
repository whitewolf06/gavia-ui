import { Ref } from 'vue';
export declare function getFocusableElements(container: HTMLElement | null): HTMLElement[];
export declare function trapOverlayFocus(event: KeyboardEvent, container: HTMLElement | null, portals?: HTMLElement[]): void;
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
export declare function useOverlayLifecycle(options: WlOverlayLifecycleOptions): {
    requestClose: () => void;
};
