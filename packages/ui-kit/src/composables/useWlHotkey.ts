import { onBeforeUnmount, onMounted } from "vue";

export interface WlHotkeyOptions {
  enabled?: () => boolean;
  allowInInputs?: boolean;
  preventDefault?: boolean;
  target?: () => EventTarget | null;
}

/** Supports mod, ctrl, meta, alt and shift. Editable targets are ignored by default. */
export function useWlHotkey(shortcut: string, callback: (event: KeyboardEvent) => void, options: WlHotkeyOptions = {}): void {
  const parts = shortcut.toLowerCase().split("+").map((part) => part.trim());
  const key = parts.pop();
  let target: EventTarget | null = null;
  function listener(event: Event): void {
    if (!(event instanceof KeyboardEvent) || event.defaultPrevented || options.enabled?.() === false) return;
    const editable = event.composedPath().some((node) => node instanceof HTMLElement
      && (node.matches("input, textarea, select") || node.isContentEditable || node.getAttribute("contenteditable") === "true"));
    if (!options.allowInInputs && editable) return;
    if (event.key.toLowerCase() !== key || event.altKey !== parts.includes("alt") || event.shiftKey !== parts.includes("shift")) return;
    const mod = parts.includes("mod");
    if (mod ? !(event.ctrlKey || event.metaKey) : event.ctrlKey !== parts.includes("ctrl") || event.metaKey !== parts.includes("meta")) return;
    if (options.preventDefault !== false) event.preventDefault();
    callback(event);
  }
  onMounted(() => {
    target = options.target?.() ?? document;
    target.addEventListener("keydown", listener);
  });
  onBeforeUnmount(() => target?.removeEventListener("keydown", listener));
}
