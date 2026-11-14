/** Shared ownership and Escape order for modal and anchored body portals. */
export interface OverlayLayer {
    token?: symbol;
    visible: () => boolean;
    panel: () => HTMLElement | null;
    anchor: () => HTMLElement | null;
    modal?: () => boolean;
    trapFocus?: () => boolean;
    backdrop?: () => HTMLElement | null;
}
export declare function removeOverlayLayer(layer: OverlayLayer): void;
export declare function addOverlayLayer(layer: OverlayLayer): void;
export declare function isTopOverlayLayer(layer: OverlayLayer): boolean;
/** Anchored children share Escape order without disabling their parent's Tab trap. */
export declare function isTopFocusTrapLayer(layer: OverlayLayer): boolean;
/** Closing a lower, unrelated surface must not steal focus from the active layer. */
export declare function canRestoreOverlayFocus(layer: OverlayLayer, target?: HTMLElement | null): boolean;
/** Includes body portals opened from a surface, including further nested portals. */
export declare function ownedOverlayPanels(layer: OverlayLayer): HTMLElement[];
/** Reconcile modal isolation after a panel mounts or a layer changes its modality. */
export declare function refreshOverlayLayers(): void;
/** A descendant portal belongs to a panel through the anchor that opened it. */
export declare function ownsOverlayTarget(layer: OverlayLayer, target: Node, visited?: Set<OverlayLayer>): boolean;
