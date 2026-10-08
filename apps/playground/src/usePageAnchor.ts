import { onBeforeUnmount, onMounted, type Ref } from "vue";

/** Restore an initial anchor after the asynchronous page has mounted. */
export function usePageAnchor(element: Ref<HTMLElement | null>): void {
  let frame: number | undefined;
  onMounted(() => {
    if (!window.location.hash) return;
    let id: string;
    try { id = decodeURIComponent(window.location.hash.slice(1)); }
    catch { return; }
    frame = window.requestAnimationFrame(() => {
      frame = undefined;
      const target = document.getElementById(id);
      if (target && element.value?.contains(target)) target.scrollIntoView({ block: "start", behavior: "instant" });
    });
  });
  onBeforeUnmount(() => {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
  });
}
