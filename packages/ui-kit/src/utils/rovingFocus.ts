import { nextTick, ref, type Ref, watchEffect } from "vue";

/** A single tab stop for a composite control, with disabled items skipped. */
export function useWlRovingFocus(options: {
  count: () => number;
  isDisabled: (index: number) => boolean;
  focus: (index: number) => void;
  orientation?: "horizontal" | "vertical" | (() => "horizontal" | "vertical");
  loop?: boolean | (() => boolean);
}): {
  active: Ref<number>;
  tabIndex: (index: number) => 0 | -1;
  onKeydown: (event: KeyboardEvent) => void;
} {
  const active = ref(0);
  function enabled(start: number, direction: 1 | -1, loop = true): number {
    const count = options.count();
    for (let step = 0; step < count; step++) {
      const candidate = start + direction * step;
      if (!loop && (candidate < 0 || candidate >= count)) break;
      const index = ((candidate % count) + count) % count;
      if (!options.isDisabled(index)) return index;
    }
    return -1;
  }
  watchEffect(() => {
    if (active.value < 0 || active.value >= options.count() || options.isDisabled(active.value)) active.value = enabled(0, 1);
  });
  function onKeydown(event: KeyboardEvent): void {
    const orientation = typeof options.orientation === "function" ? options.orientation() : options.orientation;
    const previous = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
    const next = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    const loop = typeof options.loop === "function" ? options.loop() : options.loop ?? true;
    if (![previous, next, "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = event.key === "Home"
      ? enabled(0, 1)
      : event.key === "End"
        ? enabled(options.count() - 1, -1)
        : event.key === next ? enabled(active.value + 1, 1, loop) : enabled(active.value - 1, -1, loop);
    if (index < 0) return;
    active.value = index;
    nextTick(() => options.focus(index));
  }
  return { active, tabIndex: (index) => index === active.value && !options.isDisabled(index) ? 0 : -1, onKeydown };
}
