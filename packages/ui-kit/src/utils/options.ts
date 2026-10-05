import { ref, type Ref } from "vue";

export type OptionResolver = string | ((option: any) => unknown) | undefined;

function field(option: unknown, key: string): unknown {
  return option && typeof option === "object" ? (option as Record<string, unknown>)[key] : undefined;
}
export function optionValue(option: unknown, resolver: OptionResolver): unknown {
  return typeof resolver === "function" ? resolver(option) : typeof resolver === "string"
    ? field(option, resolver) : option;
}
export function optionLabel(option: unknown, resolver: OptionResolver): string {
  const value = typeof resolver === "function" ? resolver(option) : typeof resolver === "string"
    ? field(option, resolver) : field(option, "label") ?? option;
  return value == null ? "" : String(value);
}

export function useListNavigation(length: () => number, select: (index: number) => void, close: (event?: KeyboardEvent) => void): {
  active: Ref<number>;
  onKeydown: (event: KeyboardEvent) => void;
} {
  const active = ref(0);
  function onKeydown(event: KeyboardEvent): void {
    const count = length();
    if (event.key === "Escape") {
      close(event);
      return;
    }
    if (!count) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      active.value = event.key === "Home" ? 0 : event.key === "End" ? count - 1
        : event.key === "ArrowDown" ? (active.value + 1) % count
        : (active.value + count - 1) % count;
    } else if (event.key === "Enter") {
      event.preventDefault();
      select(active.value);
    }
  }
  return { active, onKeydown };
}
