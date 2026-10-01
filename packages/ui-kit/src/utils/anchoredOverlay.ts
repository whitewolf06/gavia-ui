import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";

export interface AnchoredOverlay {
  visible: Ref<boolean>;
  panel: Ref<HTMLElement | null>;
  style: Ref<Record<string, string>>;
  show: (event?: Event) => void;
  hide: () => void;
  toggle: (event?: Event) => void;
}

/** Position and dismissal shared by the kit's non-modal overlays. */
export function useAnchoredOverlay(options: {
  dismissable?: () => boolean;
  closeOnEscape?: () => boolean;
  onOpen?: () => void;
  onClose?: () => void;
} = {}): AnchoredOverlay {
  const visible = ref(false);
  const panel = ref<HTMLElement | null>(null);
  const style = ref<Record<string, string>>({});
  let anchor: HTMLElement | null = null;
  let previouslyFocused: HTMLElement | null = null;

  function position(): void {
    if (!anchor || !panel.value) return;
    const rect = anchor.getBoundingClientRect();
    const width = panel.value.offsetWidth || rect.width;
    const height = panel.value.offsetHeight;
    const below = window.innerHeight - rect.bottom;
    const preferredTop = below < height + 8 && rect.top > below
      ? Math.max(4, rect.top - height - 4)
      : Math.min(window.innerHeight - 4, rect.bottom + 4);
    const top = Math.max(4, Math.min(preferredTop, window.innerHeight - height - 4));
    const left = Math.max(4, Math.min(rect.left, window.innerWidth - width - 4));
    // A body portal must sit above the modal/sidebar/filter containing its anchor.
    const baseLayer = Number.parseInt(getComputedStyle(panel.value).zIndex, 10) || 0;
    let anchorLayer = 0;
    for (let parent = anchor.parentElement; parent; parent = parent.parentElement) {
      const layer = Number.parseInt(getComputedStyle(parent).zIndex, 10);
      if (Number.isFinite(layer)) anchorLayer = Math.max(anchorLayer, layer);
    }
    style.value = { position: "fixed", top: `${top}px`, left: `${left}px`, minWidth: `${rect.width}px`,
      zIndex: String(Math.max(baseLayer, anchorLayer + 1)) };
  }
  function show(event?: Event): void {
    const target = event?.currentTarget ?? event?.target;
    if (target instanceof HTMLElement) anchor = target;
    previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!visible.value) style.value = {};
    visible.value = true;
  }
  function hide(): void {
    visible.value = false;
  }
  function toggle(event?: Event): void {
    if (visible.value) hide();
    else show(event);
  }
  function onPointer(event: PointerEvent): void {
    if (!visible.value || options.dismissable?.() === false) return;
    const target = event.target;
    if (target instanceof Node && !panel.value?.contains(target) && !anchor?.contains(target)) hide();
  }
  function onKeydown(event: KeyboardEvent): void {
    if (visible.value && event.key === "Escape" && options.closeOnEscape?.() !== false) {
      event.preventDefault();
      hide();
      previouslyFocused?.focus();
    }
  }
  watch(visible, async (open, previous) => {
    if (open) {
      await nextTick();
      position();
      options.onOpen?.();
    } else if (previous) {
      options.onClose?.();
    }
  });
  onMounted(() => {
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKeydown);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
  });
  onBeforeUnmount(() => {
    document.removeEventListener("pointerdown", onPointer);
    document.removeEventListener("keydown", onKeydown);
    window.removeEventListener("resize", position);
    window.removeEventListener("scroll", position, true);
  });
  return { visible, panel, style, show, hide, toggle };
}
