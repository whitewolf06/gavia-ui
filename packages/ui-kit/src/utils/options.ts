import { computed, type ComputedRef, nextTick, ref, type Ref, watch, watchEffect } from "vue";
import type { WlOptionDisabled, WlOptionKeyResolver, WlOptionValue, WlOptionValueResolver } from "../selection-types";
import { useWlTypeahead } from "../composables/useWlTypeahead";

export type OptionResolver<TOption = unknown> = WlOptionValueResolver<TOption> | undefined;

function field(option: unknown, key: string): unknown {
  return option && typeof option === "object" ? (option as Record<string, unknown>)[key] : undefined;
}
export function optionValue<TOption, TResolver extends OptionResolver<TOption>>(
  option: TOption, resolver: TResolver
): WlOptionValue<TOption, TResolver> {
  // The conditional public type follows the same three runtime branches.
  return (typeof resolver === "function"
    ? resolver(option)
    : typeof resolver === "string"
      ? field(option, resolver)
      : option) as WlOptionValue<TOption, TResolver>;
}
export function optionLabel<TOption>(
  option: TOption, resolver: string | ((option: TOption) => unknown) | undefined
): string {
  const value = typeof resolver === "function"
    ? resolver(option)
    : typeof resolver === "string"
      ? field(option, resolver)
      : field(option, "label") ?? option;
  return value == null ? "" : String(value);
}

export function optionDisabled<TOption>(option: TOption, resolver: WlOptionDisabled<TOption> | undefined): boolean {
  return typeof resolver === "function" ? resolver(option) : typeof resolver === "string" ? !!field(option, resolver) : false;
}

export function optionKey<TOption>(
  option: TOption, resolver: WlOptionKeyResolver<TOption> | undefined, index: number, defaultValue: unknown = option
): PropertyKey {
  const value = typeof resolver === "function"
    ? resolver(option)
    : typeof resolver === "string" ? field(option, resolver) : defaultValue;
  return typeof value === "string" || typeof value === "number" || typeof value === "symbol"
    ? value
    : typeof value === "boolean" || typeof value === "bigint" ? `${typeof value}:${String(value)}` : index;
}

export function useWlListbox(options: {
  listId: () => string;
  count: () => number;
  isDisabled?: (index: number) => boolean;
  label?: (index: number) => string;
  onSelect: (index: number) => void;
  onClose: (event?: KeyboardEvent) => void;
  list: Ref<HTMLElement | null>;
}): {
  active: Ref<number>;
  optionId: (index: number) => string;
  activeDescendant: ComputedRef<string | undefined>;
  onKeydown: (event: KeyboardEvent) => void;
} {
  const active = ref(0);
  const typeahead = useWlTypeahead({
    count: options.count, label: (index) => options.label?.(index) ?? "", active: () => active.value,
    isDisabled: options.isDisabled, onMatch: (index) => { active.value = index; }
  });
  const optionId = (index: number): string => `${options.listId()}-option-${index}`;
  const activeDescendant = computed(() => active.value >= 0 && active.value < options.count() && !options.isDisabled?.(active.value)
    ? optionId(active.value)
    : undefined);

  function findEnabled(start: number, direction: 1 | -1, loop = true): number {
    const count = options.count();
    for (let step = 0; step < count; step++) {
      const candidate = start + direction * step;
      if (!loop && (candidate < 0 || candidate >= count)) break;
      const index = ((candidate % count) + count) % count;
      if (!options.isDisabled?.(index)) return index;
    }
    return -1;
  }

  watchEffect(() => {
    if (active.value < 0 || active.value >= options.count() || options.isDisabled?.(active.value)) {
      active.value = findEnabled(Math.max(0, Math.min(active.value, options.count() - 1)), 1);
    }
  });

  watch([active, options.count, options.list, options.listId], async () => {
    if (!options.list.value) typeahead.reset();
    await nextTick();
    if (!activeDescendant.value || !options.list.value) return;
    // Find within the list without interpolating consumer IDs into a CSS selector.
    const element = [...options.list.value.querySelectorAll<HTMLElement>('[role="option"]')]
      .find((option) => option.id === activeDescendant.value);
    if (typeof element?.scrollIntoView === "function") element.scrollIntoView({ block: "nearest" });
  }, { flush: "post" });

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      options.onClose(event);
      return;
    }
    const count = options.count();
    if (!count) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      active.value = event.key === "Home"
        ? findEnabled(0, 1)
        : event.key === "End"
          ? findEnabled(count - 1, -1)
          : event.key === "ArrowDown"
            ? findEnabled(active.value + 1, 1)
            : findEnabled(active.value < 0 ? count - 1 : active.value - 1, -1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeDescendant.value) options.onSelect(active.value);
    } else if (event.key === "PageDown" || event.key === "PageUp") {
      event.preventDefault();
      const direction = event.key === "PageDown" ? 1 : -1;
      const target = Math.max(0, Math.min(count - 1, active.value + direction * 10));
      const next = findEnabled(target, direction, false);
      active.value = next < 0 ? findEnabled(target, direction === 1 ? -1 : 1, false) : next;
    } else if (options.label) typeahead.onKeydown(event);
  }
  return { active, optionId, activeDescendant, onKeydown };
}
