/** Shared ownership and Escape order for modal and anchored body portals. */
export interface OverlayLayer {
  visible: () => boolean;
  panel: () => HTMLElement | null;
  anchor: () => HTMLElement | null;
}

const layers: OverlayLayer[] = [];

export function removeOverlayLayer(layer: OverlayLayer): void {
  const index = layers.lastIndexOf(layer);
  if (index >= 0) layers.splice(index, 1);
}

export function addOverlayLayer(layer: OverlayLayer): void {
  removeOverlayLayer(layer);
  layers.push(layer);
}

export function isTopOverlayLayer(layer: OverlayLayer): boolean {
  const visibleLayers = layers.filter((entry) => entry.visible());
  return visibleLayers[visibleLayers.length - 1] === layer;
}

/** A descendant portal belongs to a panel through the anchor that opened it. */
export function ownsOverlayTarget(layer: OverlayLayer, target: Node, visited = new Set<OverlayLayer>()): boolean {
  if (!layer.visible() || visited.has(layer)) return false;
  visited.add(layer);
  const panel = layer.panel();
  if (panel?.contains(target) || layer.anchor()?.contains(target)) return true;
  return layers.some((child) => child !== layer && child.visible() && panel?.contains(child.anchor()) &&
    ownsOverlayTarget(child, target, visited));
}
