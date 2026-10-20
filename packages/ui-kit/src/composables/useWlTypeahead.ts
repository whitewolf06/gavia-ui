import { onScopeDispose } from "vue";

export interface WlTypeaheadOptions {
  count: () => number;
  label: (index: number) => string;
  active: () => number;
  onMatch: (index: number) => void;
  isDisabled?: (index: number) => boolean;
  delay?: number;
}

/** Buffered prefix matching for noneditable composite controls. Repeated letters cycle matches. */
export function useWlTypeahead(options: WlTypeaheadOptions): {
  onKeydown: (event: KeyboardEvent) => void;
  reset: () => void;
} {
  let search = "";
  let timer: ReturnType<typeof setTimeout> | undefined;
  function reset(): void {
    if (timer !== undefined) clearTimeout(timer);
    search = "";
    timer = undefined;
  }
  onScopeDispose(reset);
  function onKeydown(event: KeyboardEvent): void {
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    const target = event.target;
    // Keep native typing in editable inputs; SSR callers can pass plain keyboard events.
    if (typeof HTMLElement !== "undefined" && target instanceof HTMLElement
      && ((target instanceof HTMLInputElement && !target.readOnly)
        || target instanceof HTMLTextAreaElement || target.isContentEditable)) return;
    search += event.key.toLocaleLowerCase();
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(reset, options.delay ?? 500);
    const repeated = [...search].every((character) => character === search[0]);
    const query = repeated ? search[0]! : search;
    const count = options.count();
    const start = query.length > 1 ? options.active() : options.active() + 1;
    for (let step = 0; step < count; step++) {
      const index = ((start + step) % count + count) % count;
      if (!options.isDisabled?.(index) && options.label(index).toLocaleLowerCase().startsWith(query)) {
        event.preventDefault();
        options.onMatch(index);
        return;
      }
    }
  }
  return { onKeydown, reset };
}
