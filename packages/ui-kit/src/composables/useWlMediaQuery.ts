import { onBeforeUnmount, onMounted, readonly, ref, type Ref } from "vue";
import { wlBreakpoints } from "../design-system/tokens.generated";

/** Starts observing only after mount; SSR returns the explicit fallback. */
export function useWlMediaQuery(query: string, fallback = false): Readonly<Ref<boolean>> {
  const matches = ref(fallback);
  let media: MediaQueryList | undefined;
  const update = (): void => {
    matches.value = media?.matches ?? fallback;
  };
  onMounted(() => {
    if (typeof window.matchMedia !== "function")
      return;
    media = window.matchMedia(query);
    update();
    media.addEventListener("change", update);
  });
  onBeforeUnmount(() => media?.removeEventListener("change", update));
  return readonly(matches);
}

export function useWlReducedMotion(): Readonly<Ref<boolean>> {
  return useWlMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Uses the same minimum widths as the generated design-system catalog. */
export function useWlBreakpoint(): Record<keyof typeof wlBreakpoints, Readonly<Ref<boolean>>> {
  return Object.fromEntries(
    Object.entries(wlBreakpoints).map(([key, width]) => [key, useWlMediaQuery(`(min-width: ${width}px)`)])
  ) as Record<keyof typeof wlBreakpoints, Readonly<Ref<boolean>>>;
}
