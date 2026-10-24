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

const layers: OverlayLayer[] = [];
const managedInert = new Set<HTMLElement>();
let observer: MutationObserver | undefined;

export function removeOverlayLayer(layer: OverlayLayer): void {
  const index = layers.lastIndexOf(layer);
  if (index >= 0) layers.splice(index, 1);
  refreshOverlayLayers();
}

export function addOverlayLayer(layer: OverlayLayer): void {
  const index = layers.lastIndexOf(layer);
  if (index >= 0) layers.splice(index, 1);
  layers.push(layer);
  refreshOverlayLayers();
}

export function isTopOverlayLayer(layer: OverlayLayer): boolean {
  const visibleLayers = layers.filter((entry) => entry.visible());
  return visibleLayers[visibleLayers.length - 1] === layer;
}

/** Anchored children share Escape order without disabling their parent's Tab trap. */
export function isTopFocusTrapLayer(layer: OverlayLayer): boolean {
  const trappingLayers = layers.filter((entry) => entry.visible() && entry.trapFocus?.());
  return trappingLayers[trappingLayers.length - 1] === layer;
}

function isOwnedLayer(parent: OverlayLayer, child: OverlayLayer, visited = new Set<OverlayLayer>()): boolean {
  if (parent === child || visited.has(parent)) return false;
  visited.add(parent);
  const panel = parent.panel();
  const anchor = child.anchor();
  if (!panel || !anchor) return false;
  if (panel.contains(anchor)) return true;
  return layers.some((entry) => entry !== child && entry.visible()
    && panel.contains(entry.anchor()) && isOwnedLayer(entry, child, visited));
}

/** Closing a lower, unrelated surface must not steal focus from the active layer. */
export function canRestoreOverlayFocus(layer: OverlayLayer, target?: HTMLElement | null): boolean {
  const visibleLayers = layers.filter((entry) => entry.visible());
  const top = visibleLayers[visibleLayers.length - 1];
  if (top && target && [top.panel(), ...ownedOverlayPanels(top)].some((panel) => panel?.contains(target))) return true;
  return !top || top === layer || (!top.modal?.() && isOwnedLayer(layer, top));
}

/** Includes body portals opened from a surface, including further nested portals. */
export function ownedOverlayPanels(layer: OverlayLayer): HTMLElement[] {
  return layers.filter((entry) => entry.visible() && isOwnedLayer(layer, entry))
    .map((entry) => entry.panel()).filter((panel): panel is HTMLElement => panel !== null);
}

/** Reconcile modal isolation after a panel mounts or a layer changes its modality. */
export function refreshOverlayLayers(): void {
  if (typeof document === "undefined") return;
  const modal = [...layers].reverse().find((entry) => entry.visible() && entry.modal?.()
    && entry.panel()?.isConnected);
  const isolated = new Set<HTMLElement>();
  if (modal) {
    const allowed = [modal.panel(), modal.backdrop?.(), ...ownedOverlayPanels(modal), ...document.querySelectorAll<HTMLElement>("[data-wl-announcer]")]
      .filter((element): element is HTMLElement => element instanceof HTMLElement && element.isConnected);
    // Walking the ancestors also covers inline mobile surfaces, while their explicit
    // backdrops and owned portals remain available for dismissal and interaction.
    function visit(parent: HTMLElement): void {
      for (const child of Array.from(parent.children)) {
        if (!(child instanceof HTMLElement) || allowed.includes(child)) continue;
        if (allowed.some((element) => child.contains(element))) visit(child);
        else isolated.add(child);
      }
    }
    visit(document.body);
    if (!observer && typeof MutationObserver !== "undefined") {
      observer = new MutationObserver(refreshOverlayLayers);
      observer.observe(document.body, { childList: true, subtree: true });
    }
  } else {
    observer?.disconnect();
    observer = undefined;
  }
  for (const element of managedInert) {
    if (isolated.has(element)) continue;
    // A pre-existing attribute is never registered here; preserve later consumer changes too.
    if (element.getAttribute("inert") === "") element.removeAttribute("inert");
    managedInert.delete(element);
  }
  for (const element of isolated) {
    if (element.hasAttribute("inert")) continue;
    element.setAttribute("inert", "");
    managedInert.add(element);
  }
}

/** A descendant portal belongs to a panel through the anchor that opened it. */
export function ownsOverlayTarget(layer: OverlayLayer, target: Node, visited = new Set<OverlayLayer>()): boolean {
  if (!layer.visible() || visited.has(layer)) return false;
  visited.add(layer);
  const panel = layer.panel();
  if (panel?.contains(target) || layer.anchor()?.contains(target)) return true;
  return layers.some((child) => child !== layer && child.visible() && panel?.contains(child.anchor())
    && ownsOverlayTarget(child, target, visited));
}
