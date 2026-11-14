export interface WlHotkeyOptions {
    enabled?: () => boolean;
    allowInInputs?: boolean;
    preventDefault?: boolean;
    target?: () => EventTarget | null;
}
/** Supports mod, ctrl, meta, alt and shift. Editable targets are ignored by default. */
export declare function useWlHotkey(shortcut: string, callback: (event: KeyboardEvent) => void, options?: WlHotkeyOptions): void;
