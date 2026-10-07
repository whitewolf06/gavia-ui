/** Shared ownership and Escape order for modal and anchored body portals. */
export interface OverlayLayer {
    visible: () => boolean;
    panel: () => HTMLElement | null;
    anchor: () => HTMLElement | null;
}
export declare function removeOverlayLayer(layer: OverlayLayer): void;
export declare function addOverlayLayer(layer: OverlayLayer): void;
export declare function isTopOverlayLayer(layer: OverlayLayer): boolean;
/** A descendant portal belongs to a panel through the anchor that opened it. */
export declare function ownsOverlayTarget(layer: OverlayLayer, target: Node, visited?: Set<OverlayLayer>): boolean;
